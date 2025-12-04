from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import verify_admin_credentials
from app.models.group import Group
from app.models.student import Student
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.test import Test
from app.models.test_session import TestSession
from app.models.result import Result
from app.schemas.group_schema import GroupCreate, GroupResponse, GroupWithStudents
from app.schemas.student_schema import StudentCreate, StudentResponse
from app.schemas.subject_schema import SubjectCreate, SubjectResponse
from app.schemas.topic_schema import TopicCreate, TopicResponse
from app.schemas.test_schema import TestCreate, TestResponse
from app.services.otp_service import OTPService
from app.services.import_service import ImportService
from app.services.export_service import ExportService
from app.logger import get_logger
from app.exceptions import (
    NotFoundException,
    AlreadyExistsException,
    AuthenticationException,
    ValidationException
)

logger = get_logger("admin_router")
router = APIRouter(prefix="/api/admin", tags=["admin"])

def admin_auth(login: str = Query(...), password: str = Query(...)):
    """Admin autentifikatsiyasi"""
    if not verify_admin_credentials(login, password):
        logger.warning(f"Noto'g'ri admin kirish urinishi: login={login}")
        raise AuthenticationException("Admin login yoki parol xato")
    return True

# ============= GRUPPALAR =============

@router.post("/groups", response_model=GroupResponse)
def create_group(
    group: GroupCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Yangi guruhni yaratish"""
    logger.info(f"Yangi guruh yaratish: name={group.name}")

    existing = db.query(Group).filter(Group.name == group.name).first()
    if existing:
        logger.warning(f"Guruh allaqachon mavjud: name={group.name}")
        raise AlreadyExistsException("Guruh", "name", group.name)

    db_group = Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    logger.info(f"Guruh yaratildi: id={db_group.id}, name={db_group.name}")
    return db_group

@router.get("/groups", response_model=list[GroupWithStudents])
def list_groups(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Barcha guruhlarni ko'rish"""
    groups = db.query(Group).all()
    return groups

@router.delete("/groups/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Guruhni o'chirish"""
    logger.info(f"Guruh o'chirish: group_id={group_id}")

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        logger.error(f"Guruh topilmadi: group_id={group_id}")
        raise NotFoundException("Guruh", group_id)

    db.delete(group)
    db.commit()
    logger.info(f"Guruh o'chirildi: group_id={group_id}")
    return {"message": "Guruh o'chirildi", "success": True}

# ============= O'QUVCHILAR =============

@router.post("/students", response_model=StudentResponse)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Yangi o'quvchini qo'shish"""
    group = db.query(Group).filter(Group.id == student.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Guruhi topilmadi")
    
    db_student = Student(
        group_id=student.group_id,
        full_name=student.full_name
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/groups/{group_id}/students", response_model=list[StudentResponse])
def list_students(
    group_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Guruhning o'quvchilarini ko'rish"""
    students = db.query(Student).filter(Student.group_id == group_id).all()
    return students

@router.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """O'quvchini o'chirish"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")
    
    db.delete(student)
    db.commit()
    return {"message": "O'quvchi o'chirildi"}

# ============= FANLAR =============

@router.post("/subjects", response_model=SubjectResponse)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Yangi fan yaratish"""
    existing = db.query(Subject).filter(Subject.name == subject.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu fan allaqachon mavjud")
    
    db_subject = Subject(name=subject.name)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/subjects", response_model=list[SubjectResponse])
def list_subjects(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Barcha fanlarni ko'rish"""
    subjects = db.query(Subject).all()
    return subjects

# ============= MAVZULAR =============

@router.post("/topics", response_model=TopicResponse)
def create_topic(
    topic: TopicCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Yangi mavzuni yaratish"""
    subject = db.query(Subject).filter(Subject.id == topic.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Fan topilmadi")
    
    db_topic = Topic(
        subject_id=topic.subject_id,
        topic_number=topic.topic_number,
        name=topic.name
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@router.get("/subjects/{subject_id}/topics", response_model=list[TopicResponse])
def list_topics(
    subject_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Fanningmavzularni ko'rish"""
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).all()
    return topics

# ============= TESTLAR =============

@router.post("/tests", response_model=TestResponse)
def create_test(
    test: TestCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Yangi test yaratish"""
    subject = db.query(Subject).filter(Subject.id == test.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Fan topilmadi")
    
    db_test = Test(
        name=test.name,
        subject_id=test.subject_id,
        duration_minutes=test.duration_minutes
    )
    db.add(db_test)
    db.flush()
    
    # Mavzualarni qo'shish
    if test.topic_numbers:
        topics = db.query(Topic).filter(
            Topic.subject_id == test.subject_id,
            Topic.topic_number.in_(test.topic_numbers)
        ).all()
        db_test.topics.extend(topics)
    
    db.commit()
    db.refresh(db_test)
    return db_test

@router.get("/tests", response_model=list[TestResponse])
def list_tests(
    subject_id: int = Query(None),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Testlarni ko'rish"""
    query = db.query(Test)
    if subject_id:
        query = query.filter(Test.subject_id == subject_id)
    return query.all()

# ============= OTP =============

@router.post("/generate-otp")
def generate_otp(
    student_id: int = Query(...),
    test_id: int = Query(...),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Talaba uchun OTP yaratish"""
    logger.info(f"OTP generatsiya qilish: student_id={student_id}, test_id={test_id}")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        logger.error(f"O'quvchi topilmadi: student_id={student_id}")
        raise NotFoundException("O'quvchi", student_id)

    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        logger.error(f"Test topilmadi: test_id={test_id}")
        raise NotFoundException("Test", test_id)

    session = OTPService.create_session(db, student_id, test_id)

    logger.info(f"OTP yaratildi: session_id={session.id}, otp={session.otp}")
    return {
        "session_id": session.id,
        "otp": session.otp,
        "expires_at": session.expires_at,
        "success": True
    }

# ============= NATIJALARI =============

@router.get("/results")
def list_results(
    student_id: int = Query(None),
    test_id: int = Query(None),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Natijalari ko'rish"""
    query = db.query(Result)
    if student_id:
        query = query.filter(Result.student_id == student_id)
    if test_id:
        query = query.filter(Result.test_id == test_id)
    return query.all()

@router.get("/export-results")
def export_results(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Natijalalarni Excel formatida export qilish"""
    from fastapi.responses import Response
    
    file_content = ExportService.export_results_to_excel(db)
    
    return Response(
        content=file_content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=results.xlsx"}
    )

# ============= IMPORT =============

@router.post("/import-tests")
async def import_tests(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """JSON fayldan testlarni import qilish"""
    content = await file.read()
    json_data = content.decode('utf-8')
    
    result = ImportService.import_tests_from_json(db, json_data)
    return result