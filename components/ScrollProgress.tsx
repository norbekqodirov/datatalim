import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

// Scroll holati to'g'ridan motion value orqali scaleX ga ulanadi — React re-render yo'q.
export const ScrollProgress: React.FC = () => {
  const { pathname } = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  // spring qiymatidan olinadi: scrollYProgress'ga to'g'ridan bog'langan opacity native ScrollTimeline'ga o'tib noto'g'ri hisoblanardi
  const opacity = useTransform(scaleX, [0, 0.01, 0.02], [0, 0, 1]);

  // blog maqolasida o'z .read-progress chizig'i bor — ikkita chiziq ustma-ust tushmasin
  if (/^\/blog\/[^/]+/.test(pathname)) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[55] origin-left pointer-events-none"
      style={{
        scaleX,
        opacity,
        background: 'linear-gradient(90deg, #0061ff 0%, #60efff 50%, #00b26b 100%)',
        boxShadow: '0 0 10px rgba(0,97,255,0.5), 0 0 5px rgba(96,239,255,0.3)',
      }}
    />
  );
};
