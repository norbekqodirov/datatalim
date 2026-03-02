import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import CareerTest from './pages/CareerTest';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Team from './pages/Team';
import ApplyForm from './pages/ApplyForm';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useTheme } from './store/ThemeContext';
import { useStore } from './store/useStore';
import { useTracking } from './hooks/useTracking';

// Admin
import { AdminLayout } from './components/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageTeam from './pages/admin/ManageTeam';
import ManageVisibility from './pages/admin/ManageVisibility';
import ManageMedia from './pages/admin/ManageMedia';
import ManageMarketing from './pages/admin/ManageMarketing';
import ManageLeads from './pages/admin/ManageLeads';

// Protected Route Wrapper with Session Timeout
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 soat

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  const authTime = localStorage.getItem('adminAuthTime');

  // Session timeout tekshiruvi
  if (isAuthenticated && authTime) {
    const elapsed = Date.now() - parseInt(authTime, 10);
    if (elapsed > SESSION_TIMEOUT) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminAuthTime');
      return <Navigate to="/paneladmindata/login" replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/paneladmindata/login" replace />;
  }
  return <>{children}</>;
};

// Public Layout — Navbar va Footer faqat 1 marta mount bo'ladi
const PublicLayout = () => {
  const { isDark } = useTheme();
  const { isChecking } = useTracking(); // Initialize marketing link tracking

  if (isChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061ff]"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans text-slate-900"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #000000 0%, #000000 100%)'
          : 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 30%, #ffffff 100%)'
      }}
    >
      <Navbar />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const initializeStore = useStore(state => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes — Navbar/Footer persist */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/career-test" element={<CareerTest />} />
        </Route>

        {/* Standalone Landing Page for Marketing Links */}
        <Route path="/apply" element={<ApplyForm />} />

        {/* Admin Routes */}
        <Route path="/paneladmindata/login" element={<Login />} />
        <Route
          path="/paneladmindata"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="team" element={<ManageTeam />} />
          <Route path="visibility" element={<ManageVisibility />} />
          <Route path="media" element={<ManageMedia />} />
          <Route path="marketing" element={<ManageMarketing />} />
          <Route path="leads" element={<ManageLeads />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
