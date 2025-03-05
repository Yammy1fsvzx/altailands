from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Union, Any
from models import PlotStatus, PlotCategory, RequestType
from datetime import datetime

class TerrainBase(BaseModel):
    isNearRiver: bool
    isNearMountains: bool
    isNearForest: bool
    isNearLake: bool
    hasViewOnMountains: bool
    landscape: str
    
    model_config = ConfigDict(from_attributes=True)

class Coordinates(BaseModel):
    lat: float = Field(ge=-90, le=90)  # Широта
    lng: float = Field(ge=-180, le=180)  # Долгота
    
    model_config = ConfigDict(from_attributes=True)

class ImageBase(BaseModel):
    filename: str
    path: str

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class FileAttachment(BaseModel):
    id: str
    name: str
    url: str
    type: str

class Description(BaseModel):
    text: str
    attachments: List[FileAttachment] = []

class LandPlotBase(BaseModel):
    title: str
    description: Description
    cadastral_numbers: List[str]
    area: float
    specified_area: Optional[float] = None
    price: int
    price_per_sotka: int
    price_per_meter: Optional[int] = None
    location: str
    region: str
    land_category: str
    permitted_use: str
    features: List[str]
    communications: List[str]
    status: PlotStatus = PlotStatus.AVAILABLE
    is_visible: bool = True
    
    @property
    def price_per_meter(self) -> int:
        """Виртуальное свойство для совместимости с фронтендом"""
        return self.price_per_sotka

    @price_per_meter.setter
    def price_per_meter(self, value: int):
        """Сеттер для price_per_meter"""
        self.price_per_sotka = value

    model_config = ConfigDict(from_attributes=True)

class LandPlotCreate(LandPlotBase):
    pass

class LandPlot(LandPlotBase):
    id: int
    images: List[Image] = []
    
    model_config = ConfigDict(from_attributes=True)

class PlotVisibility(BaseModel):
    is_visible: bool

class LandPlotUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[Description] = None
    cadastral_numbers: Optional[List[str]] = None
    area: Optional[float] = None
    specified_area: Optional[float] = None
    price: Optional[int] = None
    price_per_meter: Optional[int] = None
    price_per_sotka: Optional[int] = None
    location: Optional[str] = None
    region: Optional[str] = None
    land_category: Optional[str] = None
    permitted_use: Optional[str] = None
    features: Optional[List[str]] = None
    communications: Optional[List[str]] = None
    status: Optional[PlotStatus] = None
    is_visible: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)

class ImageOrder(BaseModel):
    id: int
    order: int
    is_main: bool

class ImageReorderRequest(BaseModel):
    images: List[ImageOrder]

class WorkHours(BaseModel):
    monday_friday: str
    saturday_sunday: str

class SocialLink(BaseModel):
    enabled: bool
    username: str

class SocialLinks(BaseModel):
    whatsapp: SocialLink
    telegram: SocialLink
    vk: SocialLink

class ContactInfoBase(BaseModel):
    phone: str
    email: str
    address: str
    work_hours: WorkHours
    social_links: SocialLinks

class ContactInfoCreate(ContactInfoBase):
    pass

class ContactInfo(ContactInfoBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class QuizQuestionBase(BaseModel):
    question: str
    options: List[str]
    order: int
    is_active: bool = True

class QuizQuestionCreate(QuizQuestionBase):
    pass

class QuizQuestionUpdate(QuizQuestionBase):
    question: Optional[str] = None
    options: Optional[List[str]] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class QuizQuestion(QuizQuestionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RequestBase(BaseModel):
    name: str
    phone: str
    type: RequestType
    email: str
    message: Optional[str] = None
    answers: Optional[Dict] = None
    promo_code: Optional[str] = None
    status: Optional[str] = "new"

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class Request(RequestBase):
    id: int
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class AdminSessionResponse(BaseModel):
    session_token: str
    expires_at: datetime

class AdminAuth(BaseModel):
    session_token: str 