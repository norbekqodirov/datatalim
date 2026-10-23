import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import type { Course } from '../../data/courses';
import { uz, useIsDesktop, optimizedCover, useMotionReduced } from './utils';

const CATS: { id: Course['category']; title: string; blurb: string; color: string; ink: string }[] = [
  {
    id: 'programming',
    title: 'Dasturlash va maʼlumotlar',
    blurb: 'Python, frontend, Telegram botlar va BI tahlil. Noldan birinchi real loyihagacha.',
    color: '#00b26b',
    ink: 'ink-green',
  },
  {
    id: 'media',
    title: 'Media, dizayn va AI',
    blurb: 'Grafik dizayn, SMM, mobilografiya va sunʼiy intellekt bilan kontent yaratish.',
    color: '#60efff',
    ink: 'ink-cyan',
  },
  {
    id: 'finance',
    title: 'Moliya va raqamli ofis',
    blurb: 'Buxgalteriya va 1C, Excel Pro, HR menejment: biznesni yurgizadigan vositalar.',
    color: '#0061ff',
    ink: 'ink-blue',
  },
  {
    id: 'kids',
    title: 'Bolalar uchun texnologiya',
    blurb: 'Robototexnika va web dasturlash. 7 yoshdan muhandislarcha fikrlashni oʻrganamiz.',
    color: '#60efff',
    ink: 'ink-cyan',
  },
];

export const Directions: React.FC = () => {
  const desktop = useIsDesktop();
  const reduced = useMotionReduced();
  const pinned = desktop && !reduced;
  return pinned ? <PinnedTrack /> : <StackedList />;
};

// ---------------------------------------------------------------- desktop: pinned horizontal journey
const PinnedTrack: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, (v) => -v * shift);

  useLayoutEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      if (t) setShift(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="yonalishlar"
      className="relative"
      style={{ height: `calc(${shift}px + 100vh)` }}
      aria-label="Taʼlim yoʻnalishlari"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div ref={trackRef} style={{ x }} className="flex items-stretch gap-6 pl-[var(--gutter)] pr-[12vw] will-change-transform">
          <IntroPanel />
          {CATS.map((c, i) => (
            <CategoryPanel key={c.id} cat={c} index={i} progress={smooth} total={CATS.length} />
          ))}
        </motion.div>
        <ProgressRail p={smooth} />
      </div>
    </section>
  );
};

const IntroPanel: React.FC = () => {
  const { courses } = useStore();
  return (
    <div className="shrink-0 w-[min(34rem,40vw)] flex flex-col justify-center pr-8">
      <p className="t-kicker mb-6">04 — Yoʻnalishlar</p>
      <h2 className="t-display">
        Toʻrt yoʻnalish.
        <br />
        <span className="ink-3">{courses.length || 14} ta kurs.</span>
      </h2>
      <p className="t-lead mt-6 max-w-md">Har biri bozorda talab qilinadigan kasbga olib boradi. Oʻngga suring.</p>
    </div>
  );
};

const CategoryPanel: React.FC<{ cat: (typeof CATS)[number]; index: number; progress: MotionValue<number>; total: number }> = ({ cat, index, progress, total }) => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  const list = courses.filter((c) => c.category === cat.id);
  const covers = list.filter((c) => c.coverImage).slice(0, 3);

  // local progress around the moment this panel is centred
  const center = (index + 1) / (total + 0.6);
  const rot = useTransform(progress, [center - 0.35, center, center + 0.35], [28, 0, -18]);
  const lift = useTransform(progress, [center - 0.35, center, center + 0.35], [60, 0, -30]);

  return (
    <article
      className="shrink-0 w-[min(76rem,82vw)] h-[78vh] panel relative overflow-hidden grid grid-cols-12 gap-8 p-10 xl:p-14"
      aria-labelledby={`cat-${cat.id}`}
    >
      {/* category glow */}
      <div
        className="absolute -right-40 -bottom-40 w-[44rem] h-[44rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cat.color}2e 0%, transparent 65%)` }}
        aria-hidden="true"
      />

      <div className="col-span-6 flex flex-col relative z-10 min-h-0">
        <span className={`mono ${cat.ink}`} style={{ fontSize: '0.95rem', letterSpacing: '0.1em' }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <h3 id={`cat-${cat.id}`} className="t-h2 mt-5">{cat.title}</h3>
        <p className="t-body mt-4 max-w-md">{cat.blurb}</p>

        <ul className="mt-auto pt-8 min-h-0 overflow-hidden">
          {list.map((c) => (
            <li key={c.id} className="hairline">
              <Link to={`/kurslar/${c.id}`} className="group flex items-center gap-4 py-3.5">
                <span className="flex-1 font-semibold text-[1.05rem] tracking-[-0.01em] group-hover:underline underline-offset-4">
                  {uz(tField(c.title))}
                </span>
                <span className="mono ink-3 text-[0.8rem] hidden xl:inline">{uz(tField(c.duration)).split(/[.(]/)[0].trim()}</span>
                <ArrowUpRight size={18} className="ink-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3D cover stack */}
      <div className="col-span-6 relative z-10 flex items-center justify-center" style={{ perspective: '1400px' }} aria-hidden="true">
        <motion.div style={{ rotateY: rot, y: lift, transformStyle: 'preserve-3d' }} className="relative w-[78%] aspect-square">
          {covers.map((c, i) => (
            <div
              key={c.id}
              className="absolute inset-0 rounded-[22px] overflow-hidden"
              style={{
                transform: `translate3d(${i * 9}%, ${-i * 7}%, ${-i * 120}px)`,
                boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)',
                border: '1px solid var(--line-2)',
                zIndex: 3 - i,
                filter: i ? `brightness(${1 - i * 0.22})` : undefined,
              }}
            >
              <img src={optimizedCover(c.coverImage)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" width={800} height={800} />
            </div>
          ))}
        </motion.div>
      </div>
    </article>
  );
};

const ProgressRail: React.FC<{ p: MotionValue<number> }> = ({ p }) => {
  const scaleX = useTransform(p, [0, 1], [0, 1]);
  return (
    <div className="absolute left-[var(--gutter)] right-[var(--gutter)] bottom-8 h-px" style={{ background: 'var(--line)' }} aria-hidden="true">
      <motion.div className="h-px origin-left" style={{ scaleX, background: 'var(--grad)' }} />
    </div>
  );
};

// ---------------------------------------------------------------- mobile / reduced motion: vertical
const StackedList: React.FC = () => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  return (
    <section id="yonalishlar" className="relative py-[12vh]" aria-label="Taʼlim yoʻnalishlari">
      <div className="wrap">
        <p className="t-kicker mb-6">04 — Yoʻnalishlar</p>
        <h2 className="t-display">
          Toʻrt yoʻnalish. <span className="ink-3">{courses.length || 14} ta kurs.</span>
        </h2>
        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          {CATS.map((cat, index) => {
            const list = courses.filter((c) => c.category === cat.id);
            const cover = list.find((c) => c.coverImage);
            return (
              <motion.article
                key={cat.id}
                className="panel overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {cover && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={optimizedCover(cover.coverImage)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" width={800} height={450} />
                  </div>
                )}
                <div className="p-6">
                  <span className={`mono ${cat.ink} text-sm`}>{String(index + 1).padStart(2, '0')} / 04</span>
                  <h3 className="t-h3 mt-3">{cat.title}</h3>
                  <p className="t-body mt-2">{cat.blurb}</p>
                  <ul className="mt-5">
                    {list.map((c) => (
                      <li key={c.id} className="hairline">
                        <Link to={`/kurslar/${c.id}`} className="flex items-center gap-3 py-3 min-h-[44px]">
                          <span className="flex-1 font-semibold">{uz(tField(c.title))}</span>
                          <ArrowUpRight size={18} className="ink-3" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
