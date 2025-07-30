# auth/crud.py
from sqlalchemy.orm import Session
from auth.models import User
from passlib.context import CryptContext

# Настройка контекста для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Безопасное хеширование пароля с помощью passlib + bcrypt"""
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Проверка пароля с помощью passlib + bcrypt"""
    try:
        return pwd_context.verify(password, hashed)
    except Exception as e:
        print(f" Password verification error: {e}")
        return False


def get_user_by_email(db: Session, email: str):
    """Получение пользователя по email"""
    try:
        user = db.query(User).filter(User.email == email).first()
        print(f" Found user for {email}: {user}")
        return user
    except Exception as e:
        print(f" Error getting user by email: {e}")
        return None


def create_user(db: Session, email: str, password: str):
    """Создание нового пользователя"""
    try:
        hashed_password = hash_password(password)
        user = User(email=email, hashed_password=hashed_password)

        db.add(user)
        db.commit()
        db.refresh(user)

        print(f" Created user: {user}")
        return user
    except Exception as e:
        print(f" Error creating user: {e}")
        db.rollback()
        return None


def authenticate_user(db: Session, email: str, password: str):
    """Аутентификация пользователя"""
    try:
        user = get_user_by_email(db, email)
        if user and verify_password(password, user.hashed_password):
            print(f" Authentication successful for {email}")
            return user
        print(f" Authentication failed for {email}")
        return None
    except Exception as e:
        print(f" Error during authentication: {e}")
        return None