# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# путь к БД в рабочей директории
DB_PATH = "/data/users.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

print(f"🗄️ Database URL: {SQLALCHEMY_DATABASE_URL}")

# Создаем движок с минимальными настройками
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Получение сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Создание всех таблиц"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False