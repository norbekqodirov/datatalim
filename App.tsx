import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { initPixel, trackEvent } from './utils/pixel';
const Home = lazy(() => import('./pages/Home'));
const CareerTest = lazy(() => import('./pages/CareerTest'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Team'));
const ApplyForm = lazy(() => import('./pages/ApplyForm'));
const Languages = lazy(() => import('./pages/Languages'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { useTheme } from './store/ThemeContext';
import { useStore } from './store/useStore';
import { useTracking } from './hooks/useTracking';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TelegramButton } from './components/TelegramButton';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import { GlobalSearch } from './components/GlobalSearch';

// Admin
import { AdminLayout } from './components/admin/AdminLayout';
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageTeam = lazy(() => import('./pages/admin/ManageTeam'));
const ManageVisibility = lazy(() => import('./pages/admin/ManageVisibility'));
const ManageMedia = lazy(() => import('./pages/admin/ManageMedia'));
const ManageMarketing = lazy(() => import('./pages/admin/ManageMarketing'));
const ManageLeads = lazy(() => import('./pages/admin/ManageLeads'));
const ManageEnrollments = lazy(() => import('./pages/admin/ManageEnrollments'));
const ManagePipeline = lazy(() => import('./pages/admin/ManagePipeline'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManagePosts = lazy(() => import('./pages/admin/ManageBlog'));
const IGOverview = lazy(() => import('./pages/admin/analytics/IGOverview'));
const IGContent = lazy(() => import('./pages/admin/analytics/IGContent'));
const IGAIInsights = lazy(() => import("./pages/admin/analytics/IGAIInsights"));
const IGSettings = lazy(() => import("./pages/admin/analytics/IGSettings"));
const IGAudience = lazy(() => import('./pages/admin/analytics/IGAudience'));
const TelegramAnalytics = lazy(() => import('./pages/admin/analytics/TelegramAnalytics'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const ManageGroups = lazy(() => import('./pages/admin/ManageGroups'));
const ManageAttendance = lazy(() => import('./pages/admin/ManageAttendance'));
const ManageFinance = lazy(() => import('./pages/admin/ManageFinance'));

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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#000000]' : 'bg-slate-50'}`}>
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
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

// Global Pixel PageView Tracker Tool
const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Initiate Pixel once on app load
    initPixel();
  }, []);

  useEffect(() => {
    // Track PageView on every route change
    trackEvent('PageView', { path: location.pathname });
  }, [location]);

  return null;
};

function App() {
  const initializeStore = useStore(state => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <HelmetProvider>
      <Router>
        <PixelTracker />
        <ScrollProgress />
        <Toaster position="top-right" />
        <TelegramButton />
        <BackToTop />
        <GlobalSearch />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#000000]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061ff]"></div></div>}>
          <Routes>
            {/* Public Routes — Navbar/Footer persist */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/biz-haqimizda" element={<About />} />
              <Route path="/jamoa" element={<Team />} />
              <Route path="/kurslar" element={<Courses />} />
              <Route path="/kurslar/:id" element={<CourseDetail />} />
              <Route path="/karyera-testi" element={<CareerTest />} />
              <Route path="/til-kurslari" element={<Languages />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Route>

            {/* Standalone Landing Page for Marketing Links */}
            <Route path="/ariza" element={<ApplyForm />} />

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
              <Route path="enrollments" element={<ManageEnrollments />} />
              <Route path="pipeline" element={<ManagePipeline />} />
              <Route path="posts" element={<ManagePosts />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Instagram Analytics */}
              <Route path="ig/overview" element={<ErrorBoundary><IGOverview /></ErrorBoundary>} />
              <Route path="ig/content" element={<ErrorBoundary><IGContent /></ErrorBoundary>} />
              <Route path="ig/audience" element={<ErrorBoundary><IGAudience /></ErrorBoundary>} />
              <Route path="ig/ai" element={<ErrorBoundary><IGAIInsights /></ErrorBoundary>} />
              <Route path="ig/settings" element={<IGSettings />} />
              {/* Learning Center */}
              <Route path="students" element={<ManageStudents />} />
              <Route path="groups" element={<ManageGroups />} />
              <Route path="attendance" element={<ManageAttendance />} />
              <Route path="finance" element={<ManageFinance />} />
              {/* Telegram Analytics */}
              <Route path="tg" element={<ErrorBoundary><TelegramAnalytics /></ErrorBoundary>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
