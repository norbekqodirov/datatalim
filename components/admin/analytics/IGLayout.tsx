import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart2, TrendingUp, Users, Brain, Settings, Instagram } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const IG_TABS = [
  { path: '/paneladmindata/ig/overview', icon: BarChart2, label: "Umumiy Ko'rinish" },
  { path: '/paneladmindata/ig/content', icon: TrendingUp, label: 'Kontent Analitika' },
  { path: '/paneladmindata/ig/audience', icon: Users, label: 'Demografiya' },
  { path: '/paneladmindata/ig/ai', icon: Brain, label: 'AI Tavsiyalar' },
  { path: '/paneladmindata/ig/settings', icon: Settings, label: 'Token Sozlash' },
];

export const IGLayout: React.FC = () => {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} p-4 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Instagram size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram Analitika</h1>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Akaunt statistikasi va chuqur tahlillar</p>
            </div>
          </div>

          {/* Top Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {IG_TABS.map(tab => {
              const active = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    active 
                      ? 'bg-[#0061ff] text-white shadow-md shadow-blue-500/20' 
                      : isDark 
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon size={14} className={active ? 'text-white' : ''} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Outlet />
      </div>
    </div>
  );
};
