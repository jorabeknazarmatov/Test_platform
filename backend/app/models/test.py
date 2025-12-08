from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

test_topics = Table(
    'test_topics',
    Base.metadata,
    Column('test_id', Integer, ForeignKey('tests.id'), primary_key=True),
    Column('topic_id', Integer, ForeignKey('topics.id'), primary_key=True)
)

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, default=60)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    subject = relationship("Subject", back_populates="tests")
    topics = relationship("Topic", secondary=test_topics)
    test_sessions = relationship("TestSession", back_populates="test", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan")