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
import { IGLayout } from './components/admin/analytics/IGLayout';
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
// Education
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const ManageGroups = lazy(() => import('./pages/admin/ManageGroups'));
const ManageAttendance = lazy(() => import('./pages/admin/ManageAttendance'));
const Schedule = lazy(() => import('./pages/admin/education/Schedule'));
const Journal = lazy(() => import('./pages/admin/education/Journal'));
const Certificates = lazy(() => import('./pages/admin/education/Certificates'));
const Materials = lazy(() => import('./pages/admin/education/Materials'));
// Marketing
const ManageLeads = lazy(() => import('./pages/admin/ManageLeads'));
const ManagePipeline = lazy(() => import('./pages/admin/ManagePipeline'));
const ManageMarketing = lazy(() => import('./pages/admin/ManageMarketing'));
const ManagePosts = lazy(() => import('./pages/admin/ManageBlog'));
const ManageTestimonials = lazy(() => import('./pages/admin/ManageTestimonials'));
const Campaigns = lazy(() => import('./pages/admin/marketing/Campaigns'));
// HR
const Teachers = lazy(() => import('./pages/admin/hr/Teachers'));
const Staff = lazy(() => import('./pages/admin/hr/Staff'));
const Payroll = lazy(() => import('./pages/admin/hr/Payroll'));
// Finance
const ManageFinance = lazy(() => import('./pages/admin/ManageFinance'));
const ManageEnrollments = lazy(() => import('./pages/admin/ManageEnrollments'));
const FinanceReport = lazy(() => import('./pages/admin/finance/Report'));
const Discounts = lazy(() => import('./pages/admin/finance/Discounts'));
// Analytics
const BIAnalytics = lazy(() => import('./pages/admin/analytics/BIAnalytics'));
const IGOverview = lazy(() => import('./pages/admin/analytics/IGOverview'));
const IGContent = lazy(() => import('./pages/admin/analytics/IGContent'));
const IGAIInsights = lazy(() => import("./pages/admin/analytics/IGAIInsights"));
const IGSettings = lazy(() => import("./pages/admin/analytics/IGSettings"));
const IGAudience = lazy(() => import('./pages/admin/analytics/IGAudience'));
const TelegramAnalytics = lazy(() => import('./pages/admin/analytics/TelegramAnalytics'));

// Marketing Project Management (PM)
const PMLayout = lazy(() => import('./components/admin/pm/PMLayout'));
const PMDashboard = lazy(() => import('./pages/admin/pm/PMDashboard'));
const ContentPlans = lazy(() => import('./pages/admin/pm/ContentPlans'));
const ContentCalendar = lazy(() => import('./pages/admin/pm/ContentCalendar'));
const TaskBoard = lazy(() => import('./pages/admin/pm/TaskBoard'));
const MyDay = lazy(() => import('./pages/admin/pm/MyDay'));
const PMTeam = lazy(() => import('./pages/admin/pm/PMTeam'));

// Settings
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManageMedia = lazy(() => import('./pages/admin/ManageMedia'));
const ManageVisibility = lazy(() => import('./pages/admin/ManageVisibility'));
const ManageFAQ = lazy(() => import('./pages/admin/ManageFAQ'));
const AuditLog = lazy(() => import('./pages/admin/settings/AuditLog'));

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
              {/* Education */}
              <Route path="students" element={<ManageStudents />} />
              <Route path="groups" element={<ManageGroups />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="journal" element={<Journal />} />
              <Route path="attendance" element={<ManageAttendance />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="materials" element={<Materials />} />
              
              {/* Marketing */}
              <Route path="leads" element={<ManageLeads />} />
              <Route path="pipeline" element={<ManagePipeline />} />
              <Route path="marketing" element={<ManageMarketing />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="posts" element={<ManagePosts />} />
              <Route path="testimonials" element={<ManageTestimonials />} />
              <Route path="tg" element={<ErrorBoundary><TelegramAnalytics /></ErrorBoundary>} />
              <Route path="ig" element={<IGLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<ErrorBoundary><IGOverview /></ErrorBoundary>} />
                <Route path="content" element={<ErrorBoundary><IGContent /></ErrorBoundary>} />
                <Route path="audience" element={<ErrorBoundary><IGAudience /></ErrorBoundary>} />
                <Route path="ai" element={<ErrorBoundary><IGAIInsights /></ErrorBoundary>} />
                <Route path="settings" element={<IGSettings />} />
              </Route>

              {/* SMM & Marketing Project Management (PM) */}
              <Route path="pm" element={<PMLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PMDashboard />} />
                <Route path="plans" element={<ContentPlans />} />
                <Route path="calendar" element={<ContentCalendar />} />
                <Route path="board" element={<TaskBoard />} />
                <Route path="my-day" element={<MyDay />} />
                <Route path="team" element={<PMTeam />} />
              </Route>

              {/* HR */}
              <Route path="team" element={<Teachers />} />
              <Route path="staff" element={<Staff />} />
              <Route path="payroll" element={<Payroll />} />

              {/* Finance */}
              <Route path="finance" element={<ManageFinance />} />
              <Route path="enrollments" element={<ManageEnrollments />} />
              <Route path="finance-report" element={<FinanceReport />} />
              <Route path="discounts" element={<Discounts />} />

              {/* Analytics */}
              <Route path="bi" element={<BIAnalytics />} />

              {/* Settings */}
              <Route path="settings" element={<AdminSettings />} />
              <Route path="media" element={<ManageMedia />} />
              <Route path="visibility" element={<ManageVisibility />} />
              <Route path="faq" element={<ManageFAQ />} />
              <Route path="audit" element={<AuditLog />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
