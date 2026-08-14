import React from 'react';
import { Megaphone } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const Campaigns: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-6">
      <div><h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>📱 Aksiyalar / SMM</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reklama aksiyalari va SMM kampaniyalarni boshqaring</p></div>
      <div className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
          <Megaphone size={28} className="text-purple-500" />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Aksiyalar Tez Kunda</h3>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Chegirma aksiyalari yaratish, kurslar uchun maxsus takliflar tayyorlash va natijalarni kuzatish imkoniyati.
        </p>
        <div className={`mt-6 flex flex-wrap gap-3 justify-center text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>🎯 Aksiya yaratish</span>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>📊 Natija kuzatish</span>
          <span className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>📱 SMM rejalashtirish</span>
        </div>
      </div>
    </div>
  );
};
export default Campaigns;
