import React from 'react';
import { FolderOpen } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const Materials: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-6">
      <div><h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>📚 O'quv Materiallari</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kurslar uchun o'quv materiallari</p></div>
      <div className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <FolderOpen size={28} className="text-blue-500" />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>O'quv Materiallari Tez Kunda</h3>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Har bir kurs uchun PDF, video va boshqa materiallarni yuklash va o'quvchilarga ulashish imkoniyati.
        </p>
        <div className={`mt-6 flex flex-wrap gap-3 justify-center text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>📄 PDF yuklab olish</span>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>🎬 Video darslar</span>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>📂 Kursga biriktirish</span>
        </div>
      </div>
    </div>
  );
};
export default Materials;
