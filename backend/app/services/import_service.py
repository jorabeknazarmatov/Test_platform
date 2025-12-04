import json
from sqlalchemy.orm import Session
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.test import Test
from app.models.question import Question, Option

class ImportService:
    
    @staticmethod
    def import_tests_from_json(db: Session, json_data: str) -> dict:
        """
        JSON formatdan testlarni import qilish.
        Format:
        [
            {
                "subject": "Matematika",
                "tests": {
                    "theme": "Algebra asoslari",
                    "testQuestions": [...]
                }
            }
        ]
        """
        try:
            data = json.loads(json_data)
            
            imported_count = 0
            errors = []
            
            for item in data:
                subject_name = item.get("subject")
                test_data = item.get("tests", {})
                
                if not subject_name:
                    errors.append("Fanning nomi topilmadi")
                    continue
                
                # Fanini topish yoki yaratish
                subject = db.query(Subject).filter(
                    Subject.name == subject_name
                ).first()
                
                if not subject:
                    subject = Subject(name=subject_name)
                    db.add(subject)
                    db.flush()
                
                # Mavzuni topish yoki yaratish
                theme_name = test_data.get("theme")
                if not theme_name:
                    errors.append(f"{subject_name} uchun tema topilmadi")
                    continue
                
                topic = db.query(Topic).filter(
                    Topic.subject_id == subject.id,
                    Topic.name == theme_name
                ).first()
                
                if not topic:
                    # Topic raqamini aniqlash
                    max_number = db.query(Topic).filter(
                        Topic.subject_id == subject.id
                    ).count()
                    
                    topic = Topic(
                        subject_id=subject.id,
                        topic_number=max_number + 1,
                        name=theme_name
                    )
                    db.add(topic)
                    db.flush()
                
                # Testni yaratish
                test_name = theme_name
                test = db.query(Test).filter(
                    Test.name == test_name,
                    Test.subject_id == subject.id
                ).first()
                
                if not test:
                    test = Test(
                        name=test_name,
                        subject_id=subject.id
                    )
                    db.add(test)
                    db.flush()
                    test.topics.append(topic)
                
                # Savol va variantlarni qo'shish
                questions_data = test_data.get("testQuestions", [])
                
                for q_data in questions_data:
                    q_id = q_data.get("id")
                    q_text = q_data.get("question")
                    q_options = q_data.get("options", [])
                    q_correct = q_data.get("correctAnswer")
                    
                    if not q_text or not q_correct:
                        errors.append(f"Savolning matn yoki javobida xatolik: {q_id}")
                        continue
                    
                    # Savolni tekshirish (qaytarilmasligi uchun)
                    existing_question = db.query(Question).filter(
                        Question.test_id == test.id,
                        Question.text == q_text
                    ).first()
                    
                    if existing_question:
                        continue
                    
                    question = Question(
                        test_id=test.id,
                        topic_id=topic.id,
                        text=q_text,
                        correct_answer=q_correct
                    )
                    db.add(question)
                    db.flush()
                    
                    # Variantlarni qo'shish
                    for opt_text in q_options:
                        option = Option(
                            question_id=question.id,
                            text=opt_text
                        )
                        db.add(option)
                    
                    imported_count += 1
                
                db.commit()
            
            return {
                "success": True,
                "imported_count": imported_count,
                "errors": errors
            }
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "message": f"JSON parsing xatosi: {str(e)}"
            }
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "message": f"Import xatosi: {str(e)}"
            }