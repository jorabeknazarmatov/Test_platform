from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.group import Group
from app.models.student import Student
from app.models.subject import Subject
from app.models.test_session import TestSession
from app.schemas.group_schema import GroupResponse
from app.schemas.student_schema import StudentListResponse
from app.schemas.subject_schema import SubjectResponse

router = APIRouter(prefix="/api/student", tags=["student"])

@router.get("/groups", response_model=list[GroupResponse])
def get_groups(db: Session = Depends(get_db)):
    """Barcha guruhlarni olish"""
    groups = db.query(Group).all()
    return groups

@router.get("/groups/{group_id}/students", response_model=list[StudentListResponse])
def get_students_by_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Guruhning o'quvchilarini olish"""
    students = db.query(Student).filter(Student.group_id == group_id).all()
    return students

@router.get("/subjects", response_model=list[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    """Barcha fanlarni olish"""
    subjects = db.query(Subject).all()
    return subjects