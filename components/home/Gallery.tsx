import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../store/ThemeContext';
import { PatternBg, Star2 } from '../BrandElements';

export const Gallery: React.FC = () => {
  const { siteContent } = useStore();
  const { isDark } = useTheme();

  if (!siteContent.galleryImages || siteContent.galleryImages.length === 0) {
    return null;
  }

  return (
    <div className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#fff' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.03 : 0.02} />

      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0061ff] blur-[100px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 relative">
          <Star2 size={50} color="#0061ff" opacity={0.1} className="absolute -top-10 left-1/3 -translate-x-1/2 rotate-slow pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bizning <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>Galereya</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              DATA Ta'lim Stansiyasidagi qizg'in jarayonlar va yorqin lahzalar
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {siteContent.galleryImages.map((img, idx) => {
            if (!img) return null;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative group rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-sm border ${isDark ? 'border-white/10' : 'border-slate-100/50'}`}
              >
                <img
                  src={img}
                  alt={`Gallery image ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0061ff]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
