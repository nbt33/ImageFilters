# auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import crud, schemas
from auth.jwt_utils import create_token_pair, decode_refresh_token, revoke_refresh_token

router = APIRouter()


@router.post("/register")
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    print(f" Registration attempt for: {user.email}")

    try:
        # Проверка, существует ли пользователь
        existing_user = crud.get_user_by_email(db, user.email)
        if existing_user:
            print(f" User {user.email} already exists")
            raise HTTPException(status_code=400, detail="Email already registered")

        # Создаем пользователя
        new_user = crud.create_user(db, user.email, user.password)
        if not new_user:
            print(f" Failed to create user {user.email}")
            raise HTTPException(status_code=500, detail="Failed to create user")

        print(f" User {user.email} registered successfully")
        return {"message": "User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f" Unexpected error during registration: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login")
async def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Вход в систему с созданием токенов"""
    print(f" Login attempt for: {user.email}")

    try:
        # Аутентификация
        authenticated_user = crud.authenticate_user(db, user.email, user.password)
        if not authenticated_user:
            print(f" Authentication failed for {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Создание пары токенов
        token_pair = create_token_pair(authenticated_user.email)

        print(f" Login successful for {user.email}")
        return token_pair

    except HTTPException:
        raise
    except Exception as e:
        print(f" Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/refresh")
async def refresh_token(refresh_data: schemas.RefreshTokenRequest):
    """Обновление access токена с помощью refresh токена"""
    print(" Token refresh attempt")

    try:
        # Декодирование refresh токен
        token_data = decode_refresh_token(refresh_data.refresh_token)
        if not token_data:
            print(" Invalid refresh token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        email = token_data["email"]
        print(f" Refresh token valid for: {email}")

        # Создаем новую пару токенов
        new_token_pair = create_token_pair(email)

        # Отзываем старый refresh токен
        revoke_refresh_token(token_data["jti"])

        print(f" Tokens refreshed for {email}")
        return new_token_pair

    except HTTPException:
        raise
    except Exception as e:
        print(f" Unexpected error during token refresh: {e}")
        raise HTTPException(status_code=500, detail="Token refresh failed")


@router.post("/logout")
async def logout(refresh_data: schemas.RefreshTokenRequest):
    """Выход из системы с отзывом refresh токена"""
    print("🚪 Logout attempt")

    try:
        # Декодируем refresh токен для получения jti
        token_data = decode_refresh_token(refresh_data.refresh_token)
        if token_data:
            # Отзываем refresh токен
            revoke_refresh_token(token_data["jti"])
            print(f"✅ User {token_data['email']} logged out")

        return {"message": "Successfully logged out"}

    except Exception as e:
        print(f" Error during logout: {e}")
        # Даже если произошла ошибка, считаем выход успешным
        return {"message": "Logged out"}


@router.get("/test")
async def test_db(db: Session = Depends(get_db)):
    """Тестовый эндпоинт для проверки БД"""
    try:
        # Пробуем выполнить простой запрос
        users = db.query(crud.User).all()
        return {"status": "ok", "users_count": len(users)}
    except Exception as e:
        return {"status": "error", "error": str(e)}