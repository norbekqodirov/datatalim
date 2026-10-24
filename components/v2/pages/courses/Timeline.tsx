import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import type { Course } from '../../../../data/courses';
import { useLanguage } from '../../../../i18n';
import { uz, useMotionReduced } from '../../utils';

/**
 * Dars rejasi: skroll bilan to'lib boradigan vertikal chiziq. Har bir modul o'z nuqtasiga
 * yetganda yonadi va kartasi ochiladi. Faqat transform/opacity.
 */
export const Timeline: React.FC<{ modules: Course['modules'] }> = ({ modules }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.62', 'end 0.62'] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.4 });

  return (
    <div className="relative">
      {/* chiziq: 2.25rem tugunning markazi */}
      <span aria-hidden="true" className="absolute bottom-2 top-2 w-px" style={{ left: 'calc(1.125rem - 0.5px)', background: 'var(--line-2)' }} />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-2 top-2 w-[2px] origin-top"
        style={{
          left: 'calc(1.125rem - 1px)',
          background: 'linear-gradient(to bottom, var(--blue), var(--cyan))',
          boxShadow: '0 0 18px rgba(0,97,255,.55)',
          scaleY: reduced ? 1 : fill,
        }}
      />
      <ol ref={ref} className="relative space-y-5 md:space-y-7">
        {modules.map((m, i) => (
          <TimelineItem key={i} index={i} mod={m} reduced={reduced} />
        ))}
      </ol>
    </div>
  );
};

const TimelineItem: React.FC<{ index: number; mod: Course['modules'][number]; reduced: boolean }> = ({ index, mod, reduced }) => {
  const { tField } = useLanguage();
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.5'] });
  const lit = useTransform(p, [0.55, 1], [0, 1]);
  const pop = useTransform(p, [0.55, 0.85, 1], [0.7, 1.18, 1]);
  const cardY = useTransform(p, [0, 0.8], [56, 0]);
  const cardOp = useTransform(p, [0, 0.6], [0.15, 1]);
  const n = String(index + 1).padStart(2, '0');

  return (
    <li ref={ref} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 sm:gap-x-7">
      <div className="relative self-start sticky top-28 z-[1]">
        <div className="tl-node mono">
          <span aria-hidden="true">{n}</span>
          <motion.span className="tl-fill mono" style={reduced ? { opacity: 1 } : { opacity: lit, scale: pop }} aria-hidden="true">
            {n}
          </motion.span>
        </div>
      </div>
      <motion.div className="panel p-5 sm:p-7" style={reduced ? undefined : { y: cardY, opacity: cardOp }}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="t-kicker cat-ink">Modul {n}</span>
          <span className="mono ink-3 text-sm">{mod.lessons.length} ta dars</span>
        </div>
        <h3 className="t-h3 mt-3 text-balance">{uz(tField(mod.title))}</h3>
        <ol className="mt-5">
          {mod.lessons.map((l, j) => (
            <li key={j} className="tl-lesson">
              <span className="mono ink-3 w-7 shrink-0 pt-0.5 text-sm" aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
              <span className="min-w-0 text-[1.025rem] leading-relaxed" style={{ color: 'var(--fg-2)' }}>{uz(tField(l))}</span>
            </li>
          ))}
        </ol>
      </motion.div>
    </li>
  );
};
