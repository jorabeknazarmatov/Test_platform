# Test Platform — Online Testing System for College Students

A full-featured test management system with an admin panel and student test interface.

## 📋 About the Project

Test Platform is a complete online testing system designed for college students. It allows administrators to manage groups, students, subjects, topics, and tests through an admin panel — with OTP-based test session generation and Excel export for results.

## 🏗 Tech Stack

### Backend:
- **FastAPI** — Modern Python web framework
- **PostgreSQL** — Database
- **SQLAlchemy** — ORM
- **Pydantic** — Data validation
- **openpyxl** — Excel file handling

### Frontend:
- **React 19** — UI library
- **TypeScript** — Type-safe JavaScript
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Zustand** — State management
- **React Query** — Server state management
- **React Router** — Routing
- **Axios** — HTTP client
- **Lucide React** — Icons

## 📁 Project Structure

```
Test_site/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   └── routers/
│   │       ├── admin.py         # Admin API
│   │       ├── student.py       # Student API
│   │       └── test.py          # Test API
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/                 # API services
    │   ├── components/          # UI components
    │   ├── pages/               # Pages
    │   │   ├── admin/           # Admin panel pages
    │   │   └── student/         # Student interface pages
    │   ├── store/               # Zustand stores
    │   ├── types/               # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🚀 Installation & Setup

### 1. Backend

```bash
cd backend

python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Create PostgreSQL database:
# CREATE DATABASE test_db;

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend: http://localhost:5173

## 📡 API Endpoints

### Admin API (`/api/admin`)

> All requests require `login` and `password` as query parameters.

#### Groups:
- `POST /groups` — Create group
- `GET /groups` — Get all groups
- `DELETE /groups/{id}` — Delete group

#### Students:
- `POST /students` — Add student
- `GET /groups/{group_id}/students` — Get students by group
- `DELETE /students/{id}` — Delete student

#### Subjects & Topics:
- `POST /subjects` — Add subject
- `GET /subjects` — Get all subjects
- `POST /topics` — Add topic
- `GET /subjects/{subject_id}/topics` — Get topics by subject

#### Tests:
- `POST /tests` — Create test
- `GET /tests` — Get all tests
- `POST /import-tests` — Import tests from Excel

#### OTP & Results:
- `POST /generate-otp` — Generate OTP for student
- `GET /results` — Get results
- `GET /export-results` — Export results to Excel

### Student API (`/api/student`)
- `GET /groups` — List of groups
- `GET /groups/{id}/students` — Students in group
- `GET /subjects` — List of subjects

### Test API (`/api/test`)
- `GET /session/{id}` — Test session info
- `POST /verify-otp` — Verify OTP code
- `GET /questions/{session_id}` — Get test questions
- `POST /submit-answer` — Submit answer
- `POST /finish-test/{session_id}` — Finish test
- `GET /result/{session_id}` — Get result

## 👨‍💼 Admin Panel

### Credentials:
- **Login:** admin
- **Password:** admin123

### Features:
1. **Groups** — Create, view, delete groups
2. **Subjects & Topics** — Manage subjects and related topics
3. **Tests** — Create tests, import from Excel, generate OTP codes
4. **Results** — View all results with filters, export to Excel

## 🎓 Student Interface

### Test Flow:
1. Select group and student
2. Enter session ID and OTP code
3. Take the test:
   - Real-time countdown timer
   - Navigation between questions
   - Auto-save answers
   - Bookmark questions
4. View results:
   - Correct/incorrect answer count
   - Percentage score and grade
   - Visual result display

## 🔒 Security

- Admin panel protected with login/password
- OTP authentication for students
- Account blocked for 30 minutes after 3 failed OTP attempts
- Test sessions have time limits
- CORS configured

## 📊 Database Schema

| Table | Description |
|-------|-------------|
| `groups` | Student groups |
| `students` | Students |
| `subjects` | Subjects |
| `topics` | Topics |
| `tests` | Tests |
| `test_topics` | Test-topic relations |
| `questions` | Questions |
| `question_options` | Answer options |
| `test_sessions` | Test sessions |
| `student_answers` | Student answers |
| `results` | Final results |

## 📝 Excel Import Format

- Sheet name = Subject name
- Each row = 1 question
- Format: `Question | Option A | Option B | Option C | Option D | Correct Answer | Topic Number`

## ✅ Features

- Full CRUD operations
- OTP authentication system
- Real-time test timer
- Auto-save answers
- Excel import/export
- Responsive design
- Type-safe code (TypeScript)
- Professional UI/UX

## 👨‍💻 Author

**Turabek** — Full Stack Developer  
[LinkedIn](#) · [GitHub](#)

## 📄 License

MIT License
