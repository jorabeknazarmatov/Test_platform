from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int

    class Config:
        from_attributes = True

# Forward reference for circular import
if TYPE_CHECKING:
    from app.schemas.student_schema import StudentResponse

class GroupWithStudents(GroupResponse):
    students: List['StudentResponse'] = []

    class Config:
        from_attributes = True