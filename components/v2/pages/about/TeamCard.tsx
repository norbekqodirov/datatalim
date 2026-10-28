import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../i18n';
import type { TeamMember } from '../../../../store/useStore';
import { uz, useMotionReduced } from '../../utils';
import { StarGlyph, initials } from './AboutScenes';
import './about.css';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// accent cycle: blue / cyan / green — same trio the homepage uses for directions
const ACCENTS = [
  { fill: '#0061ff', ink: 'var(--blue-ink)', alt: '#60efff' },
  { fill: '#60efff', ink: 'var(--cyan-ink)', alt: '#0061ff' },
  { fill: '#00b26b', ink: 'var(--green-ink)', alt: '#60efff' },
];

const hashName = (name: string) => {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** Rang ism hash'i bo'yicha; qo'shni (oldingi va 3 ustunli to'rdagi yuqoridagi) kartalar bilan bir xil bo'lmasin. */
export function assignAccents(names: string[]): number[] {
  const out: number[] = [];
  names.forEach((n, i) => {
    const avoid = new Set<number>([out[i - 1], out[i - 3]].filter((v) => v !== undefined));
    let c = hashName(n) % ACCENTS.length;
    for (let k = 0; k < ACCENTS.length && avoid.has(c); k++) c = (c + 1) % ACCENTS.length;
    out.push(c);
  });
  return out;
}

export const TeamCard: React.FC<{ member: TeamMember; index: number; accent?: number }> = ({ member, index, accent }) => {
  const { tField } = useLanguage();
  const reduced = useMotionReduced();

  const a = ACCENTS[(accent ?? index) % ACCENTS.length];
  const name = uz(tField(member.name));
  const role = uz(tField(member.role));
  const bio = uz(tField(member.bio));
  const flip = hashName(uz(tField(member.name))) % 2 === 1; // ikkita bir xil monogramma yonma-yon farq qilsin
  const skills = (member.skills || []).map((s) => uz(tField(s))).filter(Boolean);

  return (
    <motion.li
      className="tm-card panel overflow-hidden flex flex-col p-4 sm:p-6"
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.06, ease: EASE }}
    >
      <div className="flex items-center gap-4">
        <div className="tm-avatar" style={{ background: 'var(--bg-3)', ['--tm-fill' as string]: a.fill }}>
          {member.image ? (
            <img src={member.image} alt={name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="tm-glow"
                style={{ background: `radial-gradient(90% 80% at ${flip ? 15 : 85}% 0%, ${a.fill}66 0%, transparent 70%), radial-gradient(70% 60% at ${flip ? 100 : 0}% 100%, ${a.alt}30 0%, transparent 70%)` }}
              />
              <span aria-hidden="true" className="tm-star" style={{ color: a.fill }}>
                <StarGlyph size="100%" color="currentColor" style={{ opacity: 0.28 }} />
              </span>
              <span
                aria-hidden="true"
                className="tm-initials"
                style={{
                  backgroundImage: `linear-gradient(${flip ? 200 : 160}deg, var(--fg) 25%, ${a.ink} 125%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {initials(name)}
              </span>
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span aria-hidden="true" className="mono block text-[0.75rem] tracking-[0.14em]" style={{ color: a.ink }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="t-h3 mt-1" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)', lineHeight: 1.2 }}>{name}</h3>
          <p className="mono text-[0.75rem] mt-1.5 tracking-[0.04em]" style={{ color: a.ink }}>{role}</p>
        </div>
      </div>

      {bio && <p className="t-body mt-3 sm:mt-4 text-[0.9375rem] leading-[1.5]">{bio}</p>}
      {skills.length > 0 && (
        <ul className="mt-auto pt-4 flex flex-wrap gap-2" aria-label="Yoʻnalishlar">
          {skills.map((s, i) => (
            <li key={i} className="tm-chip">{s}</li>
          ))}
        </ul>
      )}
    </motion.li>
  );
};
