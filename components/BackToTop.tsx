import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all group"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(0,97,255,0.9) 0%, rgba(96,239,255,0.9) 100%)'
              : 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 24px rgba(0,97,255,0.3)',
          }}
          aria-label="Yuqoriga qaytish"
          title="Yuqoriga"
        >
          <ArrowUp size={20} className="text-white group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
