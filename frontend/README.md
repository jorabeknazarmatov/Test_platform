# Test Platform Frontend

Professional React + TypeScript frontend with Figma Make style, 100% integrated with the backend API.

## Features

- ✅ **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS 4.x
- ✅ **Professional Design**: Figma Make style with glassmorphism effects
- ✅ **Full Backend Integration**: All API endpoints connected
- ✅ **Admin Panel**: Complete CRUD for groups, students, subjects, topics, tests, and results
- ✅ **Student Portal**: Test-taking interface with timer and progress tracking
- ✅ **State Management**: Zustand for auth and test state
- ✅ **Animations**: Framer Motion for smooth transitions
- ✅ **Type-Safe**: Full TypeScript with strict types

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API services (axios, admin, student, test)
├── components/ui/    # Reusable UI components
├── pages/            # Page components
│   ├── admin/        # Admin pages (dashboard, groups, subjects, tests, results)
│   └── student/      # Student pages (login, test, result)
├── store/            # Zustand stores (auth, test)
├── types/            # TypeScript type definitions
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

## Pages

### Public Pages
- **Landing Page** (`/`) - Choose between Student and Admin portals
- **Admin Login** (`/admin/login`) - Admin authentication

### Admin Pages (Protected)
- **Dashboard** (`/admin/dashboard`) - Overview with statistics
- **Groups** (`/admin/groups`) - Manage groups and students
- **Subjects** (`/admin/subjects`) - Manage subjects and topics
- **Tests** (`/admin/tests`) - Create tests and generate OTPs
- **Results** (`/admin/results`) - View and export results

### Student Pages
- **Student Login** (`/student`) - Enter session ID and OTP
- **Test Page** (`/test/:sessionId`) - Take the test
- **Result Page** (`/result/:sessionId`) - View test results

## Admin Credentials

**Demo Account:**
- Login: `admin`
- Password: `bek_1255`

## API Integration

All API calls use query parameters for authentication:
```typescript
?login=admin&password=bek_1255
```

The frontend automatically handles:
- Authentication state persistence
- API error handling
- Loading states
- Form validation

## UI Components

Professional, reusable components:
- **Button** - Multiple variants (primary, secondary, outline, ghost, success, danger)
- **Card** - Glassmorphism and gradient variants
- **Input** - With label, error, and icon support
- **Badge** - Status indicators
- **Loading** - Spinner and full-screen loader

## Styling

- **Tailwind CSS 4.x** with custom configuration
- **Glassmorphism** effects with `.glass` class
- **Gradient backgrounds** with utility classes
- **Hover animations** with `card-hover` and `btn-shimmer`
- **Framer Motion** for page transitions

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8000
```

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS 4.x
- React Router DOM
- Zustand
- Axios
- Framer Motion
- Lucide React (icons)

## Build Output

Production build creates optimized files in `dist/`:
- Minified JavaScript bundle (~438 KB, gzipped: 140 KB)
- Optimized CSS (~34 KB, gzipped: 6.5 KB)

---

Built with ❤️ using modern web technologies
