from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import Command
import crud
from database import get_db
from sqlalchemy.orm import Session

router = Router()

@router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я бот для уведомлений о новых заявках на AltaiLand.\n\n"
        "Доступные команды:\n"
        "/check_promo [код] - проверить валидность промокода"
    )

@router.message(Command("check_promo"))
async def cmd_check_promo(message: Message):
    try:
        # Получаем промокод из сообщения
        promo_code = message.text.split()[1]
        
        # Проверяем промокод в базе
        db: Session = next(get_db())
        request = crud.get_request_by_promo(db, promo_code)
        
        if not request:
            await message.answer("❌ Промокод не найден!")
            return
            
        if request.status == "used":
            await message.answer("❌ Этот промокод уже был использован!")
            return
            
        await message.answer("✅ Промокод действителен и может быть использован!")
        
    except IndexError:
        await message.answer("❌ Пожалуйста, укажите промокод после команды. Пример: /check_promo ABC123") 