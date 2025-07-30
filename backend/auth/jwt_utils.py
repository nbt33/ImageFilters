# auth/jwt_utils.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
import secrets

# Секретные ключи (в продакшене должны быть разными, не забыть про это!)
SECRET_KEY = os.getenv("SECRET_KEY", "simple-secret-key-for-amvera")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "refresh-secret-key-for-amvera")
ALGORITHM = "HS256"

# Времена жизни токенов
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Сократил до 15 минут
REFRESH_TOKEN_EXPIRE_DAYS = 30  # Refresh токен живет 30 дней

# Хранилище refresh токенов в памяти (в продакшене лучше Redis/БД)
active_refresh_tokens = set()


def create_access_token(data: dict):
    """Создание JWT access токена"""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "type": "access"
        })

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        print(f" Access token created for: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        print(f" Error creating access token: {e}")
        return None


def create_refresh_token(data: dict):
    """Создание JWT refresh токена"""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        # Добавляем случайный jti для возможности отзыва токена
        jti = secrets.token_urlsafe(32)
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "jti": jti
        })

        encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

        # Сохранение jti в активных токенах
        active_refresh_tokens.add(jti)

        print(f" Refresh token created for: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        print(f" Error creating refresh token: {e}")
        return None


def decode_access_token(token: str):
    """Декодирование JWT access токена"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Проверяем тип токена
        if payload.get("type") != "access":
            print(" Invalid token type for access token")
            return None

        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except jwt.ExpiredSignatureError:
        print(" Access token expired")
        return None
    except JWTError as e:
        print(f" JWT Error: {e}")
        return None
    except Exception as e:
        print(f" Access token decode error: {e}")
        return None


def decode_refresh_token(token: str):
    """Декодирование JWT refresh токена"""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])

        # Проверяем тип токена
        if payload.get("type") != "refresh":
            print(" Invalid token type for refresh token")
            return None

        # Проверяем, что токен не отозван
        jti = payload.get("jti")
        if jti not in active_refresh_tokens:
            print(" Refresh token has been revoked")
            return None

        email: str = payload.get("sub")
        if email is None:
            return None
        return {"email": email, "jti": jti}
    except jwt.ExpiredSignatureError:
        print(" Refresh token expired")
        return None
    except JWTError as e:
        print(f" JWT Error: {e}")
        return None
    except Exception as e:
        print(f" Refresh token decode error: {e}")
        return None


def revoke_refresh_token(jti: str):
    """Отзыв refresh токена"""
    try:
        active_refresh_tokens.discard(jti)
        print(f" Refresh token revoked: {jti}")
        return True
    except Exception as e:
        print(f" Error revoking refresh token: {e}")
        return False


def create_token_pair(email: str):
    """Создание пары access + refresh токенов"""
    access_token = create_access_token(data={"sub": email})
    refresh_token = create_refresh_token(data={"sub": email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # в секундах
    }