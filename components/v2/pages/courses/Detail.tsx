import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Phone, Users, Layers, Award } from 'lucide-react';
import type { Course } from '../../../../data/courses';
import { useStore } from '../../../../store/useStore';
import { useLanguage } from '../../../../i18n';
import { CountUp, Mask } from '../../fx';
import { uz, useMotionReduced } from '../../utils';
import { CAT_LABEL, Cover, SectionHead, StarMark, countLessons, splitDuration, splitPrice } from './shared';
import { Timeline } from './Timeline';
import { CourseCard } from './CourseCard';

/** Elementning ko'rinish holati (IntersectionObserver). */
function useVisible<T extends Element>(ref: React.RefObject<T | null>, initial = true, countAbove = false): boolean {
  const [vis, setVis] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting || (countAbove && e.boundingClientRect.top < 0)), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return vis;
}

const PriceFig: React.FC<{ raw: string; className?: string }> = ({ raw, className }) => {
  const p = splitPrice(raw);
  return (
    <span className={className}>
      {p.num}
      {p.unit && <span className="ink-3 ml-1.5 text-[0.5em]">{p.unit}</span>}
    </span>
  );
};

type OpenModal = (type: 'enroll' | 'consult') => void;

export const CourseDetailView: React.FC<{ course: Course; onOpen: OpenModal }> = ({ course, onOpen }) => {
  const onEnroll = () => onOpen('enroll');
  const onConsult = () => onOpen('consult');
  const { tField } = useLanguage();
  const { courses, siteContent } = useStore();
  const reduced = useMotionReduced();
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLElement>(null);
  const ctaVisible = useVisible(heroCtaRef, true);
  const closingVisible = useVisible(closingRef, false, true);

  const title = uz(tField(course.title));
  const phone = siteContent?.contactPhone || '+998 62 227-72-22';
  const tel = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const total = tField(course.totalPrice);
  const monthly = tField(course.monthlyPrice);
  const discount = course.discountPrice ? tField(course.discountPrice) : '';
  const related = courses.filter((c) => c.category === course.category && c.id !== course.id).slice(0, 3);
  const showBar = !ctaVisible && !closingVisible;

  return (
    <div data-cat={course.category} className="cd-page pb-24 lg:pb-0">
      <Hero course={course} onEnroll={onEnroll} onConsult={onConsult} ctaRef={heroCtaRef} reduced={reduced} phone={phone} tel={tel} />

      <Outcomes course={course} reduced={reduced} />

      <div className="wrap pb-[var(--sec-y)] pt-[var(--sec-y)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 space-y-16 lg:col-span-8 lg:space-y-24">
            {course.modules.length > 0 && (
              <section aria-labelledby="plan-title">
                <SectionHead kicker="02 — Dastur" id="plan-title">Dars rejasi</SectionHead>
                <p className="mono ink-3 mt-4 text-sm">
                  {course.modules.length} modul · {countLessons(course)} ta dars
                </p>
                <div className="mt-8">
                  <Timeline modules={course.modules} />
                </div>
              </section>
            )}

            {course.mentors.length > 0 && (
              <section aria-labelledby="mentors-title">
                <SectionHead kicker="03 — Ustozlar" id="mentors-title">Kurs ustozlari</SectionHead>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {course.mentors.map((m, i) => {
                    const name = uz(tField(m.name));
                    const bio = m.bio ? uz(tField(m.bio)) : '';
                    return (
                      <motion.li
                        key={i}
                        className="panel flex items-start gap-5 p-5 sm:p-6"
                        initial={reduced ? false : { opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                        transition={{ duration: 0.7, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="mentor-av">
                          {m.image ? (
                            <img src={m.image} alt={name} loading="lazy" decoding="async" width={72} height={72} />
                          ) : (
                            <span className="cat-ink text-xl font-semibold" aria-hidden="true">{name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.02em]">{name}</h3>
                          <p className="cat-ink mt-1 text-[0.95rem] font-medium">{uz(tField(m.role))}</p>
                          {bio && <p className="t-body mt-3 text-[0.95rem]">{bio}</p>}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* desktop: yopishqoq yozilish kartasi */}
          <aside className="hidden lg:col-span-4 lg:block" aria-label="Kursga yozilish">
            <div className="sticky top-24">
              <div className="panel relative overflow-hidden p-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'radial-gradient(70% 55% at 100% 0%, color-mix(in srgb, var(--cat) 20%, transparent), transparent 70%)' }}
                />
                <div className="relative">
                  <p className="t-kicker">Jami kurs narxi</p>
                  {discount ? (
                    <>
                      <p className="mono mt-3 text-[1.9rem] leading-none" style={{ fontWeight: 500 }}>
                        <PriceFig raw={discount} />
                      </p>
                      <p className="mono ink-3 mt-2 text-sm line-through">{uz(total)}</p>
                    </>
                  ) : (
                    <p className="mono mt-3 text-[1.9rem] leading-none" style={{ fontWeight: 500 }}>
                      <PriceFig raw={total} />
                    </p>
                  )}
                  <dl className="mt-6 space-y-3">
                    <div className="hairline flex items-baseline justify-between gap-4 pt-3">
                      <dt className="ink-2 text-[0.95rem]">Davomiyligi</dt>
                      <dd className="mono text-right text-[0.95rem]">{splitDuration(tField(course.duration)).main}</dd>
                    </div>
                    <div className="hairline flex items-baseline justify-between gap-4 pt-3">
                      <dt className="ink-2 text-[0.95rem]">Oylik toʻlov</dt>
                      <dd className="mono text-right text-[0.95rem]">{uz(monthly)}</dd>
                    </div>
                  </dl>
                  <button type="button" onClick={onEnroll} className="btn btn-primary mt-7 w-full">
                    Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={onConsult} className="btn btn-ghost mt-3 w-full">
                    Bepul konsultatsiya
                  </button>
                  <p className="mt-4 text-center text-[0.9rem]" style={{ color: 'var(--fg-2)' }}>
                    Yoki qoʻngʻiroq qiling:{' '}
                    <a href={tel} className="mono inline-flex min-h-[44px] items-center underline underline-offset-4">{phone}</a>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Format />

      {related.length > 0 && (
        <section className="relative pb-[var(--sec-y)]" aria-labelledby="related-title">
          <div className="hairline" aria-hidden="true" />
          <div className="wrap pt-[var(--sec-y)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHead kicker={`${uz(CAT_LABEL[course.category])} — davomi`} id="related-title">
                Shu yoʻnalishdagi <span className="ink-grad">boshqa kurslar</span>
              </SectionHead>
              <Link to="/kurslar" className="link-arrow min-h-[44px] shrink-0">
                Barcha kurslar <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-8 grid gap-3.5 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {related.map((c, i) => (
                <li key={c.id} className="min-w-0">
                  <CourseCard course={c} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Closing ref={closingRef} course={course} title={title} onEnroll={onEnroll} onConsult={onConsult} phone={phone} tel={tel} reduced={reduced} />

      {/* mobil: pastki yozilish paneli */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            className="enroll-bar lg:hidden"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto flex max-w-xl items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="t-kicker truncate" style={{ fontSize: '0.6875rem' }}>Oylik toʻlov</p>
                <p className="mono truncate text-[1.1rem]" style={{ fontWeight: 500 }}>{uz(monthly)}</p>
              </div>
              <button type="button" onClick={onEnroll} className="btn btn-primary !min-h-[48px] shrink-0">
                Kursga yozilish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------------- hero
const Hero: React.FC<{
  course: Course;
  onEnroll: () => void;
  onConsult: () => void;
  ctaRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean;
  phone: string;
  tel: string;
}> = ({ course, onEnroll, onConsult, ctaRef, reduced, phone, tel }) => {
  const { tField } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: hp } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(hp, [0, 1], [0, -70]);
  const textOp = useTransform(hp, [0, 0.65], [1, 0.2]);
  const coverY = useTransform(hp, [0, 1], [0, 48]);
  const coverScale = useTransform(hp, [0, 1], [1, 0.88]);
  const coverRot = useTransform(hp, [0, 1], [0, -9]);
  const starSpin = useTransform(hp, [0, 1], [0, 220]);

  const dur = splitDuration(tField(course.duration));
  const discount = course.discountPrice ? tField(course.discountPrice) : '';
  const total = tField(course.totalPrice);
  const monthly = splitPrice(tField(course.monthlyPrice));
  const lessons = countLessons(course);

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 sm:pt-28" aria-labelledby="course-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(52% 46% at 78% 22%, color-mix(in srgb, var(--cat) 24%, transparent), transparent 70%)' }}
      />
      <div className="wrap relative z-10">
        <Link to="/kurslar" className="link-arrow ink-2 min-h-[44px]" style={{ color: 'var(--fg-2)' }}>
          <ArrowLeft size={16} aria-hidden="true" /> Barcha kurslarga qaytish
        </Link>

        <div className="mt-4 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <motion.div className="min-w-0 lg:col-span-7" style={reduced ? undefined : { y: textY, opacity: textOp }}>
            <p className="t-kicker cat-ink mb-4">{uz(CAT_LABEL[course.category])}</p>
            <Mask>
              <h1 id="course-title" className="cd-title max-w-[16ch]">{uz(tField(course.title))}</h1>
            </Mask>
            <p className="t-lead mt-5 max-w-[36rem]">{uz(tField(course.description))}</p>
            <div ref={ctaRef} className="hero-cta mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onEnroll} className="btn btn-primary">
                Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={onConsult} className="btn btn-ghost">
                Bepul konsultatsiya
              </button>
            </div>
            <p className="mt-4 text-[0.95rem]" style={{ color: 'var(--fg-2)' }}>
              <Phone size={15} className="mr-2 inline align-[-2px]" aria-hidden="true" />
              <a href={tel} className="mono inline-flex min-h-[44px] items-center underline underline-offset-4">{phone}</a>
            </p>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[22rem] lg:col-span-5 lg:max-w-[24rem] lg:justify-self-center" style={{ perspective: '1400px' }}>
            <motion.div
              className="relative"
              initial={reduced ? false : { opacity: 0, y: 40, rotateY: 14 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div style={reduced ? undefined : { y: coverY, scale: coverScale, rotateY: coverRot }}>
                <div className="cd-cover">
                  <Cover src={course.coverImage} alt={uz(tField(course.title))} eager className="absolute inset-0" />
                </div>
              </motion.div>
              <motion.span
                aria-hidden="true"
                className="ink-cyan absolute -right-3 -top-3 sm:-right-5 sm:-top-5"
                style={reduced ? undefined : { rotate: starSpin }}
              >
                <StarMark size={52} />
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* asosiy ko'rsatkichlar */}
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:mt-14 lg:grid-cols-4" style={{ background: 'var(--line-2)' }}>
          <div className="fact">
            <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Davomiyligi</dt>
            <dd className="mt-3">
              <span className="fact-v mono block">{dur.main}</span>
              {dur.note && <span className="ink-3 mt-1.5 block text-[0.85rem] leading-snug">{dur.note}</span>}
            </dd>
          </div>
          <div className="fact">
            <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Oylik toʻlov</dt>
            <dd className="mt-3">
              <span className="fact-v mono block">
                {monthly.num}
                {monthly.unit && <span className="ink-3 ml-1.5 text-[0.5em]">{monthly.unit}</span>}
              </span>
            </dd>
          </div>
          <div className="fact">
            <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Jami kurs narxi</dt>
            <dd className="mt-3">
              {discount ? (
                <>
                  <PriceFig raw={discount} className="fact-v mono block" />
                  <span className="ink-3 mono mt-1.5 block text-[0.85rem] line-through">{uz(total)}</span>
                </>
              ) : (
                <PriceFig raw={total} className="fact-v mono block" />
              )}
            </dd>
          </div>
          <div className="fact">
            <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Dars rejasi</dt>
            <dd className="mt-3">
              <span className="fact-v mono block">
                <CountUp to={course.modules.length} /> modul
              </span>
              <span className="ink-3 mt-1.5 block text-[0.85rem] leading-snug">{lessons} ta dars</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------- yopuvchi blok
const Closing = React.forwardRef<
  HTMLElement,
  { course: Course; title: string; onEnroll: () => void; onConsult: () => void; phone: string; tel: string; reduced: boolean }
>(({ title, onEnroll, onConsult, phone, tel }, ref) => (
  <section ref={ref} className="relative overflow-hidden py-[var(--sec-y)]" aria-labelledby="close-title">
    <div className="hairline absolute inset-x-0 top-0" aria-hidden="true" />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(60% 70% at 50% 100%, color-mix(in srgb, var(--cat) 20%, transparent), transparent 70%)' }}
    />
    <div className="wrap relative z-10 text-center">
      <p className="t-kicker mb-4">Keyingi qadam</p>
      <Mask>
        <h2 id="close-title" className="t-h2 mx-auto max-w-[18ch] text-balance">
          {title} — <span className="ink-grad">kursga yoziling.</span>
        </h2>
      </Mask>
      <p className="t-lead mx-auto mt-6 max-w-[34rem]">Joy band qilish yoki savol berish uchun ariza qoldiring, administrator siz bilan bogʻlanadi.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onEnroll} className="btn btn-primary">
          Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={onConsult} className="btn btn-ghost">
          Bepul konsultatsiya
        </button>
      </div>
      <p className="mt-6 text-[0.95rem]" style={{ color: 'var(--fg-2)' }}>
        Yoki qoʻngʻiroq qiling:{' '}
        <a href={tel} className="mono inline-flex min-h-[44px] items-center underline underline-offset-4">{phone}</a>
      </p>
      <p className="mt-2">
        <Link to="/karyera-testi" className="link-arrow min-h-[44px]">
          Qaysi kasb sizga mos? Karyera testi <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </p>
    </div>
  </section>
));
Closing.displayName = 'Closing';

// ---------------------------------------------------------------- kurs oxirida nima qila olasiz (bento, faqat modul ma'lumotidan)
const Outcomes: React.FC<{ course: Course; reduced: boolean }> = ({ course, reduced }) => {
  const { tField } = useLanguage();
  const mods = course.modules;
  if (mods.length === 0 && course.technologies.length === 0) return null;
  const n = mods.length;
  const lastLg = n % 3 === 1 ? 'lg:col-span-3' : n % 3 === 2 ? 'lg:col-span-2' : '';
  const lastSm = n % 2 === 1 ? 'sm:col-span-2' : '';
  return (
    <section className="wrap pt-[var(--sec-y)]" aria-labelledby="out-title">
      <SectionHead kicker="01 — Natija" id="out-title">
        Kurs oxirida <span className="ink-grad">nima qila olasiz</span>
      </SectionHead>
      <p className="t-lead mt-4 max-w-[38rem]">Dasturdagi har bir modul alohida amaliy koʻnikmaga aylanadi.</p>
      {n > 0 && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {mods.map((m, i) => {
            const last = i === n - 1 && n > 1;
            return (
              <motion.li
                key={i}
                className={`out-card min-w-0 ${last ? `${lastSm} ${lastLg}`.trim() : ''}`}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="out-n mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="t-h3 mt-4 text-balance" style={{ fontSize: 'clamp(1.15rem, 1.6vw, 1.45rem)' }}>{uz(tField(m.title))}</h3>
                <p className="mono ink-3 mt-3 text-sm">{m.lessons.length} ta dars</p>
              </motion.li>
            );
          })}
        </ul>
      )}
      {course.technologies.length > 0 && (
        <div className="mt-8">
          <p className="t-kicker mb-4">Ishlatiladigan asboblar</p>
          <ul className="flex flex-wrap gap-3">
            {course.technologies.map((tech, i) => (
              <li key={`${tech}-${i}`} className="tech">
                <StarMark size={14} className="cat-ink" />
                {uz(tech)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

// ---------------------------------------------------------------- format (saytda allaqachon aytilgan umumiy tasdiqlar)
const FORMAT = [
  { Icon: Users, t: 'Kichik guruhlar', d: 'Darslar oflayn, kichik guruhlarda oʻtadi: ustoz har bir oʻquvchiga eʼtibor bera oladi.' },
  { Icon: Layers, t: 'Real loyiha', d: 'Har bir kurs amaliy loyiha bilan tugaydi, portfolio oʻqish davomida yigʻiladi.' },
  { Icon: Award, t: 'Sertifikat', d: 'Yakuniy imtihondan oʻtgan oʻquvchilarga DATA Taʼlim Stansiyasi sertifikati beriladi.' },
];
const Format: React.FC = () => (
  <section className="wrap pb-[var(--sec-y)]" aria-labelledby="fmt-title">
    <SectionHead kicker="04 — Format" id="fmt-title">Qanday <span className="ink-grad">oʻqiladi</span></SectionHead>
    <ul className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-3">
      {FORMAT.map(({ Icon, t, d }) => (
        <li key={t} className="out-card min-w-0">
          <span className="out-ico" aria-hidden="true"><Icon size={22} /></span>
          <h3 className="t-h3 mt-4" style={{ fontSize: 'clamp(1.15rem, 1.6vw, 1.45rem)' }}>{t}</h3>
          <p className="t-body mt-3 text-[0.975rem]">{d}</p>
        </li>
      ))}
    </ul>
  </section>
);
