import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { CountUp } from './fx';
import { uz, useMotionReduced } from './utils';
import { openConsult } from './consult';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ICON = (name: string) => `/images/v2/icons/${name}.webp`;
// 3D ikonkalar 48–80px da ko'rinadi: 192px `-sm` nusxa yetarli, to'liq 320px faqat katta DPR uchun
const ICON_SET = (name: string) => `/images/v2/icons/${name}-sm.webp 192w, /images/v2/icons/${name}.webp 320w`;

// ------------------------------------------------------------------ bento: raqamlar + vaʼdalar bitta toʻrda
// Matnlar saytda allaqachon aytilgan daʼvolardan olingan (Manifesto, Campus) — yangi raqam oʻylab topilmaydi.

type Tile =
  | { kind: 'stat'; n: number; from: number; suffix?: string; label: string; ink: string; span?: string; icon?: string }
  | { kind: 'claim'; title: string; text: string; icon: string; span?: string }
  | { kind: 'cta'; span?: string };

const TileIcon: React.FC<{ name: string; size?: string }> = ({ name, size = '' }) => (
  <img src={ICON(name)} srcSet={ICON_SET(name)} sizes="80px" alt="" aria-hidden="true" loading="lazy" decoding="async" width={240} height={240}
    className={`bento-icon ${size} object-contain select-none pointer-events-none`} />
);

// Telefonda (<640): raqamlar 2×2 ixcham kafel, vaʼda va CTA kartalari toʻliq kenglikda.
// sm+ dagi joylashuv (span) oʻzgarmaydi.
const spanCls = (t: Tile) => {
  if (t.kind === 'stat') return t.span ? 'col-span-1 sm:col-span-2' : '';
  if (t.kind === 'claim') return t.span ? 'col-span-2' : 'col-span-2 sm:col-span-1';
  return 'col-span-2';
};

export const ProofBento: React.FC = () => {
  const { courses } = useStore();
  const reduced = useMotionReduced();
  const categories = new Set(courses.map((c) => c.category)).size || 4;

  const tiles: Tile[] = [
    { kind: 'stat', n: 2019, from: 2019, label: 'yildan beri yoshlarni oʻqitamiz', ink: 'ink-blue', span: 'col-span-2', icon: 'why-ustoz' },
    { kind: 'stat', n: courses.length || 14, from: 0, label: 'ta kurs — boshlangʻichdan kasbgacha', ink: 'ink-cyan' },
    { kind: 'stat', n: categories, from: 0, label: 'yoʻnalish: IT, media, moliya, bolalar', ink: 'ink-green' },
    { kind: 'claim', title: 'Kichik guruhlar', text: 'Savol berishga va amaliyotga vaqt yetadi.', icon: 'why-guruh' },
    { kind: 'claim', title: 'Har bir kurs real loyiha bilan tugaydi', text: 'Sayt, Telegram bot, brend, video yoki moliyaviy hisobot.', icon: 'why-loyiha', span: 'col-span-2' },
    { kind: 'stat', n: 7, from: 0, suffix: '+', label: 'yoshdan boshlab qabul qilamiz', ink: '', icon: 'why-kids' },
    { kind: 'claim', title: 'Amaliyotchi ustozlar', text: 'Darslarni oʻz sohasida ishlayotgan mutaxassislar oʻtadi.', icon: 'why-test' },
    { kind: 'claim', title: 'Sertifikat + portfolio', text: 'Kurs oxirida qoʻlingizda hujjat ham, koʻrsatadigan ish ham boʻladi.', icon: 'why-sertifikat' },
    { kind: 'cta', span: 'col-span-2' },
  ];

  return (
    <section className="relative sec" aria-label="DATA raqamlarda">
      <div className="wrap">
        <p className="t-kicker mb-8">02 — DATA raqamlarda</p>
        <ul className="bento grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 [grid-auto-flow:dense]">
          {tiles.map((t, i) => (
            <motion.li
              key={i}
              className={`bento-tile panel is-${t.kind} ${t.kind === 'cta' ? 'bento-cta' : ''} ${spanCls(t)}`}
              initial={reduced ? undefined : { opacity: 0, y: 28, scale: 0.98 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: EASE }}
            >
              {t.kind === 'stat' && (
                <div className="bento-stat flex h-full flex-col justify-between gap-3 sm:gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <CountUp to={t.n} from={t.from} suffix={t.suffix || ''} className={`bento-num block mono ${t.ink}`} />
                    {t.icon && <TileIcon name={t.icon} size="hidden sm:block sm:w-20 sm:h-20 sm:-mt-2 sm:-mr-2" />}
                  </div>
                  <p className="t-body max-w-[18rem]">{t.label}</p>
                </div>
              )}
              {t.kind === 'claim' && (
                <div className="bento-claim">
                  <TileIcon name={t.icon} />
                  <div className="min-w-0">
                    <h3 className="bento-title">{t.title}</h3>
                    <p className="t-body bento-text mt-2">{t.text}</p>
                  </div>
                </div>
              )}
              {t.kind === 'cta' && (
                <div className="relative flex h-full flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                  <div>
                    <p className="t-kicker !text-white/70 mb-3">Bepul</p>
                    <h3 className="bento-title !text-white max-w-[20ch]">Qaysi kurs mos — hali bilmayapsizmi?</h3>
                    <p className="mt-2 text-white/80 text-[0.95rem] max-w-[34ch]">Menejer 1 ish kuni ichida qoʻngʻiroq qilib, mos kurs va jadvalni tanlab beradi.</p>
                  </div>
                  <button type="button" onClick={() => openConsult()} className="btn bento-cta-btn shrink-0">
                    Konsultatsiya olish <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ kurslar lentasi (kinetik tipografiya)
const CAT_EMOJI: Record<string, string> = { programming: '💻', media: '🎬', finance: '📊', kids: '🤖' };

export const CourseMarquee: React.FC = () => {
  const { courses } = useStore();
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  if (!courses.length) return null;
  const items = courses.map((c) => ({ id: c.id, title: uz(tField(c.title)), emoji: CAT_EMOJI[c.category] || '✦' }));
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];

  return (
    <Link to="/kurslar" className="marquee-band block py-6 sm:py-14 overflow-hidden" aria-label="Barcha kurslarni koʻrish">
      {rows.map((row, r) => (
        <div key={r} className={`marquee-row ${r ? 'is-rev' : ''} ${reduced ? 'is-still' : ''}`} aria-hidden="true">
          {[0, 1].map((dup) => (
            <div key={dup} className="marquee-track">
              {row.map((it) => (
                <span key={it.id + dup} className={`marquee-item ${r ? 'is-outline' : ''}`}>
                  <span className="marquee-emoji">{it.emoji}</span>
                  {it.title}
                  <svg viewBox="0 0 24 24" className="marquee-star" aria-hidden="true"><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" /></svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </Link>
  );
};

// ------------------------------------------------------------------ jarayon: arizadan guruhgacha
const STEPS = [
  { icon: 'step-ariza', title: 'Ariza qoldirasiz', text: 'Ism va telefon raqam — 30 soniyalik ish.' },
  { icon: 'step-qongiroq', title: 'Menejer qoʻngʻiroq qiladi', text: '1 ish kuni ichida maqsadingizni soʻrab, mos kursni tavsiya qiladi.' },
  { icon: 'step-guruh', title: 'Guruh va jadval', text: 'Sizga qulay vaqtdagi guruhga yozilib, oʻqishni boshlaysiz.' },
];

export const StartSteps: React.FC = () => {
  const reduced = useMotionReduced();
  return (
    <ol className="start-steps mt-12 grid gap-3">
      {STEPS.map((s, i) => (
        <motion.li
          key={s.title}
          className="start-step"
          initial={reduced ? undefined : { opacity: 0, x: -24 }}
          whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
        >
          <img src={ICON(s.icon)} srcSet={ICON_SET(s.icon)} sizes="72px" alt="" aria-hidden="true" loading="lazy" decoding="async" width={160} height={160} className="bento-icon w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] object-contain shrink-0" />
          <div className="min-w-0">
            <p className="mono text-[0.75rem] ink-cyan tracking-[0.12em]">{String(i + 1).padStart(2, '0')}</p>
            <p className="font-semibold text-[1.05rem] leading-snug mt-0.5">{s.title}</p>
            <p className="t-body !text-[0.92rem] mt-1">{s.text}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
};

// mobil pastki CTA paneli endi alohida: ./MobileCtaBar (App.tsx › PublicLayout)
