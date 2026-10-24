import React, { useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, animate, MotionValue } from 'framer-motion';
import { useMotionReduced } from './utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Mask reveal: the heading rises out of an invisible line (transform only). */
export const Mask: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  // observe the (never clipped) outer box, not the translated inner one
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className} style={{ clipPath: 'inset(-0.3em -100vw 0 -100vw)', paddingBottom: '0.16em', marginBottom: '-0.16em' }}>
      <motion.div
        initial={{ y: '108%', opacity: 0 }}
        animate={inView ? { y: '0%', opacity: 1 } : undefined}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Words light up as the block scrolls through the viewport. */
export const ScrollText: React.FC<{ text: string; className?: string; style?: React.CSSProperties; id?: string }> = ({ text, className, style, id }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <span ref={ref} id={id} className={className} style={style}>
      {reduced
        ? text
        : words.map((w, i) => (
            <ScrollWord key={i} trail={i < words.length - 1} p={scrollYProgress} start={i / words.length} end={(i + 1.5) / words.length}>
              {w}
            </ScrollWord>
          ))}
    </span>
  );
};

const ScrollWord: React.FC<{ p: MotionValue<number>; start: number; end: number; trail: boolean; children: string }> = ({ p, start, end, trail, children }) => {
  const opacity = useTransform(p, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}
      {trail ? ' ' : ''}
    </motion.span>
  );
};

/** A real 3D object: the DATA 4-point star as a stack of extruded layers that turns with scroll. */
export const Star3D: React.FC<{ progress: MotionValue<number>; className?: string; layers?: number; spin?: number }> = ({ progress, className, layers = 9, spin = 80 }) => {
  const rotateY = useTransform(progress, [0, 0.5, 1], [-spin, 0, spin]);
  const rotateX = useTransform(progress, [0, 0.5, 1], [18, -6, 14]);
  const y = useTransform(progress, [0, 1], [70, -70]);
  const mid = (layers - 1) / 2;
  return (
    <div className={className} style={{ perspective: '1400px' }} aria-hidden="true">
      <motion.div className="star3d w-full h-full" style={{ rotateY, rotateX, y, transformStyle: 'preserve-3d' }}>
        {Array.from({ length: layers }, (_, k) => {
          const front = k === layers - 1;
          const back = k === 0;
          return (
            <i
              key={k}
              style={{
                transform: `translateZ(${(k - mid) * 16}px)`,
                color: front ? 'var(--cyan)' : back ? 'var(--blue)' : 'var(--blue)',
                opacity: front ? 0.55 : back ? 0.3 : 0.07 + (k / layers) * 0.16,
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

/** Section divider: a hairline that draws itself out from a star that turns with scroll. */
export const StarSeam: React.FC = () => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.35'] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const grow = useTransform(scrollYProgress, [0.05, 0.6], [0, 1]);
  const starScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1.25, 0.6]);
  return (
    <div ref={ref} className="wrap py-6 flex items-center gap-5" aria-hidden="true">
      <motion.span className="h-px flex-1 origin-right" style={{ scaleX: reduced ? 1 : grow, background: 'linear-gradient(90deg, transparent, var(--line-2))' }} />
      <motion.svg width="30" height="30" viewBox="0 0 53.82 53.82" style={reduced ? undefined : { rotate, scale: starScale }}>
        <path
          fill="var(--cyan-ink)"
          d="M28.06.91l2.46,10.03c1.5,6.09,6.25,10.85,12.35,12.35l10.03,2.46c1.21.3,1.21,2.02,0,2.31l-10.03,2.46c-6.09,1.5-10.85,6.25-12.35,12.35l-2.46,10.03c-.3,1.21-2.02,1.21-2.31,0l-2.46-10.03c-1.5-6.09-6.25-10.85-12.35-12.35L.91,28.06c-1.21-.3-1.21-2.02,0-2.31l10.03-2.46c6.09-1.5,10.85-6.25,12.35-12.35L25.75.91c.3-1.21,2.02-1.21,2.31,0Z"
        />
      </motion.svg>
      <motion.span className="h-px flex-1 origin-left" style={{ scaleX: reduced ? 1 : grow, background: 'linear-gradient(270deg, transparent, var(--line-2))' }} />
    </div>
  );
};

/** Number that counts up the first time it scrolls into view. */
export const CountUp: React.FC<{ to: number; from?: number; suffix?: string; className?: string; style?: React.CSSProperties }> = ({ to, from = 0, suffix = '', className, style }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !inView) return;
    el.textContent = String(from) + suffix;
    const c = animate(from, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v)) + suffix;
      },
    });
    return () => c.stop();
  }, [inView, reduced, to, from, suffix]);
  return (
    <span ref={ref} className={className} style={style}>
      {to}
      {suffix}
    </span>
  );
};
