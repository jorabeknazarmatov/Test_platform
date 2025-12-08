# Import schemas to resolve forward references
from app.schemas.student_schema import StudentResponse
from app.schemas.group_schema import GroupWithStudents

# Rebuild models to resolve forward references
GroupWithStudents.model_rebuild()
