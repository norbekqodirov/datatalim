import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../Button';
import { useTheme } from '../../store/ThemeContext';
import { PatternBg, FloatingStars, SymbolMark } from '../BrandElements';

export const CareerTestSection: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      {/* Brand decorative backgrounds */}
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.05 : 0.03} />

      {/* Background glow and floating stars */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${isDark ? 'bg-[#0061ff]' : 'bg-blue-50'} rounded-full blur-3xl opacity-20 pulse-glow`}></div>
        <FloatingStars color1={isDark ? '#60efff' : '#0061ff'} color2={isDark ? '#82f4b1' : '#00b26b'} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex p-5 rounded-3xl text-[#0061ff] glow-blue border border-blue-100 dark:border-[#0061ff] dark:border-opacity-30 relative"
          style={{ background: isDark ? 'rgba(0, 97, 255, 0.1)' : 'white' }}
        >
          {/* Using Symbol SVG instead of generic Brain icon */}
          <div className="w-16 h-12 flex items-center justify-center relative">
            <SymbolMark width={70} color={isDark ? '#60efff' : '#0061ff'} />
            <div className="absolute inset-0 bg-[#60efff] blur-xl opacity-20 mix-blend-screen pulse-glow"></div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Kelajak kasbingizni <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] shimmer-text">
            aniqlang
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          DATA Ta'lim Stansiyasi tomonidan ishlab chiqilgan maxsus algoritm yordamida,
          36 ta savolga javob berib, o'z qobiliyatingizga mos IT yo'nalishni toping.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12 text-left max-w-3xl mx-auto"
        >
          {[
            { icon: BarChart2, text: "Aniq tahlil", iconColor: "text-[#0061ff]", bgClass: "bg-blue-50 dark:bg-[#0061ff]/20" },
            { icon: ShieldCheck, text: "Ilmiy yondashuv", iconColor: "text-[#00b26b]", bgClass: "bg-emerald-50 dark:bg-[#00b26b]/20" },
            { icon: CheckCircle2, text: "Tezkor natija", iconColor: "text-[#6228d7]", bgClass: "bg-purple-50 dark:bg-[#6228d7]/20" }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${isDark ? 'bg-slate-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bgClass} ${item.iconColor}`}>
                <item.icon size={20} />
              </div>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/career-test" state={{ startNow: true }}>
            <Button className={`text-lg px-12 py-5 text-white font-bold rounded-2xl shadow-xl group transition-all duration-300 transform w-full sm:w-auto hover:scale-105 active:scale-95`} style={{ background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)' }}>
              <span className="flex items-center justify-center gap-2">
                Testni boshlash
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
