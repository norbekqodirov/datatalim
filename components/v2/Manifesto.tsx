import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Star3D, ScrollText } from './fx';
import { useMotionReduced } from './utils';

const TEXT =
  'Har bir kurs real loyiha bilan tugaydi: sayt, Telegram bot, brend, video yoki moliyaviy hisobot. ' +
  'Darslar kichik guruhlarda, amaliyotchi ustozlar bilan oʻtadi. Siz bizdan sertifikat bilan birga portfolio olib chiqasiz.';

// matndagi natijalar yulduz atrofida aylanadi: "nima bilan chiqaman?" savoliga koʻrinadigan javob
const OUTCOMES = [
  { e: '🌐', t: 'Sayt' },
  { e: '🤖', t: 'Telegram bot' },
  { e: '🎨', t: 'Brend' },
  { e: '🎬', t: 'Video' },
  { e: '📊', t: 'Moliyaviy hisobot' },
];

const Chip: React.FC<{ i: number; spin: MotionValue<number>; e: string; t: string }> = ({ i, spin, e, t }) => {
  const a = (i / OUTCOMES.length) * Math.PI * 2 - Math.PI / 2;
  // halqa aylanadi, chip esa teskari aylanib doim tik turadi
  const counter = useTransform(spin, (v) => -v);
  return (
    <span className="orbit-slot" style={{ left: `${50 + Math.cos(a) * 40}%`, top: `${50 + Math.sin(a) * 44}%` }}>
      <motion.span className="orbit-chip" style={{ rotate: counter }}>
        <span aria-hidden="true">{e}</span> {t}
      </motion.span>
    </span>
  );
};

export const Manifesto: React.FC = () => {
  const secRef = useRef<HTMLElement>(null);
  const reduced = useMotionReduced();
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start end', 'end start'] });
  const spin = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-50, 50]);

  return (
    <section ref={secRef} className="relative sec overflow-hidden" aria-labelledby="manifesto-k">
      <div className="wrap grid lg:grid-cols-12 gap-14 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <p id="manifesto-k" className="t-kicker mb-8">04 — Yondashuv</p>
          <p className="manifesto-text">
            <ScrollText text={TEXT} />
          </p>
        </div>

        {/* oʻng ustun markazida: aylanuvchi brend yulduzi va natijalar orbitasi */}
        <div className="lg:col-span-5 flex justify-center" aria-hidden="true">
          <div className="orbit-stage">
            <span className="orbit-ring" />
            <span className="orbit-ring is-inner" />
            <span className="orbit-glow" />
            <Star3D progress={scrollYProgress} drift={18} spin={60} className="absolute inset-[27%]" />
            <motion.div className="absolute inset-0" style={{ rotate: spin }}>
              {OUTCOMES.map((o, i) => (
                <Chip key={o.t} i={i} spin={spin} e={o.e} t={o.t} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
