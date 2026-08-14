import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Kanban, Sun, Users, FolderKanban } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const PM_TABS = [
  { path: '/paneladmindata/pm/dashboard', icon: LayoutDashboard, label: "Dashboard" },
  { path: '/paneladmindata/pm/plans', icon: FileText, label: 'Kontent Rejalar' },
  { path: '/paneladmindata/pm/calendar', icon: Calendar, label: 'Taqvim' },
  { path: '/paneladmindata/pm/board', icon: Kanban, label: 'Vazifalar (Kanban)' },
  { path: '/paneladmindata/pm/my-day', icon: Sun, label: 'Bugungi Kun' },
  { path: '/paneladmindata/pm/team', icon: Users, label: 'Jamoa Yuklamasi' },
];

export const PMLayout: React.FC = () => {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} p-4 shadow-sm backdrop-blur-md`}>
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-pulse-slow">
              <FolderKanban size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SMM & Marketing Project Management
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Jamoa loyihalari, kontent rejalar, ssenariy-script yozish va vazifalar boshqaruvi
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-hide">
            {PM_TABS.map(tab => {
              const active = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    active 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border-t border-white/10' 
                      : isDark 
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <tab.icon size={15} className={`${active ? 'text-white' : 'opacity-80'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nested Route View */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <Outlet />
      </div>
    </div>
  );
};

export default PMLayout;
