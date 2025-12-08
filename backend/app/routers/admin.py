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

@router.put("/groups/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_update: GroupCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Guruh nomini tahrirlash"""
    logger.info(f"Guruh tahrirlash: group_id={group_id}, new_name={group_update.name}")

    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        logger.error(f"Guruh topilmadi: group_id={group_id}")
        raise NotFoundException("Guruh", group_id)

    # Nom takrorlanishini tekshirish
    existing = db.query(Group).filter(
        Group.name == group_update.name,
        Group.id != group_id
    ).first()
    if existing:
        logger.warning(f"Guruh nomi allaqachon mavjud: name={group_update.name}")
        raise AlreadyExistsException("Guruh", "name", group_update.name)

    group.name = group_update.name
    db.commit()
    db.refresh(group)

    logger.info(f"Guruh tahrirlandi: group_id={group_id}")
    return group

@router.post("/import-groups")
async def import_groups(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """JSON fayldan guruh va studentlarni import qilish"""
    logger.info("Guruh va studentlarni import qilish boshlandi")

    content = await file.read()
    json_data = content.decode('utf-8')

    result = ImportService.import_groups_from_json(db, json_data)

    if result["success"]:
        logger.info(f"Import muvaffaqiyatli: {result['imported_groups']} guruh, {result['imported_students']} student")
    else:
        logger.error(f"Import xatosi: {result.get('message')}")

    return result

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
        raise NotFoundException("O'quvchi", student_id)

    db.delete(student)
    db.commit()
    return {"message": "O'quvchi o'chirildi"}

@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_update: StudentCreate,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """O'quvchi ismini tahrirlash"""
    logger.info(f"O'quvchi tahrirlash: student_id={student_id}")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        logger.error(f"O'quvchi topilmadi: student_id={student_id}")
        raise NotFoundException("O'quvchi", student_id)

    # Guruhni tekshirish
    group = db.query(Group).filter(Group.id == student_update.group_id).first()
    if not group:
        raise NotFoundException("Guruh", student_update.group_id)

    student.full_name = student_update.full_name
    student.group_id = student_update.group_id
    db.commit()
    db.refresh(student)

    logger.info(f"O'quvchi tahrirlandi: student_id={student_id}")
    return student

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

@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Fanni o'chirish"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise NotFoundException("Fan", subject_id)

    db.delete(subject)
    db.commit()
    return {"message": "Fan o'chirildi", "success": True}

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

@router.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Mavzuni o'chirish"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise NotFoundException("Mavzu", topic_id)

    db.delete(topic)
    db.commit()
    return {"message": "Mavzu o'chirildi", "success": True}

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

@router.delete("/tests/{test_id}")
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Testni o'chirish"""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise NotFoundException("Test", test_id)

    db.delete(test)
    db.commit()
    return {"message": "Test o'chirildi", "success": True}

@router.patch("/tests/{test_id}/toggle-status")
def toggle_test_status(
    test_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Test holatini o'zgartirish (Faol/Faol emas)"""
    logger.info(f"Test holatini o'zgartirish: test_id={test_id}")

    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        logger.error(f"Test topilmadi: test_id={test_id}")
        raise NotFoundException("Test", test_id)

    # Holatni o'zgartirish
    test.is_active = not test.is_active
    db.commit()
    db.refresh(test)

    status_text = "faol" if test.is_active else "faol emas"
    logger.info(f"Test holati o'zgartirildi: test_id={test_id}, is_active={test.is_active}")

    return {
        "message": f"Test {status_text} holatiga o'tkazildi",
        "success": True,
        "is_active": test.is_active
    }

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

    if not test.is_active:
        logger.warning(f"Test faol emas: test_id={test_id}")
        raise ValidationException("Test faol emas. Faol testlar uchun OTP yaratishingiz mumkin.")

    session = OTPService.create_session(db, student_id, test_id)

    logger.info(f"OTP yaratildi: session_id={session.id}, otp={session.otp}")
    return {
        "session_id": session.id,
        "otp": session.otp,
        "expires_at": session.expires_at,
        "success": True
    }

@router.post("/generate-otp-batch")
def generate_otp_batch(
    group_id: int = Query(...),
    test_id: int = Query(...),
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Guruhning barcha o'quvchilari uchun OTP yaratish"""
    logger.info(f"Batch OTP generatsiya: group_id={group_id}, test_id={test_id}")

    # Guruhni tekshirish
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        logger.error(f"Guruh topilmadi: group_id={group_id}")
        raise NotFoundException("Guruh", group_id)

    # Testni tekshirish
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        logger.error(f"Test topilmadi: test_id={test_id}")
        raise NotFoundException("Test", test_id)

    if not test.is_active:
        logger.warning(f"Test faol emas: test_id={test_id}")
        raise ValidationException("Test faol emas. Faol testlar uchun OTP yaratishingiz mumkin.")

    # Guruhning barcha o'quvchilarini olish
    students = db.query(Student).filter(Student.group_id == group_id).all()

    if not students:
        logger.warning(f"Guruhda o'quvchilar topilmadi: group_id={group_id}")
        return {
            "success": True,
            "message": "Guruhda o'quvchilar yo'q",
            "sessions": [],
            "count": 0
        }

    # Barcha o'quvchilar uchun OTP yaratish
    sessions = []
    for student in students:
        session = OTPService.create_session(db, student.id, test_id)
        sessions.append({
            "session_id": session.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "otp": session.otp,
            "expires_at": session.expires_at
        })

    logger.info(f"Batch OTP yaratildi: {len(sessions)} ta session")
    return {
        "success": True,
        "message": f"{len(sessions)} ta o'quvchi uchun OTP yaratildi",
        "sessions": sessions,
        "count": len(sessions)
    }

@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """Barcha OTP sessiyalarni ko'rish"""
    sessions = db.query(TestSession).order_by(TestSession.created_at.desc()).all()

    result = []
    for session in sessions:
        result.append({
            "id": session.id,
            "student_id": session.student_id,
            "test_id": session.test_id,
            "otp": session.otp,
            "status": session.status,
            "created_at": session.created_at,
            "expires_at": session.expires_at,
            "started_at": session.started_at,
            "completed_at": session.completed_at,
            "student": {
                "id": session.student.id,
                "full_name": session.student.full_name,
                "group_name": session.student.group.name if session.student.group else None
            } if session.student else None,
            "test": {
                "id": session.test.id,
                "name": session.test.name
            } if session.test else None
        })

    return result

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    authenticated: bool = Depends(admin_auth)
):
    """OTP sessiyani o'chirish"""
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise NotFoundException("Sessiya", session_id)

    db.delete(session)
    db.commit()
    return {"message": "Sessiya o'chirildi", "success": True}

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

    results = query.all()

    result_list = []
    for result in results:
        result_list.append({
            "id": result.id,
            "student_id": result.student_id,
            "test_id": result.test_id,
            "correct_count": result.correct_count,
            "total_count": result.total_count,
            "percentage": result.percentage,
            "created_at": result.created_at,
            "student": {
                "id": result.student.id,
                "full_name": result.student.full_name,
                "group_name": result.student.group.name if result.student.group else None
            } if result.student else None,
            "test": {
                "id": result.test.id,
                "name": result.test.name,
                "subject_name": result.test.subject.name if result.test.subject else None
            } if result.test else None
        })

    return result_list

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