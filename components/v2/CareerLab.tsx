import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMotionReduced } from './utils';
import { ArrowRight } from 'lucide-react';

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

export const CareerLab: React.FC = () => {
  const reduced = useMotionReduced();
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % PROFILES.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, inView]);

  const prof = PROFILES[idx];

  return (
    <section className="relative py-[16vh] overflow-hidden" aria-labelledby="lab-title">
      <div className="wrap grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-5 relative z-10">
          <p className="t-kicker mb-6">05 — Karyera laboratoriyasi</p>
          <h2 id="lab-title" className="t-h2">
            Qaysi kasb sizga mos — <span className="ink-grad">maʼlumot</span> aytib beradi.
          </h2>
          <p className="t-lead mt-6 max-w-md">
            Holland RIASEC metodikasi asosidagi test qiziqishlaringizni olti oʻlchovda baholaydi va sizga mos yoʻnalishni koʻrsatadi.
          </p>
          <ul className="mt-8 grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--line)' }}>
            {[
              ['≈12', 'daqiqa'],
              ['6', 'oʻlchov'],
              ['0', 'soʻm'],
            ].map(([n, l]) => (
              <li key={l} className="p-4" style={{ background: 'var(--bg)' }}>
                <span className="block mono text-2xl" style={{ fontWeight: 500 }}>{n}</span>
                <span className="block text-sm ink-3 mt-1">{l}</span>
              </li>
            ))}
          </ul>
          <Link to="/karyera-testi" className="btn btn-primary mt-10">
            Testni boshlash <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <motion.div
          className="lg:col-span-7 relative flex flex-col items-center"
          onViewportEnter={() => setInView(true)}
          onViewportLeave={() => setInView(false)}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[34rem] h-auto overflow-visible" role="img" aria-label={`Namuna natija: ${prof.label}`}>
            <defs>
              <linearGradient id="lab-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0061ff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#60efff" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {/* rings */}
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <polygon key={r} points={poly(Array(6).fill(r))} fill="none" stroke="var(--line-2)" strokeWidth={1} />
            ))}
            {/* spokes + labels */}
            {AXES.map((a, i) => {
              const [x, y] = point(i, R);
              const [lx, ly] = point(i, R + 34);
              return (
                <g key={a.k}>
                  <line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />
                  <text x={lx} y={ly - 6} textAnchor="middle" className="mono" fontSize="15" fill="var(--fg)" style={{ fontWeight: 500 }}>
                    {a.k}
                  </text>
                  <text x={lx} y={ly + 12} textAnchor="middle" fontSize="12" fill="var(--fg-3)">
                    {a.name}
                  </text>
                </g>
              );
            })}
            {/* the profile */}
            <motion.polygon
              initial={false}
              animate={{ points: poly(prof.v) }}
              transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
              fill="url(#lab-fill)"
              stroke="#60efff"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {prof.v.map((v, i) => {
              const [x, y] = point(i, R * v);
              return (
                <motion.circle
                  key={i}
                  initial={false}
                  animate={{ cx: x, cy: y }}
                  transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                  r={4}
                  fill="var(--bg)"
                  stroke="#60efff"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
          <div className="mt-6 text-center" aria-live="polite">
            <span className="t-kicker">Namuna natija</span>
            <motion.p
              key={prof.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="t-h3 mt-2"
            >
              {prof.label}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
