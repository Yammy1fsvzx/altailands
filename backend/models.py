from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, JSON, Enum, Boolean, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime

# Связь многие-ко-многим для изображений и участков
plot_images = Table(
    'plot_images',
    Base.metadata,
    Column('plot_id', Integer, ForeignKey('land_plots.id')),
    Column('image_id', Integer, ForeignKey('images.id'))
)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"))
    session_token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)

class PlotStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"

class PlotCategory(str, enum.Enum):
    IGS = "ИЖС"
    SNT = "СНТ"
    LPH = "ЛПХ"

class LandPlot(Base):
    __tablename__ = "land_plots"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(JSON, nullable=False, default=lambda: {"text": "", "attachments": []})
    cadastral_numbers = Column(JSON, nullable=False, default=list)  # Пустой список по умолчанию
    area = Column(Float)  # площадь в м²
    specified_area = Column(Float, nullable=True)  # уточненная площадь в м²
    price = Column(Integer)
    price_per_sotka = Column(Integer)
    location = Column(String)
    region = Column(String)
    land_category = Column(String)
    permitted_use = Column(String)
    features = Column(JSON, nullable=False, default=list)  # Пустой список по умолчанию
    communications = Column(JSON, nullable=False, default=list)  # Пустой список по умолчанию
    status = Column(Enum(PlotStatus), default=PlotStatus.AVAILABLE)
    is_visible = Column(Boolean, default=True)
    
    images = relationship("Image", secondary=plot_images, back_populates="plots")

    @property
    def price_per_meter(self):
        """Виртуальное свойство для совместимости с фронтендом"""
        return self.price_per_sotka

    @price_per_meter.setter
    def price_per_meter(self, value):
        """Сеттер для price_per_meter, который сохраняет значение в price_per_sotka"""
        self.price_per_sotka = value

    def __init__(self, *args, **kwargs):
        # Преобразуем price_per_meter в price_per_sotka при создании
        if 'price_per_meter' in kwargs:
            kwargs['price_per_sotka'] = kwargs.pop('price_per_meter')
        super().__init__(*args, **kwargs)

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    path = Column(String)
    is_main = Column(Boolean, default=False, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    
    plots = relationship("LandPlot", secondary=plot_images, back_populates="images")

class ContactInfo(Base):
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    work_hours = Column(JSON)  # Для хранения режима работы
    social_links = Column(JSON)  # Для хранения соц. сетей с enabled флагом
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=False)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RequestType(str, enum.Enum):
    QUIZ = "quiz"
    CONTACT_FORM = "contact_form"
    CALLBACK = "callback"

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(RequestType), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(String, nullable=True)
    answers = Column(JSON, nullable=True)  # Ответы на вопросы квиза
    promo_code = Column(String, nullable=True)  # Сгенерированный промокод
    status = Column(String, default="new")  # new, processing, completed, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(String, nullable=True)  # Заметки администратора 

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True, default=datetime.utcnow)
    path = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    referrer = Column(String, nullable=True) 