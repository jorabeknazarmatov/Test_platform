from pydantic import BaseModel
from datetime import datetime

class ResultResponse(BaseModel):
    correct_count: int
    total_count: int
    percentage: float
    
    class Config:
        from_attributes = True

class ResultWithDetails(ResultResponse):
    student_name: str
    group_name: str
    topic_number: int
    created_at: datetime