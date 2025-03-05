import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import SQLALCHEMY_DATABASE_URL

def run_migration():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        # Обновляем пути к изображениям, убирая /static/
        connection.execute(text("""
            UPDATE images 
            SET path = REPLACE(path, '/static/images/', '/images/')
            WHERE path LIKE '/static/images/%'
        """))
        
        connection.commit()

if __name__ == "__main__":
    run_migration() 