from fastapi import HTTPException, status
from app.config import get_settings
from app.logger import get_logger
from app.exceptions import AuthenticationException

logger = get_logger("auth_middleware")
settings = get_settings()

def verify_admin_credentials(login: str, password: str) -> bool:
    """
    Admin login va parolni tekshirish

    Args:
        login: Admin login
        password: Admin parol

    Returns:
        bool: To'g'ri bo'lsa True, aks holda False

    Raises:
        AuthenticationException: Autentifikatsiya xatosi
    """
    logger.info(f"Admin autentifikatsiya urinishi: login={login}")

    is_valid = login == settings.ADMIN_LOGIN and password == settings.ADMIN_PASSWORD

    if is_valid:
        logger.info(f"Admin muvaffaqiyatli autentifikatsiya qilindi: {login}")
    else:
        logger.warning(f"Admin autentifikatsiya xatosi: login={login}")

    return is_valid