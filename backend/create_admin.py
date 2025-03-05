from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import crud

def create_first_admin(username: str, password: str):
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        existing_admin = crud.get_admin_by_username(db, username)
        if existing_admin:
            print(f"Администратор с именем {username} уже существует")
            return
        
        # Создаем нового админа
        admin = crud.create_admin(db, username, password)
        print(f"Администратор {username} успешно создан")
        
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Использование: python create_admin.py <username> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    
    # Создаем таблицы, если они еще не существуют
    models.Base.metadata.create_all(bind=engine)
    
    create_first_admin(username, password) 