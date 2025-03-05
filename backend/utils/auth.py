from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_session_token(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_session_expiration() -> datetime:
    return datetime.utcnow() + timedelta(days=7)  # Сессия действительна 7 дней 