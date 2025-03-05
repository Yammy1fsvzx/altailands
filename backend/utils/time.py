from datetime import datetime, timedelta

def get_msk_time(dt: datetime = None) -> datetime:
    """Конвертирует UTC время в московское (UTC+3)"""
    if dt is None:
        dt = datetime.utcnow()
    return dt + timedelta(hours=3)

def get_msk_now() -> datetime:
    """Возвращает текущее московское время"""
    return get_msk_time()

def to_utc(msk_time: datetime) -> datetime:
    """Конвертирует московское время в UTC"""
    return msk_time - timedelta(hours=3) 