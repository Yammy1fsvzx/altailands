from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import crud
from schemas import (
    QuizQuestion, QuizQuestionCreate,
    Request, RequestCreate, RequestUpdate,
    RequestType
)
import random
import string
from telegram_bot.bot import bot
from telegram_bot.notifications import send_request_notification
from telegram_bot.config import config

router = APIRouter(
    prefix="/requests",
    tags=["requests"]
)

def generate_promo_code(length: int = 8) -> str:
    """Генерирует случайный промокод"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# Управление вопросами квиза
@router.get("/quiz/questions", response_model=List[QuizQuestion])
def get_quiz_questions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_quiz_questions(db, skip=skip, limit=limit)

@router.post("/quiz/questions", response_model=QuizQuestion)
def create_quiz_question(
    question: QuizQuestionCreate,
    db: Session = Depends(get_db)
):
    return crud.create_quiz_question(db, question)

@router.put("/quiz/questions/{question_id}", response_model=QuizQuestion)
def update_quiz_question(
    question_id: int,
    question: QuizQuestionCreate,
    db: Session = Depends(get_db)
):
    db_question = crud.update_quiz_question(db, question_id, question)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@router.delete("/quiz/questions/{question_id}")
def delete_quiz_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    if crud.delete_quiz_question(db, question_id):
        return {"message": "Question deleted successfully"}
    raise HTTPException(status_code=404, detail="Question not found")

# Управление заявками
@router.get("/", response_model=List[Request])
def get_requests(
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    return crud.get_requests(db, skip=skip, limit=limit, type=type, status=status)

@router.post("/", response_model=dict)
async def create_request(
    request: RequestCreate,
    db: Session = Depends(get_db)
):
    """Создать новую заявку (публичный эндпоинт)"""
    request_data = request.model_dump()
    
    # Генерируем промокод для квиза
    if request_data["type"] == RequestType.QUIZ:
        request_data["promo_code"] = generate_promo_code()
    
    # Создаем заявку
    new_request = crud.create_request(db, RequestCreate(**request_data))
    
    # Отправляем уведомление в Telegram
    try:
        notification_data = {
            "type": new_request.type,
            "name": new_request.name,
            "phone": new_request.phone,
            "email": new_request.email,
            "message": getattr(new_request, 'message', None),
            "promo_code": getattr(new_request, 'promo_code', None),
            "answers": getattr(new_request, 'answers', None)
        }
        await send_request_notification(bot, notification_data)
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
    
    # Возвращаем промокод, если это квиз
    return {
        "status": "success",
        "promo_code": new_request.promo_code if new_request.type == RequestType.QUIZ else None
    }

@router.put("/{request_id}", response_model=Request)
def update_request(
    request_id: int,
    request: RequestUpdate,
    db: Session = Depends(get_db)
):
    db_request = crud.update_request(db, request_id, request)
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.get("/{request_id}", response_model=Request)
def get_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    db_request = crud.get_request(db, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request 