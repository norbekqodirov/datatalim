import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

export const TeamCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const initialsY = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const starTurn = useTransform(scrollYProgress, [0, 1], [-35, 35]);

  const a = ACCENTS[index % ACCENTS.length];
  const name = uz(tField(member.name));
  const role = uz(tField(member.role));
  const bio = uz(tField(member.bio));
  const skills = (member.skills || []).map((s) => uz(tField(s))).filter(Boolean);

  return (
    <motion.li
      ref={ref}
      className={`tm-card panel overflow-hidden flex flex-col ${index % 3 === 1 ? 'lg:mt-14' : ''}`}
      initial={reduced ? false : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.85, delay: (index % 3) * 0.08, ease: EASE }}
    >
      <div className="tm-visual aspect-[4/5]" style={{ background: 'var(--bg-3)' }}>
        {member.image ? (
          <>
            <motion.img
              src={member.image}
              alt={name}
              loading="lazy"
              decoding="async"
              className="absolute left-0 w-full object-cover"
              style={{ top: '-6%', height: '112%', y: reduced ? 0 : imgY, zIndex: 0 }}
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3" style={{ zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent)' }} />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="tm-glow"
              style={{ background: `radial-gradient(95% 75% at 88% 0%, ${a.fill}59 0%, transparent 70%), radial-gradient(75% 65% at 0% 100%, ${a.alt}24 0%, transparent 70%)` }}
            />
            <div aria-hidden="true" className="tm-grid" />
            <span aria-hidden="true" className="tm-star" style={{ color: a.fill }}>
              <motion.span className="block w-full h-full" style={reduced ? undefined : { rotate: starTurn }}>
                <StarGlyph size="100%" color="currentColor" style={{ opacity: 0.2 }} />
              </motion.span>
            </span>
            <div aria-hidden="true" className="absolute inset-0 z-[1] flex items-center justify-center">
              <motion.span
                className="tm-initials"
                style={{
                  y: reduced ? 0 : initialsY,
                  backgroundImage: `linear-gradient(160deg, var(--fg) 25%, ${a.ink} 125%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  padding: '0.12em 0.08em',
                }}
              >
                {initials(name)}
              </motion.span>
            </div>
          </>
        )}
        <span aria-hidden="true" className="absolute left-6 top-6 z-[2] mono text-[0.8125rem] tracking-[0.14em]" style={{ color: member.image ? '#fff' : a.ink }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="p-7 sm:p-8 flex flex-col flex-1">
        <h3 className="t-h3">{name}</h3>
        <p className="mono text-[0.8125rem] mt-2 tracking-[0.04em]" style={{ color: a.ink }}>{role}</p>
        {bio && <p className="t-body mt-5 text-[0.98rem]">{bio}</p>}
        {skills.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Yoʻnalishlar">
            {skills.map((s, i) => (
              <li key={i} className="tm-chip">{s}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
};
