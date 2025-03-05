from database import SessionLocal, engine, Base
from models import LandPlot, Image, PlotStatus, PlotCategory, QuizQuestion
import json

# Пересоздаем все таблицы
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Тестовые вопросы для квиза
test_questions = [
    {
        "question": "Какой тип участка вас интересует?",
        "options": ["ИЖС", "СНТ", "ЛПХ", "Пока не определился"],
        "order": 1,
        "is_active": True
    },
    {
        "question": "В каком районе хотите приобрести участок?",
        "options": ["Чемальский", "Майминский", "Турочакский", "Рассмотрю все варианты"],
        "order": 2,
        "is_active": True
    },
    {
        "question": "Какая площадь участка вас интересует?",
        "options": ["До 10 м²", "10-15 м²", "15-20 м²", "Более 20 м²"],
        "order": 3,
        "is_active": True
    },
    {
        "question": "Какой бюджет планируете выделить на покупку?",
        "options": ["До 1 млн", "1-2 млн", "2-3 млн", "Более 3 млн"],
        "order": 4,
        "is_active": True
    }
]

# Тестовые данные
test_plots = [
    {
        "title": "Участок в Чемальском районе",
        "description": "Великолепный участок в окружении гор с видом на реку Катунь. Идеально подходит для строительства дома или гостевых домиков. Экологически чистый район, развивающаяся инфраструктура, круглогодичный доступ.",
        "cadastral_number": "04:01:010101:123",
        "area": 15.0,
        "specified_area": 15.2,
        "price": 2800000,
        "price_per_sotka": 186667,
        "location": "Чемал",
        "region": "Республика Алтай",
        "land_category": "Земли населенных пунктов",
        "permitted_use": "Для индивидуального жилищного строительства",
        "features": [
            "Живописный вид на горы",
            "Рядом река Катунь",
            "Круглогодичный подъезд",
            "Рядом лес",
            "Развивающийся район"
        ],
        "terrain": {
            "isNearRiver": True,
            "isNearMountains": True,
            "isNearForest": True,
            "isNearLake": False,
            "hasViewOnMountains": True,
            "landscape": "slope"
        },
        "communications": [
            "Электричество 15 кВт",
            "Водозаборная скважина",
            "Септик",
            "Газ в перспективе"
        ],
        "category": PlotCategory.IGS,
        "status": PlotStatus.AVAILABLE
    },
    {
        "title": "Видовой участок в Майминском районе",
        "description": "Просторный участок с панорамным видом на горы. Отличная возможность для инвестиций или строительства собственного дома. Прекрасная транспортная доступность, развитая инфраструктура поселка.",
        "cadastral_number": "04:01:010203:5678",
        "area": 12.0,
        "specified_area": 12.1,
        "price": 3200000,
        "price_per_sotka": 266667,
        "location": "Майма",
        "region": "Республика Алтай",
        "land_category": "Земли населенных пунктов",
        "permitted_use": "Для индивидуального жилищного строительства",
        "features": [
            "Панорамный вид",
            "Ровный рельеф",
            "Благоустроенная территория",
            "Городская инфраструктура",
            "Удобная транспортная доступность"
        ],
        "terrain": {
            "isNearRiver": False,
            "isNearMountains": True,
            "isNearForest": True,
            "isNearLake": False,
            "hasViewOnMountains": True,
            "landscape": "flat"
        },
        "communications": [
            "Электричество 15 кВт",
            "Центральный водопровод",
            "Газ по границе",
            "Канализация центральная"
        ],
        "category": PlotCategory.IGS,
        "status": PlotStatus.RESERVED
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # Создаем участки
        for plot_data in test_plots:
            # Конвертируем словари в JSON строки
            plot_data["terrain"] = json.dumps(plot_data["terrain"])
            plot_data["features"] = json.dumps(plot_data["features"])
            plot_data["communications"] = json.dumps(plot_data["communications"])
            
            plot = LandPlot(**plot_data)
            db.add(plot)
        
        # Создаем вопросы для квиза
        for question_data in test_questions:
            question = QuizQuestion(**question_data)
            db.add(question)
        
        db.commit()
        print("База данных успешно заполнена тестовыми данными!")
    
    except Exception as e:
        print(f"Ошибка при заполнении базы данных: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 