from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ADMIN_LOGIN: str
    ADMIN_PASSWORD: str
    OTP_EXPIRY_MINUTES: int = 180
    TEST_DURATION_MINUTES: int = 60
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()