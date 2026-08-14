import React from 'react';
import { FileBarChart } from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';

const FinanceReport: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-6">
      <div><h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>📊 Moliya Hisobot</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oylik va yillik moliya hisobotlari</p></div>
      <div className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
          <FileBarChart size={28} className="text-emerald-500" />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Moliya Hisobot Tez Kunda</h3>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Kirim-chiqim balansi, oylik va yillik hisobotlar, grafiklar va PDF eksport.
        </p>
      </div>
    </div>
  );
};
export default FinanceReport;
