from sqlalchemy import create_engine, text
from app.config import get_settings

settings = get_settings()
engine = create_engine(str(settings.DATABASE_URL))

with engine.connect() as conn:
    # Gruppalarni tekshirish
    result = conn.execute(text('SELECT id, name FROM groups LIMIT 10'))
    groups = result.fetchall()
    print(f'\nBazada {len(groups)} ta guruh topildi (birinchi 10 tasi):')
    for row in groups:
        print(f'  - ID: {row[0]}, Name: {row[1]}')

    # Umumiy statistika
    count_result = conn.execute(text('SELECT COUNT(*) FROM groups'))
    total = count_result.fetchone()[0]
    print(f'\nJami gruppalar soni: {total}')
