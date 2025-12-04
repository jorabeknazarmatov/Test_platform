import pytest
from app.services.result_service import ResultService

def test_calculate_result(db: Session, test_session_id: int):
    """Natija hisoblashni tekshirish"""
    result = ResultService.calculate_result(db, test_session_id)
    
    assert result is not None
    assert result.correct_count >= 0
    assert result.total_count > 0
    assert result.percentage >= 0 and result.percentage <= 100

def test_percentage_calculation(db: Session, test_session_id: int):
    """Foizni hisoblashni tekshirish"""
    result = ResultService.calculate_result(db, test_session_id)
    
    expected_percentage = (result.correct_count / result.total_count * 100) if result.total_count > 0 else 0
    assert result.percentage == expected_percentage