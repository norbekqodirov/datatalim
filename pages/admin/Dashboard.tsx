import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { BookOpen, Users, Eye, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';

export default function Dashboard() {
  const { courses, team, visibility } = useStore();
  const { isDark } = useTheme();

  const stats = [
    { title: 'Jami Kurslar', value: courses.length, icon: BookOpen, lightColor: 'bg-blue-50 text-blue-600', darkColor: 'bg-blue-500/20 text-[#60efff]', link: '/paneladmindata/courses' },
    { title: "Jamoa A'zolari", value: team.length, icon: Users, lightColor: 'bg-purple-50 text-purple-600', darkColor: 'bg-purple-500/20 text-[#d73ffb]', link: '/paneladmindata/team' },
    { title: "Faol Bo'limlar", value: Object.values(visibility).filter(Boolean).length, icon: Eye, lightColor: 'bg-emerald-50 text-emerald-600', darkColor: 'bg-emerald-500/20 text-[#82f4b1]', link: '/paneladmindata/visibility' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
        <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xush kelibsiz! Sayt ma'lumotlarini shu yerdan boshqaring.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={stat.link} className={`block p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${isDark ? 'bg-slate-900/50 border-white/5 shadow-black/50 hover:bg-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? stat.darkColor : stat.lightColor}`}>
                  <stat.icon size={28} />
                </div>
                <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
              </div>
              <h3 className={`text-lg font-bold transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'}`}>{stat.title}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className={`p-8 rounded-[2rem] border shadow-sm mt-8 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Settings className={isDark ? "text-[#60efff]" : "text-blue-600"} />
          Tezkor Sozlamalar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/paneladmindata/visibility" className={`p-4 rounded-2xl font-bold transition-colors border ${isDark ? 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
            Bo'limlarni yoqish/o'chirish
          </Link>
          <Link to="/paneladmindata/media" className={`p-4 rounded-2xl font-bold transition-colors border ${isDark ? 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
            Asosiy matnlarni o'zgartirish
          </Link>
          <Link to="/paneladmindata/courses" className={`p-4 rounded-2xl font-bold transition-colors border ${isDark ? 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
            Yangi kurs qo'shish
          </Link>
        </div>
      </div>
    </div>
  );
}
