from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from app.config import get_settings
from app.logger import get_logger
from app.exceptions import DatabaseException

logger = get_logger("database")
settings = get_settings()

# Database engine yaratish
try:
    logger.info(f"Database'ga ulanish: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'local'}")
    engine = create_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    logger.info("Database engine muvaffaqiyatli yaratildi")
except Exception as e:
    logger.error(f"Database engine yaratishda xatolik: {str(e)}", exc_info=True)
    raise DatabaseException("Database'ga ulanib bo'lmadi", detail=str(e))


def get_db():
    """
    Database session yaratish va boshqarish

    Yields:
        Session: SQLAlchemy database session

    Raises:
        DatabaseException: Database bilan muammo bo'lsa
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session xatosi: {str(e)}", exc_info=True)
        db.rollback()
        raise DatabaseException("Database operatsiyasida xatolik", detail=str(e))
    finally:
        db.close()