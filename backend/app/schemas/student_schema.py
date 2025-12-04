from pydantic import BaseModel

class StudentBase(BaseModel):
    full_name: str
    group_id: int

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    
    class Config:
        from_attributes = True

class StudentListResponse(StudentResponse):
    pass