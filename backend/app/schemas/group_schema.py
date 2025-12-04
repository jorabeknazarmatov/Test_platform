from pydantic import BaseModel
from typing import List, Optional

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    
    class Config:
        from_attributes = True

class GroupWithStudents(GroupResponse):
    students: List = []
    
    class Config:
        from_attributes = True