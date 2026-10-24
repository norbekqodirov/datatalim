import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { openConsult } from './consult';
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
  // short windows can't hold a pinned card with a full course list: fall back to the vertical layout
  const desktop = useIsDesktop('(min-width: 1024px) and (min-height: 640px)');
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

  // Keyboard focus on a card that is currently scrolled off to the side: scroll the page to the
  // matching track position (otherwise the browser scrolls the clipped box sideways and breaks the scene).
  const onFocusIn = (e: React.FocusEvent<HTMLDivElement>) => {
    const art = (e.target as HTMLElement).closest('article');
    const track = trackRef.current;
    const sec = sectionRef.current;
    if (!art || !track || !sec || shift <= 0) return;
    e.currentTarget.scrollLeft = 0;
    const left = art.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const gutter = parseFloat(getComputedStyle(sec).getPropertyValue('--gutter')) || 40;
    const frac = Math.min(1, Math.max(0, (left - gutter) / shift));
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY + frac * shift });
  };

  return (
    <section
      ref={sectionRef}
      id="yonalishlar"
      className="relative"
      style={{ height: `calc(${shift}px + 100vh)` }}
      aria-label="Taʼlim yoʻnalishlari"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center" onFocus={onFocusIn}>
        <motion.div ref={trackRef} style={{ x }} className="relative flex items-stretch gap-6 pl-[var(--gutter)] pr-[12vw] will-change-transform">
          <IntroPanel />
          {CATS.map((c, i) => (
            <CategoryPanel key={c.id} cat={c} index={i} x={x} total={CATS.length} />
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
      <p className="t-lead mt-6 max-w-md">Har biri bozorda talab qilinadigan kasbga olib boradi. Pastga aylantiring.</p>
    </div>
  );
};

// one cover of the 3D stack: deeper layers drift more than the front one (parallax in depth)
const CoverLayer: React.FC<{ src: string; i: number; dist: MotionValue<number> }> = ({ src, i, dist }) => {
  const dx = useTransform(dist, [-1, 0, 1], [-i * 70, 0, i * 70]);
  return (
    <motion.div
      className="absolute inset-0 rounded-[22px] overflow-hidden"
      style={{
        x: dx,
        translateZ: -i * 120,
        top: `${-i * 7}%`,
        bottom: `${i * 7}%`,
        left: `${i * 9}%`,
        right: `${-i * 9}%`,
        boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)',
        border: '1px solid var(--line-2)',
        zIndex: 3 - i,
        filter: i ? `brightness(${1 - i * 0.22})` : undefined,
      }}
    >
      <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" width={800} height={800} />
    </motion.div>
  );
};

const CategoryPanel: React.FC<{ cat: (typeof CATS)[number]; index: number; x: MotionValue<number>; total: number }> = ({ cat, index, x, total }) => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  const list = courses.filter((c) => c.category === cat.id);
  const covers = list.filter((c) => c.coverImage).slice(0, 3);
  const ref = useRef<HTMLElement>(null);
  const geo = useRef({ left: 0, w: 1 });

  useLayoutEffect(() => {
    const m = () => {
      const el = ref.current;
      if (el) geo.current = { left: el.offsetLeft, w: el.offsetWidth };
    };
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);

  // signed distance of this panel's centre from the viewport centre, in viewport widths
  const dist = useTransform(x, (xv) => (geo.current.left + xv + geo.current.w / 2 - window.innerWidth / 2) / window.innerWidth);
  const rot = useTransform(dist, [-0.9, 0, 0.9], [-24, 0, 30]);
  const lift = useTransform(dist, [-0.9, 0, 0.9], [-30, 0, 60]);
  const panelOpacity = useTransform(dist, [-0.95, -0.35, 0, 0.35, 0.95], [0.3, 0.85, 1, 0.85, 0.3]);
  const panelScale = useTransform(dist, [-0.95, 0, 0.95], [0.92, 1, 0.92]);
  const ghostX = useTransform(dist, [-1, 1], [160, -160]);
  const glowX = useTransform(dist, [-1, 1], [-120, 120]);

  return (
    <motion.article
      ref={ref}
      style={{ opacity: panelOpacity, scale: panelScale }}
      className="dir-panel shrink-0 w-[min(76rem,82vw)] h-[78vh] panel relative overflow-hidden grid grid-cols-12"
      aria-labelledby={`cat-${cat.id}`}
    >
      {/* oversized outlined numeral drifting against the scroll */}
      <motion.span
        className="mono absolute right-[2%] top-[-4%] select-none pointer-events-none leading-none"
        style={{ x: ghostX, fontSize: 'clamp(9rem, 24vw, 22rem)', color: 'transparent', WebkitTextStroke: '1px var(--line-2)', fontWeight: 500 }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.span>
      {/* category glow */}
      <motion.div
        className="absolute -left-40 -bottom-48 w-[44rem] h-[44rem] rounded-full pointer-events-none"
        style={{ x: glowX, background: `radial-gradient(circle, ${cat.color}3a 0%, transparent 65%)` }}
        aria-hidden="true"
      />

      <div className="col-span-6 flex flex-col relative z-10 min-h-0">
        <span className={`mono ${cat.ink}`} style={{ fontSize: '0.95rem', letterSpacing: '0.1em' }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <h3 id={`cat-${cat.id}`} className="dir-title">{cat.title}</h3>
        <p className="dir-blurb">{cat.blurb}</p>

        <ul className="dir-list mt-8 min-h-0 overflow-hidden">
          {list.map((c) => (
            <li key={c.id} className="hairline">
              <Link to={`/kurslar/${c.id}`} className="group flex items-center gap-4">
                <span className="flex-1 font-semibold text-[1.05rem] tracking-[-0.01em] group-hover:underline underline-offset-4">
                  {uz(tField(c.title))}
                </span>
                <span className="mono ink-3 text-[0.8rem] hidden xl:inline">{uz(tField(c.duration)).split(/[.(]/)[0].trim()}</span>
                <ArrowUpRight size={18} className="ink-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        {/* kartaning chap-pastki burchagi: oʻng tomondagi yorqin muqovaga qarshi vazn va keyingi qadam */}
        <div className="mt-auto pt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button type="button" onClick={() => openConsult(cat.title)} className="btn btn-ghost !min-h-[48px]">
            Mos kursni tanlashda yordam <ArrowRight size={18} aria-hidden="true" />
          </button>
          <span className="mono ink-3 text-[0.8rem]">{list.length} ta kurs · bepul konsultatsiya</span>
        </div>
      </div>

      {/* 3D cover stack */}
      <div className="col-span-6 relative z-10 flex items-center justify-center" style={{ perspective: '1400px' }} aria-hidden="true">
        <motion.div style={{ rotateY: rot, y: lift, transformStyle: 'preserve-3d' }} className="relative w-[78%] aspect-square">
          {covers.map((c, i) => (
            <CoverLayer key={c.id} src={optimizedCover(c.coverImage)} i={i} dist={dist} />
          ))}
        </motion.div>
      </div>
    </motion.article>
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
        <div className="mt-12 grid md:grid-cols-2 gap-5">
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
                  <button type="button" onClick={() => openConsult(cat.title)} className="btn btn-ghost w-full mt-5">
                    Mos kursni tanlashda yordam <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
