import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { Mask, Star3D } from '../../fx';
import { uz, useMotionReduced } from '../../utils';
import { CAT_LABEL, CAT_ORDER, StarMark, type CatId } from './shared';
import { CourseCard } from './CourseCard';

type Filter = 'all' | CatId;

export const CoursesCatalog: React.FC = () => {
  const { courses } = useStore();
  const reduced = useMotionReduced();
  const [cat, setCat] = useState<Filter>('all');

  const list = cat === 'all' ? courses : courses.filter((c) => c.category === cat);
  const count = (id: Filter) => (id === 'all' ? courses.length : courses.filter((c) => c.category === id).length);
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Barcha kurslar' },
    ...CAT_ORDER.filter((id) => count(id) > 0).map((id) => ({ id, label: CAT_LABEL[id] })),
  ];

  return (
    <>
      <Hero total={courses.length} reduced={reduced} />

      <section id="katalog" className="relative pb-[10vh] scroll-mt-20" aria-label="Kurslar katalogi">
        <div className="wrap">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div role="group" aria-label="Yoʻnalish boʻyicha filtr" className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const on = cat === f.id;
                return (
                  <button key={f.id} type="button" className="chip" data-cat={f.id} aria-pressed={on} onClick={() => setCat(f.id)}>
                    {on && (
                      <motion.span
                        layoutId="chip-bg"
                        className="chip-bg"
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    {f.id !== 'all' && <span className="chip-dot" aria-hidden="true" />}
                    {uz(f.label)}
                    <span className="chip-n" aria-hidden="true">{count(f.id)}</span>
                  </button>
                );
              })}
            </div>
            <p className="t-kicker" role="status" aria-live="polite">
              {list.length} ta kurs
            </p>
          </div>

          {list.length === 0 ? (
            <p className="t-lead mt-16">Bu yoʻnalishda hozircha kurs yoʻq.</p>
          ) : (
            <ul key={cat} className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((c, i) => (
                <React.Fragment key={c.id}>
                  <motion.li
                    className="min-w-0"
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.min(i, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CourseCard course={c} index={i} />
                  </motion.li>
                  {i === Math.min(5, list.length - 1) && (
                    <li className="sm:col-span-2 xl:col-span-3">
                      <UndecidedBand reduced={reduced} />
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </section>

    </>
  );
};

// ---------------------------------------------------------------- hero
const Hero: React.FC<{ total: number; reduced: boolean }> = ({ total, reduced }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOp = useTransform(scrollYProgress, [0, 0.7], [1, 0.15]);
  const ghostX = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const starP = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const still = useMotionValue(0.5);

  return (
    <section ref={ref} className="relative flex min-h-[82svh] items-center overflow-hidden pb-16 pt-28 lg:pb-24" aria-labelledby="kurslar-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 78% 28%, rgba(0,97,255,.2), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(96,239,255,.07), transparent 70%)' }}
      />
      <motion.span
        aria-hidden="true"
        className="cx-ghost mono pointer-events-none absolute -right-[4%] bottom-[-2%] select-none"
        style={reduced ? undefined : { x: ghostX, y: ghostY }}
      >
        {String(total).padStart(2, '0')}
      </motion.span>
      <Star3D progress={reduced ? still : starP} spin={50} className="pointer-events-none absolute -right-[2%] top-[14%] hidden aspect-square w-[min(26rem,30vw)] opacity-80 lg:block" />

      <div className="wrap relative z-10">
        <motion.div style={reduced ? undefined : { y: copyY, opacity: copyOp }}>
          <p className="t-kicker mb-6">Katalog — {total} ta kurs</p>
          <Mask>
            <h1 id="kurslar-title" className="cx-title max-w-[11ch]">
              Barcha <span className="ink-grad">kurslar</span>
            </h1>
          </Mask>
          <p className="t-lead mt-8 max-w-[34rem]">
            {uz("O'zingizga mos yo'nalishni tanlang va kelajak kasbini biz bilan o'rganing. Amaliyotga asoslangan ta'lim va kuchli mutaxassislar sizni kutmoqda.")}
          </p>
          <div className="hero-cta mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#katalog" className="btn btn-primary">
              Kurslarni koʻrish <ArrowDown size={18} aria-hidden="true" />
            </a>
            <Link to="/karyera-testi" className="btn btn-ghost">
              Karyera testi
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------- "qaror qilmaganlar" bandi (grid o'rtasida)
const UndecidedBand: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-160, 160]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.2, 0.7]);
  return (
    <div ref={ref} className="panel relative flex flex-col items-start gap-6 overflow-hidden p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 120% at 0% 50%, rgba(0,97,255,.18), transparent 70%)' }}
      />
      <div className="relative flex items-start gap-5 md:items-center">
        <motion.span className="ink-cyan mt-1 shrink-0 md:mt-0" style={reduced ? undefined : { rotate, scale }} aria-hidden="true">
          <StarMark size={44} />
        </motion.span>
        <div>
          <h2 className="t-h3">Hali qaror qilmadingizmi?</h2>
          <p className="t-body mt-1.5 max-w-[34rem]">Karyera testi qiziqishlaringizni olti oʻlchovda baholab, sizga mos yoʻnalishni koʻrsatadi.</p>
          <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
            {[['≈12', 'daqiqa'], ['6', 'oʻlchov'], ['0', 'soʻm']].map(([n, l]) => (
              <li key={l} className="flex items-baseline gap-2"><span className="mono text-xl" style={{ fontWeight: 500 }}>{n}</span><span className="ink-3 text-sm">{l}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <Link to="/karyera-testi" className="btn btn-primary relative shrink-0">
        Testni boshlash <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
};

