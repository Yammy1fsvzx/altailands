from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
from sqlalchemy import func

from database import get_db
import crud
from schemas import LandPlotCreate, LandPlotUpdate, LandPlot, PlotVisibility, ImageOrder, ImageReorderRequest
import models

router = APIRouter()

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "static/images")

@router.get("/", response_model=List[LandPlot])
def get_plots(
    skip: int = 0,
    limit: int = 100,
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
    plots = crud.get_land_plots(
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
        show_hidden=False  # Для публичного API не показываем скрытые участки
    )
    # Преобразуем данные для фронтенда
    for plot in plots:
        if not hasattr(plot, 'price_per_meter'):
            setattr(plot, 'price_per_meter', plot.price_per_sotka)
    return plots

@router.get("/regions", response_model=List[str])
def get_unique_regions(db: Session = Depends(get_db)):
    """Получить список уникальных регионов из базы данных"""
    regions = (
        db.query(models.LandPlot.region)
        .filter(models.LandPlot.is_visible == True)  # Только видимые участки
        .group_by(models.LandPlot.region)
        .all()
    )
    # Фильтруем None и пустые строки, сортируем результат
    return sorted([region[0] for region in regions if region[0]])

@router.get("/locations", response_model=List[str])
def get_unique_locations(db: Session = Depends(get_db)):
    """Получить список уникальных локаций из базы данных"""
    locations = (
        db.query(models.LandPlot.location)
        .filter(models.LandPlot.is_visible == True)  # Только видимые участки
        .group_by(models.LandPlot.location)
        .all()
    )
    # Фильтруем None и пустые строки, сортируем результат
    return sorted([location[0] for location in locations if location[0]])

@router.get("/categories", response_model=List[str])
def get_unique_categories(db: Session = Depends(get_db)):
    """Получить список уникальных категорий земель из базы данных"""
    categories = (
        db.query(models.LandPlot.land_category)
        .filter(models.LandPlot.is_visible == True)  # Только видимые участки
        .group_by(models.LandPlot.land_category)
        .all()
    )
    # Фильтруем None и пустые строки, сортируем результат
    return sorted([category[0] for category in categories if category[0]])

@router.get("/count", response_model=dict)
def get_plots_count(
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
        show_hidden=False  # Для публичного API не показываем скрытые участки
    )
    return {"total": total}

@router.get("/{plot_id}", response_model=LandPlot)
def get_plot(plot_id: int, db: Session = Depends(get_db)):
    plot = crud.get_land_plot(db, plot_id=plot_id)
    if plot is None:
        raise HTTPException(status_code=404, detail="Plot not found")
    
    # Добавляем price_per_meter
    if not hasattr(plot, 'price_per_meter'):
        setattr(plot, 'price_per_meter', plot.price_per_sotka)
    
    return plot

@router.post("/", response_model=LandPlot)
def create_plot(plot: LandPlotCreate, db: Session = Depends(get_db)):
    try:
        # Проверяем наличие обязательных полей
        if not plot.title:
            raise HTTPException(status_code=422, detail="Название участка обязательно")
        if not plot.description or not plot.description.text:
            raise HTTPException(status_code=422, detail="Описание участка обязательно")
        if not plot.cadastral_numbers or len(plot.cadastral_numbers) == 0:
            raise HTTPException(status_code=422, detail="Кадастровый номер обязателен")
        if not plot.area or plot.area <= 0:
            raise HTTPException(status_code=422, detail="Площадь участка должна быть больше 0")
        if not plot.price or plot.price <= 0:
            raise HTTPException(status_code=422, detail="Цена участка должна быть больше 0")
        if not plot.price_per_sotka or plot.price_per_sotka <= 0:
            raise HTTPException(status_code=422, detail="Цена за сотку должна быть больше 0")
        if not plot.location:
            raise HTTPException(status_code=422, detail="Местоположение обязательно")
        if not plot.region:
            raise HTTPException(status_code=422, detail="Регион обязателен")
        if not plot.land_category:
            raise HTTPException(status_code=422, detail="Категория земель обязательна")
        if not plot.permitted_use:
            raise HTTPException(status_code=422, detail="Вид разрешенного использования обязателен")
            
        # Проверяем, что features и communications - это списки
        if not isinstance(plot.features, list):
            raise HTTPException(status_code=422, detail="Особенности участка должны быть списком")
        if not isinstance(plot.communications, list):
            raise HTTPException(status_code=422, detail="Коммуникации должны быть списком")
            
        # Проверяем, что attachments - это список
        if not isinstance(plot.description.attachments, list):
            raise HTTPException(status_code=422, detail="Вложения должны быть списком")
            
        # Создаем участок
        return crud.create_land_plot(db=db, plot=plot)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ошибка при создании участка: {str(e)}")
        if "UNIQUE constraint failed: land_plots.cadastral_number" in str(e):
            raise HTTPException(
                status_code=400,
                detail="Участок с таким кадастровым номером уже существует в базе данных. Пожалуйста, проверьте правильность введенного номера."
            )
        raise HTTPException(
            status_code=500,
            detail=f"Произошла ошибка при создании участка: {str(e)}"
        )

@router.patch("/{plot_id}", response_model=LandPlot)
def update_plot(
    plot_id: int,
    plot: LandPlotUpdate,
    db: Session = Depends(get_db)
):
    db_plot = crud.update_land_plot(db, plot_id=plot_id, plot=plot)
    if db_plot is None:
        raise HTTPException(status_code=404, detail="Участок не найден")
    return db_plot

@router.patch("/{plot_id}/visibility", response_model=LandPlot)
def toggle_plot_visibility(
    plot_id: int,
    visibility: PlotVisibility,
    db: Session = Depends(get_db)
):
    db_plot = crud.update_plot_visibility(db, plot_id=plot_id, is_visible=visibility.is_visible)
    if db_plot is None:
        raise HTTPException(status_code=404, detail="Участок не найден")
    return db_plot

@router.delete("/{plot_id}")
def delete_plot(plot_id: int, db: Session = Depends(get_db)):
    if crud.delete_land_plot(db, plot_id):
        return {"message": "Plot deleted successfully"}
    raise HTTPException(status_code=404, detail="Plot not found")

@router.post("/{plot_id}/images/reorder")
def reorder_images(
    plot_id: int,
    image_order: ImageReorderRequest,
    db: Session = Depends(get_db)
):
    """Обновляет порядок изображений для участка"""
    try:
        print(f"Получен запрос на обновление порядка изображений для участка {plot_id}")
        print(f"Данные запроса: {image_order}")
        
        # Проверяем, что все id являются целыми числами
        for img in image_order.images:
            if not isinstance(img.id, int):
                print(f"Ошибка: ID изображения должен быть целым числом, получено: {img.id} типа {type(img.id)}")
                raise HTTPException(
                    status_code=422, 
                    detail=f"ID изображения должен быть целым числом, получено: {img.id} типа {type(img.id)}"
                )
            
            # Проверяем, что order является целым числом
            if not isinstance(img.order, int):
                print(f"Ошибка: order должен быть целым числом, получено: {img.order} типа {type(img.order)}")
                raise HTTPException(
                    status_code=422, 
                    detail=f"order должен быть целым числом, получено: {img.order} типа {type(img.order)}"
                )
            
            # Проверяем, что is_main является булевым значением
            if not isinstance(img.is_main, bool):
                print(f"Ошибка: is_main должен быть булевым значением, получено: {img.is_main} типа {type(img.is_main)}")
                raise HTTPException(
                    status_code=422, 
                    detail=f"is_main должен быть булевым значением, получено: {img.is_main} типа {type(img.is_main)}"
                )
        
        # Проверяем, что участок существует
        plot = crud.get_land_plot(db, plot_id, show_hidden=True)
        if not plot:
            print(f"Ошибка: Участок с ID {plot_id} не найден")
            raise HTTPException(status_code=404, detail=f"Участок с ID {plot_id} не найден")
        
        # Проверяем, что все изображения принадлежат участку
        plot_image_ids = [img.id for img in plot.images]
        for img in image_order.images:
            if img.id not in plot_image_ids:
                print(f"Ошибка: Изображение с ID {img.id} не принадлежит участку {plot_id}")
                raise HTTPException(
                    status_code=422, 
                    detail=f"Изображение с ID {img.id} не принадлежит участку {plot_id}"
                )
        
        # Вызываем функцию обновления порядка изображений
        crud.reorder_plot_images(db, plot_id, image_order.images)
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Ошибка при обновлении порядка изображений: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении порядка изображений: {str(e)}")

@router.post("/{plot_id}/images/")
async def upload_plot_image(
    plot_id: int,
    file: UploadFile = File(...),
    is_main: bool = Form(False),
    order: int = Form(-1),
    db: Session = Depends(get_db)
):
    try:
        print(f"Начало загрузки изображения для участка {plot_id}")
        print(f"Информация о файле: имя={file.filename}, тип={file.content_type}, порядок={order}, is_main={is_main}")
        
        # Проверяем существование участка
        plot = crud.get_land_plot(db, plot_id)
        if not plot:
            print(f"Участок {plot_id} не найден")
            raise HTTPException(status_code=404, detail="Участок не найден")
        
        # Проверяем тип файла
        if not file.content_type.startswith('image/'):
            print(f"Неверный тип файла: {file.content_type}")
            raise HTTPException(
                status_code=422,
                detail=f"Неверный формат файла: {file.content_type}. Разрешены только изображения"
            )
        
        # Проверяем размер файла (максимум 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB в байтах
        file_size = 0
        try:
            file.file.seek(0, 2)  # Перемещаемся в конец файла
            file_size = file.file.tell()  # Получаем размер
            file.file.seek(0)  # Возвращаемся в начало
        except Exception as e:
            print(f"Ошибка при определении размера файла: {str(e)}")
            # Продолжаем выполнение, так как это не критическая ошибка
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=422,
                detail=f"Размер файла ({file_size} байт) превышает максимально допустимый размер (10MB)"
            )
        
        # Создаем директорию, если её нет
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Сохраняем файл
        try:
            filename, file_path = crud.save_image(UPLOAD_FOLDER, file)
            if not filename:
                raise HTTPException(status_code=500, detail="Ошибка при сохранении файла")
        except Exception as e:
            print(f"Ошибка при сохранении файла: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Ошибка при сохранении файла: {str(e)}")
            
        # Создаем запись в базе данных с указанным порядком
        try:
            image = crud.create_image(db, filename=filename, path=file_path, order=order)
            if not image:
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
                raise HTTPException(status_code=500, detail="Ошибка при создании записи изображения")
        except Exception as e:
            print(f"Ошибка при создании записи изображения: {str(e)}")
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Ошибка при создании записи изображения: {str(e)}")
        
        # Привязываем изображение к участку
        try:
            if not crud.add_image_to_plot(db, plot_id, image.id):
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
                db.delete(image)
                db.commit()
                raise HTTPException(status_code=500, detail="Ошибка при привязке изображения к участку")
        except Exception as e:
            print(f"Ошибка при привязке изображения к участку: {str(e)}")
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, filename))
                db.delete(image)
                db.commit()
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Ошибка при привязке изображения к участку: {str(e)}")
        
        # Если это первое изображение или указано как главное, устанавливаем его главным
        try:
            if is_main or len(plot.images) == 1:
                crud.set_image_as_main(db, plot_id, image.id)
        except Exception as e:
            print(f"Ошибка при установке главного изображения: {str(e)}")
            # Продолжаем выполнение, так как это не критическая ошибка
        
        return {"filename": filename, "path": file_path, "id": image.id}
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Необработанная ошибка при загрузке изображения: {str(e)}"
        )

@router.delete("/{plot_id}/images/{image_id}")
async def delete_plot_image(
    plot_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    try:
        image = crud.get_image(db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Изображение не найдено")
            
        if not any(plot.id == plot_id for plot in image.plots):
            raise HTTPException(status_code=403, detail="Изображение не принадлежит данному участку")
            
        if crud.delete_image(db, image_id):
            return {"message": "Изображение успешно удалено"}
        raise HTTPException(status_code=500, detail="Ошибка при удалении изображения")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Необработанная ошибка при удалении изображения: {str(e)}"
        )

@router.patch("/{plot_id}/images/{image_id}/main")
async def set_main_image(
    plot_id: int,
    image_id: int,
    db: Session = Depends(get_db)
):
    try:
        image = crud.get_image(db, image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Изображение не найдено")
            
        if not any(plot.id == plot_id for plot in image.plots):
            raise HTTPException(status_code=403, detail="Изображение не принадлежит данному участку")
            
        if crud.set_image_as_main(db, plot_id, image_id):
            return {"message": "Изображение успешно установлено как главное"}
        raise HTTPException(status_code=500, detail="Ошибка при установке главного изображения")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Необработанная ошибка при установке главного изображения: {str(e)}"
        ) 