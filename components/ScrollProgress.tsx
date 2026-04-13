import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scaleX = useSpring(0, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = window.scrollY / totalHeight;
        setScrollProgress(progress);
        scaleX.set(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scaleX]);

  if (scrollProgress < 0.01) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #0061ff 0%, #60efff 50%, #00b26b 100%)',
        boxShadow: '0 0 10px rgba(0,97,255,0.5), 0 0 5px rgba(96,239,255,0.3)',
      }}
    />
  );
};
