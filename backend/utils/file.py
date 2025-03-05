import mimetypes
import os

ALLOWED_MIME_TYPES = {
    "document": [".pdf", ".doc", ".docx", ".txt", ".rtf"],
    "image": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    "archive": [".zip", ".rar", ".7z"]
}

FILE_SIZE_LIMITS = {
    "document": 10 * 1024 * 1024,  # 10MB
    "image": 5 * 1024 * 1024,      # 5MB
    "archive": 50 * 1024 * 1024    # 50MB
}

def is_allowed_file_type(filename: str, type: str) -> bool:
    """Проверяет, разрешен ли данный тип файла"""
    if type not in ALLOWED_MIME_TYPES:
        return False
    
    return any(filename.lower().endswith(ext) for ext in ALLOWED_MIME_TYPES[type])

def get_file_size_limit(type: str) -> int:
    """Возвращает максимальный размер файла для данного типа"""
    return FILE_SIZE_LIMITS.get(type, 5 * 1024 * 1024)  # По умолчанию 5MB 