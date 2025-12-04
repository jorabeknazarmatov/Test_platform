from pydantic import BaseModel

class TopicBase(BaseModel):
    topic_number: int
    name: str

class TopicCreate(TopicBase):
    subject_id: int

class TopicResponse(TopicBase):
    id: int
    subject_id: int
    
    class Config:
        from_attributes = True