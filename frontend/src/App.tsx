import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DashboardHome } from './pages/admin/DashboardHome';
import { GroupsPage } from './pages/admin/GroupsPage';
import { SubjectsPage } from './pages/admin/SubjectsPage';
import { TestsPage } from './pages/admin/TestsPage';
import { ResultsPage } from './pages/admin/ResultsPage';
import { StudentPage } from './pages/student/StudentPage';
import { TestPage } from './pages/student/TestPage';
import { ResultPage } from './pages/student/ResultPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        <Route path="/student" element={<StudentPage />} />
        <Route path="/test/:sessionId" element={<TestPage />} />
        <Route path="/result/:sessionId" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
