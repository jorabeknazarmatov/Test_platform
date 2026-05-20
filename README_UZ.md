# Test Platformasi - Kollej O'quvchilari uchun Online Test Tizimi

Vollständiges Test-Management-System mit Admin-Panel und Student-Test-Interface.

## 📋 Loyiha Haqida

Test Platformasi - bu kollej o'quvchilari uchun mo'ljallangan to'liq funksional online test tizimi. Admin panel orqali guruhlar, o'quvchilar, fanlar, mavzular va testlarni boshqarish, OTP orqali o'quvchilarga test sessiyalari berish va natijalarni Excel formatida eksport qilish imkoniyati mavjud.

## 🏗 Texnologiyalar

### Backend:
- **FastAPI** - Zamonaviy Python web framework
- **PostgreSQL** - Ma'lumotlar bazasi
- **SQLAlchemy** - ORM
- **Pydantic** - Ma'lumot validatsiya
- **openpyxl** - Excel fayllari bilan ishlash

### Frontend (Next.js versiyasi):
- **Next.js 14+** - React framework (App Router)
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling
- **Framer Motion** - Animatsiyalar
- **Axios** - HTTP client
- **React Hook Form** - Form boshqaruv
- **Zod** - Validatsiya

### Frontend (Vite versiyasi - eski):
- **React 19** - UI kutubxona
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Server state management
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📁 Loyiha Strukturasi

```
Test_site/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI ilova
│   │   ├── database.py          # Database konfiguratsiya
│   │   ├── models.py            # SQLAlchemy modellari
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
    │   │   ├── axios.ts
    │   │   ├── admin.api.ts
    │   │   ├── student.api.ts
    │   │   └── test.api.ts
    │   ├── components/          # UI komponentlar
    │   │   └── common/
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── Card.tsx
    │   │       └── Loading.tsx
    │   ├── pages/               # Sahifalar
    │   │   ├── LandingPage.tsx
    │   │   ├── admin/
    │   │   │   ├── AdminLogin.tsx
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   ├── GroupsPage.tsx
    │   │   │   ├── SubjectsPage.tsx
    │   │   │   ├── TestsPage.tsx
    │   │   │   └── ResultsPage.tsx
    │   │   └── student/
    │   │       ├── StudentPage.tsx
    │   │       ├── TestPage.tsx
    │   │       └── ResultPage.tsx
    │   ├── store/               # Zustand stores
    │   │   ├── authStore.ts
    │   │   └── testStore.ts
    │   ├── types/               # TypeScript types
    │   │   └── index.ts
    │   ├── App.tsx              # Main app component
    │   └── main.tsx             # Entry point
    └── package.json

```

## 🚀 O'rnatish va Ishga Tushirish

### 1. Backend O'rnatish

```bash
# Backend papkasiga o'tish
cd backend

# Virtual environment yaratish
python -m venv venv

# Virtual environment aktivlashtirish
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Dependencies o'rnatish
pip install -r requirements.txt

# PostgreSQL database yaratish
# PostgreSQL da quyidagi commandani ishga tushiring:
# CREATE DATABASE test_db;

# .env fayl yaratish (ixtiyoriy)
# DATABASE_URL=postgresql://postgres:password@localhost/test_db

# Backend ishga tushirish
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend manzil: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 2. Frontend O'rnatish (Next.js versiyasi)

```bash
# Frontend papkasiga o'tish
cd frontend

# Dependencies o'rnatish
npm install

# .env.local fayl yaratish
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Development rejimida ishga tushirish
npm run dev

# Yoki production build
npm run build
npm start
```

Frontend manzil: http://localhost:3000

**Eslatma:** Next.js versiyasida minimal, professional dizayn, O'zbek tilidagi interfeys va Framer Motion animatsiyalari ishlatilgan.

## 📡 API Endpoints

### Admin API (`/api/admin`)

**Autentifikatsiya:** Barcha so'rovlarda `login` va `password` query parametrlari kerak.

#### Guruhlar:
- `POST /groups` - Yangi guruh yaratish
- `GET /groups` - Barcha guruhlarni olish
- `DELETE /groups/{id}` - Guruhni o'chirish

#### O'quvchilar:
- `POST /students` - Yangi o'quvchi qo'shish
- `GET /groups/{group_id}/students` - Guruh o'quvchilarini olish
- `DELETE /students/{id}` - O'quvchini o'chirish

#### Fanlar va Mavzular:
- `POST /subjects` - Yangi fan qo'shish
- `GET /subjects` - Barcha fanlarni olish
- `POST /topics` - Yangi mavzu qo'shish
- `GET /subjects/{subject_id}/topics` - Fan mavzularini olish

#### Testlar:
- `POST /tests` - Yangi test yaratish
- `GET /tests` - Barcha testlarni olish
- `POST /import-tests` - Excel dan testlarni import qilish

#### OTP va Natijalar:
- `POST /generate-otp` - O'quvchi uchun OTP generatsiya qilish
- `GET /results` - Natijalarni olish
- `GET /export-results` - Natijalarni Excel ga eksport qilish

### Student API (`/api/student`)

- `GET /groups` - Guruhlar ro'yxati
- `GET /groups/{id}/students` - Guruh o'quvchilari
- `GET /subjects` - Fanlar ro'yxati

### Test API (`/api/test`)

- `GET /session/{id}` - Test sessiyasi ma'lumoti
- `POST /verify-otp` - OTP kodni tekshirish
- `GET /questions/{session_id}` - Test savollarini olish
- `POST /submit-answer` - Javobni yuborish
- `POST /finish-test/{session_id}` - Testni yakunlash
- `GET /result/{session_id}` - Natijani olish

## 👨‍💼 Admin Panel Funksiyalari

### Kirish:
- **Login:** admin
- **Parol:** admin123

### Imkoniyatlar:
1. **Guruhlar:** Guruhlar yaratish, ko'rish, o'chirish
2. **Fanlar va Mavzular:** Fanlar va ularga tegishli mavzular boshqarish
3. **Testlar:**
   - Testlar yaratish (fan, davomiylik, mavzular)
   - Excel dan testlarni import qilish
   - OTP generatsiya qilish
4. **Natijalar:**
   - Barcha natijalarni ko'rish
   - Filtrlar (guruh, o'quvchi, test)
   - Excel ga eksport qilish

## 🎓 O'quvchi Interface

### Test Topshirish Jarayoni:
1. Guruh va o'quvchini tanlash
2. Sessiya ID va OTP kodni kiritish
3. Test topshirish:
   - Real-time timer
   - Savollar orasida navigatsiya
   - Javoblar avtomatik saqlanadi
   - Savollarga belgi qo'yish
4. Natijani ko'rish:
   - To'g'ri/noto'g'ri javoblar soni
   - Foiz va baho
   - Vizual natija

## 🔒 Xavfsizlik

- Admin panel login/password bilan himoyalangan
- O'quvchilar uchun OTP autentifikatsiya
- OTP kod 3 marta noto'g'ri kiritilganda 30 daqiqaga bloklanadi
- Test sessiyalari muddati cheklangan
- CORS konfiguratsiyasi

## 📊 Ma'lumotlar Bazasi Sxemasi

### Jadvallar:
- `groups` - Guruhlar
- `students` - O'quvchilar
- `subjects` - Fanlar
- `topics` - Mavzular
- `tests` - Testlar
- `test_topics` - Test va mavzular bog'lanishi
- `questions` - Savollar
- `question_options` - Javob variantlari
- `test_sessions` - Test sessiyalari
- `student_answers` - O'quvchi javoblari
- `results` - Yakuniy natijalar

## 🛠 Development

### Backend Test qilish:
```bash
# Database migratsiya (agar kerak bo'lsa)
# Alembic yoki boshqa migration tool ishlatish mumkin

# Test mode ishga tushirish
uvicorn app.main:app --reload
```

### Frontend Test qilish:
```bash
# Development server
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

## 📝 Test Excel Format

Excel fayldan testlarni import qilish uchun:
- Sheet nomi = Fan nomi
- Har bir qator = 1 ta savol
- Format: Savol matn | A variant | B variant | C variant | D variant | To'g'ri javob | Mavzu raqami

## 🎯 Xususiyatlar

✅ To'liq CRUD operatsiyalar
✅ OTP autentifikatsiya tizimi
✅ Real-time test timer
✅ Avtomatik javob saqlash
✅ Excel import/export
✅ Responsive dizayn
✅ O'zbek tilida interface
✅ Professional UI/UX
✅ Type-safe kod (TypeScript)

## 🐛 Bug Report va Yangi Funksiyalar

Agar bug topsangiz yoki yangi funksiya taklif qilmoqchi bo'lsangiz, GitHub Issues orqali xabar bering.

## 📄 Litsenziya

MIT License

## 👨‍💻 Muallif

Turabek - Full Stack Developer
