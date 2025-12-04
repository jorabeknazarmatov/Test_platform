import random
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.test import Test
from app.models.question import Question, Option
from app.models.topic import Topic
from app.models.test_session import TestSession
from app.models.answer import Answer
from app.config import get_settings
from app.logger import get_logger
from app.exceptions import NotFoundException, ValidationException

logger = get_logger("test_service")
settings = get_settings()

class TestService:
    
    @staticmethod
    def get_test_questions(db: Session, test_id: int) -> list[Question]:
        # Testning savollari
        test = db.query(Test).filter(Test.id == test_id).first()
        if not test:
            return []
        
        questions = db.query(Question).filter(Question.test_id == test_id).all()
        return questions
    
    @staticmethod
    def get_random_questions(db: Session, test_id: int, limit: int = 20) -> list[Question]:
        """
        Testga tegishli mavzulardan random savollar tanlash

        Args:
            db: Database session
            test_id: Test ID
            limit: Nechta savol kerak

        Returns:
            list[Question]: Tanlangan savollar ro'yxati

        Raises:
            NotFoundException: Test topilmasa
            ValidationException: Savollar yetarli bo'lmasa
        """
        logger.info(f"Random savollar olish: test_id={test_id}, limit={limit}")

        test = db.query(Test).filter(Test.id == test_id).first()
        if not test:
            logger.error(f"Test topilmadi: test_id={test_id}")
            raise NotFoundException("Test", test_id)

        if not test.topics:
            logger.warning(f"Testda mavzular yo'q: test_id={test_id}")
            raise ValidationException("Test uchun mavzular tanlanmagan")

        topic_ids = [topic.id for topic in test.topics]
        logger.debug(f"Mavzular: topic_ids={topic_ids}")

        questions = db.query(Question).filter(
            and_(
                Question.test_id == test_id,
                Question.topic_id.in_(topic_ids)
            )
        ).all()

        logger.info(f"Jami savollar: {len(questions)}, kerak: {limit}")

        if len(questions) == 0:
            logger.error(f"Test uchun savollar topilmadi: test_id={test_id}")
            raise ValidationException("Test uchun savollar mavjud emas")

        # Agar savollar kam bo'lsa, hammasi qaytariladi
        if len(questions) <= limit:
            logger.info(f"Barcha {len(questions)} ta savol qaytarildi")
            return questions

        selected = random.sample(questions, limit)
        logger.info(f"{len(selected)} ta random savol tanlandi")
        return selected
    
    @staticmethod
    def submit_answer(
        db: Session,
        test_session_id: int,
        question_id: int,
        student_answer: str
    ) -> Answer:
        """
        Talaba javobini saqlash va tekshirish

        Args:
            db: Database session
            test_session_id: Test sessiya ID
            question_id: Savol ID
            student_answer: Talaba javobi

        Returns:
            Answer: Saqlangan javob

        Raises:
            NotFoundException: Savol topilmasa
        """
        logger.info(f"Javobni saqlash: session_id={test_session_id}, question_id={question_id}")

        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            logger.error(f"Savol topilmadi: question_id={question_id}")
            raise NotFoundException("Savol", question_id)

        is_correct = student_answer.strip().lower() == question.correct_answer.strip().lower()
        logger.debug(f"Javob tekshirildi: is_correct={is_correct}")

        answer = Answer(
            test_session_id=test_session_id,
            question_id=question_id,
            student_answer=student_answer,
            is_correct=is_correct
        )
        db.add(answer)
        db.commit()
        db.refresh(answer)

        logger.info(f"Javob saqlandi: answer_id={answer.id}, is_correct={is_correct}")
        return answer