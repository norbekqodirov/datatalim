import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Video, Calculator, Gamepad2, ArrowRight, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, FloatingStars, Star1, BRAND_COLORS } from '../components/BrandElements';
import { useLanguage } from '../i18n';

const categories = [
  { id: 'all', label: 'Barcha kurslar', icon: null, color: '#0061ff' },
  { id: 'programming', label: 'Dasturlash', icon: Code, color: BRAND_COLORS.programming.primary },
  { id: 'media', label: 'Media & Dizayn', icon: Video, color: BRAND_COLORS.media.primary },
  { id: 'finance', label: 'Moliya va Ofis', icon: Calculator, color: BRAND_COLORS.finance.primary },
  { id: 'kids', label: 'Bolalar uchun', icon: Gamepad2, color: BRAND_COLORS.kids.primary },
];

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { isDark } = useTheme();
  const { tField, t } = useLanguage();
  const { courses } = useStore();

  const filteredCourses = activeCategory === 'all'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={activeCategory === 'all' ? (isDark ? '#60efff' : '#0061ff') : categories.find(c => c.id === activeCategory)?.color} opacity={isDark ? 0.03 : 0.02} />
      <FloatingStars color1={categories.find(c => c.id === activeCategory)?.color || '#0061ff'} color2={isDark ? '#fc466b' : '#3f5efb'} className="opacity-40" />

      {/* Dynamic Background Glow Based on Category */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] blur-[150px] opacity-10 pointer-events-none transition-colors duration-700" style={{ background: categories.find(c => c.id === activeCategory)?.color || '#0061ff' }}></div>

      <div className={`relative z-10 pt-32 pb-16 ${isDark ? 'border-b border-white/5 bg-slate-900/50 backdrop-blur-3xl' : 'bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Star1 size={60} color={categories.find(c => c.id === activeCategory)?.color || '#0061ff'} opacity={0.15} className="absolute -top-10 right-10 rotate-slow pointer-events-none hidden md:block" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Barcha <span className="text-transparent bg-clip-text shimmer-text transition-all duration-700" style={{ backgroundImage: `linear-gradient(135deg, ${categories.find(c => c.id === activeCategory)?.color || '#0061ff'}, ${isDark ? '#60efff' : '#3f5efb'})` }}>Kurslar</span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              O'zingizga mos yo'nalishni tanlang va kelajak kasbini biz bilan o'rganing.
              Amaliyotga asoslangan ta'lim va kuchli mutaxassislar sizni kutmoqda.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const brandSecondary = cat.id === 'all' ? '#0061ff' : (BRAND_COLORS[cat.id as keyof typeof BRAND_COLORS]?.secondary || cat.color);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border hover:-translate-y-1 ${isActive
                  ? (isDark ? 'text-slate-900 shadow-xl shadow-[color:var(--cat-color-20)] border-transparent' : 'text-white shadow-xl shadow-[color:var(--cat-color-20)] border-transparent')
                  : isDark ? 'text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white bg-slate-900/50' : 'text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 bg-white'
                  }`}
                style={{
                  ...(isActive ? { background: isDark ? `linear-gradient(135deg, ${cat.color}, ${brandSecondary})` : `linear-gradient(135deg, ${brandSecondary}, ${cat.color})` } : {}),
                  '--cat-color-20': `${cat.color}30`
                } as React.CSSProperties}
              >
                {cat.icon && <cat.icon size={18} className={isActive ? 'animate-bounce' : ''} />}
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, idx) => {
            const brandColors = BRAND_COLORS[course.category as keyof typeof BRAND_COLORS] || { primary: '#0061ff', secondary: '#60efff' };

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                layout
                className={`rounded-[2.5rem] overflow-hidden flex flex-col h-full group relative transition-all duration-300 hover:-translate-y-2 border ${isDark ? 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-2xl'}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}></div>

                {/* Course Image */}
                <div className="h-56 w-full overflow-hidden relative">
                  <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}></div>
                  <img
                    src={course.coverImage || `https://picsum.photos/seed/${course.id}/1920/1080`}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200/50'}`} style={{ color: isDark ? brandColors.primary : brandColors.secondary }}>
                      {categories.find(c => c.id === course.category)?.label}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 relative z-20">
                  <div className="mb-6">
                    <h3 className={`text-2xl font-black mb-3 leading-tight transition-colors group-hover:text-[color:var(--brand-color)] ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ '--brand-color': isDark ? brandColors.primary : brandColors.secondary } as React.CSSProperties}>
                      <span className="text-balance">{tField(course.title)}</span>
                    </h3>
                    <p className={`text-sm line-clamp-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tField(course.description)}</p>
                  </div>

                  <div className="mt-auto space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        <Clock size={18} />
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Davomiyligi: <span className={isDark ? 'text-white' : 'text-slate-900'}>{tField(course.duration)}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        <CreditCard size={18} />
                      </div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Oylik to'lov: <span className={isDark ? 'text-white' : 'text-slate-900'}>{tField(course.monthlyPrice)}</span></span>
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`} className="block mt-auto">
                    <button className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group/btn border-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:border-transparent hover:text-white' : 'bg-white border-slate-200 text-slate-900 hover:border-transparent hover:text-white'}`} style={{ '--hover-bg': `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`;
                        (e.currentTarget as any).style.borderColor = 'transparent';
                        if (!isDark) e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        (e.currentTarget as any).style.borderColor = '';
                        if (!isDark) e.currentTarget.style.color = '';
                      }}
                    >
                      Batafsil ma'lumot
                      <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

