"""
Global exception handler'lar
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.exceptions import AppException
from app.logger import get_logger

logger = get_logger("exception_handlers")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Custom exception'lar uchun handler"""
    logger.error(
        f"AppException: {exc.message}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "detail": exc.detail
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Pydantic validation xatolari uchun handler"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })

    logger.warning(
        f"Validation error: {errors}",
        extra={
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Ma'lumotlar validatsiyasi xatosi",
            "errors": errors
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """SQLAlchemy xatolari uchun handler"""
    error_message = "Database xatosi yuz berdi"

    # IntegrityError (unique constraint, foreign key, etc.)
    if isinstance(exc, IntegrityError):
        if "unique constraint" in str(exc).lower():
            error_message = "Bu ma'lumot allaqachon mavjud"
        elif "foreign key constraint" in str(exc).lower():
            error_message = "Bog'liq ma'lumot topilmadi"
        else:
            error_message = "Ma'lumotlar yaxlitligi buzildi"

    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exc_type": type(exc).__name__
        },
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": error_message,
            "detail": "Database bilan bog'liq xatolik"
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Barcha boshqa exception'lar uchun handler"""
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exc_type": type(exc).__name__
        },
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Serverda xatolik yuz berdi",
            "detail": "Iltimos, keyinroq qayta urinib ko'ring"
        }
    )
