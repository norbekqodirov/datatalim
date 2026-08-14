import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const AuditLog: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-6">
      <div><h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>📋 Audit Log</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tizimda amalga oshirilgan barcha o'zgarishlar</p></div>
      <div className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}><Shield size={28} className="text-slate-500" /></div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Audit Log Tez Kunda</h3>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kim, qachon, nima o'zgartirganini kuzatish imkoniyati.</p>
      </div>
    </div>
  );
};
export default AuditLog;
