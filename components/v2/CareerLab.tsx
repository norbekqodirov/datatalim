import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Mask } from './fx';
import { useIsDesktop, useMotionReduced } from './utils';
import { ArrowRight, RotateCcw } from 'lucide-react';

// Holland RIASEC — the six axes the career test actually measures (pages/CareerTest.tsx)
const AXES = [
  { k: 'R', name: 'Amaliy' },
  { k: 'I', name: 'Tadqiqotchi' },
  { k: 'A', name: 'Ijodiy' },
  { k: 'S', name: 'Ijtimoiy' },
  { k: 'E', name: 'Tadbirkor' },
  { k: 'C', name: 'Tizimli' },
];

// Example profiles the radar cycles through, each paired with a matching direction
const PROFILES: { v: number[]; label: string }[] = [
  { v: [0.55, 0.95, 0.4, 0.3, 0.45, 0.8], label: 'Dasturlash va maʼlumotlar' },
  { v: [0.35, 0.45, 0.95, 0.65, 0.55, 0.3], label: 'Grafik dizayn va media' },
  { v: [0.3, 0.5, 0.35, 0.55, 0.7, 0.95], label: 'Moliya va buxgalteriya' },
  { v: [0.4, 0.5, 0.7, 0.9, 0.95, 0.4], label: 'SMM va marketing' },
];

const SIZE = 420;
const C = SIZE / 2;
const R = 150;

const point = (i: number, r: number) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 6;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const;
};
const poly = (vals: number[]) => vals.map((v, i) => point(i, R * v).join(',')).join(' ');

// ---------------------------------------------------------------- mini-test: 3 savol, jonli radar
type Axis = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
const QUIZ: { q: string; opts: { e: string; t: string; add: Partial<Record<Axis, number>> }[] }[] = [
  {
    q: 'Boʻsh vaqtingizda nimani koʻproq yoqtirasiz?',
    opts: [
      { e: '🛠️', t: 'Narsalarni yasash yoki tuzatish', add: { R: 1 } },
      { e: '🔍', t: 'Nima qanday ishlashini oʻrganish', add: { I: 1 } },
      { e: '🎨', t: 'Chizish, video yoki dizayn', add: { A: 1 } },
      { e: '🤝', t: 'Odamlar bilan muloqot', add: { S: 1 } },
    ],
  },
  {
    q: 'Jamoaviy loyihada qaysi rolni tanlaysiz?',
    opts: [
      { e: '📣', t: 'Gʻoyani taqdim etib, jamoani boshqarish', add: { E: 1 } },
      { e: '📋', t: 'Reja tuzib, hammasini tartibga solish', add: { C: 1 } },
      { e: '💡', t: 'Yangi gʻoyalar topish', add: { A: 1 } },
      { e: '🧪', t: 'Muammoning yechimini izlash', add: { I: 1 } },
    ],
  },
  {
    q: 'Qaysi natija sizni koʻproq quvontiradi?',
    opts: [
      { e: '💻', t: 'Ishlaydigan dastur yoki Telegram bot', add: { I: 0.5, R: 0.5 } },
      { e: '📈', t: 'Aniq hisob-kitob va tartibli hisobot', add: { C: 1 } },
      { e: '🎬', t: 'Koʻp koʻrilgan video yoki chiroyli brend', add: { A: 1 } },
      { e: '🚀', t: 'Sotuv yoki tadbirning natijasi', add: { E: 0.5, S: 0.5 } },
    ],
  },
];
const ORDER: Axis[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const DIRECTION: Record<Axis, string> = {
  R: 'Dasturlash va maʼlumotlar',
  I: 'Dasturlash va maʼlumotlar',
  A: 'Media, dizayn va AI',
  S: 'SMM va HR menejment',
  E: 'SMM va marketing',
  C: 'Moliya va raqamli ofis',
};

const toProfile = (score: Record<Axis, number>) => ORDER.map((k) => Math.min(1, 0.28 + score[k] * 0.36));
const EMPTY: Record<Axis, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

export const CareerLab: React.FC = () => {
  const reduced = useMotionReduced();
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState<Record<Axis, number>>(EMPTY);
  const started = step > 0;
  const done = step >= QUIZ.length;

  // foydalanuvchi javob bermaguncha radar namunaviy profillarni almashtirib turadi
  useEffect(() => {
    if (reduced || !inView || started) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % PROFILES.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, inView, started]);

  const prof = PROFILES[idx];
  const vals = started ? toProfile(score) : prof.v;
  const top = ORDER.reduce((best, k) => (score[k] > score[best] ? k : best), ORDER[0]);

  const answer = (add: Partial<Record<Axis, number>>) => {
    setScore((s) => {
      const next = { ...s };
      (Object.keys(add) as Axis[]).forEach((k) => { next[k] += add[k] || 0; });
      return next;
    });
    setStep((n) => n + 1);
  };
  const reset = () => { setScore(EMPTY); setStep(0); };

  // the radar rises out of the page: tilted flat at first, standing up as it reaches the centre
  const stageRef = useRef<HTMLDivElement>(null);
  // telefonda radar ekranning pastki qismidayoq tik turib boʻladi — yarim xira holatda qolmaydi
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: stageRef, offset: desktop ? ['start end', 'center 0.55'] : ['start 0.98', 'start 0.6'] });
  const tilt = useTransform(scrollYProgress, [0, 1], [62, 0]);
  const rise = useTransform(scrollYProgress, [0, 1], [0.78, 1]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [0.15, 1]);
  const spin = useTransform(scrollYProgress, [0, 1], [-14, 0]);

  return (
    <section className="relative sec overflow-hidden" aria-labelledby="lab-title">
      <div className="wrap grid lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 items-center">
        <div className="lg:col-span-5 relative z-10">
          <p className="t-kicker mb-6">05 — Karyera laboratoriyasi</p>
          <Mask>
            <h2 id="lab-title" className="t-h2">
              Qaysi kasb sizga mos — <span className="ink-grad">maʼlumot</span> aytib beradi.
            </h2>
          </Mask>
          <p className="t-lead mt-4 sm:mt-6 max-w-md">
            Holland RIASEC metodikasi asosidagi test qiziqishlaringizni olti oʻlchovda baholaydi va sizga mos yoʻnalishni koʻrsatadi.
          </p>
          <ul className="mt-6 sm:mt-8 grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--line)' }}>
            {[
              ['≈12', 'daqiqa'],
              ['6', 'oʻlchov'],
              ['0', 'soʻm'],
            ].map(([n, l]) => (
              <li key={l} className="p-3 sm:p-4" style={{ background: 'var(--bg)' }}>
                <span className="block mono text-xl sm:text-2xl" style={{ fontWeight: 500 }}>{n}</span>
                <span className="block text-sm ink-3 mt-1">{l}</span>
              </li>
            ))}
          </ul>
          <Link to="/karyera-testi" className="btn btn-primary mt-6 sm:mt-10">
            Testni boshlash <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        {/* oʻng: laboratoriya pulti — chapda jonli radar, oʻngda 3 savollik tezkor sinov */}
        <motion.div
          className="lg:col-span-7 lab-console panel"
          onViewportEnter={() => setInView(true)}
          onViewportLeave={() => setInView(false)}
        >
          <div className="grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 sm:gap-8 items-center">
            <div className="flex flex-col items-center">
              <div ref={stageRef} className="w-full max-w-[15.5rem] sm:max-w-[22rem]" style={{ perspective: '1100px' }}>
                <motion.svg
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  className="w-full h-auto overflow-visible"
                  style={reduced ? undefined : { rotateX: tilt, rotateZ: spin, scale: rise, opacity: fade, transformOrigin: '50% 60%' }}
                  role="img"
                  aria-label={started ? 'Sizning qiziqishlar profilingiz' : `Namuna natija: ${prof.label}`}
                >
                  <defs>
                    <linearGradient id="lab-sweep" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor="#60efff" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#60efff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lab-fill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0061ff" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#60efff" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75, 1].map((r) => (
                    <polygon key={r} points={poly(Array(6).fill(r))} fill="none" stroke="var(--line-2)" strokeWidth={1} />
                  ))}
                  {AXES.map((a, i) => {
                    const [x, y] = point(i, R);
                    const [lx, ly] = point(i, R + 34);
                    const hot = started && a.k === top && score[top] > 0;
                    return (
                      <g key={a.k}>
                        <line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />
                        <text x={lx} y={ly - 6} textAnchor="middle" className="mono" fontSize="16" fill={hot ? 'var(--cyan-ink)' : 'var(--fg)'} style={{ fontWeight: 500 }}>
                          {a.k}
                        </text>
                        <text x={lx} y={ly + 12} textAnchor="middle" fontSize="14" fill="var(--fg-2)">
                          {a.name}
                        </text>
                      </g>
                    );
                  })}
                  {!reduced && (
                    <g className="radar-sweep" style={{ animationPlayState: inView ? 'running' : 'paused' }}>
                      <path d={`M ${C} ${C} L ${C + R} ${C} A ${R} ${R} 0 0 0 ${C + R * Math.cos(-0.9)} ${C + R * Math.sin(-0.9)} Z`} fill="url(#lab-sweep)" />
                      <line x1={C} y1={C} x2={C + R} y2={C} stroke="var(--cyan-ink)" strokeWidth={1.5} opacity={0.8} />
                    </g>
                  )}
                  <motion.polygon
                    initial={false}
                    animate={{ points: poly(vals) }}
                    transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                    fill="url(#lab-fill)"
                    stroke="var(--cyan-ink)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {vals.map((v, i) => {
                    const [x, y] = point(i, R * v);
                    return (
                      <motion.circle
                        key={i}
                        initial={false}
                        animate={{ cx: x, cy: y }}
                        transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                        r={4}
                        fill="var(--bg)"
                        stroke="var(--cyan-ink)"
                        strokeWidth={2}
                      />
                    );
                  })}
                </motion.svg>
              </div>
              <p className="t-kicker mt-2 sm:mt-4 text-center">{started ? 'Sizning profilingiz' : `Namuna: ${prof.label}`}</p>
            </div>

            <div className="min-w-0" aria-live="polite">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="t-kicker">Tezkor sinov · 30 soniya</span>
                <span className="flex gap-1.5" aria-label={`${Math.min(step + 1, QUIZ.length)} / ${QUIZ.length} savol`}>
                  {QUIZ.map((_, i) => (
                    <span key={i} className={`lab-dot ${i < step ? 'is-done' : i === step && !done ? 'is-now' : ''}`} />
                  ))}
                </span>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {!done ? (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="lab-q">{QUIZ[step].q}</p>
                    <div className="mt-4 grid gap-2">
                      {QUIZ[step].opts.map((o) => (
                        <button key={o.t} type="button" className="lab-opt" onClick={() => answer(o.add)}>
                          <span className="lab-emoji" aria-hidden="true">{o.e}</span>
                          <span className="min-w-0">{o.t}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="t-kicker">Taxminiy yoʻnalish</p>
                    <p className="lab-result mt-2"><span className="ink-grad">{DIRECTION[top]}</span></p>
                    <p className="t-body mt-3 !text-[0.95rem]">
                      Bu 3 savollik tezkor koʻrinish. Aniq natija va mos kurslar roʻyxati — 6 oʻlchovli toʻliq testda.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to="/karyera-testi" className="btn btn-primary">
                        Toʻliq testni boshlash <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                      <button type="button" className="btn btn-ghost" onClick={reset}>
                        <RotateCcw size={16} aria-hidden="true" /> Qaytadan
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
