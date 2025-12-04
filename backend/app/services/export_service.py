from openpyxl import Workbook
from sqlalchemy.orm import Session
from sqlalchemy import join
from app.models.result import Result
from app.models.student import Student
from app.models.group import Group
from app.models.test import Test

class ExportService:
    
    @staticmethod
    def export_results_to_excel(db: Session) -> bytes:
        """
        Barcha natijalalarni Excel faylga export qilish
        Ustunlar: Student_id, Group_name, Student_full_name, Topic, result (ball)
        """
        # Natijalalarni olish
        results = db.query(
            Result.id,
            Student.id.label('student_id'),
            Student.full_name,
            Group.name.label('group_name'),
            Test.name.label('test_name')
        ).join(
            Student, Result.student_id == Student.id
        ).join(
            Group, Student.group_id == Group.id
        ).join(
            Test, Result.test_id == Test.id
        ).all()
        
        # Excel workbook yaratish
        wb = Workbook()
        ws = wb.active
        ws.title = "Natijalari"
        
        # Ustun sarlavhalari
        headers = ["Student ID", "Guruh nomi", "O'quvchining to'liq ismi", "Test nomi", "Ball"]
        ws.append(headers)
        
        # Qatorlarni qo'shish
        for result in results:
            ws.append([
                result.student_id,
                result.group_name,
                result.full_name,
                result.test_name,
                result[0]  # result.correct_count
            ])
        
        # Ustun kengliklarini sozlash
        ws.column_dimensions['A'].width = 12
        ws.column_dimensions['B'].width = 20
        ws.column_dimensions['C'].width = 25
        ws.column_dimensions['D'].width = 20
        ws.column_dimensions['E'].width = 10
        
        # Faylni byte ga o'tkazish
        from io import BytesIO
        file_stream = BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        return file_stream.getvalue()