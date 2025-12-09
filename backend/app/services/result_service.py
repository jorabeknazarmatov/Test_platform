from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.answer import Answer
from app.models.result import Result
from app.models.test_session import TestSession, SessionStatus
from app.models.question import Question
from app.logger import get_logger
from app.exceptions import NotFoundException

logger = get_logger("result_service")

class ResultService:
    
    @staticmethod
    def calculate_result(db: Session, test_session_id: int) -> Result:
        """
        Test natijasini hisoblash

        Args:
            db: Database session
            test_session_id: Test sessiya ID

        Returns:
            Result: Hisoblangan natija

        Raises:
            NotFoundException: Sessiya topilmasa
        """
        logger.info(f"Natijani hisoblash: session_id={test_session_id}")

        test_session = db.query(TestSession).filter(
            TestSession.id == test_session_id
        ).first()

        if not test_session:
            logger.error(f"Test sessiyasi topilmadi: session_id={test_session_id}")
            raise NotFoundException("Test sessiyasi", test_session_id)

        # Talabaning javoblarini olish
        answers = db.query(Answer).filter(
            Answer.test_session_id == test_session_id
        ).all()

        # Jami savollar soni - bu har doim 20 (test.py:99 da hardcoded)
        # Yoki testning haqiqiy savollar sonini olish mumkin
        total_count = 20  # Default qiymat

        # Agar test savollar soni boshqacha bo'lsa, uni olish:
        # total_questions = db.query(Question).filter(Question.test_id == test_session.test_id).count()
        # if total_questions > 0:
        #     total_count = min(20, total_questions)  # Maksimal 20 ta savol

        correct_count = sum(1 for answer in answers if answer.is_correct)
        percentage = (correct_count / total_count * 100) if total_count > 0 else 0

        logger.info(f"Natija: correct={correct_count}, total={total_count}, answered={len(answers)}, percentage={percentage:.2f}%")

        # Eski natijani almashtirish (qayta topshirganda)
        existing_result = db.query(Result).filter(
            and_(
                Result.student_id == test_session.student_id,
                Result.test_id == test_session.test_id
            )
        ).first()

        if existing_result:
            logger.info(f"Mavjud natija yangilanmoqda: result_id={existing_result.id}")
            existing_result.correct_count = correct_count
            existing_result.total_count = total_count
            existing_result.percentage = percentage
            db.commit()
            logger.info(f"Natija muvaffaqiyatli yangilandi")
            return existing_result

        # Yangi natijani yaratish
        result = Result(
            student_id=test_session.student_id,
            test_id=test_session.test_id,
            correct_count=correct_count,
            total_count=total_count,
            percentage=percentage
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        logger.info(f"Yangi natija yaratildi: result_id={result.id}")
        return result
    
    @staticmethod
    def get_student_results(db: Session, student_id: int):
        # Talabaning barcha natijalari
        results = db.query(Result).filter(
            Result.student_id == student_id
        ).all()
        return results