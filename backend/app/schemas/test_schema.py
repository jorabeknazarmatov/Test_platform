from pydantic import BaseModel
from typing import List

class TestBase(BaseModel):
    name: str
    subject_id: int
    duration_minutes: int = 60
    topic_numbers: List[int] = []

class TestCreate(TestBase):
    pass

class TestResponse(TestBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

class TestWithQuestions(TestResponse):
    questions_count: int