import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Star3D, ScrollText, CountUp } from './fx';
import { useStore } from '../../store/useStore';

const TEXT =
  'Har bir kurs real loyiha bilan tugaydi: sayt, Telegram bot, brend, video yoki moliyaviy hisobot. ' +
  'Darslar kichik guruhlarda, amaliyotchi ustozlar bilan oʻtadi. Siz bizdan sertifikat bilan birga portfolio olib chiqasiz.';

export const Manifesto: React.FC = () => {
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start end', 'end start'] });

  return (
    <section ref={secRef} className="relative py-[18vh]" aria-labelledby="manifesto-k">
      {/* the hero's star keeps turning here: scroll-linked 3D object that carries the story over */}
      <Star3D progress={scrollYProgress} className="absolute -right-[4vw] top-[14%] w-[min(36vw,520px)] aspect-square opacity-[.9] pointer-events-none hidden md:block" />
      <div className="wrap relative">
        <p id="manifesto-k" className="t-kicker mb-10">03 — Yondashuv</p>
        <p className="t-h2 max-w-[22ch] sm:max-w-[26ch]" style={{ fontWeight: 600 }}>
          <ScrollText text={TEXT} />
        </p>
      </div>
    </section>
  );
};

export const Numbers: React.FC = () => {
  const { courses } = useStore();
  const categories = new Set(courses.map((c) => c.category)).size || 4;
  const stats = [
    { n: 2019, from: 2019, suffix: '', label: 'yildan beri yoshlarni oʻqitamiz', ink: 'ink-blue' },
    { n: courses.length || 14, from: 0, suffix: '', label: 'ta kurs — boshlangʻichdan kasbgacha', ink: 'ink-cyan' },
    { n: categories, from: 0, suffix: '', label: 'yoʻnalish: IT, media, moliya, bolalar', ink: 'ink-green' },
    { n: 7, from: 0, suffix: '+', label: 'yoshdan boshlab qabul qilamiz', ink: '' },
  ];

  return (
    <section className="relative pb-[14vh]" aria-label="DATA raqamlarda">
      <div className="wrap">
        <dl className="grid grid-cols-2 lg:grid-cols-4 hairline">
          {stats.map((s, i) => (
            <motion.div
              key={String(s.n) + i}
              className="pt-8 pb-2 pr-6 lg:border-l lg:pl-8 first:lg:border-l-0 first:lg:pl-0"
              style={{ borderColor: 'var(--line)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <CountUp to={s.n} from={s.from} suffix={s.suffix} className={`block mono ${s.ink}`} style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 500 }} />
                <span className="block t-body mt-4 max-w-[16rem]" aria-hidden="true">{s.label}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};
