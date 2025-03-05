from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL

def run_migration():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        # Создаем временную таблицу
        connection.execute(text("""
            CREATE TABLE land_plots_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR,
                description JSON NOT NULL DEFAULT '{"text": "", "attachments": []}',
                cadastral_numbers JSON NOT NULL DEFAULT '[]',
                area FLOAT,
                specified_area FLOAT,
                price INTEGER,
                price_per_sotka INTEGER,
                location VARCHAR,
                region VARCHAR,
                land_category VARCHAR,
                permitted_use VARCHAR,
                features JSON NOT NULL DEFAULT '[]',
                communications JSON NOT NULL DEFAULT '[]',
                status VARCHAR DEFAULT 'available',
                is_visible BOOLEAN DEFAULT 1
            )
        """))

        # Копируем данные из старой таблицы в новую
        connection.execute(text("""
            INSERT INTO land_plots_new (
                id, title, description, area, specified_area, price, 
                price_per_sotka, location, region, land_category, 
                permitted_use, is_visible, status,
                cadastral_numbers, features, communications
            )
            SELECT 
                id, title, 
                COALESCE(json_object('text', description, 'attachments', json_array()), 
                    json_object('text', '', 'attachments', json_array())) as description,
                area, specified_area, price, 
                price_per_sotka, location, region, land_category, 
                permitted_use, is_visible, 
                COALESCE(status, 'available') as status,
                COALESCE(cadastral_numbers, '[]') as cadastral_numbers,
                COALESCE(features, '[]') as features,
                COALESCE(communications, '[]') as communications
            FROM land_plots
        """))

        # Удаляем старую таблицу
        connection.execute(text("DROP TABLE land_plots"))

        # Переименовываем новую таблицу
        connection.execute(text("ALTER TABLE land_plots_new RENAME TO land_plots"))

        # Создаем индексы
        connection.execute(text("CREATE INDEX idx_land_plots_title ON land_plots(title)"))
        connection.execute(text("CREATE INDEX idx_land_plots_is_visible ON land_plots(is_visible)"))

        connection.commit()

if __name__ == "__main__":
    run_migration() 