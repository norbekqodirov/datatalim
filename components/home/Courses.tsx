import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Video, Calculator, Gamepad2, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { Star1, Star2, PatternBg, FloatingStars } from '../BrandElements';
import { useStore } from '../../store/useStore';

const categories = [
  {
    id: 'programming',
    title: { uz: 'Dasturlash', ru: 'Программирование', en: 'Programming' },
    icon: Code,
    brandGradient: 'linear-gradient(135deg, #82f4b1, #00b26b)',
    brandColor1: '#82f4b1',
    brandColor2: '#00b26b',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    glowClass: 'brand-glow-programming',
    darkGradient: 'linear-gradient(160deg, rgba(0,0,0,0.95) 0%, rgba(0,100,60,0.4) 100%)',
    darkGlow: 'radial-gradient(ellipse at bottom right, rgba(0,178,107,0.2) 0%, transparent 70%)',
    courses: [
      { uz: 'Foundation', ru: 'Foundation', en: 'Foundation' },
      { uz: 'Web dasturlash: Python BI', ru: 'Веб-программирование: Python BI', en: 'Web programming: Python BI' },
      { uz: 'Frontend Web Dasturlash', ru: 'Frontend Web Программирование', en: 'Frontend Web Programming' },
      { uz: 'Telegram Bot', ru: 'Telegram Bot', en: 'Telegram Bot' }
    ]
  },
  {
    id: 'media',
    title: { uz: 'Media & Dizayn', ru: 'Медиа и Дизайн', en: 'Media & Design' },
    icon: Video,
    brandGradient: 'linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)',
    brandColor1: '#f9ce34',
    brandColor2: '#ee2a7b',
    bgLight: 'bg-pink-50',
    iconColor: 'text-pink-600',
    glowClass: 'brand-glow-media',
    darkGradient: 'linear-gradient(160deg, rgba(0,0,0,0.95) 0%, rgba(120,0,100,0.4) 100%)',
    darkGlow: 'radial-gradient(ellipse at bottom right, rgba(238,42,123,0.2) 0%, transparent 70%)',
    courses: [
      { uz: 'Mobilografiya', ru: 'Мобилография', en: 'Mobilography' },
      { uz: 'Grafik Dizayn', ru: 'Графический дизайн', en: 'Graphic Design' },
      { uz: 'SMM', ru: 'SMM', en: 'SMM' }
    ]
  },
  {
    id: 'finance',
    title: { uz: 'Moliya va Ofis', ru: 'Финансы и Офис', en: 'Finance & Office' },
    icon: Calculator,
    brandGradient: 'linear-gradient(135deg, #60efff, #0061ff)',
    brandColor1: '#60efff',
    brandColor2: '#0061ff',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
    glowClass: 'brand-glow-finance',
    darkGradient: 'linear-gradient(160deg, rgba(0,0,0,0.95) 0%, rgba(0,50,130,0.5) 100%)',
    darkGlow: 'radial-gradient(ellipse at bottom right, rgba(0,97,255,0.25) 0%, transparent 70%)',
    courses: [
      { uz: 'Zamonaviy Buxgalteriya: Noldan balansgacha + 1C', ru: 'Современная бухгалтерия: С нуля до баланса + 1С', en: 'Modern Accounting: From Scratch to Balance + 1C' },
      { uz: 'Ofis Dasturlarida Ishlash', ru: 'Работа в офисных программах', en: 'Working in Office Programs' }
    ]
  },
  {
    id: 'kids',
    title: { uz: 'Bolalar uchun', ru: 'Для детей', en: 'For Kids' },
    icon: Gamepad2,
    brandGradient: 'linear-gradient(135deg, #d73ffb, #4f0ead)',
    brandColor1: '#d73ffb',
    brandColor2: '#4f0ead',
    bgLight: 'bg-purple-50',
    iconColor: 'text-purple-600',
    glowClass: 'brand-glow-kids',
    darkGradient: 'linear-gradient(160deg, rgba(0,0,0,0.95) 0%, rgba(79,14,173,0.4) 100%)',
    darkGlow: 'radial-gradient(ellipse at bottom right, rgba(215,63,251,0.2) 0%, transparent 70%)',
    courses: [
      { uz: 'Robototexnika', ru: 'Робототехника', en: 'Robotics' },
      { uz: 'Web Dasturlash (Kids)', ru: 'Веб-программирование (Kids)', en: 'Web Programming (Kids)' }
    ]
  }
];

export const Courses: React.FC = () => {
  const { isDark } = useTheme();
  const { tField } = useLanguage();
  const { courses } = useStore();

  return (
    <div
      id="courses"
      className="py-24 relative overflow-hidden"
      style={{
        background: isDark ? '#000000' : '#ffffff',
      }}
    >
      {/* Brand pattern background */}
      <PatternBg color={isDark ? '#ffffff' : '#0061ff'} opacity={isDark ? 0.02 : 0.025} />

      {/* Floating stars decoration */}
      <FloatingStars color1={isDark ? '#60efff' : '#0061ff'} color2={isDark ? '#82f4b1' : '#00b26b'} />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {isDark ? (
          <>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(0,97,255,0.15) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
          </>
        ) : (
          <>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-50" />
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
              Bizning <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff]">Kurslar</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Zamonaviy kasblarni o'rganing va kelajagingizni quring. Bizda barcha yoshdagilar uchun mos kurslar mavjud.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group flex flex-col h-full rounded-[2rem] p-1 transition-all duration-300 ${cat.glowClass}`}
              style={{
                background: isDark ? cat.darkGradient : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
                boxShadow: isDark
                  ? '0 8px 30px rgba(0,0,0,0.3)'
                  : '0 8px 30px rgb(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Dark mode glow overlay */}
              {isDark && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-[2rem]"
                  style={{ background: cat.darkGlow }}
                />
              )}

              {/* Decorative brand stars */}
              <Star1 size={20} color={cat.brandColor1} opacity={isDark ? 0.15 : 0.1} className="absolute top-4 right-4 star-float pointer-events-none z-0" />
              <Star2 size={12} color={cat.brandColor2} opacity={isDark ? 0.2 : 0.12} className="absolute bottom-20 left-4 star-float-delay-2 pointer-events-none z-0" />

              <div className="flex-1 p-6 sm:p-8 flex flex-col relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${cat.brandColor1}15, ${cat.brandColor2}15)`
                      : `linear-gradient(135deg, ${cat.brandColor1}18, ${cat.brandColor2}12)`,
                    border: isDark
                      ? `1px solid ${cat.brandColor1}20`
                      : `1px solid ${cat.brandColor1}25`,
                  }}
                >
                  <cat.icon
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: isDark ? cat.brandColor1 : cat.brandColor2 }}
                  />
                </div>

                <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {tField(cat.title)}
                </h3>

                <ul className="space-y-4 mb-8 flex-1">
                  {courses.filter(c => c.category === cat.id).slice(0, 4).map((course, idx) => (
                    <li key={idx} className={`flex items-start text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <ChevronRight size={18} style={{ color: isDark ? `${cat.brandColor1}60` : cat.brandColor2 }} className="shrink-0 mr-2 opacity-70" />
                      <span>{tField(course.title)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2 mt-auto relative z-10">
                <Link to="/courses" className="block">
                  <div
                    className="w-full py-4 rounded-[1.5rem] text-white font-bold flex items-center justify-center gap-2 opacity-90 group-hover:opacity-100 transition-all shadow-md group-hover:shadow-lg"
                    style={{ background: cat.brandGradient }}
                  >
                    Batafsil
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/courses">
            <button className={`inline-flex items-center gap-2 font-bold transition-colors ${isDark ? 'text-[#60efff] hover:text-white' : 'text-[#0061ff] hover:text-blue-800'}`}>
              Barcha kurslarni ko'rish <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
