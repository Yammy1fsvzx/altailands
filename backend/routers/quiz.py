from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
from typing import List
from schemas import QuizQuestion, RequestCreate, RequestType, QuizQuestionCreate, QuizQuestionUpdate
import random
import string
from telegram_bot.bot import bot
from telegram_bot.notifications import send_request_notification

router = APIRouter(
    prefix="/quiz",
    tags=["quiz"]
)

def generate_promo_code(length: int = 8) -> str:
    """Генерирует случайный промокод"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.get("/questions", response_model=List[QuizQuestion])
def get_quiz_questions(
    db: Session = Depends(get_db)
):
    """Получить список активных вопросов для квиза (публичный эндпоинт)"""
    return crud.get_quiz_questions(db)

@router.post("/request", response_model=dict)
async def submit_quiz(
    request: RequestCreate,
    db: Session = Depends(get_db)
):
    """Отправить ответы на квиз"""
    # Генерируем промокод и устанавливаем тип
    request_data = request.model_dump()
    request_data["promo_code"] = generate_promo_code()
    request_data["type"] = RequestType.QUIZ
    
    # Создаем заявку
    new_request = crud.create_request(db, RequestCreate(**request_data))
    
    # Отправляем уведомление в Telegram
    try:
        notification_data = {
            "type": "quiz",
            "name": new_request.name,
            "phone": new_request.phone,
            "email": new_request.email,
            "promo_code": new_request.promo_code,
            "answers": new_request.answers
        }
        await send_request_notification(bot, notification_data)
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
    
    # Возвращаем промокод
    return {
        "status": "success",
        "promo_code": new_request.promo_code
    }

@router.post("/questions", response_model=QuizQuestion)
def create_quiz_question(
    question: QuizQuestionCreate,
    db: Session = Depends(get_db)
):
    """Создать новый вопрос для квиза"""
    return crud.create_quiz_question(db, question)

@router.put("/questions/{question_id}", response_model=QuizQuestion)
def update_quiz_question(
    question_id: int,
    question: QuizQuestionUpdate,
    db: Session = Depends(get_db)
):
    """Обновить существующий вопрос квиза"""
    db_question = crud.update_quiz_question(db, question_id, question)
    if not db_question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    return db_question

@router.delete("/questions/{question_id}")
def delete_quiz_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """Удалить вопрос квиза"""
    if crud.delete_quiz_question(db, question_id):
        return {"message": "Вопрос успешно удален"}
    raise HTTPException(status_code=404, detail="Вопрос не найден") 