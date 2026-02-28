import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/paneladmindata/login');
  };

  const navItems = [
    { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/paneladmindata/courses', icon: BookOpen, label: 'Kurslar' },
    { path: '/paneladmindata/team', icon: Users, label: 'Jamoa' },
    { path: '/paneladmindata/media', icon: Video, label: 'Media & Matnlar' },
    { path: '/paneladmindata/visibility', icon: Eye, label: "Bo'limlar" },
  ];

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className={`w-64 flex flex-col fixed h-full z-20 transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-r border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-white border-r border-slate-200'}`}
      >
        <div className={`h-20 flex items-center px-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#0061ff]">
            DATA <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ADMIN</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/paneladmindata' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
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

        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-2xl font-bold transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-500" />}
            {isDark ? 'Light Rejim' : 'Dark Rejim'}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-2xl font-bold transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
              }`}
          >
            <LogOut size={20} />
            Chiqish
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative">
        {/* Subtle glow for dark mode in main area */}
        {isDark && (
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0061ff] blur-[150px] opacity-5 rounded-full pointer-events-none z-0"></div>
        )}
        <div className="max-w-6xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
