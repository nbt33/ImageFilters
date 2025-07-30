# auth/schemas.py
from pydantic import BaseModel, EmailStr, validator
import re

class UserCreate(BaseModel):
    email: EmailStr  # Автоматическая валидация email
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Пароль должен содержать минимум 8 символов')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Пароль должен содержать минимум одну букву')
        if not re.search(r'\d', v):
            raise ValueError('Пароль должен содержать минимум одну цифру')
        return v

class UserLogin(BaseModel):
    email: EmailStr  # Валидация email и при логине
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class User(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True