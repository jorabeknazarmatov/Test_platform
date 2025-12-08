import json
from sqlalchemy.orm import Session
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.test import Test
from app.models.question import Question, Option
from app.models.group import Group
from app.models.student import Student

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

    @staticmethod
    def import_groups_from_json(db: Session, json_data: str) -> dict:
        """
        JSON formatdan guruh va studentlarni import qilish.
        Format:
        [
            {
                "group_name": "101-guruh",
                "students": [
                    {
                        "first_name": "Otabek",
                        "last_name": "Olimov",
                        "middle_name": "Olim o'g'li",
                        "birth_date": "12.12.1996"
                    }
                ]
            }
        ]
        """
        try:
            data = json.loads(json_data)

            imported_groups = 0
            imported_students = 0
            errors = []

            for item in data:
                group_name = item.get("group_name")
                students_data = item.get("students", [])

                if not group_name:
                    errors.append("Guruh nomi topilmadi")
                    continue

                # Guruhni topish yoki yaratish
                group = db.query(Group).filter(Group.name == group_name).first()

                if not group:
                    group = Group(name=group_name)
                    db.add(group)
                    db.flush()
                    imported_groups += 1

                # Studentlarni qo'shish
                for student_data in students_data:
                    first_name = student_data.get("first_name", "")
                    last_name = student_data.get("last_name", "")
                    middle_name = student_data.get("middle_name", "")

                    # Full name yaratish
                    name_parts = [first_name, middle_name, last_name]
                    full_name = " ".join([part for part in name_parts if part]).strip()

                    if not full_name:
                        errors.append(f"Guruh '{group_name}' da studentning ismi topilmadi")
                        continue

                    # Studentni tekshirish (qaytarilmasligi uchun)
                    existing_student = db.query(Student).filter(
                        Student.group_id == group.id,
                        Student.full_name == full_name
                    ).first()

                    if existing_student:
                        continue

                    student = Student(
                        group_id=group.id,
                        full_name=full_name
                    )
                    db.add(student)
                    imported_students += 1

            db.commit()

            return {
                "success": True,
                "imported_groups": imported_groups,
                "imported_students": imported_students,
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