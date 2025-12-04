from pydantic import BaseModel
from typing import List

class OptionSchema(BaseModel):
    text: str

class QuestionBase(BaseModel):
    text: str
    options: List[str]
    correct_answer: str

class QuestionResponse(QuestionBase):
    id: int
    test_id: int
    topic_id: int
    
    class Config:
        from_attributes = True