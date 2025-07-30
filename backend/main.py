# main.py
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi import status
from sqlalchemy.orm import Session

import os
import time
import traceback
import cv2
import tempfile
from pathlib import Path
import io
import zipfile

from auth.jwt_utils import decode_access_token


# Инициализация приложения
app = FastAPI(title="Image Filter App with Auth")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Инициализация БД при старте
@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске"""
    print("Starting application...")

    try:
        from database import create_tables
        from auth import models

        success = create_tables()
        if success:
            print("Database initialized successfully")
        else:
            print("Database initialization failed, but continuing...")

    except Exception as e:
        print(f"Startup error: {e}")


# Импорты для auth
from database import get_db
from auth import crud, schemas
from auth.jwt_utils import create_access_token, decode_access_token

# OAuth2 для защищенных эндпоинтов
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Получение текущего пользователя из токена"""
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return email



# ПРЯМЫЕ AUTH ЭНДПОИНТЫ
@app.post("/register")
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    print(f"Registration attempt for: {user.email}")

    try:
        # Проверяем, существует ли пользователь
        existing_user = crud.get_user_by_email(db, user.email)
        if existing_user:
            print(f"User {user.email} already exists")
            raise HTTPException(status_code=400, detail="Email already registered")

        # Создаем пользователя
        new_user = crud.create_user(db, user.email, user.password)
        if not new_user:
            print(f"Failed to create user {user.email}")
            raise HTTPException(status_code=500, detail="Failed to create user")

        print(f"User {user.email} registered successfully")
        return {"message": "User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during registration: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/login")
async def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Вход в систему с созданием токенов"""
    print(f"Login attempt for: {user.email}")

    try:
        # Аутентификация
        authenticated_user = crud.authenticate_user(db, user.email, user.password)
        if not authenticated_user:
            print(f"Authentication failed for {user.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Создаем пару токенов
        from auth.jwt_utils import create_token_pair
        token_pair = create_token_pair(authenticated_user.email)

        print(f"Login successful for {user.email}")
        return token_pair

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Login failed")


@app.post("/refresh")
async def refresh_token(refresh_data: schemas.RefreshTokenRequest):
    """Обновление access токена с помощью refresh токена"""
    print("Token refresh attempt")

    try:
        from auth.jwt_utils import decode_refresh_token, create_token_pair, revoke_refresh_token

        # Декодируем refresh токен
        token_data = decode_refresh_token(refresh_data.refresh_token)
        if not token_data:
            print("Invalid refresh token")
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        email = token_data["email"]
        print(f"Refresh token valid for: {email}")

        # Создаем новую пару токенов
        new_token_pair = create_token_pair(email)

        # Отзываем старый refresh токен
        revoke_refresh_token(token_data["jti"])

        print(f"Tokens refreshed for {email}")
        return new_token_pair

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during token refresh: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Token refresh failed")


@app.post("/logout")
async def logout(refresh_data: schemas.RefreshTokenRequest):
    """Выход из системы с отзывом refresh токена"""
    print("Logout attempt")

    try:
        from auth.jwt_utils import decode_refresh_token, revoke_refresh_token

        # Декодируем refresh токен для получения jti
        token_data = decode_refresh_token(refresh_data.refresh_token)
        if token_data:
            # Отзываем refresh токен
            revoke_refresh_token(token_data["jti"])
            print(f"User {token_data['email']} logged out")

        return {"message": "Successfully logged out"}

    except Exception as e:
        print(f"Error during logout: {e}")
        # Даже если произошла ошибка, считаем выход успешным
        return {"message": "Logged out"}


# ТАКЖЕ ПОДКЛЮЧАЕМ СТАРЫЕ РОУТЫ С ПРЕФИКСОМ (для совместимости)
from auth.routes import router as auth_router

app.include_router(auth_router, prefix="/auth", tags=["auth"])



# Импорты для обработки изображений
from filters.base import apply_filter
from utils.image_io import image_bytes_to_array, array_to_base64
from utils.video_io import extract_significant_frames


# API эндпоинты для обработки изображений
@app.post("/process/")
async def process_image(
        file: UploadFile = File(...),
        filter_type: str = Form(...),
        user: str = Depends(get_current_user)
):
    """Обработка одного изображения"""
    try:
        start_time = time.time()

        content = await file.read()
        img = image_bytes_to_array(content)
        result = apply_filter(img, filter_type)
        encoded = array_to_base64(result)

        duration = round((time.time() - start_time) * 1000)
        return {"image": encoded, "duration_ms": duration}

    except Exception as e:
        print(f"Image processing error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/process/batch/inline/")
async def process_batch_inline(
        files: list[UploadFile] = File(...),
        filter_type: str = Form(...),
        user: str = Depends(get_current_user)
):
    """Обработка нескольких изображений (inline)"""
    results = []
    for i, file in enumerate(files):
        try:
            content = await file.read()
            img = image_bytes_to_array(content)
            result = apply_filter(img, filter_type)
            encoded = array_to_base64(result)
            results.append(encoded)
        except Exception as e:
            print(f"Error processing file {i}: {e}")
            results.append(None)
    return {"images": results}


@app.post("/process/batch/")
async def process_batch_zip(
        files: list[UploadFile] = File(...),
        filter_type: str = Form(...),
        user: str = Depends(get_current_user)
):
    """Обработка нескольких изображений (zip)"""
    zip_io = io.BytesIO()

    with zipfile.ZipFile(zip_io, mode="w", compression=zipfile.ZIP_DEFLATED) as zipf:
        for i, file in enumerate(files):
            try:
                content = await file.read()
                img = image_bytes_to_array(content)
                result = apply_filter(img, filter_type)
                success, encoded_img = cv2.imencode('.png', result)
                if success:
                    zipf.writestr(f"filtered_{i + 1}.png", encoded_img.tobytes())
            except Exception as e:
                zipf.writestr(f"error_{i + 1}.txt", f"Ошибка: {str(e)}")

    zip_io.seek(0)
    return StreamingResponse(
        zip_io,
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": "attachment; filename=filtered_images.zip"}
    )


# Обработка видео
@app.post("/process/video/")
async def process_video(
        file: UploadFile = File(...),
        filter_type: str = Form(...),
        user: str = Depends(get_current_user)
):
    """Обработка видео (извлечение кадров)"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(await file.read())
            tmp_path = Path(tmp.name)

        raw_frames = extract_significant_frames(str(tmp_path), threshold=30.0)
        tmp_path.unlink()

        results = []
        for frame in raw_frames:
            filtered = apply_filter(frame, filter_type)
            encoded = array_to_base64(filtered)
            results.append(encoded)

        return {"frames": results}

    except Exception as e:
        print(f"Video processing error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


# Статические файлы (фронтенд)
class SPAStaticFiles(StaticFiles):
    """Кастомный класс для SPA маршрутизации"""

    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except HTTPException as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex


# Монтирование статических файлов
static_dir = os.getenv("STATIC_DIR", "/app/frontend/dist")
if os.path.exists(static_dir):
    print(f"Static directory found: {static_dir}")

    # Assets
    assets_dir = f"{static_dir}/assets"
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        print(f"Assets mounted: {assets_dir}")

    # SPA файлы
    app.mount("/", SPAStaticFiles(directory=static_dir, html=True), name="spa")
    print("SPA static files mounted")
else:
    print(f"Static directory not found: {static_dir}")


    @app.get("/{path:path}")
    async def fallback(request: Request, path: str):
        return JSONResponse(
            status_code=404,
            content={
                "detail": f"Static files not found. Path: {path}",
                "static_dir": static_dir
            }
        )