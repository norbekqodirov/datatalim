import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon,
  Target, UserPlus, Menu, X, FileText, Instagram, BarChart2, Brain,
  ChevronDown, ChevronRight, Zap, Bell, TrendingUp, Globe, GraduationCap, GitMerge, Send,
  CheckSquare, DollarSign, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

const NAV_GROUPS = [
  {
    label: 'Asosiy',
    items: [
      { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { path: '/paneladmindata/leads', icon: UserPlus, label: 'Arizalar', badge: null },
      { path: '/paneladmindata/enrollments', icon: GraduationCap, label: 'Yozilganlar' },
      { path: '/paneladmindata/pipeline', icon: GitMerge, label: 'Pipeline' },
      { path: '/paneladmindata/marketing', icon: Target, label: 'Marketing' },
    ],
  },
  {
    label: "O'quv Markaz",
    items: [
      { path: '/paneladmindata/students', icon: UserCheck, label: "O'quvchilar" },
      { path: '/paneladmindata/groups', icon: Users, label: 'Guruhlar' },
      { path: '/paneladmindata/attendance', icon: CheckSquare, label: 'Davomat' },
      { path: '/paneladmindata/finance', icon: DollarSign, label: 'Moliya' },
    ],
  },
  {
    label: 'Kontent',
    items: [
      { path: '/paneladmindata/courses', icon: BookOpen, label: 'Kurslar' },
      { path: '/paneladmindata/posts', icon: FileText, label: 'Blog' },
      { path: '/paneladmindata/team', icon: Users, label: 'Jamoa' },
      { path: '/paneladmindata/media', icon: Video, label: 'Media & Matnlar' },
    ],
  },
  {
    label: 'Tizim',
    items: [
      { path: '/paneladmindata/visibility', icon: Eye, label: "Bo'limlar" },
      { path: '/paneladmindata/tg', icon: Send, label: 'Telegram Analitika' },
      { path: '/paneladmindata/settings', icon: Settings, label: 'Sozlamalar' },
    ],
  },
];

const IG_ITEMS = [
  { path: '/paneladmindata/ig/overview', icon: BarChart2, label: "Umumiy Ko'rinish", color: '#0061ff' },
  { path: '/paneladmindata/ig/content', icon: TrendingUp, label: 'Kontent Analitika', color: '#a855f7' },
  { path: '/paneladmindata/ig/audience', icon: Users, label: 'Demografiya', color: '#ec4899' },
  { path: '/paneladmindata/ig/ai', icon: Brain, label: 'AI Tavsiyalar', color: '#f59e0b' },
  { path: '/paneladmindata/ig/settings', icon: Settings, label: 'Token Sozlash', color: '#64748b' },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(location.pathname.includes('/paneladmindata/ig'));

  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const prevTotalRef = useRef<number | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchNewLeads = () => {
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
    fetchNewLeads();
    const interval = setInterval(fetchNewLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthTime');
    navigate('/paneladmindata/login');
  };

  const confirmLogout = () => setShowLogoutConfirm(true);

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || (location.pathname.startsWith(path) && !location.pathname.includes('/ig'));
  };

  const isIGActive = location.pathname.includes('/paneladmindata/ig');

  const NavContent = ({ onClose, isCollapsed = false }: { onClose?: () => void, isCollapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">

        {/* CRM Nav Groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className={`px-3 pb-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} rounded-xl font-semibold text-[13px] transition-all relative ${
                      active
                        ? isDark
                          ? 'bg-[#0061ff]/15 text-[#60efff] border border-[#0061ff]/20'
                          : 'bg-blue-50 text-[#0061ff] border border-blue-100'
                        : isDark
                          ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    {!isCollapsed && active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#0061ff] rounded-r-full" />
                    )}
                    <item.icon size={15} className={active ? 'text-[#0061ff]' : ''} />
                    {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    {!isCollapsed && (item as any).badge && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />

        {/* Instagram Analytics */}
        <div>
          {!isCollapsed && (
            <p className={`px-3 pb-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Instagram Analitika
            </p>
          )}

          {/* Toggle */}
          <button
            onClick={() => setAnalyticsOpen(o => !o)}
            title={isCollapsed ? 'Instagram Analitika' : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} rounded-xl font-semibold text-[13px] transition-all ${
              isIGActive
                ? isDark
                  ? 'bg-pink-500/15 text-pink-400 border border-pink-500/20'
                  : 'bg-pink-50 text-pink-600 border border-pink-100'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isIGActive ? 'bg-gradient-to-br from-pink-500 to-purple-600' : isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Instagram size={13} className={isIGActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
            </div>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">Instagram</span>
                <motion.div animate={{ rotate: analyticsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} />
                </motion.div>
              </>
            )}
          </button>

          <AnimatePresence>
            {analyticsOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="pl-3 pt-1 space-y-0.5">
                  {IG_ITEMS.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold text-[12px] transition-all ${
                          active
                            ? isDark
                              ? 'bg-pink-500/15 text-pink-400'
                              : 'bg-pink-50 text-pink-600'
                            : isDark
                              ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${item.color}25` }}>
                          <item.icon size={11} style={{ color: item.color }} />
                        </div>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom actions */}
      <div className={`p-3 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} style={{ overflowX: 'hidden' }}>
        <button
          onClick={toggleTheme}
          title={isCollapsed ? (isDark ? 'Yorug\' rejim' : 'Qorong\'i rejim') : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} w-full rounded-xl font-semibold text-sm transition-colors ${
            isDark ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {isDark
            ? <Sun size={16} className="text-amber-400 shrink-0" />
            : <Moon size={16} className="text-slate-500 shrink-0" />}
          {!isCollapsed && <span className="truncate">{isDark ? 'Yorug\' rejim' : 'Qorong\'i rejim'}</span>}
        </button>
        <button
          onClick={confirmLogout}
          title={isCollapsed ? 'Chiqish' : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} w-full rounded-xl font-semibold text-sm transition-colors ${
            isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Chiqish</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0a0f1e] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>

      {/* Desktop Sidebar */}
      <aside className={`flex-col fixed h-full z-20 transition-all duration-300 hidden lg:flex ${
        collapsed ? 'w-[68px]' : 'w-60'
      } ${
        isDark
          ? 'bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-xl'
          : 'bg-white border-r border-slate-200 shadow-sm'
      }`}>
        {/* Logo */}
        <div className={`h-14 flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {collapsed ? (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={14} className="text-white" />
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-[#0061ff]">DATA</span>
                <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CRM</span>
              </div>
            </Link>
          )}
          {!collapsed && <div className={`w-2 h-2 rounded-full bg-green-500 shadow shadow-green-500/50`} title="Online" />}
        </div>

        <NavContent isCollapsed={collapsed} />

        {/* Collapse toggle */}
        <div className={`px-3 pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title={collapsed ? 'Kengaytirish' : 'Yig\'ish'}
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            {!collapsed && <span>Yig'ish</span>}
          </button>
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

      {/* Mobile drawer */}
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
              className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col lg:hidden ${isDark ? 'bg-slate-950 border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}
            >
              <div className={`h-14 flex items-center justify-between px-4 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
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
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'} pt-14 lg:pt-0 min-h-screen relative`}>
        {/* Subtle bg gradient */}
        {isDark && (
          <>
            <div className="fixed top-0 right-0 w-[600px] h-[400px] bg-[#0061ff] blur-[200px] opacity-[0.03] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-64 w-[400px] h-[300px] bg-purple-500 blur-[200px] opacity-[0.03] rounded-full pointer-events-none" />
          </>
        )}

        {/* Top header bar */}
        <div className={`hidden lg:flex items-center justify-between px-8 py-3 border-b ${isDark ? 'border-slate-800/80 bg-slate-950/50 backdrop-blur-sm' : 'border-slate-100 bg-white/80 backdrop-blur-sm'}`}>
          <div className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {location.pathname === '/paneladmindata' ? 'Dashboard' :
              location.pathname.includes('/ig/overview') ? 'Instagram → Umumiy Ko\'rinish' :
              location.pathname.includes('/ig/content') ? 'Instagram → Kontent Analitika' :
              location.pathname.includes('/ig/ai') ? 'Instagram → AI Tavsiyalar' :
              location.pathname.includes('/ig/settings') ? 'Instagram → Token Sozlash' :
              location.pathname.includes('/leads') ? 'CRM → Arizalar' :
              location.pathname.includes('/courses') ? 'Kontent → Kurslar' :
              location.pathname.includes('/posts') ? 'Kontent → Blog' :
              location.pathname.includes('/team') ? 'Kontent → Jamoa' :
              location.pathname.includes('/marketing') ? 'Asosiy → Marketing' :
              location.pathname.includes('/media') ? 'Kontent → Media & Matnlar' :
              location.pathname.includes('/visibility') ? 'Tizim → Bo\'limlar' :
              location.pathname.includes('/settings') ? 'Tizim → Sozlamalar' : 'Admin Panel'}
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
              <Globe size={13} />
              Saytni ko'rish
            </a>
            {/* Notification Bell */}
            <Link to="/paneladmindata/leads" onClick={() => setNewLeadsCount(0)} className="relative"
              title={newLeadsCount > 0 ? `${newLeadsCount} ta yangi ariza` : 'Bildirishnomalar'}>
              <div className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Bell size={16} className={newLeadsCount > 0 ? 'text-amber-400' : ''} />
              </div>
              {newLeadsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {newLeadsCount > 9 ? '9+' : newLeadsCount}
                </span>
              )}
            </Link>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center">
                <span className="text-white text-[9px] font-black">A</span>
              </div>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Admin</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 lg:px-8 lg:py-7 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Logout confirmation modal */}
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
              <p className={`text-sm text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tizimdan chiqmoqchimisiz?
              </p>
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
