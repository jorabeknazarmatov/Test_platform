# Test Platform — Онлайн-система тестирования для студентов колледжа

Полнофункциональная система управления тестами с панелью администратора и интерфейсом для студентов.

## 📋 О проекте

Test Platform — это полноценная онлайн-система тестирования для студентов колледжа. Через панель администратора можно управлять группами, студентами, предметами, темами и тестами, генерировать OTP-сессии и экспортировать результаты в Excel.

## 🏗 Технологии

### Backend:
- **FastAPI** — Современный Python веб-фреймворк
- **PostgreSQL** — База данных
- **SQLAlchemy** — ORM
- **Pydantic** — Валидация данных
- **openpyxl** — Работа с Excel-файлами

### Frontend:
- **React 19** — UI-библиотека
- **TypeScript** — Типизированный JavaScript
- **Vite** — Сборщик
- **Tailwind CSS** — Стилизация
- **Zustand** — Управление состоянием
- **React Query** — Серверное состояние
- **React Router** — Маршрутизация
- **Axios** — HTTP-клиент
- **Lucide React** — Иконки

## 📁 Структура проекта

```
Test_site/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI приложение
│   │   ├── database.py          # Конфигурация БД
│   │   ├── models.py            # Модели SQLAlchemy
│   │   ├── schemas.py           # Схемы Pydantic
│   │   └── routers/
│   │       ├── admin.py         # Admin API
│   │       ├── student.py       # Student API
│   │       └── test.py          # Test API
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/                 # API-сервисы
    │   ├── components/          # UI-компоненты
    │   ├── pages/               # Страницы
    │   │   ├── admin/           # Страницы админ-панели
    │   │   └── student/         # Страницы студенческого интерфейса
    │   ├── store/               # Zustand-сторы
    │   ├── types/               # TypeScript-типы
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🚀 Установка и запуск

### 1. Backend

```bash
cd backend

python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Создать базу данных в PostgreSQL:
# CREATE DATABASE test_db;

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend: http://localhost:8000  
API Документация: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend: http://localhost:5173

## 📡 API Эндпоинты

### Admin API (`/api/admin`)

> Все запросы требуют параметры `login` и `password`.

#### Группы:
- `POST /groups` — Создать группу
- `GET /groups` — Получить все группы
- `DELETE /groups/{id}` — Удалить группу

#### Студенты:
- `POST /students` — Добавить студента
- `GET /groups/{group_id}/students` — Студенты группы
- `DELETE /students/{id}` — Удалить студента

#### Предметы и темы:
- `POST /subjects` — Добавить предмет
- `GET /subjects` — Все предметы
- `POST /topics` — Добавить тему
- `GET /subjects/{subject_id}/topics` — Темы предмета

#### Тесты:
- `POST /tests` — Создать тест
- `GET /tests` — Все тесты
- `POST /import-tests` — Импорт тестов из Excel

#### OTP и результаты:
- `POST /generate-otp` — Генерация OTP для студента
- `GET /results` — Получить результаты
- `GET /export-results` — Экспорт результатов в Excel

### Student API (`/api/student`)
- `GET /groups` — Список групп
- `GET /groups/{id}/students` — Студенты группы
- `GET /subjects` — Список предметов

### Test API (`/api/test`)
- `GET /session/{id}` — Данные тестовой сессии
- `POST /verify-otp` — Проверка OTP-кода
- `GET /questions/{session_id}` — Вопросы теста
- `POST /submit-answer` — Отправить ответ
- `POST /finish-test/{session_id}` — Завершить тест
- `GET /result/{session_id}` — Получить результат

## 👨‍💼 Панель администратора

### Данные для входа:
- **Логин:** admin
- **Пароль:** admin123

### Возможности:
1. **Группы** — Создание, просмотр, удаление групп
2. **Предметы и темы** — Управление предметами и темами
3. **Тесты** — Создание тестов, импорт из Excel, генерация OTP
4. **Результаты** — Просмотр с фильтрами, экспорт в Excel

## 🎓 Интерфейс студента

### Процесс прохождения теста:
1. Выбрать группу и студента
2. Ввести Session ID и OTP-код
3. Пройти тест:
   - Таймер обратного отсчёта
   - Навигация между вопросами
   - Автосохранение ответов
   - Отметка вопросов закладкой
4. Просмотр результата:
   - Количество правильных/неправильных ответов
   - Процент и оценка
   - Визуальное отображение

## 🔒 Безопасность

- Панель администратора защищена логином и паролем
- OTP-аутентификация для студентов
- Блокировка на 30 минут после 3 неверных попыток ввода OTP
- Ограниченное время тестовых сессий
- Настроен CORS

## 📊 Схема базы данных

| Таблица | Описание |
|---------|----------|
| `groups` | Группы студентов |
| `students` | Студенты |
| `subjects` | Предметы |
| `topics` | Темы |
| `tests` | Тесты |
| `test_topics` | Связи тест-тема |
| `questions` | Вопросы |
| `question_options` | Варианты ответов |
| `test_sessions` | Тестовые сессии |
| `student_answers` | Ответы студентов |
| `results` | Итоговые результаты |

## 📝 Формат Excel для импорта

- Название листа = Название предмета
- Каждая строка = 1 вопрос
- Формат: `Вопрос | Вариант A | Вариант B | Вариант C | Вариант D | Правильный ответ | Номер темы`

## ✅ Возможности системы

- Полный CRUD
- OTP-аутентификация
- Таймер в реальном времени
- Автосохранение ответов
- Импорт/экспорт Excel
- Адаптивный дизайн
- Типизированный код (TypeScript)
- Профессиональный UI/UX

## 👨‍💻 Автор

**Turabek** — Full Stack Developer  
[LinkedIn](#) · [GitHub](#)

## 📄 Лицензия

MIT License
