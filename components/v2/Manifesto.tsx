import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useMotionReduced } from './utils';
import { useStore } from '../../store/useStore';

const TEXT =
  'Har bir kurs real loyiha bilan tugaydi: sayt, Telegram bot, brend, video yoki moliyaviy hisobot. ' +
  'Darslar kichik guruhlarda, amaliyotchi ustozlar bilan oʻtadi. Siz bizdan sertifikat bilan birga portfolio olib chiqasiz.';

const Word: React.FC<{ p: MotionValue<number>; start: number; end: number; children: string }> = ({ p, start, end, children }) => {
  const opacity = useTransform(p, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  );
};

export const Manifesto: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = TEXT.split(' ');

  return (
    <section className="relative py-[18vh]" aria-labelledby="manifesto-k">
      <div className="wrap">
        <p id="manifesto-k" className="t-kicker mb-10">03 — Yondashuv</p>
        <div ref={ref}>
          <p className="t-h2 max-w-[22ch] sm:max-w-[26ch]" style={{ fontWeight: 600 }}>
            {reduced
              ? TEXT
              : words.map((w, i) => (
                  <Word key={i} p={scrollYProgress} start={i / words.length} end={(i + 1.5) / words.length}>
                    {w}
                  </Word>
                ))}
          </p>
        </div>
      </div>
    </section>
  );
};

export const Numbers: React.FC = () => {
  const { courses } = useStore();
  const categories = new Set(courses.map((c) => c.category)).size || 4;
  const stats = [
    { n: '2019', label: 'yildan beri yoshlarni oʻqitamiz', ink: 'ink-blue' },
    { n: String(courses.length || 14), label: 'ta kurs — boshlangʻichdan kasbgacha', ink: 'ink-cyan' },
    { n: String(categories), label: 'yoʻnalish: IT, media, moliya, bolalar', ink: 'ink-green' },
    { n: '7+', label: 'yoshdan boshlab qabul qilamiz', ink: '' },
  ];

  return (
    <section className="relative pb-[14vh]" aria-label="DATA raqamlarda">
      <div className="wrap">
        <dl className="grid grid-cols-2 lg:grid-cols-4 hairline">
          {stats.map((s, i) => (
            <motion.div
              key={s.n + i}
              className="pt-8 pb-2 pr-6 lg:border-l lg:pl-8 first:lg:border-l-0 first:lg:pl-0"
              style={{ borderColor: 'var(--line)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className={`block mono ${s.ink}`} style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 500 }}>
                  {s.n}
                </span>
                <span className="block t-body mt-4 max-w-[16rem]">{s.label}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};
