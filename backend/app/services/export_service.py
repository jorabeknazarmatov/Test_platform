from openpyxl import Workbook
from sqlalchemy.orm import Session
from sqlalchemy import join
from app.models.result import Result
from app.models.student import Student
from app.models.group import Group
from app.models.test import Test
from app.models.subject import Subject

class ExportService:

    @staticmethod
    def export_results_to_excel(db: Session) -> bytes:
        """
        Barcha natijalalarni Excel faylga export qilish
        Ustunlar: ID, FISh, Guruh, Fan, Test, Natija, Foiz
        """
        # Natijalalarni olish
        results = db.query(
            Result.id,
            Student.id.label('student_id'),
            Student.full_name,
            Group.name.label('group_name'),
            Subject.name.label('subject_name'),
            Test.name.label('test_name'),
            Result.correct_count,
            Result.total_count,
            Result.percentage
        ).join(
            Student, Result.student_id == Student.id
        ).join(
            Group, Student.group_id == Group.id
        ).join(
            Test, Result.test_id == Test.id
        ).join(
            Subject, Test.subject_id == Subject.id
        ).all()

        # Excel workbook yaratish
        wb = Workbook()
        ws = wb.active
        ws.title = "Natijalar"

        # Ustun sarlavhalari
        headers = ["ID", "FISh", "Guruh", "Fan", "Test", "To'g'ri javoblar", "Jami savollar", "Foiz (%)"]
        ws.append(headers)

        # Qatorlarni qo'shish
        for result in results:
            ws.append([
                result.student_id,
                result.full_name,
                result.group_name,
                result.subject_name,
                result.test_name,
                result.correct_count,
                result.total_count,
                result.percentage
            ])

        # Ustun kengliklarini sozlash
        ws.column_dimensions['A'].width = 8
        ws.column_dimensions['B'].width = 25
        ws.column_dimensions['C'].width = 15
        ws.column_dimensions['D'].width = 20
        ws.column_dimensions['E'].width = 25
        ws.column_dimensions['F'].width = 15
        ws.column_dimensions['G'].width = 15
        ws.column_dimensions['H'].width = 12

        # Faylni byte ga o'tkazish
        from io import BytesIO
        file_stream = BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        return file_stream.getvalue()