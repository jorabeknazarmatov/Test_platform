"""
Logging konfiguratsiyasi
Test platformasi uchun logging tizimi
"""
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime


# Logs papkasini yaratish
LOGS_DIR = Path(__file__).parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Logger'ni sozlash

    Args:
        name: Logger nomi
        level: Logging darajasi

    Returns:
        Konfiguratsiya qilingan logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Agar handler'lar allaqachon qo'shilgan bo'lsa, qaytadan qo'shmaslik
    if logger.handlers:
        return logger

    # Format
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler - Barcha loglar
    file_handler = RotatingFileHandler(
        LOGS_DIR / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # File handler - Faqat xatolar
    error_handler = RotatingFileHandler(
        LOGS_DIR / "errors.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)

    return logger


# Asosiy logger
app_logger = setup_logger("test_platform", logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """
    Logger olish

    Args:
        name: Logger nomi (odatda modul nomi)

    Returns:
        Logger instance
    """
    return setup_logger(f"test_platform.{name}", logging.INFO)
