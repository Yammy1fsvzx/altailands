from sqlalchemy.orm import Session
import models
import schemas
from fastapi import UploadFile
import os
from datetime import datetime
import json
from sqlalchemy import Boolean, or_, func
from typing import List, Optional
from models import LandPlot, Image, plot_images, QuizQuestion, Request, Admin, AdminSession
from schemas import ImageOrder, QuizQuestionCreate, QuizQuestionUpdate
from utils.auth import verify_password, get_password_hash, generate_session_token, create_session_expiration

def deserialize_json_fields(plot):
    """Десериализуем JSON поля из строк в объекты"""
    try:
        if isinstance(plot.terrain, str):
            plot.terrain = json.loads(plot.terrain)
        if isinstance(plot.features, str):
            plot.features = json.loads(plot.features)
        if isinstance(plot.communications, str):
            plot.communications = json.loads(plot.communications)
    except Exception as e:
        print(f"Ошибка десериализации: {e}")
    return plot

def get_land_plot(db: Session, plot_id: int, show_hidden: bool = False):
    query = db.query(models.LandPlot).filter(models.LandPlot.id == plot_id)
    
    if not show_hidden:
        query = query.filter(models.LandPlot.is_visible == True)
    
    plot = query.first()
    
    if plot:
        # Десериализуем JSON поля
        if isinstance(plot.description, str):
            plot.description = json.loads(plot.description)
        if isinstance(plot.features, str):
            plot.features = json.loads(plot.features) if plot.features else []
        if isinstance(plot.communications, str):
            plot.communications = json.loads(plot.communications) if plot.communications else []
        if isinstance(plot.cadastral_numbers, str):
            plot.cadastral_numbers = json.loads(plot.cadastral_numbers) if plot.cadastral_numbers else []
        
        # Сортируем изображения
        plot.images.sort(key=lambda x: (not x.is_main, x.order))
    
    return plot

def get_land_plots(
    db: Session,
    skip: int = 0,
    limit: int = 9,
    search: str = None,
    status: str = None,
    category: str = None,
    price_min: float = None,
    price_max: float = None,
    area_min: float = None,
    area_max: float = None,
    region: str = None,
    location: str = None,
    show_hidden: bool = False
) -> List[models.LandPlot]:
    query = db.query(models.LandPlot)

    if not show_hidden:
        query = query.filter(models.LandPlot.is_visible == True)

    if search:
        # Добавляем поиск по кадастровым номерам
        query = query.filter(
            or_(
                models.LandPlot.title.ilike(f"%{search}%"),
                # Используем функцию для поиска в JSON поле
                func.json_extract(models.LandPlot.cadastral_numbers, '$').like(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(models.LandPlot.status == status)
    
    if price_min is not None:
        query = query.filter(models.LandPlot.price >= price_min)
    
    if price_max is not None:
        query = query.filter(models.LandPlot.price <= price_max)
    
    if area_min is not None:
        query = query.filter(models.LandPlot.area >= area_min)
    
    if area_max is not None:
        query = query.filter(models.LandPlot.area <= area_max)
    
    if region:
        query = query.filter(models.LandPlot.region == region)
    
    if location:
        query = query.filter(models.LandPlot.location == location)

    plots = query.offset(skip).limit(limit).all()
    
    # Десериализуем JSON поля для каждого участка
    for plot in plots:
        if isinstance(plot.description, str):
            plot.description = json.loads(plot.description)
        if isinstance(plot.features, str):
            plot.features = json.loads(plot.features) if plot.features else []
        if isinstance(plot.communications, str):
            plot.communications = json.loads(plot.communications) if plot.communications else []
        if isinstance(plot.cadastral_numbers, str):
            plot.cadastral_numbers = json.loads(plot.cadastral_numbers) if plot.cadastral_numbers else []
        
        # Сортируем изображения
        plot.images.sort(key=lambda x: (not x.is_main, x.order))
    
    return plots

def get_plots_count(
    db: Session,
    search: str = None,
    status: str = None,
    category: str = None,
    price_min: float = None,
    price_max: float = None,
    area_min: float = None,
    area_max: float = None,
    region: str = None,
    location: str = None,
    show_hidden: bool = False
) -> int:
    query = db.query(func.count(models.LandPlot.id))

    # Фильтруем скрытые участки
    if not show_hidden:
        query = query.filter(models.LandPlot.is_visible == True)

    if search:
        # Добавляем поиск по кадастровым номерам
        query = query.filter(
            or_(
                models.LandPlot.title.ilike(f"%{search}%"),
                # Используем функцию для поиска в JSON поле
                func.json_extract(models.LandPlot.cadastral_numbers, '$').like(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(models.LandPlot.status == status)
    
    if price_min is not None:
        query = query.filter(models.LandPlot.price >= price_min)
    
    if price_max is not None:
        query = query.filter(models.LandPlot.price <= price_max)
    
    if area_min is not None:
        query = query.filter(models.LandPlot.area >= area_min)
    
    if area_max is not None:
        query = query.filter(models.LandPlot.area <= area_max)
    
    if region:
        query = query.filter(models.LandPlot.region == region)
    
    if location:
        query = query.filter(models.LandPlot.location == location)

    return query.scalar()

def create_land_plot(db: Session, plot: schemas.LandPlotCreate):
    try:
        plot_dict = plot.model_dump()
        print(f"Данные для создания участка: {plot_dict}")
        
        # Преобразуем поля в JSON
        if isinstance(plot_dict["description"], dict):
            plot_dict["description"] = json.dumps(plot_dict["description"])
        if isinstance(plot_dict["features"], list):
            plot_dict["features"] = json.dumps(plot_dict["features"])
        if isinstance(plot_dict["communications"], list):
            plot_dict["communications"] = json.dumps(plot_dict["communications"])
        if isinstance(plot_dict["cadastral_numbers"], list):
            plot_dict["cadastral_numbers"] = json.dumps(plot_dict["cadastral_numbers"])
        
        # Проверяем, что price_per_sotka существует
        if "price_per_sotka" not in plot_dict and hasattr(plot, "price_per_meter"):
            plot_dict["price_per_sotka"] = plot.price_per_meter
        
        # Удаляем поля, которых нет в модели
        model_fields = [c.name for c in models.LandPlot.__table__.columns]
        for key in list(plot_dict.keys()):
            if key not in model_fields and key != "price_per_meter":
                print(f"Удаляем поле {key}, которого нет в модели")
                del plot_dict[key]
        
        print(f"Данные после обработки: {plot_dict}")
        
        db_plot = models.LandPlot(**plot_dict)
        db.add(db_plot)
        db.commit()
        db.refresh(db_plot)
        
        # Десериализуем поля перед возвратом
        if isinstance(db_plot.description, str):
            db_plot.description = json.loads(db_plot.description)
        if isinstance(db_plot.features, str):
            db_plot.features = json.loads(db_plot.features) if db_plot.features else []
        if isinstance(db_plot.communications, str):
            db_plot.communications = json.loads(db_plot.communications) if db_plot.communications else []
        if isinstance(db_plot.cadastral_numbers, str):
            db_plot.cadastral_numbers = json.loads(db_plot.cadastral_numbers) if db_plot.cadastral_numbers else []
        
        return db_plot
    except Exception as e:
        db.rollback()
        print(f"Ошибка в create_land_plot: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def delete_land_plot(db: Session, plot_id: int):
    db_plot = get_land_plot(db, plot_id, show_hidden=True)
    if db_plot:
        # Удаляем связанные изображения
        for image in db_plot.images:
            # Удаляем файл изображения
            try:
                if os.path.exists(image.path):
                    os.remove(image.path)
            except Exception as e:
                print(f"Ошибка при удалении файла {image.path}: {e}")
            # Удаляем запись из базы
            db.delete(image)
        
        # Удаляем сам участок
        db.delete(db_plot)
        db.commit()
        return True
    return False

def save_image(upload_folder: str, file: UploadFile) -> tuple[str, str]:
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Обеспечиваем безопасное имя файла
        original_filename = file.filename or "unnamed_file"
        safe_filename = "".join(c for c in original_filename if c.isalnum() or c in ('-', '_', '.'))
        if not safe_filename:
            safe_filename = "unnamed_file"
            
        # Добавляем расширение, если его нет
        if '.' not in safe_filename:
            content_type = file.content_type or "application/octet-stream"
            if content_type.startswith("image/"):
                ext = content_type.split("/")[1]
                if ext == "jpeg":
                    ext = "jpg"
                safe_filename = f"{safe_filename}.{ext}"
        
        filename = f"{timestamp}_{safe_filename}"
        file_path = os.path.join(upload_folder, filename)
        
        # Создаем директорию, если она не существует
        os.makedirs(upload_folder, exist_ok=True)
        
        # Выводим отладочную информацию
        print(f"Сохранение файла: {filename}")
        print(f"Полный путь: {os.path.abspath(file_path)}")
        
        try:
            contents = file.file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            file.file.seek(0)  # Возвращаем указатель в начало файла
        except Exception as e:
            print(f"Ошибка при сохранении файла {filename}: {e}")
            raise
        
        # Возвращаем и имя файла, и путь для URL
        return filename, f"/images/{filename}"  # Изменили путь с /static/images на /images
    except Exception as e:
        print(f"Ошибка в save_image: {e}")
        import traceback
        traceback.print_exc()
        raise

def create_image(db: Session, filename: str, path: str, order: int = -1):
    try:
        # Если order не указан или -1, получаем максимальный текущий порядок
        if order == -1:
            order = db.query(func.max(models.Image.order)).scalar() or -1
            order += 1
            
        # Создаем новое изображение с указанным порядком
        db_image = models.Image(filename=filename, path=path, order=order)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    except Exception as e:
        print(f"Ошибка в create_image: {e}")
        db.rollback()
        raise

def add_image_to_plot(db: Session, plot_id: int, image_id: int):
    try:
        plot = get_land_plot(db, plot_id, show_hidden=True)
        image = db.query(models.Image).filter(models.Image.id == image_id).first()
        
        if not plot or not image:
            print(f"Не найден участок (id={plot_id}) или изображение (id={image_id})")
            return False
            
        plot.images.append(image)
        db.commit()
        return True
    except Exception as e:
        print(f"Ошибка в add_image_to_plot: {e}")
        db.rollback()
        return False

def update_land_plot(db: Session, plot_id: int, plot: schemas.LandPlotUpdate):
    db_plot = get_land_plot(db, plot_id, show_hidden=True)
    if not db_plot:
        return None
    
    plot_data = plot.model_dump(exclude_unset=True)
    
    # Преобразуем поля в JSON
    if 'description' in plot_data and isinstance(plot_data['description'], dict):
        plot_data['description'] = json.dumps(plot_data['description'])
    if 'features' in plot_data and isinstance(plot_data['features'], list):
        plot_data['features'] = json.dumps(plot_data['features'])
    if 'communications' in plot_data and isinstance(plot_data['communications'], list):
        plot_data['communications'] = json.dumps(plot_data['communications'])
    if 'cadastral_numbers' in plot_data and isinstance(plot_data['cadastral_numbers'], list):
        plot_data['cadastral_numbers'] = json.dumps(plot_data['cadastral_numbers'])
    
    for key, value in plot_data.items():
        setattr(db_plot, key, value)
    
    db.commit()
    db.refresh(db_plot)
    
    # Десериализуем поля перед возвратом
    if isinstance(db_plot.description, str):
        db_plot.description = json.loads(db_plot.description)
    if isinstance(db_plot.features, str):
        db_plot.features = json.loads(db_plot.features) if db_plot.features else []
    if isinstance(db_plot.communications, str):
        db_plot.communications = json.loads(db_plot.communications) if db_plot.communications else []
    if isinstance(db_plot.cadastral_numbers, str):
        db_plot.cadastral_numbers = json.loads(db_plot.cadastral_numbers) if db_plot.cadastral_numbers else []
    
    return db_plot

def update_plot_visibility(
    db: Session,
    plot_id: int,
    is_visible: bool
):
    db_plot = get_land_plot(db, plot_id, show_hidden=True)
    if not db_plot:
        return None
    
    db_plot.is_visible = is_visible
    db.commit()
    db.refresh(db_plot)
    return deserialize_json_fields(db_plot)

def get_image(db: Session, image_id: int):
    return db.query(models.Image).filter(models.Image.id == image_id).first()

def delete_image(db: Session, image_id: int) -> bool:
    try:
        image = get_image(db, image_id)
        if not image:
            return False
            
        # Удаляем файл
        file_path = os.path.join('static', 'images', image.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
        # Удаляем запись из БД
        db.delete(image)
        db.commit()
        return True
    except Exception as e:
        print(f"Ошибка при удалении изображения: {e}")
        db.rollback()
        return False

def set_image_as_main(db: Session, plot_id: int, image_id: int) -> bool:
    try:
        # Получаем участок и изображение
        plot = get_land_plot(db, plot_id)
        image = get_image(db, image_id)
        
        if not plot or not image:
            return False
            
        # Проверяем, принадлежит ли изображение участку
        if not any(img.id == image_id for img in plot.images):
            return False
            
        # Сбрасываем флаг is_main у всех изображений участка
        for img in plot.images:
            img.is_main = False
            
        # Устанавливаем новое главное изображение
        image.is_main = True
        
        db.commit()
        return True
    except Exception as e:
        print(f"Ошибка при установке главного изображения: {e}")
        db.rollback()
        return False

def reorder_plot_images(db: Session, plot_id: int, images: List[ImageOrder]):
    """Обновляет порядок изображений для участка"""
    try:
        # Проверяем, что все изображения принадлежат участку
        plot = get_land_plot(db, plot_id, show_hidden=True)
        if not plot:
            raise ValueError("Участок не найден")
            
        plot_image_ids = [img.id for img in plot.images]
        for image_order in images:
            if image_order.id not in plot_image_ids:
                raise ValueError(f"Изображение {image_order.id} не принадлежит участку {plot_id}")
        
        # Сначала сбрасываем флаг is_main у всех изображений участка
        for img in plot.images:
            img.is_main = False
            
        # Обновляем порядок и флаг главного изображения
        main_image_set = False
        for image_order in images:
            image = db.query(models.Image).filter(models.Image.id == image_order.id).first()
            if image:
                image.order = image_order.order
                if image_order.is_main:
                    if main_image_set:
                        raise ValueError("Может быть только одно главное изображение")
                    image.is_main = True
                    main_image_set = True
                    print(f"Устанавливаю изображение {image.id} как главное")
        
        # Если ни одно изображение не отмечено как главное, делаем первое главным
        if not main_image_set and images:
            first_image = db.query(models.Image).filter(models.Image.id == images[0].id).first()
            if first_image:
                first_image.is_main = True
                print(f"Автоматически устанавливаю первое изображение {first_image.id} как главное")
        
        db.commit()
        return True
    except Exception as e:
        print(f"Ошибка при обновлении порядка изображений: {str(e)}")
        db.rollback()
        raise e

def get_contact_info(db: Session) -> models.ContactInfo:
    return db.query(models.ContactInfo).first()

def create_contact_info(db: Session, contact_info: schemas.ContactInfoCreate) -> models.ContactInfo:
    db_contact_info = models.ContactInfo(**contact_info.model_dump())
    db.add(db_contact_info)
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

def update_contact_info(db: Session, contact_info: schemas.ContactInfoBase) -> models.ContactInfo:
    db_contact_info = get_contact_info(db)
    if not db_contact_info:
        return create_contact_info(db, schemas.ContactInfoCreate(**contact_info.model_dump()))
    
    for key, value in contact_info.model_dump().items():
        setattr(db_contact_info, key, value)
    
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

# Функции для работы с вопросами квиза
def get_quiz_questions(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[QuizQuestion]:
    """Получить список вопросов для квиза"""
    questions = (
        db.query(QuizQuestion)
        .order_by(QuizQuestion.order)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Убедимся, что options - это список
    for question in questions:
        if isinstance(question.options, str):
            question.options = json.loads(question.options)
    
    return questions

def create_quiz_question(db: Session, question: QuizQuestionCreate):
    """Создать новый вопрос для квиза"""
    question_data = question.model_dump()
    # Сериализуем options в JSON если нужно
    if not isinstance(question_data['options'], str):
        question_data['options'] = json.dumps(question_data['options'])
    
    # Добавляем текущее время
    current_time = datetime.utcnow()
    question_data['created_at'] = current_time
    question_data['updated_at'] = current_time
    
    db_question = QuizQuestion(**question_data)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Десериализуем options перед возвратом
    if isinstance(db_question.options, str):
        db_question.options = json.loads(db_question.options)
    
    return db_question

def update_quiz_question(db: Session, question_id: int, question: QuizQuestionUpdate):
    """Обновить существующий вопрос квиза"""
    db_question = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not db_question:
        return None
    
    update_data = question.model_dump(exclude_unset=True)
    
    # Сериализуем options в JSON если они есть в обновлении
    if 'options' in update_data and not isinstance(update_data['options'], str):
        update_data['options'] = json.dumps(update_data['options'])
    
    # Обновляем updated_at
    update_data['updated_at'] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    
    # Десериализуем options перед возвратом
    if isinstance(db_question.options, str):
        db_question.options = json.loads(db_question.options)
    
    return db_question

def delete_quiz_question(db: Session, question_id: int) -> bool:
    """Удалить вопрос квиза"""
    db_question = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not db_question:
        return False
    
    db.delete(db_question)
    db.commit()
    return True

# Функции для работы с заявками
def get_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    status: str = None
) -> List[Request]:
    query = db.query(Request)
    
    if type:
        query = query.filter(Request.type == type)
    if status:
        query = query.filter(Request.status == status)
    
    return query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()

def create_request(
    db: Session,
    request: schemas.RequestCreate
) -> Request:
    db_request = Request(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def update_request(
    db: Session,
    request_id: int,
    request: schemas.RequestUpdate
) -> Optional[Request]:
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        return None
    
    for key, value in request.model_dump().items():
        setattr(db_request, key, value)
    
    db.commit()
    db.refresh(db_request)
    return db_request

def get_request(
    db: Session,
    request_id: int
) -> Optional[Request]:
    return db.query(Request).filter(Request.id == request_id).first()

def get_admin_by_username(db: Session, username: str):
    return db.query(Admin).filter(Admin.username == username).first()

def get_admin_by_session(db: Session, session_token: str):
    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.session_token == session_token,
            AdminSession.is_active == True,
            AdminSession.expires_at > datetime.utcnow()
        )
        .first()
    )
    if session:
        return db.query(Admin).filter(Admin.id == session.admin_id).first()
    return None

def create_admin_session(db: Session, admin_id: int) -> AdminSession:
    # Деактивируем все предыдущие сессии
    db.query(AdminSession).filter(
        AdminSession.admin_id == admin_id,
        AdminSession.is_active == True
    ).update({"is_active": False})
    
    # Создаем новую сессию
    session = AdminSession(
        admin_id=admin_id,
        session_token=generate_session_token(),
        expires_at=create_session_expiration()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def authenticate_admin(db: Session, username: str, password: str):
    admin = get_admin_by_username(db, username)
    if not admin or not verify_password(password, admin.hashed_password):
        return None
    
    # Обновляем время последнего входа
    admin.last_login = datetime.utcnow()
    db.commit()
    
    return admin

def create_admin(db: Session, username: str, password: str):
    hashed_password = get_password_hash(password)
    db_admin = Admin(username=username, hashed_password=hashed_password)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def get_request_by_promo(db: Session, promo_code: str):
    """Получить заявку по промокоду"""
    return db.query(models.Request).filter(models.Request.promo_code == promo_code).first() 