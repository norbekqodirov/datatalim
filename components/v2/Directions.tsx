import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
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

// ---------------------------------------------------------------- desktop: sticky explorer
// Chapda toʻrt yoʻnalish — katta tipografik roʻyxat, scroll yoki bosish bilan faollashadi.
// Oʻngda sahna: faol yoʻnalishning 3D muqovasi (kursorga egiladi), kurslari va keyingi qadam.
const STEP_VH = 70;

const PinnedTrack: React.FC = () => {
  const { courses } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(CATS.length - 1, Math.max(0, Math.floor(v * CATS.length * 0.999)));
    setActive((cur) => (cur === i ? cur : i));
  });

  // bosilgan yoʻnalish — shu qadamning oʻrtasiga scroll
  const go = (i: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const travel = sec.offsetHeight - window.innerHeight;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + travel * ((i + 0.5) / CATS.length), behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="yonalishlar"
      className="relative"
      style={{ height: `calc(100vh + ${CATS.length * STEP_VH}vh)` }}
      aria-label="Taʼlim yoʻnalishlari"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="wrap w-full">
          <div className="flex items-end justify-between gap-10 mb-[4.5vh]">
            <div>
              <p className="t-kicker mb-4">04 — Yoʻnalishlar</p>
              <h2 className="dx-title">
                Toʻrt yoʻnalish. <span className="ink-3 whitespace-nowrap">{courses.length || 14} ta kurs.</span>
              </h2>
            </div>
            <p className="t-body max-w-[22rem] text-right hidden xl:block">Har biri bozorda talab qilinadigan kasbga olib boradi.</p>
          </div>

          <div className="grid grid-cols-12 gap-8 items-stretch">
            <ol className="col-span-5 flex flex-col justify-center" role="tablist" aria-label="Yoʻnalishni tanlang">
              {CATS.map((c, i) => (
                <DirTab key={c.id} cat={c} i={i} active={i === active} p={scrollYProgress} onPick={() => go(i)} />
              ))}
            </ol>
            <div className="col-span-7">
              <Stage index={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DirTab: React.FC<{ cat: (typeof CATS)[number]; i: number; active: boolean; p: MotionValue<number>; onPick: () => void }> = ({ cat, i, active, p, onPick }) => {
  const n = CATS.length;
  // shu qadam ichidagi progress — faol tab ostidagi chiziq toʻladi
  const fill = useTransform(p, [i / n, (i + 1) / n], [0, 1]);
  return (
    <li className={`dx-tab ${active ? 'is-active' : ''}`}>
      <button type="button" role="tab" aria-selected={active} onClick={onPick} className="dx-tab-btn">
        <span className={`mono dx-num ${active ? cat.ink : ''}`}>{String(i + 1).padStart(2, '0')}</span>
        <span className="dx-name">{cat.title}</span>
      </button>
      <AnimatePresence initial={false}>
        {active && (
          <motion.p
            className="dx-blurb"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {cat.blurb}
          </motion.p>
        )}
      </AnimatePresence>
      <span className="dx-line" aria-hidden="true">
        {active && <motion.span className="dx-line-fill" style={{ scaleX: fill, background: cat.color }} />}
      </span>
    </li>
  );
};

// Har yoʻnalishning fonsiz 3D obyekti (public/images/v2/dirs). Fayl topilmasa kurs muqovasi qoʻyiladi.
const dirArt = (id: string) => `/images/v2/dirs/dir-${id}.webp`;

const Stage: React.FC<{ index: number }> = ({ index }) => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const cat = CATS[index];
  const list = courses.filter((c) => c.category === cat.id);
  const fallback = list.find((c) => c.coverImage);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  // kursorga qarab obyekt egiladi
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 16 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const art = broken[cat.id] ? (fallback ? optimizedCover(fallback.coverImage) : '') : dirArt(cat.id);

  return (
    <div className="dx-stage" role="tabpanel" aria-label={cat.title} onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* fon qatlami alohida kesiladi — obyekt esa ramkadan chiqib turishi mumkin */}
      <div className="dx-stage-bg panel" aria-hidden="true">
        <motion.span
          className="dx-glow"
          animate={{ background: `radial-gradient(60% 70% at 30% 55%, ${cat.color}38 0%, transparent 70%)` }}
          transition={{ duration: 0.8 }}
        />
        <span className="dx-ghost mono">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="relative grid grid-cols-12 gap-6 h-full">
        <div className="col-span-6 relative" style={{ perspective: '1100px' }} aria-hidden="true">
          <span className="dx-shadow" style={{ background: `radial-gradient(closest-side, ${cat.color}55, transparent)` }} />
          <AnimatePresence mode="popLayout" initial={false}>
            {art && (
              <motion.div
                key={cat.id + (broken[cat.id] ? '-f' : '')}
                className={`dx-art ${broken[cat.id] ? 'is-boxed' : ''}`}
                style={{ rotateX: rx, rotateY: ry }}
                initial={{ opacity: 0, scale: 0.8, rotateZ: -10, y: 40 }}
                animate={{ opacity: 1, scale: 1, rotateZ: 0, y: 0 }}
                exit={{ opacity: 0, scale: 1.08, y: -30, filter: 'blur(6px)' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.img
                  src={art}
                  alt=""
                  width={640}
                  height={640}
                  decoding="async"
                  onError={() => setBroken((b) => ({ ...b, [cat.id]: true }))}
                  className="w-full h-full object-contain"
                  animate={reduced ? undefined : { y: [-10, 10, -10] }}
                  transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="col-span-6 flex flex-col justify-center min-h-0 py-2 pr-1">
          <p className={`mono text-[0.78rem] tracking-[0.14em] ${cat.ink}`}>KURSLAR · {String(list.length).padStart(2, '0')}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={cat.id}
              className="dx-list mt-3"
              initial="hide"
              animate="show"
              exit="hide"
              variants={{ show: { transition: { staggerChildren: 0.05 } }, hide: {} }}
            >
              {list.map((c, i) => (
                <motion.li
                  key={c.id}
                  variants={{ hide: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <Link to={`/kurslar/${c.id}`} className="dx-row group">
                    <span className="mono ink-3 text-[0.75rem] w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 min-w-0 font-semibold leading-snug group-hover:underline underline-offset-4">{uz(tField(c.title))}</span>
                    <span className="mono ink-3 text-[0.78rem] shrink-0">{uz(tField(c.duration)).split(/[.(]/)[0].trim()}</span>
                    <ArrowUpRight size={17} className="ink-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>

          <div className="mt-6">
            <button type="button" onClick={() => openConsult(cat.title)} className="btn btn-primary !min-h-[48px]">
              Mos kursni tanlashda yordam <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className="mono ink-3 text-[0.75rem] mt-3">Bepul konsultatsiya · 1 ish kunida qoʻngʻiroq</p>
          </div>
        </div>
      </div>
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
                <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden" aria-hidden="true"
                  style={{ background: `radial-gradient(60% 70% at 50% 60%, ${cat.color}33, transparent 70%)` }}>
                  <img
                    src={dirArt(cat.id)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="h-[92%] w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,.45)]"
                    onError={(e) => { if (cover?.coverImage) { e.currentTarget.onerror = null; e.currentTarget.src = optimizedCover(cover.coverImage); } }}
                  />
                </div>
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
