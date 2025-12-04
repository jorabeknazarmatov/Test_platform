from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class SessionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"
    BLOCKED = "blocked"

class TestSession(Base):
    __tablename__ = "test_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    otp = Column(String(6), unique=True, nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE)
    otp_attempts = Column(Integer, default=0)
    blocked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="test_sessions")
    test = relationship("Test", back_populates="test_sessions")
    answers = relationship("Answer", back_populates="test_session", cascade="all, delete-orphan")