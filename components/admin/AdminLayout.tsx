import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon, Target, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  ];

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0, width: isCollapsed ? 80 : 256 }}
        className={`flex flex-col fixed h-full z-20 transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-r border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-white border-r border-slate-200'}`}
      >
        <div className={`h-20 flex items-center justify-between px-6 border-b relative ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {!isCollapsed && (
            <Link to="/" className="text-2xl font-black tracking-tighter text-[#0061ff]">
              DATA <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ADMIN</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" className="text-2xl font-black tracking-tighter text-[#0061ff] mx-auto">
              D
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-7 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm z-30 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/paneladmindata' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-3 rounded-2xl font-bold transition-all ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive
                  ? isDark ? 'bg-[#0061ff]/20 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'
                  : isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </div>

        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (isDark ? 'Light Rejim' : 'Dark Rejim') : undefined}
            className={`flex items-center gap-3 py-3 w-full rounded-2xl font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isDark ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            {isDark ? <Sun size={20} className={`text-amber-400 ${isCollapsed ? 'mx-auto' : ''}`} /> : <Moon size={20} className={`text-slate-500 ${isCollapsed ? 'mx-auto' : ''}`} />}
            {!isCollapsed && (isDark ? 'Light Rejim' : 'Dark Rejim')}
          </button>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Chiqish' : undefined}
            className={`flex items-center gap-3 py-3 w-full rounded-2xl font-bold transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
              }`}
          >
            <LogOut size={20} className={isCollapsed ? 'mx-auto' : ''} />
            {!isCollapsed && 'Chiqish'}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-8 relative"
      >
        {/* Subtle glow for dark mode in main area */}
        {isDark && (
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0061ff] blur-[150px] opacity-5 rounded-full pointer-events-none z-0"></div>
        )}
        <div className="max-w-6xl mx-auto relative z-10">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};
