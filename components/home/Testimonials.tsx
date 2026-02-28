import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, FloatingStars } from '../BrandElements';

export const Testimonials: React.FC = () => {
  const { siteContent } = useStore();
  const { isDark } = useTheme();
  const { tField } = useLanguage();

  // Duplicate for seamless marquee
  const videos = [...siteContent.testimonialVideos, ...siteContent.testimonialVideos];

  return (
    <div className="py-24 overflow-hidden relative" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />
      <FloatingStars color1="#0061ff" color2="#00b26b" className="opacity-60" />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {isDark ? (
          <>
            <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(0,97,255,0.2) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(96,239,255,0.15) 0%, transparent 70%)' }} />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
            <div className="absolute top-1/2 -right-24 w-72 h-72 bg-cyan-50 rounded-full blur-3xl opacity-60" />
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-4 py-2 rounded-full border font-bold text-sm mb-6 tracking-wider uppercase font-sans relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#0061ff] to-[#60efff]"></div>
            <span className={`relative z-10 ${isDark ? 'text-[#60efff]' : 'text-[#0061ff]'}`}>{tField({ uz: "O'quvchilar Fikri", ru: "Отзывы учеников", en: "Student Feedback" })}</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField({ uz: "Natijalarimiz", ru: "Наши результаты", en: "Our Results" })} <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>{tField({ uz: "so'zlaydi", ru: "говорят сами за себя", en: "speak for themselves" })}</span></h2>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {tField({ uz: "Bizning kurslarimizni tamomlagan va hozirda muvaffaqiyatli faoliyat yuritayotgan o'quvchilarimizning intervyulari.", ru: "Интервью с нашими выпускниками, которые успешно окончили курсы и сейчас работают.", en: "Interviews with our students who have successfully completed our courses and are currently working." })}
          </p>
        </motion.div>
      </div>

      <div className="relative w-full overflow-hidden flex z-10">
        {/* Gradient masks for smooth edges */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full z-20 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to right, #000, transparent)' : 'linear-gradient(to right, #f8fafc, transparent)' }} />
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full z-20 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to left, #000, transparent)' : 'linear-gradient(to left, #f8fafc, transparent)' }} />

        {/* Marquee Container */}
        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] px-4 w-max">
          {videos.map((videoId, idx) => (
            <div
              key={idx}
              className={`w-[280px] sm:w-[320px] shrink-0 aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-xl border relative group transition-transform duration-300 hover:scale-[1.02] ${isDark ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-slate-100 border-slate-200 shadow-slate-200/50'}`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none transition-transform group-hover:scale-150" style={{ background: 'linear-gradient(135deg, #00b26b, #0061ff)' }}></div>
              <iframe
                className="absolute top-0 left-0 w-full h-full pointer-events-none group-hover:pointer-events-auto transition-all z-10 opacity-90 group-hover:opacity-100"
                src={`https://www.youtube.com/embed/${videoId}?controls=1&rel=0&playsinline=1&modestbranding=1`}
                title="O'quvchi fikri"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {/* Overlay to prevent accidental clicks while scrolling, disappears on hover */}
              <div className="absolute inset-0 bg-transparent z-20 group-hover:hidden"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
