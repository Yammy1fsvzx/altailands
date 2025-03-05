from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
import asyncio
from .config import config
from .handlers import router as handlers_router
from .notifications import send_request_notification

# Инициализация бота и диспетчера
bot = Bot(token=config.telegram_bot_token)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

# Подключаем все обработчики
dp.include_router(handlers_router)

# Функция для отправки уведомления о новой заявке
async def send_request_notification(admin_chat_id: int, request_data: dict):
    text = f"""🔔 Новая заявка!

📝 Имя: {request_data.get('name')}
📱 Телефон: {request_data.get('phone')}
🏷 Участок: {request_data.get('plot_number')}

Проверьте админ-панель для подробной информации."""
    
    await bot.send_message(chat_id=admin_chat_id, text=text)

# Функция запуска бота
async def start_bot():
    try:
        await dp.start_polling(bot)
    except Exception as e:
        print(f"Error starting bot: {e}")
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(start_bot()) 