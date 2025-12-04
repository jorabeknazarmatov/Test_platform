import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.test_session import TestSession, SessionStatus
from app.services.otp_service import OTPService

def test_generate_otp():
    """OTP generatsiyasini tekshirish"""
    otp = OTPService.generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()

def test_otp_verify_success(db: Session, student_id: int, test_id: int):
    """To'g'ri OTP tekshirish"""
    session = OTPService.create_session(db, student_id, test_id)
    is_valid, updated_session = OTPService.verify_otp(db, session.id, session.otp)
    assert is_valid is True

def test_otp_verify_failed(db: Session, student_id: int, test_id: int):
    """Xato OTP tekshirish"""
    session = OTPService.create_session(db, student_id, test_id)
    is_valid, updated_session = OTPService.verify_otp(db, session.id, "999999")
    assert is_valid is False
    assert updated_session.otp_attempts == 1

def test_otp_block_after_three_attempts(db: Session, student_id: int, test_id: int):
    """3ta xato urunishdan keyin bloklanish"""
    session = OTPService.create_session(db, student_id, test_id)
    
    for i in range(3):
        is_valid, updated_session = OTPService.verify_otp(db, session.id, f"99999{i}")
        assert is_valid is False
    
    db.refresh(session)
    assert session.status == SessionStatus.BLOCKED