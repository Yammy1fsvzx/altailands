from fastapi import APIRouter, Depends, Request, HTTPException, Header, UploadFile, File, Form
from sqlalchemy.sql import func
from database import get_db
from models import QuizQuestion, Request as RequestModel, LandPlot, Visitor, Admin, AdminSession
from datetime import datetime, timedelta
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import Optional, List
from utils.time import get_msk_time, get_msk_now, to_utc
import crud
from schemas import (
    LandPlot as LandPlotSchema,
    AdminLogin,
    AdminResponse,
    AdminSessionResponse,
    PlotVisibility,
    LandPlotUpdate
)
import os
import uuid
from utils.file import is_allowed_file_type, get_file_size_limit
from pydantic import BaseModel

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

async def get_current_admin(
    session_token: str = Header(..., alias="X-Admin-Token"),
    db: Session = Depends(get_db)
):
    admin = crud.get_admin_by_session(db, session_token)
    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Недействительная или истекшая сессия администратора"
        )
    return admin

@router.post("/login", response_model=AdminSessionResponse)
async def login(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = crud.authenticate_admin(db, login_data.username, login_data.password)
    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Неверное имя пользователя или пароль"
        )
    
    session = crud.create_admin_session(db, admin.id)
    return AdminSessionResponse(
        session_token=session.session_token,
        expires_at=session.expires_at
    )

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_admin)
):
    return current_admin

@router.get("/stats")
async def get_admin_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Получение общей статистики для административной панели
    """
    # Статистика заявок
    total_requests = db.query(RequestModel).count()
    new_requests = db.query(RequestModel).filter(RequestModel.status == "new").count()
    completed_requests = db.query(RequestModel).filter(RequestModel.status == "completed").count()
    
    # Статистика участков
    total_plots = db.query(LandPlot).count()
    available_plots = db.query(LandPlot).filter(LandPlot.status == "available").count()
    
    # Статистика квиза
    quiz_questions = db.query(QuizQuestion).count()
    quiz_completions = db.query(RequestModel).filter(RequestModel.type == "quiz").count()

    # Текущие онлайн пользователи (за последние 5 минут)
    five_minutes_ago = to_utc(get_msk_now() - timedelta(minutes=5))
    current_online = db.query(func.count(func.distinct(Visitor.session_id))).filter(
        Visitor.timestamp >= five_minutes_ago
    ).scalar()
    
    return {
        "total_requests": total_requests,
        "new_requests": new_requests,
        "completed_requests": completed_requests,
        "total_plots": total_plots,
        "available_plots": available_plots,
        "quiz_questions": quiz_questions,
        "quiz_completions": quiz_completions,
        "current_online": current_online
    }

@router.get("/stats/visitors")
async def get_visitors_stats(db: Session = Depends(get_db)):
    """
    Получение статистики посещаемости сайта
    """
    now = get_msk_now()
    
    # Данные за последние 24 часа
    hourly_data = []
    for i in range(24):
        hour_start = now - timedelta(hours=23-i)
        hour_end = hour_start + timedelta(hours=1)
        visitors_count = db.query(func.count(func.distinct(Visitor.session_id))).filter(
            and_(
                Visitor.timestamp >= to_utc(hour_start),
                Visitor.timestamp < to_utc(hour_end)
            )
        ).scalar()
        hourly_data.append({
            "time": hour_start.strftime("%H:00"),
            "visitors": visitors_count
        })
    
    # Данные за последние 7 дней
    daily_data = []
    for i in range(7):
        day_start = (now - timedelta(days=6-i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        visitors_count = db.query(func.count(func.distinct(Visitor.session_id))).filter(
            and_(
                Visitor.timestamp >= to_utc(day_start),
                Visitor.timestamp < to_utc(day_end)
            )
        ).scalar()
        daily_data.append({
            "date": day_start.strftime("%d.%m"),
            "visitors": visitors_count
        })
    
    # Данные за последние 30 дней
    monthly_data = []
    for i in range(30):
        day_start = (now - timedelta(days=29-i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        visitors_count = db.query(func.count(func.distinct(Visitor.session_id))).filter(
            and_(
                Visitor.timestamp >= to_utc(day_start),
                Visitor.timestamp < to_utc(day_end)
            )
        ).scalar()
        monthly_data.append({
            "date": day_start.strftime("%d.%m"),
            "visitors": visitors_count
        })
    
    return {
        "hourly": hourly_data,
        "daily": daily_data,
        "monthly": monthly_data
    }

class VisitData(BaseModel):
    session_id: Optional[str] = None

@router.post("/track-visit")
async def track_visit(visit_data: VisitData, request: Request, db: Session = Depends(get_db)):
    """
    Записывает информацию о посещении
    """
    path = request.headers.get("referer", "/")
    
    # Игнорируем запросы к админке
    if "/admin/" in path:
        return {"status": "ignored"}
    
    # Используем session_id из тела запроса, если есть, иначе ищем в cookies или ставим "unknown"
    session_id = visit_data.session_id or request.cookies.get("session_id", "unknown")
    
    visitor = Visitor(
        session_id=session_id,
        path=path,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host,
        referrer=request.headers.get("referer"),
        timestamp=to_utc(get_msk_now())  # Сохраняем в UTC, но берем текущее московское время
    )
    db.add(visitor)
    db.commit()
    return {"status": "success"}

@router.get("/plots/count", response_model=dict)
def get_admin_plots_count(
    search: str = None,
    status: str = None,
    category: str = None,
    price_min: float = None,
    price_max: float = None,
    area_min: float = None,
    area_max: float = None,
    region: str = None,
    location: str = None,
    db: Session = Depends(get_db)
):
    total = crud.get_plots_count(
        db,
        search=search,
        status=status,
        category=category,
        price_min=price_min,
        price_max=price_max,
        area_min=area_min,
        area_max=area_max,
        region=region,
        location=location,
        show_hidden=True  # Для админки показываем все участки
    )
    return {"total": total}

@router.get("/plots", response_model=List[LandPlotSchema])
def get_admin_plots(
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
    db: Session = Depends(get_db)
):
    return crud.get_land_plots(
        db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        category=category,
        price_min=price_min,
        price_max=price_max,
        area_min=area_min,
        area_max=area_max,
        region=region,
        location=location,
        show_hidden=True  # Для админки показываем все участки
    )

@router.get("/plots/{plot_id}", response_model=LandPlotSchema)
def get_admin_plot(
    plot_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получить информацию об участке, включая скрытые (только для админов)"""
    db_plot = crud.get_land_plot(db, plot_id=plot_id, show_hidden=True)
    if db_plot is None:
        raise HTTPException(status_code=404, detail="Участок не найден")
    return db_plot

@router.patch("/plots/{plot_id}/visibility", response_model=LandPlotSchema)
def toggle_admin_plot_visibility(
    plot_id: int,
    visibility: PlotVisibility,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Изменить видимость участка (только для админов)"""
    db_plot = crud.update_plot_visibility(db, plot_id=plot_id, is_visible=visibility.is_visible)
    if db_plot is None:
        raise HTTPException(status_code=404, detail="Участок не найден")
    return db_plot

@router.delete("/plots/{plot_id}")
def delete_admin_plot(
    plot_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удалить участок (только для админов)"""
    if crud.delete_land_plot(db, plot_id):
        return {"message": "Участок успешно удален"}
    raise HTTPException(status_code=404, detail="Участок не найден")

@router.patch("/plots/{plot_id}", response_model=LandPlotSchema)
def update_admin_plot(
    plot_id: int,
    plot: LandPlotUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновить информацию об участке (только для админов)"""
    db_plot = crud.update_land_plot(db, plot_id=plot_id, plot=plot)
    if db_plot is None:
        raise HTTPException(status_code=404, detail="Участок не найден")
    return db_plot

# Директория для загрузки файлов
UPLOAD_FOLDER = os.path.join("static", "uploads")

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(default="document")
):
    print(f"Загрузка документа: {file.filename}, тип: {document_type}")
    
    try:
        # Проверяем расширение файла
        allowed_extensions = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".xls", ".xlsx"]
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Неподдерживаемый тип файла. Разрешены только: {', '.join(allowed_extensions)}"
            )
        
        # Проверяем размер файла (10MB максимум)
        MAX_SIZE = 10 * 1024 * 1024
        contents = await file.read()
        if len(contents) > MAX_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Файл слишком большой. Максимальный размер: 10MB"
            )
        
        # Создаем директорию, если её нет
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Генерируем уникальное имя файла
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(uuid.uuid4())[:8]
        filename = f"{timestamp}_{file_id}{file_ext}"
        
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Возвращаем информацию о файле
        return {
            "id": file_id,
            "name": file.filename,
            "url": f"/uploads/{filename}",
            "type": document_type,
            "size": len(contents)
        }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ошибка при загрузке файла: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке файла: {str(e)}")

@router.post("/upload-documents")
async def upload_documents(
    files: List[UploadFile] = File(...),
    document_type: str = Form(default="document")
):
    print(f"Загрузка {len(files)} документов, тип: {document_type}")
    
    uploaded_files = []
    
    for file in files:
        try:
            # Проверяем расширение файла
            allowed_extensions = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".xls", ".xlsx"]
            file_ext = os.path.splitext(file.filename)[1].lower()
            
            if file_ext not in allowed_extensions:
                continue  # Пропускаем неподдерживаемые файлы
            
            # Проверяем размер файла (10MB максимум)
            MAX_SIZE = 10 * 1024 * 1024
            contents = await file.read()
            if len(contents) > MAX_SIZE:
                continue  # Пропускаем слишком большие файлы
            
            # Создаем директорию, если её нет
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            # Генерируем уникальное имя файла
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_id = str(uuid.uuid4())[:8]
            filename = f"{timestamp}_{file_id}{file_ext}"
            
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            
            # Сохраняем файл
            with open(file_path, "wb") as f:
                f.write(contents)
            
            # Добавляем информацию о файле в список
            uploaded_files.append({
                "id": file_id,
                "name": file.filename,
                "url": f"/uploads/{filename}",
                "type": document_type,
                "size": len(contents)
            })
                
        except Exception as e:
            print(f"Ошибка при загрузке файла {file.filename}: {str(e)}")
            # Продолжаем с другими файлами
    
    return uploaded_files 