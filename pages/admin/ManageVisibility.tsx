import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

export default function ManageVisibility() {
  const { visibility, toggleSectionVisibility } = useStore();
  const { isDark } = useTheme();

  const sections = [
    { key: 'hero', label: 'Bosh qism (Hero)' },
    { key: 'about', label: 'Biz haqimizda' },
    { key: 'tourVideo', label: 'DATAga Sayohat (Video)' },
    { key: 'courses', label: 'Kurslar' },
    { key: 'testimonials', label: "O'quvchilar Fikri" },
    { key: 'careerTest', label: 'Karyera Testi' },
    { key: 'facilities', label: 'Sharoitlar' },
    { key: 'team', label: 'Jamoa' },
    { key: 'faq', label: "Ko'p beriladigan savollar (FAQ)" },
    { key: 'gallery', label: 'Galereya' },
    { key: 'contact', label: 'Aloqa' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bo'limlar Ko'rinishi</h1>
        <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saytning qaysi qismlari ko'rinishini boshqaring.</p>
      </motion.div>

      <div className={`rounded-[2.5rem] p-8 border shadow-sm ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(({ key, label }) => {
            const isVisible = visibility[key as keyof typeof visibility];
            return (
              <div 
                key={key} 
                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${
                  isVisible 
                    ? isDark ? 'border-blue-900/50 bg-blue-900/20' : 'border-blue-100 bg-blue-50/50' 
                    : isDark ? 'border-white/5 bg-slate-800' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div>
                  <h3 className={`font-bold text-lg ${isVisible ? (isDark ? 'text-blue-300' : 'text-blue-900') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>{label}</h3>
                  <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isVisible ? "Saytda ko'rinib turibdi" : 'Yashirilgan'}
                  </p>
                </div>
                <button
                  onClick={() => toggleSectionVisibility(key as keyof typeof visibility)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                    isVisible 
                      ? isDark 
                        ? 'bg-[#0061ff] text-white hover:bg-blue-600 shadow-blue-900/50' 
                        : 'bg-[#0061ff] text-white hover:bg-blue-700 shadow-blue-500/30'
                      : isDark 
                        ? 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600' 
                        : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isVisible ? <Eye size={24} /> : <EyeOff size={24} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
