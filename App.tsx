import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { initPixel, trackEvent } from './utils/pixel';
import { trackSiteEventOncePerSession } from './utils/analytics';
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
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManagePosts = lazy(() => import('./pages/admin/ManageBlog'));

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
    // Count this as a site visit (once per session, public pages only)
    if (!location.pathname.startsWith('/paneladmindata')) {
      trackSiteEventOncePerSession('site_visit');
    }
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
            {/* /apply: legacy path — all 13 existing marketing_links rows (Instagram bio,
                QR codes, ad campaigns already printed/shared) point here. Keep as a live
                alias, not a redirect, so old links keep working without a DB update. */}
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
              <Route path="posts" element={<ManagePosts />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
