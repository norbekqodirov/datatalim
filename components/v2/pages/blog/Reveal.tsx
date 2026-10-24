import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useMotionReduced } from '../../utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + rise (opacity/transform only) the first time the block scrolls into view. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'article' | 'section';
}> = ({ children, className, delay = 0, y = 28, as = 'div' }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const Tag = motion[as] as typeof motion.div;
  if (reduced) {
    const Plain = as as 'div';
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
};
