import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Monitor, Layers, GraduationCap, Armchair, Award, Wifi, ArrowUpRight, ArrowRight, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { YouTubeFacade } from './YouTubeFacade';
import { youtubeId, useMotionReduced, useIsDesktop, uz } from './utils';
import { Mask } from './fx';
import { openConsult } from './consult';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const TINTS = ['#0061ff', '#60efff', '#00b26b'];
// vertikal scroll gorizontal masofaning shu ulushi: trek scroll'dan ~1.8x tez yuradi, bo'lim ~2 ekran
const TRAVEL = 0.55;

const FEATURES: { n: string; t: string; d: string; Icon: LucideIcon; art: string }[] = [
  { n: '01', t: 'Zamonaviy texnika', d: 'iMac va kuchli Windows kompyuterlari. Dizayn va dasturlash dasturlari qotmasdan ishlaydi.', Icon: Monitor, art: 'campus-texnika' },
  { n: '02', t: 'Real loyihalar', d: 'Oʻqish davomida portfolio yigʻiladi: har modul amaliy topshiriq bilan yakunlanadi.', Icon: Layers, art: 'why-loyiha' },
  { n: '03', t: 'Amaliyotchi ustozlar', d: 'Darslarni oʻz sohasida ishlayotgan dasturchi, dizayner va moliyachilar oʻtadi.', Icon: GraduationCap, art: 'why-ustoz' },
  { n: '04', t: 'Coworking hududi', d: 'Darsdan keyin ham kelib, jamoaviy loyiha ustida ishlash mumkin.', Icon: Armchair, art: 'campus-cowork' },
  { n: '05', t: 'Sertifikat va ishga yoʻnaltirish', d: 'Yakuniy imtihondan soʻng sertifikat, eng yaxshi bitiruvchilarga ish topishda yordam.', Icon: Award, art: 'why-sertifikat' },
  { n: '06', t: 'Tezkor internet', d: 'Butun markaz boʻylab barqaror Wi-Fi: videodars va katta fayllar muammosiz.', Icon: Wifi, art: 'campus-wifi' },
];

/** Transparent 3D object with an icon fallback if the file is missing. */
const Art: React.FC<{ i: number }> = ({ i }) => {
  const f = FEATURES[i];
  const [broken, setBroken] = useState(false);
  return broken ? (
    <span className="cx-art-fallback"><f.Icon size={34} strokeWidth={1.6} /></span>
  ) : (
    <img src={`/images/v2/icons/${f.art}.webp`} alt="" width={320} height={320} loading="lazy" decoding="async" onError={() => setBroken(true)} />
  );
};

/** Address, hours and the two next steps — shared by both layouts. */
const VisitCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const address = uz(tField(siteContent.contactAddress));
  const landmark = uz(tField(siteContent.contactLandmark));
  const schedule = uz(tField(siteContent.contactSchedule));
  const phone = siteContent.contactPhone;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tField(siteContent.contactAddress) || '')}`;
  return (
    <aside className={`cx-visit panel ${className}`} aria-label="Manzil va ish vaqti">
      <p className="t-kicker">📍 Bizni topish oson</p>
      <p className="cx-addr mt-4">{address}</p>
      {landmark && <p className="t-body mt-2 !text-[0.95rem]">{landmark}</p>}
      <ul className="mt-6 grid gap-3">
        {schedule && (
          <li className="cx-row"><span className="cx-emoji" aria-hidden="true">🕘</span><span>{schedule}</span></li>
        )}
        {phone && (
          <li className="cx-row">
            <span className="cx-emoji" aria-hidden="true">📞</span>
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="mono hover:underline underline-offset-4">{phone}</a>
          </li>
        )}
      </ul>
      <p className="t-body mt-6 !text-[0.95rem]">Kelib, sinfxonalarni oʻz koʻzingiz bilan koʻring.</p>
      <div className="mt-auto pt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => openConsult()}>
          Bepul konsultatsiya <ArrowRight size={18} aria-hidden="true" />
        </button>
        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Xaritada ochish <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
};

const Heading: React.FC = () => (
  <>
    <p className="t-kicker mb-6">06 — Stansiya</p>
    <Mask><h2 id="campus-title" className="t-h2 max-w-[16ch]">Oʻqish uchun qurilgan makon.</h2></Mask>
  </>
);
const Lead: React.FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`t-lead max-w-md ${className}`}>Urganch markazida, Darital savdo markazi yonida. Ichkarini videoda koʻring.</p>
);

// ------------------------------------------------------------------ desktop: pinned horizontal tour

/**
 * One stop on the tour. Its 3D object reacts to where the card sits on screen:
 * tilted and small while it waits on the right, upright and lit in the centre, drifting away on the left.
 */
const Stop: React.FC<{ i: number; x: MotionValue<number>; offset: number; vw: number }> = ({ i, x, offset, vw }) => {
  const f = FEATURES[i];
  // -1 = card centre at the left edge, 0 = screen centre, +1 = right edge
  const pos = useTransform(x, (v) => (offset + v - vw / 2) / (vw / 2));
  const rotY = useTransform(pos, [-1.2, 0, 1.2], [20, 0, -26]);
  const artY = useTransform(pos, [-1.2, 0, 1.2], [-16, 0, 24]);
  const artScale = useTransform(pos, [-1.2, 0, 1.2], [0.8, 1, 0.74]);
  const artRot = useTransform(pos, [-1.2, 0, 1.2], [-14, 0, 18]);
  const glow = useTransform(pos, [-0.9, 0, 0.9], [0.15, 1, 0.15]);
  const dim = useTransform(pos, [-1.4, -0.35, 0, 0.35, 1.4], [0.45, 1, 1, 1, 0.5]);
  return (
    <motion.li className="ct-stop" style={{ rotateY: rotY, opacity: dim, ['--tint' as string]: TINTS[i % 3] }}>
      <motion.span className="ct-glow" aria-hidden="true" style={{ opacity: glow }} />
      <span className="ct-num mono" aria-hidden="true">{f.n}</span>
      {/* qat'iy grid: ikonka qutisi va matn bloki har kartada bir xil balandlikda */}
      <span className="ct-art-box" aria-hidden="true">
        <motion.span className="ct-art" style={{ y: artY, scale: artScale, rotate: artRot }}>
          <Art i={i} />
        </motion.span>
      </span>
      <span className="ct-text">
        <span className="mono ink-blue text-sm">{f.n} / 06</span>
        <h3 className="ct-h">{f.t}</h3>
        <p className="t-body">{f.d}</p>
      </span>
    </motion.li>
  );
};

const Tour: React.FC<{ vid: string }> = ({ vid }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stopsRef = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState({ dist: 0, vw: 1440, offsets: [] as number[] });

  // measure how far the track has to travel and where each stop sits on it
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const list = stopsRef.current;
      if (!track || !list) return;
      const vw = window.innerWidth;
      const offsets = Array.from(list.children).map((el) => {
        const e = el as HTMLElement;
        return list.offsetLeft + e.offsetLeft + e.offsetWidth / 2;
      });
      setGeo({ dist: Math.max(0, track.scrollWidth - vw), vw, offsets });
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

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (p) => -p * geo.dist);
  const ghostX = useTransform(scrollYProgress, (p) => -p * geo.dist * 0.35);
  const videoScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.92]);
  const videoTilt = useTransform(scrollYProgress, [0, 0.12], [0, -10]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${Math.round(geo.dist * TRAVEL)}px)` }} aria-labelledby="campus-title">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <motion.span className="ct-ghost" aria-hidden="true" style={{ x: ghostX }}>STANSIYA · STANSIYA</motion.span>

        <motion.div ref={trackRef} className="ct-track" style={{ x }}>
          {/* 1 — kirish: sarlavha + video */}
          <div className="ct-intro">
            <div className="ct-intro-copy">
              <Heading />
              <Lead className="mt-6" />
              <p className="ct-hint mono mt-10" aria-hidden="true">
                Pastga aylantiring — stansiya boʻylab sayohat <span>→</span>
              </p>
            </div>
            {vid && (
              <div className="ct-video" style={{ perspective: '1400px' }}>
                <motion.div style={{ scale: videoScale, rotateY: videoTilt }} className="overflow-hidden rounded-[28px] shadow-[0_60px_120px_-50px_rgba(0,97,255,.6)]">
                  <YouTubeFacade id={vid} title="DATA Taʼlim Stansiyasi — virtual sayohat" />
                </motion.div>
              </div>
            )}
          </div>

          {/* 2 — oltita bekat */}
          <ol ref={stopsRef} className="ct-stops" style={{ perspective: '1200px' }}>
            {FEATURES.map((f, i) => (
              <Stop key={f.n} i={i} x={x} offset={geo.offsets[i] ?? 0} vw={geo.vw} />
            ))}
          </ol>

          {/* 3 — yakuniy bekat: manzil */}
          <div className="ct-final">
            <VisitCard className="h-full" />
          </div>
        </motion.div>

        {/* yoʻl chizigʻi: progress + bekatlar */}
        <div className="wrap w-full ct-rail" aria-hidden="true">
          <span className="ct-rail-line" />
          <motion.span className="ct-rail-fill" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ mobile / reduced motion: stacked

const Stacked: React.FC<{ vid: string; reduced: boolean }> = ({ vid, reduced }) => (
  <section className="relative sec" aria-labelledby="campus-title">
    <div className="wrap">
      <div className="sec-head">
        <div><Heading /></div>
        <Lead />
      </div>
      <div className="grid lg:grid-cols-12 gap-5 items-stretch">
        {vid && (
          <div className="lg:col-span-8 overflow-hidden rounded-[28px] shadow-[0_60px_120px_-50px_rgba(0,97,255,.55)]">
            <YouTubeFacade id={vid} title="DATA Taʼlim Stansiyasi — virtual sayohat" />
          </div>
        )}
        <VisitCard className={vid ? 'lg:col-span-4' : 'lg:col-span-12'} />
      </div>
      <ol className="cx-grid mt-16">
        {FEATURES.map((f, i) => (
          <motion.li
            key={f.n}
            className="cx-tile panel"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: 0.6, ease: EASE, delay: (i % 2) * 0.08 }}
          >
            <span className="cx-art" aria-hidden="true"><Art i={i} /></span>
            <span className="mono ink-blue text-sm">{f.n}</span>
            <h3 className="t-h3 mt-3 cx-title">{f.t}</h3>
            <p className="t-body mt-3">{f.d}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  </section>
);

export const Campus: React.FC = () => {
  const { siteContent } = useStore();
  const reduced = useMotionReduced();
  const desktop = useIsDesktop();
  const vid = youtubeId(siteContent.tourVideoUrl);
  return desktop && !reduced ? <Tour vid={vid} /> : <Stacked vid={vid} reduced={reduced} />;
};
