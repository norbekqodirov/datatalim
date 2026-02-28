import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '../Button';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, Star1, Star2 } from '../BrandElements';

const dummyData = [
  { value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 50 }, { value: 80 }, { value: 65 }
];

export const Hero: React.FC = () => {
  const { siteContent } = useStore();
  const { isDark } = useTheme();
  const { tField, t } = useLanguage();

  return (
    <div className="relative pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden" style={{ background: isDark ? 'transparent' : 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #ffffff 100%)' }}>

      {/* Brand pattern overlay */}
      <PatternBg color={isDark ? '#ffffff' : '#0061ff'} opacity={isDark ? 0.02 : 0.025} />

      {/* Background glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full" style={{ opacity: isDark ? 0.5 : 0.4, background: isDark ? 'radial-gradient(circle, rgba(0,97,255,0.25) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,97,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-40 right-[5%] w-[400px] h-[400px] rounded-full" style={{ opacity: isDark ? 0.4 : 0.3, background: isDark ? 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(96,239,255,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-[40%] w-[600px] h-[300px] rounded-full" style={{ opacity: isDark ? 0.35 : 0.2, background: isDark ? 'radial-gradient(circle, rgba(96,239,255,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Hero star decorations */}
      <Star1 size={45} color="#0061ff" opacity={isDark ? 0.3 : 0.15} className="absolute top-[10%] left-[8%] star-float pointer-events-none z-0" />
      <Star2 size={24} color="#00b26b" opacity={isDark ? 0.4 : 0.2} className="absolute top-[25%] right-[10%] star-float-delay-1 pointer-events-none z-0" />
      <Star1 size={30} color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.2 : 0.1} className="absolute bottom-[20%] left-[40%] star-float-delay-2 pointer-events-none z-0" />
      <Star2 size={20} color="#ee2a7b" opacity={isDark ? 0.35 : 0.18} className="absolute bottom-[35%] right-[5%] star-float-delay-3 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Section: Text and Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">

          {/* Left: Text Content */}
          <motion.div
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight uppercase">
              {tField(siteContent.heroTitle)} <br />
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] shimmer-text">
                  {tField(siteContent.heroSubtitle)}
                </span>
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#0061ff] opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-md">
              {tField(siteContent.heroDescription)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center relative z-20">
              <Link to="/career-test" className="w-full sm:w-auto">
                <button className="btn-glass-gradient h-14 px-8 text-lg text-white rounded-full w-full sm:w-auto font-bold inline-flex items-center justify-center gap-2 active:scale-95 hover:shadow-[0_0_20px_rgba(0,97,255,0.4)] transition-all">
                  <Sparkles size={20} />
                  {t('hero.cta.test')}
                </button>
              </Link>
              <Link to="/courses" className="w-full sm:w-auto">
                <button className={`btn-glass h-14 px-8 text-lg ${isDark ? 'text-white border-white/10 hover:border-white/20' : 'text-slate-700 bg-white shadow-md hover:bg-slate-50'} rounded-full w-full sm:w-auto font-bold inline-flex items-center justify-center gap-2 active:scale-95 transition-all`}>
                  {t('hero.cta.courses')}
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>

            {/* Decorative Brand Star behind text */}
            <div className="absolute right-0 bottom-0 -z-10 opacity-15 translate-x-1/4 translate-y-1/4 hidden md:block rotate-slow">
              <Star1 size={220} color={isDark ? '#60efff' : '#0061ff'} />
            </div>
          </motion.div>

          {/* Right: Image and Floating Glass Cards */}
          <motion.div
            className="lg:col-span-6 relative mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-[2.5rem] overflow-hidden h-[450px] lg:h-[550px] w-full relative z-10 ml-auto lg:w-[90%] border-4 border-white/50 dark:border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
                alt="Students learning IT"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Floating Glass Chart Card */}
            <motion.div
              className={`absolute bottom-8 right-4 lg:right-[5%] p-5 rounded-3xl z-20 w-64 ${isDark ? 'glass-card' : 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100'}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'rtacha daromad</p>
                  <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>3 000 000 UZS</p>
                </div>
                <div className={`text-[10px] font-bold px-3 py-1.5 rounded-xl text-[#0061ff] ${isDark ? 'glass-blue' : 'bg-blue-50'}`}>
                  Bitiruvchilar
                </div>
              </div>

              <div className="h-20 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dummyData}>
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={12}>
                      {dummyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === dummyData.length - 2 ? '#0061ff' : isDark ? '#334155' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="absolute top-[40%] left-[70%] transform -translate-x-1/2 -translate-y-1/2 btn-glass-gradient text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(0,97,255,0.4)]">
                  1500+
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section: 3 Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

          {/* Card 1: Dark Glass */}
          <motion.div
            className="md:col-span-6 lg:col-span-5 rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-xl"
            style={{ background: isDark ? 'linear-gradient(135deg, #090e17 0%, #0a1426 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Inner glow using brand color */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-40 pulse-glow" style={{ background: 'radial-gradient(circle at top right, rgba(96,239,255,0.3), transparent)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-full opacity-30" style={{ background: 'radial-gradient(circle at bottom left, rgba(0,178,107,0.2), transparent)' }} />

            <Star1 size={140} color="#ffffff" opacity={0.03} className="absolute -right-10 -bottom-10 rotate-slow" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-2 border-slate-800 bg-slate-200 overflow-hidden shadow-sm relative z-0">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-4xl font-black mb-1">2000+</h3>
                <p className="text-sm text-slate-300 leading-snug">O'quvchi sig'imi va<br />zamonaviy xonalar</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Glass Card */}
          <motion.div
            className={`md:col-span-3 lg:col-span-3 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden ${isDark ? 'glass-card' : 'bg-white shadow-xl border border-slate-100'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={0.05} />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner relative z-10" style={{ background: 'linear-gradient(135deg, rgba(0,97,255,0.1) 0%, rgba(96,239,255,0.2) 100%)' }}>
              <TrendingUp size={24} className="text-[#0061ff]" />
            </div>
            <h3 className="text-4xl lg:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-[#0061ff] to-[#60efff] z-10">75%</h3>
            <p className={`font-medium text-sm z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ish bilan ta'minlangan</p>
          </motion.div>

          {/* Card 3: Gradient Glass Accent */}
          <motion.div
            className="md:col-span-3 lg:col-span-4 rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-[0_15px_40px_rgba(0,178,107,0.3)] hover:-translate-y-1 transition-transform cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #00b26b 0%, #82f4b1 100%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <Star2 size={80} color="#ffffff" opacity={0.1} className="absolute -top-4 -right-4" />

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.4)' }}>
                <Star size={20} className="text-white fill-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ArrowRight size={20} className="text-white" />
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <h3 className="text-4xl font-black mb-2 drop-shadow-md">98%</h3>
              <p className="text-sm text-emerald-950 font-semibold leading-snug">Mamnun ota-onalar va<br />yuqori sifatli xizmat</p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
