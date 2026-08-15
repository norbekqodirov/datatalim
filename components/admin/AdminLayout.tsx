import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon,
  Target, Menu, X, FileText,
  Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

const NAV_GROUPS = [
  {
    label: 'Asosiy',
    items: [
      { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { path: '/paneladmindata/marketing', icon: Target, label: 'Marketing' },
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
      { path: '/paneladmindata/settings', icon: Settings, label: 'Sozlamalar' },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthTime');
    navigate('/paneladmindata/login');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5 scrollbar-thin">

        {/* CRM Nav Groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className={`px-3 pb-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-[13px] transition-all relative ${
                      active
                        ? isDark
                          ? 'bg-[#0061ff]/15 text-[#60efff] border border-[#0061ff]/20'
                          : 'bg-blue-50 text-[#0061ff] border border-blue-100'
                        : isDark
                          ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#0061ff] rounded-r-full" />
                    )}
                    <item.icon size={15} className={active ? 'text-[#0061ff]' : ''} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge && (
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
      </div>

      {/* Bottom actions */}
      <div className={`p-3 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl font-semibold text-sm transition-colors ${
            isDark ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {isDark
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-slate-500" />}
          {isDark ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl font-semibold text-sm transition-colors ${
            isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
          }`}
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0a0f1e] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>

      {/* Desktop Sidebar */}
      <aside className={`w-60 flex-col fixed h-full z-20 transition-colors duration-300 hidden lg:flex ${
        isDark
          ? 'bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-xl'
          : 'bg-white border-r border-slate-200 shadow-sm'
      }`}>
        {/* Logo */}
        <div className={`h-14 flex items-center justify-between px-4 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0061ff] to-[#60efff] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#0061ff]">DATA</span>
              <span className={`text-[10px] font-bold ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CRM</span>
            </div>
          </Link>
          <div className={`w-2 h-2 rounded-full bg-green-500 shadow shadow-green-500/50`} title="Online" />
        </div>

        <NavContent />
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
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen relative">
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
    </div>
  );
};
