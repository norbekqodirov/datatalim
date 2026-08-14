import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Megaphone, Users, CreditCard, BarChart3,
  Settings, LogOut, Sun, Moon, Menu, X, Bell, Globe, Zap, ChevronRight,
  BookOpen, CalendarDays, ClipboardList, CheckSquare, Award, FolderOpen,
  UserPlus, Target, FileText, Instagram, Send, Star, TrendingUp,
  UserCheck, Briefcase, Banknote, DollarSign, FileBarChart, Tag,
  BarChart2, Brain, Eye, Shield, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';
import { getRoleFromToken, getUsernameFromToken } from '../../utils/api';


// ─── Kategoriya ta'riflari ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'education', label: "Ta'lim", icon: GraduationCap, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { id: 'hr',        label: 'HR', icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'finance',   label: 'Moliya', icon: CreditCard, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { id: 'analytics', label: 'Analitika', icon: BarChart3, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  { id: 'settings',  label: 'Sozlamalar', icon: Settings, color: '#64748B', bg: 'rgba(100,116,139,0.12)' },
];

// ─── Sub-menyular ─────────────────────────────────────────────────────────────
const NAV_MAP: Record<string, { path: string; icon: React.ElementType; label: string; isNew?: boolean; isComing?: boolean }[]> = {
  education: [
    { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/paneladmindata/students', icon: UserCheck, label: "O'quvchilar" },
    { path: '/paneladmindata/groups', icon: Users, label: 'Guruhlar' },
    { path: '/paneladmindata/courses', icon: BookOpen, label: 'Kurslar' },
    { path: '/paneladmindata/schedule', icon: CalendarDays, label: 'Dars Jadvali' },
    { path: '/paneladmindata/journal', icon: ClipboardList, label: 'Elektron Jurnal' },
    { path: '/paneladmindata/attendance', icon: CheckSquare, label: 'Davomat' },
    { path: '/paneladmindata/certificates', icon: Award, label: 'Sertifikatlar' },
    { path: '/paneladmindata/materials', icon: FolderOpen, label: "O'quv Materiallari", isComing: true },
  ],
  marketing: [
    { path: '/paneladmindata/leads', icon: UserPlus, label: 'Lidlar (Voronka)' },
    { path: '/paneladmindata/pipeline', icon: TrendingUp, label: 'Pipeline' },
    { path: '/paneladmindata/marketing', icon: Target, label: 'Target Formalar' },
    { path: '/paneladmindata/campaigns', icon: Megaphone, label: 'Aksiyalar / SMM', isComing: true },
    { path: '/paneladmindata/posts', icon: FileText, label: 'Blog' },
    { path: '/paneladmindata/testimonials', icon: Star, label: 'Izohlar' },
    { path: '/paneladmindata/pm/calendar', icon: CalendarDays, label: 'Kontent Taqvim', isNew: true },
    { path: '/paneladmindata/pm/plans', icon: FileText, label: 'Kontent Reja', isNew: true },
    { path: '/paneladmindata/pm/board', icon: CheckSquare, label: 'Vazifalar (Kanban)', isNew: true },
    { path: '/paneladmindata/pm/my-day', icon: Sun, label: 'Bugungi Kun', isNew: true },
    { path: '/paneladmindata/pm/team', icon: Users, label: 'Marketing Jamoa', isNew: true },
    { path: '/paneladmindata/pm/dashboard', icon: BarChart2, label: 'PM Dashboard', isNew: true },
    { path: '/paneladmindata/ig/overview', icon: Instagram, label: 'Instagram Analitika' },
    { path: '/paneladmindata/tg', icon: Send, label: 'Telegram Analitika' },
  ],
  hr: [
    { path: '/paneladmindata/team', icon: UserCheck, label: 'Ustozlar' },
    { path: '/paneladmindata/staff', icon: Briefcase, label: 'Xodimlar' },
    { path: '/paneladmindata/payroll', icon: Banknote, label: 'Ish Haqi' },
  ],
  finance: [
    { path: '/paneladmindata/finance', icon: DollarSign, label: 'To\'lovlar' },
    { path: '/paneladmindata/enrollments', icon: GraduationCap, label: 'Yozilganlar' },
    { path: '/paneladmindata/finance-report', icon: FileBarChart, label: 'Hisobot', isComing: true },
    { path: '/paneladmindata/discounts', icon: Tag, label: 'Chegirmalar' },
  ],
  analytics: [
    { path: '/paneladmindata/bi', icon: BarChart3, label: 'BI Analitika', isNew: true },
  ],
  settings: [
    { path: '/paneladmindata/settings', icon: Settings, label: 'Umumiy Sozlamalar' },
    { path: '/paneladmindata/media', icon: Globe, label: 'Sayt Kontent' },
    { path: '/paneladmindata/visibility', icon: Eye, label: "Bo'limlar Ko'rinishi" },
    { path: '/paneladmindata/faq', icon: ClipboardList, label: 'FAQ' },
    { path: '/paneladmindata/ig/settings', icon: Instagram, label: 'Instagram Token' },
    { path: '/paneladmindata/audit', icon: Shield, label: 'Audit Log', isComing: true },
  ],
};

// ─── Kategoriyani yo'l bo'yicha aniqlash ────────────────────────────────────
function getCategoryForPath(pathname: string): string {
  const marketingPaths = ['/leads', '/pipeline', '/marketing', '/campaigns', '/posts', '/testimonials', '/ig/', '/tg', '/pm/'];
  const hrPaths = ['/team', '/staff', '/payroll'];
  const financePaths = ['/finance', '/enrollments', '/finance-report', '/discounts'];
  const analyticsPaths = ['/bi', '/ig/'];
  const settingsPaths = ['/settings', '/media', '/visibility', '/faq', '/audit'];

  if (marketingPaths.some(p => pathname.includes(p))) return 'marketing';
  if (hrPaths.some(p => pathname.includes(p))) return 'hr';
  if (financePaths.some(p => pathname.includes(p))) return 'finance';
  if (analyticsPaths.some(p => pathname.includes(p)) && !marketingPaths.some(p => pathname.includes(p))) return 'analytics';
  if (settingsPaths.some(p => pathname.includes(p))) return 'settings';
  return 'education';
}

const AccessDenied: React.FC<{ isDark: boolean; onGoBack: () => void }> = ({ isDark, onGoBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${
          isDark 
            ? 'bg-slate-900/60 border-red-500/20 text-white' 
            : 'bg-white border-red-200 text-slate-900'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Ruxsat Etilmadi</h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Sizda ushbu sahifaga kirish uchun yetarli huquqlar mavjud emas. Agar bu xatolik bo'lsa, tizim administratoriga murojaat qiling.
        </p>
        <button
          onClick={onGoBack}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/25"
        >
          Bosh sahifaga qaytish
        </button>
      </motion.div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const role = getRoleFromToken();
  const username = getUsernameFromToken();

  const [activeCategory, setActiveCategory] = useState(() => {
    const currentCat = getCategoryForPath(location.pathname);
    if (role === 'teacher') return 'education';
    if (role === 'manager' && currentCat === 'settings') return 'education';
    return currentCat;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const prevTotalRef = useRef<number | null>(null);

  useEffect(() => {
    const currentCat = getCategoryForPath(location.pathname);
    if (role === 'teacher') {
      setActiveCategory('education');
    } else if (role === 'manager' && currentCat === 'settings') {
      setActiveCategory('education');
    } else {
      setActiveCategory(currentCat);
    }
  }, [location.pathname, role]);

  useEffect(() => {
    const fetchLeads = () => {
      const token = localStorage.getItem('adminToken');
      fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          const total: number = d.totalLeads ?? 0;
          if (prevTotalRef.current !== null && total > prevTotalRef.current) {
            setNewLeadsCount(c => c + (total - prevTotalRef.current!));
          }
          prevTotalRef.current = total;
        })
        .catch(() => {});
    };
    fetchLeads();
    const iv = setInterval(fetchLeads, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthTime');
    navigate('/paneladmindata/login');
  };

  const isActive = (path: string) => {
    if (path === '/paneladmindata') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const allowedCategories = CATEGORIES.filter(cat => {
    if (role === 'teacher') return cat.id === 'education';
    if (role === 'manager') return cat.id !== 'settings';
    return true;
  });

  const activeCat = allowedCategories.find(c => c.id === activeCategory) || allowedCategories[0] || CATEGORIES[0];
  
  let currentItems = NAV_MAP[activeCat.id] || [];
  if (role === 'teacher') {
    currentItems = currentItems.filter(i => 
      ['/paneladmindata', '/paneladmindata/schedule', '/paneladmindata/journal', '/paneladmindata/attendance'].includes(i.path)
    );
  } else if (role === 'manager' && activeCat.id === 'hr') {
    currentItems = currentItems.filter(i => i.path !== '/paneladmindata/payroll');
  }

  // Helper to check if a path is allowed
  const isPathAllowed = (path: string) => {
    if (role === 'admin') return true;
    if (role === 'manager') {
      if (path.includes('/payroll') || path.includes('/settings') || path.includes('/media') || path.includes('/visibility') || path.includes('/faq') || path.includes('/audit') || path.includes('/ig/settings')) {
        return false;
      }
      return true;
    }
    if (role === 'teacher') {
      return ['/paneladmindata', '/paneladmindata/schedule', '/paneladmindata/journal', '/paneladmindata/attendance'].includes(path) || path === '/paneladmindata/';
    }
    return false;
  };

  // Qidiruv filtri
  const filteredItems = searchQuery
    ? Object.entries(NAV_MAP).flatMap(([catId, items]) => {
        if (role === 'teacher' && catId !== 'education') return [];
        if (role === 'manager' && catId === 'settings') return [];
        return items.filter(i => isPathAllowed(i.path));
      }).filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentItems;


  // ── Sidebar ichki kontent ──────────────────────────────────────────────────
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex h-full">
      {/* Chap: Kategoriya Icon Tablar */}
      <div className={`w-[60px] flex flex-col items-center py-3 gap-1 border-r shrink-0 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'}`}>
        {allowedCategories.map(cat => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              title={cat.label}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                isSelected ? 'shadow-lg' : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              style={isSelected ? { background: cat.bg } : {}}
            >
              {isSelected && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: cat.color }} />
              )}
              <cat.icon
                size={17}
                style={{ color: isSelected ? cat.color : undefined }}
                className={!isSelected ? (isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700') : ''}
              />
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-amber-400' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
          title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors mb-1 ${isDark ? 'text-red-500/60 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-50 hover:text-red-500'}`}
          title="Chiqish"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* O'ng: Sub-menyu panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${isDark ? 'bg-[#0a0f1e]' : 'bg-slate-50'}`}>
        {/* Kategoriya sarlavhasi */}
        <div className={`px-4 pt-4 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: activeCat.bg }}>
              <activeCat.icon size={11} style={{ color: activeCat.color }} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: activeCat.color }}>
              {activeCat.label}
            </span>
          </div>
          {/* Search */}
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            <Search size={11} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="bg-transparent outline-none flex-1 text-xs"
            />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
          {filteredItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition-all relative ${
                  active
                    ? isDark ? 'text-white' : 'text-slate-900'
                    : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                style={active ? { background: activeCat.bg, color: activeCat.color } : {}}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: activeCat.color }} />}
                <item.icon size={14} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.isComing && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                    Breve
                  </span>
                )}
                {item.isNew && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500">Yangi</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0a0f1e] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>

      {/* Desktop Sidebar */}
      <aside className={`fixed h-full z-20 hidden lg:flex flex-col w-[260px] ${
        isDark ? 'border-r border-slate-800/80' : 'border-r border-slate-200 shadow-sm'
      }`}>
        {/* Logo */}
        <div className={`h-14 flex items-center justify-between px-4 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#0061ff]">DATA</span>
              <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CRM</span>
            </div>
          </Link>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow shadow-green-500/50" title="Online" />
        </div>

        <div className="flex-1 overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b ${
        isDark ? 'bg-slate-950/95 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-base font-black text-[#0061ff]">DATA <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CRM</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col lg:hidden border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
            >
              <div className={`h-14 flex items-center justify-between px-4 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'}`}>
                <span className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center">
                    <Zap size={13} className="text-white" />
                  </div>
                  <span className="text-base font-black text-[#0061ff]">DATA <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CRM</span></span>
                </span>
                <button onClick={() => setMobileOpen(false)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent onClose={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        {/* Background gradients */}
        {isDark && (
          <>
            <div className="fixed top-0 right-0 w-[600px] h-[400px] bg-[#0061ff] blur-[200px] opacity-[0.025] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-64 w-[400px] h-[300px] bg-purple-500 blur-[200px] opacity-[0.025] rounded-full pointer-events-none" />
          </>
        )}

        {/* Top Header Bar */}
        <div className={`hidden lg:flex items-center justify-between px-8 py-3 border-b sticky top-0 z-10 ${isDark ? 'border-slate-800/80 bg-[#0a0f1e]/90 backdrop-blur-sm' : 'border-slate-100 bg-white/90 backdrop-blur-sm'}`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span style={{ color: activeCat.color }}>{activeCat.label}</span>
            <ChevronRight size={12} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {currentItems.find(i => isActive(i.path))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
              <Globe size={13} />Saytni ko'rish
            </a>
            {/* Notification */}
            <Link to="/paneladmindata/leads" onClick={() => setNewLeadsCount(0)} className="relative" title={newLeadsCount > 0 ? `${newLeadsCount} yangi ariza` : 'Bildirishnomalar'}>
              <div className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Bell size={16} className={newLeadsCount > 0 ? 'text-amber-400' : ''} />
              </div>
              {newLeadsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {newLeadsCount > 9 ? '9+' : newLeadsCount}
                </span>
              )}
            </Link>
            {/* User badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center">
                <span className="text-white text-[9px] font-black">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{username || 'User'}</span>
                <span className={`text-[9px] font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {role === 'admin' ? 'Admin' : role === 'manager' ? 'Menejer' : 'Ustoz'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 lg:px-8 lg:py-7 max-w-7xl mx-auto">
          {isPathAllowed(location.pathname) ? (
            <Outlet />
          ) : (
            <AccessDenied isDark={isDark} onGoBack={() => navigate('/paneladmindata')} />
          )}
        </div>

      </main>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <LogOut size={22} className="text-red-500" />
              </div>
              <h3 className={`text-lg font-black text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Chiqishni tasdiqlang</h3>
              <p className={`text-sm text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tizimdan chiqmoqchimisiz?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Bekor qilish
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors">
                  Chiqish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
