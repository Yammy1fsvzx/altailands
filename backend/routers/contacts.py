from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
from schemas import ContactInfo, ContactInfoBase

router = APIRouter(
    prefix="/contacts",
    tags=["contacts"]
)

@router.get("", response_model=ContactInfo)
def get_contacts(db: Session = Depends(get_db)):
    contact_info = crud.get_contact_info(db)
    if not contact_info:
        raise HTTPException(status_code=404, detail="Contact info not found")
    return contact_info

@router.put("", response_model=ContactInfo)
def update_contacts(contact_info: ContactInfoBase, db: Session = Depends(get_db)):
    return crud.update_contact_info(db, contact_info) 