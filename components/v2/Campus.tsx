import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from 'framer-motion';
import { Monitor, Layers, GraduationCap, Armchair, Award, Wifi, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { YouTubeFacade } from './YouTubeFacade';
import { youtubeId, useMotionReduced } from './utils';
import { Mask } from './fx';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES: { n: string; t: string; d: string; Icon: LucideIcon }[] = [
  { n: '01', t: 'Zamonaviy texnika', d: 'iMac va kuchli Windows kompyuterlari. Dizayn va dasturlash dasturlari qotmasdan ishlaydi.', Icon: Monitor },
  { n: '02', t: 'Real loyihalar', d: 'Oʻqish davomida portfolio yigʻiladi: har modul amaliy topshiriq bilan yakunlanadi.', Icon: Layers },
  { n: '03', t: 'Amaliyotchi ustozlar', d: 'Darslarni oʻz sohasida ishlayotgan dasturchi, dizayner va moliyachilar oʻtadi.', Icon: GraduationCap },
  { n: '04', t: 'Coworking hududi', d: 'Darsdan keyin ham kelib, jamoaviy loyiha ustida ishlash mumkin.', Icon: Armchair },
  { n: '05', t: 'Sertifikat va ishga yoʻnaltirish', d: 'Yakuniy imtihondan soʻng sertifikat, eng yaxshi bitiruvchilarga ish topishda yordam.', Icon: Award },
  { n: '06', t: 'Tezkor internet', d: 'Butun markaz boʻylab barqaror Wi-Fi: videodars va katta fayllar muammosiz.', Icon: Wifi },
];

/** One feature row. Reports itself as "active" while it crosses the middle band of the viewport. */
const Feature: React.FC<{ i: number; active: boolean; reduced: boolean; onEnter: (i: number) => void }> = ({ i, active, reduced, onEnter }) => {
  const f = FEATURES[i];
  const ref = useRef<HTMLLIElement>(null);
  const mid = useInView(ref, { margin: '-44% 0px -44% 0px' });
  useEffect(() => {
    if (mid) onEnter(i);
  }, [mid, i, onEnter]);
  const lit = reduced || active;
  return (
    <li
      ref={ref}
      className="relative pl-9 lg:pl-12 py-7 lg:py-0 lg:min-h-[36vh] flex flex-col justify-center"
      style={{
        opacity: lit ? 1 : 0.42,
        transform: reduced ? undefined : `translate3d(${lit ? 0 : 10}px,0,0)`,
        transition: 'opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)',
      }}
      aria-current={active ? 'true' : undefined}
    >
      {/* node on the rail */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
        style={{
          background: lit ? 'var(--cyan-ink)' : 'var(--bg)',
          border: `1.5px solid ${lit ? 'var(--cyan-ink)' : 'var(--line-2)'}`,
          boxShadow: lit ? '0 0 0 6px color-mix(in srgb, var(--cyan-ink) 18%, transparent)' : 'none',
          transition: 'all .45s cubic-bezier(.22,1,.36,1)',
        }}
      />
      <span className="mono ink-blue text-sm">{f.n}</span>
      <h3 className="t-h3 mt-3">{f.t}</h3>
      <p className="t-body mt-3 max-w-[30rem]">{f.d}</p>
    </li>
  );
};

/** Sticky "instrument panel": the active feature flips in as a 3D card while the list scrolls. */
const Readout: React.FC<{ active: number; reduced: boolean }> = ({ active, reduced }) => {
  const f = FEATURES[active];
  const Icon = f.Icon;
  return (
    <div className="hidden lg:block mt-6" style={{ perspective: '1000px' }} aria-hidden="true">
      <div className="panel flex items-center gap-6 px-7 h-[132px] overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="flex items-center gap-6 w-full"
            initial={reduced ? false : { opacity: 0, rotateX: -60, y: 18 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, rotateX: 60, y: -18 }}
            transition={{ duration: 0.38, ease: EASE }}
            style={{ transformOrigin: '50% 50%' }}
          >
            <span className="shrink-0 w-[68px] h-[68px] rounded-[22px] flex items-center justify-center" style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 18px 40px -16px rgba(0,97,255,.8)' }}>
              <Icon size={30} strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block mono text-[0.8rem] ink-cyan tracking-[0.14em]">
                {f.n} / {String(FEATURES.length).padStart(2, '0')}
              </span>
              <span className="block t-h3 mt-1 truncate">{f.t}</span>
            </span>
          </motion.div>
        </AnimatePresence>
        {/* progress ticks */}
        <span className="absolute left-7 right-7 bottom-4 flex gap-1.5">
          {FEATURES.map((_, i) => (
            <span key={i} className="h-[3px] flex-1 rounded-full transition-colors duration-500" style={{ background: i <= active ? 'var(--cyan-ink)' : 'var(--line-2)' }} />
          ))}
        </span>
      </div>
    </div>
  );
};

export const Campus: React.FC = () => {
  const { siteContent } = useStore();
  const reduced = useMotionReduced();
  const vid = youtubeId(siteContent.tourVideoUrl);
  const [active, setActive] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // video "unfolds" into place as the layout scrolls in, then stays put while the list moves
  const { scrollYProgress: enter } = useScroll({ target: stageRef, offset: ['start end', 'start 0.3'] });
  const scale = useTransform(enter, [0, 1], [0.82, 1]);
  const tilt = useTransform(enter, [0, 1], [18, 0]);
  const lift = useTransform(enter, [0, 1], [60, 0]);
  const radius = useTransform(enter, [0, 1], [48, 28]);

  // rail fill follows the list
  const { scrollYProgress: along } = useScroll({ target: listRef, offset: ['start 0.55', 'end 0.55'] });
  const fill = useSpring(along, { stiffness: 140, damping: 26, mass: 0.4 });

  return (
    <section className="relative py-[14vh]" aria-labelledby="campus-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="t-kicker mb-6">06 — Stansiya</p>
            <Mask><h2 id="campus-title" className="t-h2 max-w-[16ch]">Oʻqish uchun qurilgan makon.</h2></Mask>
          </div>
          <p className="t-lead max-w-md">Urganch markazida, Darital savdo markazi yonida. Ichkarini videoda koʻring.</p>
        </div>

        <div ref={stageRef} className="grid lg:grid-cols-12 gap-x-14 gap-y-8 items-start">
          <div className="lg:col-span-7 lg:sticky lg:top-[15vh]">
            {vid && (
              <div style={{ perspective: '1600px' }}>
                <motion.div
                  style={reduced ? undefined : { scale, rotateX: tilt, y: lift, borderRadius: radius, transformOrigin: '50% 100%' }}
                  className="overflow-hidden will-change-transform rounded-[28px] shadow-[0_60px_120px_-50px_rgba(0,97,255,.55)]"
                >
                  <YouTubeFacade id={vid} title="DATA Taʼlim Stansiyasi — virtual sayohat" />
                </motion.div>
              </div>
            )}
            <Readout active={active} reduced={reduced} />
          </div>

          <div className="lg:col-span-5 relative ml-1.5 lg:ml-0 lg:pt-[2vh]">
            {/* rail */}
            <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'var(--line-2)' }} />
            <motion.span
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-px origin-top"
              style={{ scaleY: reduced ? 1 : fill, background: 'linear-gradient(180deg, var(--blue), var(--cyan))' }}
            />
            <ol ref={listRef} className="relative">
              {FEATURES.map((f, i) => (
                <Feature key={f.n} i={i} active={active === i} reduced={reduced} onEnter={setActive} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
