import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
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

// ---------------------------------------------------------------- desktop: "metro xaritasi"
// Pin qilingan gorizontal sayohat: har yoʻnalish — oʻz rangidagi metro liniyasi, kurslar — uning bekatlari.
// Ekran markazidagi "poyezd" liniya boʻylab yuradi; 3D obyektlar oʻz bobiga yaqinlashganda jonlanadi.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
// vertikal scroll gorizontal masofaning shu ulushi: trek scroll'dan ~1.8x tez yuradi, bo'lim ~2 ekran
const TRAVEL = 0.55;

// Har yoʻnalishning fonsiz 3D obyekti (public/images/v2/dirs). Fayl topilmasa kurs muqovasi qoʻyiladi.
const dirArt = (id: string) => `/images/v2/dirs/dir-${id}.webp`;

const PinnedTrack: React.FC = () => {
  const { courses } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ dist: 0, vw: 1440, centers: [] as number[], edges: [] as number[] });
  const [active, setActive] = useState(0);

  // trek qancha yurishi kerak va har bob qayerda turgani
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const vw = window.innerWidth;
      const kids: HTMLElement[] = Array.from(track.querySelectorAll<HTMLElement>('.mt-chapter'));
      setGeo({
        dist: Math.max(0, track.scrollWidth - vw),
        vw,
        centers: kids.map((k) => k.offsetLeft + k.offsetWidth / 2),
        edges: kids.map((k) => k.offsetLeft),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [courses.length]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (p) => -p * geo.dist);
  useMotionValueEvent(x, 'change', (v) => {
    // poyezd ekran markazida: qaysi bob chegarasidan oʻtgan boʻlsa, oʻsha faol
    const mid = -v + geo.vw / 2;
    let i = 0;
    geo.edges.forEach((e, k) => { if (mid >= e) i = k; });
    setActive((cur) => (cur === i ? cur : i));
  });

  // bosilgan yoʻnalish — oʻsha bobning markaziga scroll
  const go = (i: number) => {
    const sec = sectionRef.current;
    if (!sec || !geo.dist) return;
    const want = Math.min(1, Math.max(0, (geo.centers[i] - geo.vw / 2) / geo.dist));
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + want * (sec.offsetHeight - window.innerHeight), behavior: 'smooth' });
  };

  const cat = CATS[active];

  return (
    <section ref={sectionRef} id="yonalishlar" className="relative" style={{ height: `calc(100vh + ${Math.round(geo.dist * TRAVEL)}px)` }} aria-label="Taʼlim yoʻnalishlari">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="wrap w-full">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-8">
              <p className="t-kicker mb-4">03 — Yoʻnalishlar</p>
              <h2 className="t-h2">
                Toʻrt yoʻnalish. <span className="ink-3 whitespace-nowrap">{courses.length || 14} ta kurs.</span>
              </h2>
            </div>
            <div className="col-span-4 flex flex-col items-end gap-4">
              <p className="t-body text-right max-w-[20rem]">Har biri bozorda talab qilinadigan kasbga olib boradi.</p>
              {/* liniya tanlagich — metro xaritasidagi rangli belgilar */}
              <div className="mt-legend" role="tablist" aria-label="Yoʻnalishni tanlang">
                {CATS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={c.title}
                    title={c.title}
                    onClick={() => go(i)}
                    className={`mt-legend-btn ${i === active ? 'is-active' : ''}`}
                    style={{ ['--c' as string]: c.color }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-[4vh]">
          <motion.div ref={trackRef} className="mt-track" style={{ x }}>
            {CATS.map((c, i) => (
              <Chapter key={c.id} cat={c} i={i} x={x} center={geo.centers[i] ?? 0} vw={geo.vw} />
            ))}
          </motion.div>

          {/* poyezd: ekran markazida turadi, liniya uning ostidan oʻtadi */}
          <div className="mt-train" aria-hidden="true" style={{ ['--c' as string]: cat.color }}>
            <span className="mt-train-pulse" />
            <span className="mt-train-dot" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Chapter: React.FC<{ cat: (typeof CATS)[number]; i: number; x: MotionValue<number>; center: number; vw: number }> = ({ cat, i, x, center, vw }) => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  const list = courses.filter((c) => c.category === cat.id);
  const fallback = list.find((c) => c.coverImage);
  const [broken, setBroken] = useState(false);

  // -1 = bob markazi chap chekkada, 0 = ekran markazida, +1 = oʻng chekkada
  const pos = useTransform(x, (v) => (center + v - vw / 2) / (vw / 2));
  const artX = useTransform(pos, [-1, 0, 1], [-90, 0, 120]);
  const artRot = useTransform(pos, [-1, 0, 1], [-16, 0, 20]);
  const artScale = useTransform(pos, [-1, 0, 1], [0.82, 1, 0.78]);
  const ghostX = useTransform(pos, [-1, 1], [80, -80]);
  const copyO = useTransform(pos, [-1.1, -0.45, 0.45, 1.1], [0.25, 1, 1, 0.25]);

  const art = broken ? (fallback ? optimizedCover(fallback.coverImage) : '') : dirArt(cat.id);

  return (
    <article className="mt-chapter" style={{ ['--c' as string]: cat.color }} aria-label={cat.title}>
      <div className="mt-body">
        <motion.div className="mt-copy" style={{ opacity: copyO }}>
          <span className="mt-badge mono">{String(i + 1).padStart(2, '0')} · {list.length} kurs</span>
          <h3 className="mt-title">{cat.title}</h3>
          <p className="t-body mt-3 max-w-[26rem]">{cat.blurb}</p>
          <button type="button" onClick={() => openConsult(cat.title)} className="btn btn-primary mt-6">
            Mos kursni tanlashda yordam <ArrowRight size={18} aria-hidden="true" />
          </button>
        </motion.div>

        <div className="mt-stage" aria-hidden="true">
          <motion.span className="mt-ghost mono" style={{ x: ghostX }}>{String(i + 1).padStart(2, '0')}</motion.span>
          <span className="mt-glow" />
          {art && (
            <motion.img
              src={art}
              alt=""
              width={640}
              height={640}
              decoding="async"
              loading="lazy"
              onError={() => setBroken(true)}
              className={`mt-art ${broken ? 'is-boxed' : ''}`}
              style={{ x: artX, rotate: artRot, scale: artScale }}
            />
          )}
        </div>
      </div>

      {/* liniya va bekatlar */}
      <ol className="mt-line">
        {list.map((c, k) => (
          <li key={c.id} className="mt-stop">
            <Link to={`/kurslar/${c.id}`} className="mt-stop-link group">
              <span className="mt-stop-dot" aria-hidden="true" />
              <span className="mono mt-stop-n">{String(k + 1).padStart(2, '0')}</span>
              <span className="mt-stop-t group-hover:underline underline-offset-4">{uz(tField(c.title))}</span>
              <span className="mono mt-stop-d">{uz(tField(c.duration)).split(/[.(]/)[0].trim()}</span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
};

// ---------------------------------------------------------------- mobile / reduced motion: vertical
const StackedList: React.FC = () => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  return (
    <section id="yonalishlar" className="relative sec" aria-label="Taʼlim yoʻnalishlari">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="t-kicker mb-6">03 — Yoʻnalishlar</p>
            <h2 className="t-h2">
              Toʻrt yoʻnalish. <span className="ink-3">{courses.length || 14} ta kurs.</span>
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
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
