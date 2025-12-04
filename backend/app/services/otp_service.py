import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.test_session import TestSession, SessionStatus
from app.config import get_settings
from app.logger import get_logger
from app.exceptions import OTPException, NotFoundException

logger = get_logger("otp_service")
settings = get_settings()

class OTPService:
    
    @staticmethod
    def generate_otp() -> str:
        """6 raqamli OTP generatsiya qilish"""
        otp = ''.join(random.choices(string.digits, k=6))
        logger.debug(f"OTP generatsiya qilindi")
        return otp
    
    @staticmethod
    def create_session(db: Session, student_id: int, test_id: int) -> TestSession:
        """
        Yangi test sessiyasi yaratish

        Args:
            db: Database session
            student_id: Talaba ID
            test_id: Test ID

        Returns:
            TestSession: Yaratilgan sessiya

        Raises:
            OTPException: Sessiya yaratishda xatolik
        """
        try:
            logger.info(f"Yangi sessiya yaratish: student_id={student_id}, test_id={test_id}")

            # Eski faol sessiyalarni tugatish
            expired_count = db.query(TestSession).filter(
                TestSession.student_id == student_id,
                TestSession.test_id == test_id,
                TestSession.status == SessionStatus.ACTIVE
            ).update({"status": SessionStatus.EXPIRED})

            if expired_count > 0:
                logger.info(f"{expired_count} ta eski sessiya tugatilib, EXPIRED qilindi")

            db.commit()

            otp = OTPService.generate_otp()
            expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

            session = TestSession(
                student_id=student_id,
                test_id=test_id,
                otp=otp,
                expires_at=expires_at
            )
            db.add(session)
            db.commit()
            db.refresh(session)

            logger.info(f"Sessiya muvaffaqiyatli yaratildi: session_id={session.id}, expires_at={expires_at}")
            return session

        except Exception as e:
            logger.error(f"Sessiya yaratishda xatolik: {str(e)}", exc_info=True)
            db.rollback()
            raise OTPException("Sessiya yaratishda xatolik yuz berdi", status_code=500)
    
    @staticmethod
    def verify_otp(db: Session, session_id: int, otp: str) -> tuple[bool, TestSession]:
        """
        OTP tekshirish

        Args:
            db: Database session
            session_id: Sessiya ID
            otp: Kiritilgan OTP

        Returns:
            tuple: (success: bool, session: TestSession)

        Raises:
            NotFoundException: Sessiya topilmasa
        """
        logger.info(f"OTP tekshirish: session_id={session_id}")

        session = db.query(TestSession).filter(
            TestSession.id == session_id
        ).first()

        if not session:
            logger.warning(f"Sessiya topilmadi: session_id={session_id}")
            raise NotFoundException("Sessiya", session_id)

        # OTP vaqti o'tganmi?
        if datetime.utcnow() > session.expires_at:
            logger.warning(f"OTP vaqti o'tgan: session_id={session_id}")
            session.status = SessionStatus.EXPIRED
            db.commit()
            return False, session

        # Bloklanganmi?
        if session.status == SessionStatus.BLOCKED:
            if session.blocked_until and datetime.utcnow() < session.blocked_until:
                logger.warning(f"Sessiya bloklangan: session_id={session_id}, blocked_until={session.blocked_until}")
                return False, session
            elif session.blocked_until and datetime.utcnow() >= session.blocked_until:
                logger.info(f"Bloklash vaqti tugadi, sessiya qayta faollashtirildi: session_id={session_id}")
                session.status = SessionStatus.ACTIVE
                session.otp_attempts = 0

        # OTP tekshirish
        if session.otp != otp:
            session.otp_attempts += 1
            logger.warning(f"Noto'g'ri OTP: session_id={session_id}, attempts={session.otp_attempts}")

            if session.otp_attempts >= 3:
                session.status = SessionStatus.BLOCKED
                session.blocked_until = datetime.utcnow() + timedelta(seconds=15)
                logger.warning(f"Sessiya bloklandi (3 ta noto'g'ri urinish): session_id={session_id}")

            db.commit()
            return False, session

        # OTP to'g'ri
        logger.info(f"OTP muvaffaqiyatli tasdiqlandi: session_id={session_id}")
        session.started_at = datetime.utcnow()
        db.commit()
        return True, session
    
    @staticmethod
    def is_session_active(session: TestSession) -> bool:
        if session.status != SessionStatus.ACTIVE:
            return False
        if datetime.utcnow() > session.expires_at:
            return False
        if session.started_at is None:
            return False
        return True