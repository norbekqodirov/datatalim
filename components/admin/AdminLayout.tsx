import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon, Target, UserPlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/paneladmindata/login');
  };

  const navItems = [
    { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/paneladmindata/courses', icon: BookOpen, label: 'Kurslar' },
    { path: '/paneladmindata/team', icon: Users, label: 'Jamoa' },
    { path: '/paneladmindata/media', icon: Video, label: 'Media & Matnlar' },
    { path: '/paneladmindata/marketing', icon: Target, label: 'Marketing' },
    { path: '/paneladmindata/leads', icon: UserPlus, label: 'Arizalar' },
    { path: '/paneladmindata/visibility', icon: Eye, label: "Bo'limlar" },
  ];

  const NavContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/paneladmindata' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                ? isDark ? 'bg-[#0061ff]/20 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'
                : isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className={`p-4 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-2xl font-bold transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-500" />}
          {isDark ? 'Light Rejim' : 'Dark Rejim'}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-2xl font-bold transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
        >
          <LogOut size={20} />
          Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Desktop Sidebar */}
      <aside className={`w-64 flex-col fixed h-full z-20 transition-colors duration-300 hidden lg:flex ${isDark ? 'bg-slate-900/80 border-r border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-white border-r border-slate-200'}`}>
        <div className={`h-16 flex items-center px-6 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#0061ff]">
            DATA <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ADMIN</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <Link to="/" className="text-xl font-black tracking-tighter text-[#0061ff]">
          DATA <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ADMIN</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col lg:hidden ${isDark ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}
            >
              <div className={`h-14 flex items-center justify-between px-5 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className="text-xl font-black text-[#0061ff]">DATA <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ADMIN</span></span>
                <button onClick={() => setMobileOpen(false)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <X size={20} />
                </button>
              </div>
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 lg:p-8 relative">
        {isDark && (
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0061ff] blur-[150px] opacity-5 rounded-full pointer-events-none z-0" />
        )}
        <div className="max-w-6xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
