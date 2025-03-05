from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Создаем директорию для базы данных, если её нет
os.makedirs("db", exist_ok=True)

# Используем SQLite вместо PostgreSQL
SQLALCHEMY_DATABASE_URL = "sqlite:///./db/altailand.db"

# Создаем движок SQLite с поддержкой внешних ключей
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Только для SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Создаем все таблицы
from models import *
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 