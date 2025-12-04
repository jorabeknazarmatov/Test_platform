from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.database import Base, engine
from app.routers import admin, student, test
from app.exceptions import AppException
from app.exception_handlers import (
    app_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler
)
from app.logger import get_logger

logger = get_logger("main")

# Bazani yaratish
try:
    logger.info("Database jadvallarini yaratish boshlandi")
    Base.metadata.create_all(bind=engine)
    logger.info("Database jadvallar muvaffaqiyatli yaratildi")
except Exception as e:
    logger.error(f"Database yaratishda xatolik: {str(e)}", exc_info=True)
    raise

app = FastAPI(
    title="Test Platform API",
    description="Kollej o'quvchilar uchun test platformasi",
    version="1.0.0"
)

# Exception handler'larni ro'yxatdan o'tkazish
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routerlarni qo'shish
app.include_router(admin.router)
app.include_router(student.router)
app.include_router(test.router)

logger.info("Application muvaffaqiyatli ishga tushdi")

@app.get("/")
def root():
    logger.debug("Root endpoint chaqirildi")
    return {"message": "Test Platform API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    logger.debug("Health check endpoint chaqirildi")
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)