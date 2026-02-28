import React from 'react';
import { useTheme } from '../../store/ThemeContext';

export type Lang = 'uz' | 'ru' | 'en';

interface Props {
  activeTab: Lang;
  onTabChange: (lang: Lang) => void;
}

export const AdminLangTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex p-1 rounded-xl mb-6 w-max ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
      {(['uz', 'ru', 'en'] as Lang[]).map(lang => (
        <button
          key={lang}
          onClick={(e) => { e.preventDefault(); onTabChange(lang); }}
          className={`px-6 py-2 text-sm font-bold rounded-lg uppercase transition-all ${
            activeTab === lang 
              ? isDark 
                ? 'bg-slate-700 text-[#60efff] shadow-sm' 
                : 'bg-white text-[#0061ff] shadow-sm'
              : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};
