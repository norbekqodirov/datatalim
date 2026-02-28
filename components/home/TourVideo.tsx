import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../store/ThemeContext';
import { PatternBg, FloatingStars, Star1, Star2 } from '../BrandElements';

export const TourVideo: React.FC = () => {
  const { siteContent } = useStore();
  const { isDark } = useTheme();

  return (
    <div className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />
      <FloatingStars color1="#0061ff" color2="#60efff" className="opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Star2 size={60} color="#0061ff" opacity={0.15} className="absolute top-10 right-20 rotate-slow pointer-events-none hidden md:block" />
        <Star1 size={40} color="#60efff" opacity={0.15} className="absolute bottom-10 left-20 rotate-slow pointer-events-none hidden md:block" />

        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={`inline-block px-4 py-2 rounded-xl border text-sm font-bold mb-6 tracking-wider uppercase backdrop-blur-sm ${isDark ? 'bg-[#0061ff]/20 border-[#60efff]/30 text-[#60efff]' : 'bg-[#0061ff]/10 border-[#0061ff]/20 text-[#0061ff]'}`}>
              DATAga Sayohat
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>DATA bilan yaqindan <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>tanishamiz</span></h2>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Markazimizdagi sharoitlar, o'quv xonalari va ta'lim jarayoni bilan videolavha orqali tanishing.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative rounded-[3rem] overflow-hidden backdrop-blur-sm shadow-2xl aspect-video max-w-5xl mx-auto border-[8px] ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[color:var(--brand-shadow)]'}`}
          style={{ '--brand-shadow': 'rgba(0,97,255,0.1)' } as React.CSSProperties}
        >
          <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}></div>
          <iframe
            className="absolute top-0 left-0 w-full h-full relative z-20"
            src={siteContent.tourVideoUrl}
            title="DATA bilan yaqindan tanishamiz"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
};
