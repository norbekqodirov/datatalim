import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../i18n';
import { uz, useIsDesktop, useMotionReduced } from '../../utils';
import { Mask, ScrollText, Star3D } from '../../fx';
import { Reveal } from '../blog/Reveal';
import { Star4 } from '../blog/Star';
import { Icon3D } from '../Icon3D';
import { LANGUAGE_COURSES, MOCK_TESTS, SUNDAY_EVENTS, type LangCourse } from './data';
import './languages.css';

// Decorative letterforms for each language tile (not copy: aria-hidden).
const GLYPH: Record<string, string> = { english: 'Aa', russian: 'Яя', korean: '한', german: 'Ää' };
const ACC = ['var(--blue-ink)', 'var(--cyan-ink)', 'var(--green-ink)', 'var(--blue-ink)'];
const pad = (n: number) => String(n + 1).padStart(2, '0');

// ------------------------------------------------------------------ hero
export const LangHero: React.FC<{ onEnroll: () => void }> = ({ onEnroll }) => {
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const lift = [
    useTransform(scrollYProgress, [0, 1], [0, -30]),
    useTransform(scrollYProgress, [0, 1], [0, -90]),
    useTransform(scrollYProgress, [0, 1], [0, -60]),
    useTransform(scrollYProgress, [0, 1], [0, -130]),
  ];

  return (
    <header ref={ref} className="relative overflow-hidden pt-32 sm:pt-40 pb-[10vh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 78% 28%, rgba(0,97,255,.18), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(96,239,255,.07), transparent 70%)' }}
      />
      <div className="wrap relative grid lg:grid-cols-12 gap-14 lg:gap-8 items-center">
        <div className="lg:col-span-7 relative z-10">
          <p className="t-kicker mb-7 flex items-center gap-3">
            <Star4 className="w-3.5 h-3.5 ink-cyan" /> DATA Languages Academy
          </p>
          <Mask>
            <h1 className="t-hero lang-h1">
              Barcha dunyo tillari <span className="ink-grad">bitta joyda</span>
            </h1>
          </Mask>
          <p className="t-lead mt-8 max-w-[36rem]">
            {uz("DATA bilan zamonaviy usulda, ko'ngilochar tadbirlar va maxsus mock testlar orqali xorijiy tillarni tez va onson o'rganing.")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={onEnroll} className="btn btn-primary">
              Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a href="#kurslar" className="btn btn-ghost">Til kurslari</a>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          {!reduced && (
            <Star3D
              progress={scrollYProgress}
              layers={7}
              spin={50}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64%] max-w-[18rem] aspect-square opacity-50 lg:w-[min(26vw,360px)] lg:max-w-none lg:opacity-60"
            />
          )}
          <ul className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {LANGUAGE_COURSES.map((c, i) => (
              <motion.li key={c.id} style={reduced ? undefined : { y: lift[i % 4] }} className={i % 2 ? 'mt-8' : ''}>
                <a href={`#${c.id}`} className="lang-tile" style={{ ['--acc' as string]: ACC[i % 4] }}>
                  <span className="glyph" aria-hidden="true">{GLYPH[c.id] || 'A'}</span>
                  <span className="mono text-[0.75rem] ink-3">{pad(i)}</span>
                  <span className="mt-1 text-[1.15rem] sm:text-[1.3rem] font-semibold tracking-[-0.02em]">{uz(tField(c.title))}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

// ------------------------------------------------------------------ courses (sticky stack on desktop)
const CourseCard: React.FC<{ course: LangCourse; i: number; last: boolean; onEnroll: (name: string) => void }> = ({ course, i, last, onEnroll }) => {
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const desktop = useIsDesktop('(min-width: 1024px) and (min-height: 640px)');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const gy = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const stack = desktop && !reduced && !last;
  const title = uz(tField(course.title));

  return (
    <motion.article
      ref={ref}
      id={course.id}
      aria-labelledby={`${course.id}-t`}
      className="lang-card scroll-mt-28"
      style={{ ['--i' as string]: i, ['--acc' as string]: ACC[i % 4], scale: stack ? scale : 1 } as React.CSSProperties}
    >
      <span className="glow" aria-hidden="true" />
      <motion.span className="big-glyph" aria-hidden="true" style={reduced ? undefined : { y: gy }}>
        {GLYPH[course.id] || 'A'}
      </motion.span>
      <div className="relative grid lg:grid-cols-12 gap-8 p-7 sm:p-10 lg:p-14 min-h-full">
        <div className="lg:col-span-8 flex flex-col">
          <p className="mono text-[0.8125rem] flex items-center gap-3" style={{ color: 'var(--acc)' }}>
            <Star4 className="w-3 h-3" /> {pad(i)} / {pad(LANGUAGE_COURSES.length - 1)}
          </p>
          <h3 id={`${course.id}-t`} className="lang-name mt-5">{title}</h3>
          <p className="t-lead mt-6 max-w-[34rem]">{uz(tField(course.desc))}</p>
          <div className="mt-8 lg:mt-auto lg:pt-10 flex flex-wrap items-center gap-4">
            <span className="lang-level">
              <i aria-hidden="true" />
              <span><span className="ink-3">Daraja:</span> {uz(tField(course.level))}</span>
            </span>
            <button type="button" onClick={() => onEnroll(tField(course.title))} className="btn btn-primary">
              Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const LangCourses: React.FC<{ onEnroll: (name: string) => void }> = ({ onEnroll }) => (
  <section id="kurslar" aria-labelledby="kurslar-title" className="relative py-[8vh] scroll-mt-20">
    <div className="wrap">
      <div className="mb-10 lg:mb-14 grid lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <p className="t-kicker mb-6">Kurslar</p>
          <Mask>
            <h2 id="kurslar-title" className="t-h2">
              Til <span className="ink-grad">kurslari</span>
            </h2>
          </Mask>
        </div>
      </div>
      <div className="lang-stack grid gap-6">
        {LANGUAGE_COURSES.map((c, i) => (
          <CourseCard key={c.id} course={c} i={i} last={i === LANGUAGE_COURSES.length - 1} onEnroll={onEnroll} />
        ))}
      </div>
    </div>
  </section>
);

// ------------------------------------------------------------------ mock tests
export const MockTests: React.FC = () => {
  const { tField } = useLanguage();
  return (
    <section aria-labelledby="mock-title" className="relative py-[12vh]">
      <div className="wrap grid lg:grid-cols-12 gap-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="t-kicker mb-6 flex items-center gap-3">
              <Star4 className="w-3.5 h-3.5 ink-green" /> Mock
            </p>
            <Mask>
              <h2 id="mock-title" className="t-h2">Bepul Mock <span className="ink-grad">Testlar</span></h2>
            </Mask>
            <p className="t-lead mt-6 max-w-[28rem]">
              {uz("Bu testlar o'quvchilarimizga imtihondan oldin kuchli tayyorgarlik ko'rish va uni muvaffaqiyatli topshirishga yordam beradi.")}
            </p>
          </div>
        </div>
        <ul className="lg:col-span-7 grid gap-4">
          {MOCK_TESTS.map((t, i) => (
            <Reveal as="li" key={i} delay={i * 0.06}>
              <article className="panel row-card flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
                {t.art ? (
                  <Icon3D name={t.art} size={56} className="w-14 h-14" />
                ) : (
                  <span className="icon-tile" aria-hidden="true"><t.icon size={28} /></span>
                )}
                <div className="min-w-0">
                  <p className="mono text-[0.8125rem] ink-3">{pad(i)}</p>
                  <h3 className="t-h3 mt-2 break-words">{uz(tField(t.title))}</h3>
                  <p className="t-body mt-3">{uz(tField(t.desc))}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ sunday events
const EventRow: React.FC<{ i: number; title: string; desc: string; Icon: React.ElementType }> = ({ i, title, desc, Icon }) => {
  const reduced = useMotionReduced();
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.55'] });
  const opacity: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0.28, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [24, 0]);
  return (
    <motion.li ref={ref} className="event-row hairline py-7 sm:py-8 grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8 gap-y-2" style={reduced ? undefined : { opacity, x }}>
      <span className="icon-tile" aria-hidden="true"><Icon size={28} /></span>
      <div className="min-w-0">
        <p className="mono text-[0.8125rem] ink-3">{pad(i)}</p>
        <h3 className="t-h3 mt-1 break-words">{title}</h3>
        <p className="t-body mt-3 max-w-[40rem]">{desc}</p>
      </div>
    </motion.li>
  );
};

export const SundayEvents: React.FC = () => {
  const { tField } = useLanguage();
  return (
    <section aria-labelledby="events-title" className="relative py-[12vh]">
      <div className="wrap grid lg:grid-cols-12 gap-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="t-kicker mb-6 flex items-center gap-3">
              <Star4 className="w-3.5 h-3.5 ink-cyan" /> Sunday event
            </p>
            <Mask>
              <h2 id="events-title" className="t-h2">Koʻngilochar <span className="ink-grad">tadbirlar</span></h2>
            </Mask>
            <p className="t-lead mt-6 max-w-[30rem]">
              {uz("Dam olish kunini maroqli va zavqli o'tkazish uchun har yakshanba ")}
              <span style={{ color: 'var(--fg)' }}>{uz('"Sunday event"')}</span>
              {uz(" lar tashkil etilgan. Ushbu tadbirlar nafaqat dam olish, balki yangi do'stlar orttirish, muloqot ko'nikmalarini rivojlantirish va til o'rganishga bo'lgan qiziqishni orttiradi.")}
            </p>
          </div>
        </div>
        <ul className="lg:col-span-7" style={{ borderBottom: '1px solid var(--line)' }}>
          {SUNDAY_EVENTS.map((e, i) => (
            <EventRow key={i} i={i} title={uz(tField(e.title))} desc={uz(tField(e.desc))} Icon={e.icon} />
          ))}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ closing
export const LangClosing: React.FC<{ onEnroll: () => void }> = ({ onEnroll }) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useMotionReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section ref={ref} aria-labelledby="lang-close" className="relative overflow-hidden py-[16vh]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 55% at 50% 100%, rgba(0,97,255,.2), transparent 70%)' }} />
      {!reduced && (
        <Star3D
          progress={scrollYProgress}
          layers={7}
          spin={70}
          className="pointer-events-none absolute right-[4vw] top-[8%] hidden sm:block sm:top-1/2 sm:-translate-y-1/2 sm:w-[min(26vw,360px)] sm:h-[min(26vw,360px)] opacity-40 sm:opacity-50"
        />
      )}
      <div className="wrap relative">
        <h2 id="lang-close" className="t-caption max-w-[18ch]">
          <ScrollText text="Har bir muvaffaqiyat biz uchun muhim!" />
        </h2>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={onEnroll} className="btn btn-primary">
            Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
          </button>
          <Link to="/kurslar" className="btn btn-ghost">Barcha kurslar</Link>
        </div>
      </div>
    </section>
  );
};
