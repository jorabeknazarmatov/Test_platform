from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OTPVerify(BaseModel):
    otp: str

class TestSessionResponse(BaseModel):
    id: int
    otp: str
    status: str
    expires_at: datetime
    
    class Config:
        from_attributes = True