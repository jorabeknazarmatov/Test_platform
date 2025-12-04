"""
Custom exception'lar moduli
Test platformasi uchun maxsus exception'lar
"""
from typing import Any, Optional


class AppException(Exception):
    """Asosiy application exception"""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        detail: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resurs topilmaganda"""
    def __init__(self, resource: str, resource_id: Any = None):
        message = f"{resource} topilmadi"
        if resource_id:
            message = f"{resource} (ID: {resource_id}) topilmadi"
        super().__init__(message=message, status_code=404)


class AlreadyExistsException(AppException):
    """Resurs allaqachon mavjud bo'lganda"""
    def __init__(self, resource: str, field: str = None, value: Any = None):
        message = f"{resource} allaqachon mavjud"
        if field and value:
            message = f"{resource} ({field}: {value}) allaqachon mavjud"
        super().__init__(message=message, status_code=400)


class AuthenticationException(AppException):
    """Autentifikatsiya xatosi"""
    def __init__(self, message: str = "Autentifikatsiya xatosi"):
        super().__init__(message=message, status_code=401)


class AuthorizationException(AppException):
    """Avtorizatsiya xatosi"""
    def __init__(self, message: str = "Ruxsat yo'q"):
        super().__init__(message=message, status_code=403)


class ValidationException(AppException):
    """Ma'lumotlar validatsiya xatosi"""
    def __init__(self, message: str, detail: Any = None):
        super().__init__(message=message, status_code=422, detail=detail)


class OTPException(AppException):
    """OTP bilan bog'liq xatolar"""
    def __init__(self, message: str, status_code: int = 401, detail: Any = None):
        super().__init__(message=message, status_code=status_code, detail=detail)


class SessionException(AppException):
    """Test sessiyasi bilan bog'liq xatolar"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message=message, status_code=status_code)


class DatabaseException(AppException):
    """Database bilan ishlashda xatolar"""
    def __init__(self, message: str = "Database xatosi", detail: Any = None):
        super().__init__(message=message, status_code=500, detail=detail)


class FileProcessingException(AppException):
    """Fayl bilan ishlashda xatolar"""
    def __init__(self, message: str, detail: Any = None):
        super().__init__(message=message, status_code=400, detail=detail)
