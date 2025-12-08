from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.test_session import TestSession, SessionStatus
from app.models.question import Question, Option
from app.models.test import Test
from app.services.otp_service import OTPService
from app.services.test_service import TestService
from app.services.result_service import ResultService
from app.logger import get_logger
from app.exceptions import NotFoundException, OTPException, SessionException

logger = get_logger("test_router")
router = APIRouter(prefix="/api/test", tags=["test"])

@router.get("/session/{session_id}")
def get_session_info(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Test sessiyasi haqida ma'lumot"""
    logger.info(f"Sessiya ma'lumotlari so'raldi: session_id={session_id}")

    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        logger.error(f"Sessiya topilmadi: session_id={session_id}")
        raise NotFoundException("Sessiya", session_id)

    logger.debug(f"Sessiya ma'lumoti qaytarildi: status={session.status}")
    return {
        "id": session.id,
        "status": session.status,
        "otp_attempts": session.otp_attempts,
        "blocked_until": session.blocked_until,
        "expires_at": session.expires_at,
        "started_at": session.started_at
    }

@router.post("/verify-otp")
def verify_otp(
    session_id: int = Query(...),
    otp: str = Query(...),
    db: Session = Depends(get_db)
):
    """OTP tekshirish va testni boshlash"""
    logger.info(f"OTP tekshirish so'rovi: session_id={session_id}")

    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        logger.error(f"Sessiya topilmadi: session_id={session_id}")
        raise NotFoundException("Sessiya", session_id)

    is_valid, updated_session = OTPService.verify_otp(db, session_id, otp)

    if not is_valid:
        if updated_session.status == SessionStatus.BLOCKED:
            logger.warning(f"Sessiya bloklangan: session_id={session_id}")
            raise OTPException(
                f"Juda ko'p urinish. {updated_session.blocked_until} gacha kutib turish kerak",
                status_code=429,
                detail={"blocked_until": updated_session.blocked_until}
            )
        elif updated_session.status == SessionStatus.EXPIRED:
            logger.warning(f"OTP vaqti o'tgan: session_id={session_id}")
            raise OTPException("OTP vaqti o'tgan", status_code=401)
        else:
            logger.warning(f"OTP noto'g'ri: session_id={session_id}")
            raise OTPException("OTP noto'g'ri", status_code=401)

    logger.info(f"OTP muvaffaqiyatli tasdiqlandi, test boshlandi: session_id={session_id}")
    return {
        "success": True,
        "session_id": session.id,
        "test_id": session.test_id
    }

@router.get("/questions/{session_id}")
def get_test_questions(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Test savollarini olish"""
    import random

    logger.info(f"Savollar so'raldi: session_id={session_id}")

    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        logger.error(f"Sessiya topilmadi: session_id={session_id}")
        raise NotFoundException("Sessiya", session_id)

    # Sessiya faol ekanligini tekshirish
    if not OTPService.is_session_active(session):
        logger.warning(f"Sessiya faol emas: session_id={session_id}, status={session.status}")
        raise SessionException("Sessiya faol emas yoki vaqti o'tgan", status_code=401)

    # Random savollarni olish
    questions = TestService.get_random_questions(db, session.test_id, limit=20)

    result = []
    for question in questions:
        options = db.query(Option).filter(Option.question_id == question.id).all()

        # Variantlarni aralashtirish (xavfsizlik uchun)
        options_list = list(options)
        random.shuffle(options_list)

        result.append({
            "id": question.id,
            "text": question.text,
            "options": [{"id": opt.id, "text": opt.text} for opt in options_list]
        })

    logger.info(f"{len(result)} ta savol qaytarildi (variantlar aralashtirildi): session_id={session_id}")
    return result

@router.post("/submit-answer")
def submit_answer(
    session_id: int = Query(...),
    question_id: int = Query(...),
    answer: str = Query(...),
    db: Session = Depends(get_db)
):
    """Talabaning javobini qabul qilish"""
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessiya topilmadi")
    
    # Sessiya faol ekanligini tekshirish
    if not OTPService.is_session_active(session):
        raise HTTPException(status_code=401, detail="Sessiya vaqti o'tgan")
    
    # Javobni saqlash
    answer_obj = TestService.submit_answer(db, session_id, question_id, answer)
    
    return {
        "question_id": question_id,
        "is_correct": answer_obj.is_correct
    }

@router.post("/finish-test/{session_id}")
def finish_test(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Testni yakunlash va natijani hisoblash"""
    logger.info(f"Test yakunlanmoqda: session_id={session_id}")

    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        logger.error(f"Sessiya topilmadi: session_id={session_id}")
        raise NotFoundException("Sessiya", session_id)

    # Sessiyaning statusini o'zgartirish
    session.status = SessionStatus.COMPLETED
    session.completed_at = datetime.utcnow()
    db.commit()
    logger.info(f"Sessiya COMPLETED holatiga o'tkazildi: session_id={session_id}")

    # Natijani hisoblash
    result = ResultService.calculate_result(db, session_id)

    logger.info(f"Test yakunlandi: session_id={session_id}, natija={result.percentage:.1f}%")
    return {
        "correct_count": result.correct_count,
        "total_count": result.total_count,
        "percentage": result.percentage,
        "result_text": f"{result.correct_count} / {result.total_count} ({result.percentage:.1f}%)"
    }

@router.get("/result/{session_id}")
def get_session_result(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Sessiyaning natijasini olish"""
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessiya topilmadi")
    
    # Natijavni olish
    from app.models.result import Result
    result = db.query(Result).filter(
        Result.student_id == session.student_id,
        Result.test_id == session.test_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Natija topilmadi")
    
    return {
        "correct_count": result.correct_count,
        "total_count": result.total_count,
        "percentage": result.percentage,
        "result_text": f"{result.correct_count} / {result.total_count} ({result.percentage:.1f}%)"
    }