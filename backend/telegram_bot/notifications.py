from aiogram import Bot
from .config import config
import logging
import json

logger = logging.getLogger(__name__)

async def send_quiz_request_notification(bot: Bot, request_data: dict):
    try:
        answers_text = "Нет ответов"
        if request_data.get('answers'):
            try:
                answers = request_data['answers']
                if isinstance(answers, str):
                    answers = json.loads(answers)
                answers_text = "\n".join([f"- {q}: {a}" for q, a in answers.items()])
            except:
                answers_text = "Ошибка при обработке ответов"

        text = f"""🎯 Новая заявка из квиза!

📝 Имя: {request_data.get('name')}
📱 Телефон: {request_data.get('phone')}
📧 Email: {request_data.get('email')}
🎲 Промокод: {request_data.get('promo_code')}

📋 Ответы на вопросы:
{answers_text}

Проверьте админ-панель для подробной информации."""
        
        await bot.send_message(chat_id=config.admin_chat_id, text=text)
        logger.info(f"Отправлено уведомление о новой заявке из квиза от {request_data.get('name')}")
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления о квизе: {e}")
        raise

async def send_plot_request_notification(bot: Bot, request_data: dict):
    try:
        text = f"""🏠 Новая заявка!

📝 Имя: {request_data.get('name')}
📱 Телефон: {request_data.get('phone')}
📧 Email: {request_data.get('email')}
💬 Сообщение: {request_data.get('message', 'Не указано')}

Проверьте админ-панель для подробной информации."""
        
        await bot.send_message(chat_id=config.admin_chat_id, text=text)
        logger.info(f"Отправлено уведомление о новой заявке от {request_data.get('name')}")
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления о заявке: {e}")
        raise

async def send_request_notification(bot: Bot, request_data: dict):
    """Выбирает подходящий формат уведомления в зависимости от типа заявки"""
    try:
        if request_data.get('type') == 'quiz':
            await send_quiz_request_notification(bot, request_data)
        else:
            await send_plot_request_notification(bot, request_data)
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления: {e}")
        raise 