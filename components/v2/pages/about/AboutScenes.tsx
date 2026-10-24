import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform, type UseInViewOptions } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Clock, Coffee, Award, Monitor, Phone, MapPin, Target, Users, Wifi, Zap, Heart, Globe, type LucideIcon } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { useLanguage } from '../../../../i18n';
import { uz, useMotionReduced } from '../../utils';
import { CountUp, Mask, ScrollText, Star3D } from '../../fx';
import { EnrollModal } from '../../../EnrollModal';
import './about.css';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STAR_PATH =
  'M28.06.91l2.46,10.03c1.5,6.09,6.25,10.85,12.35,12.35l10.03,2.46c1.21.3,1.21,2.02,0,2.31l-10.03,2.46c-6.09,1.5-10.85,6.25-12.35,12.35l-2.46,10.03c-.3,1.21-2.02,1.21-2.31,0l-2.46-10.03c-1.5-6.09-6.25-10.85-12.35-12.35L.91,28.06c-1.21-.3-1.21-2.02,0-2.31l10.03-2.46c6.09-1.5,10.85-6.25,12.35-12.35L25.75.91c.3-1.21,2.02-1.21,2.31,0Z';

export const StarGlyph: React.FC<{ size?: number | string; className?: string; color?: string; style?: React.CSSProperties }> = ({ size = 24, className, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 53.82 53.82" className={className} style={style} aria-hidden="true" focusable="false">
    <path fill={color} d={STAR_PATH} />
  </svg>
);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/** Fades/lifts its children in once (transform + opacity only). */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string }> = ({ children, delay = 0, y = 28, className }) => {
  const reduced = useMotionReduced();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/** True while the element crosses the middle band of the viewport. */
function useMid<T extends HTMLElement>(margin: UseInViewOptions['margin'] = '-40% 0px -40% 0px') {
  const ref = useRef<T>(null);
  const on = useInView(ref, { margin });
  return [ref, on] as const;
}

const lastWordSplit = (s: string): [string, string] => {
  const i = s.trim().lastIndexOf(' ');
  return i < 0 ? ['', s] : [s.slice(0, i + 1), s.slice(i + 1)];
};

// ------------------------------------------------------------------ 01 hero
export const AboutHero: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // the star starts facing front and turns as the hero scrolls away
  const starP = useTransform(scrollYProgress, [0, 1], [0.46, 1]);

  const [head, tail] = lastWordSplit(uz(tField(siteContent.aboutTitle)));
  const desc = uz(tField(siteContent.aboutDescription));

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center pt-28 pb-[12vh]" aria-labelledby="about-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(55% 50% at 78% 28%, rgba(0,97,255,.16), transparent 70%)' }} />
      <Star3D
        progress={starP}
        className="ab-star absolute -right-[22vw] top-[12%] w-[78vw] aspect-square pointer-events-none opacity-[.38] md:-right-[5vw] md:top-[10%] md:w-[min(44vw,620px)] md:opacity-90"
      />
      <motion.div className="wrap relative" style={reduced ? undefined : { y: textY, opacity: textOpacity }}>
        <p className="t-kicker mb-8">01 — Biz haqimizda</p>
        <Mask>
          <h1 id="about-title" className="t-display max-w-[16ch]">
            {head}
            <span className="ink-grad">{tail}</span>
          </h1>
        </Mask>
        <Reveal delay={0.25}>
          <p className="t-lead mt-8 max-w-[40rem]">{desc}</p>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/kurslar" className="btn btn-primary">
              Kurslarni koʻrish <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/karyera-testi" className="btn btn-ghost">Karyera testi</Link>
          </div>
        </Reveal>
      </motion.div>
      {!reduced && (
        <div className="scroll-hint absolute bottom-8 left-0 right-0 pointer-events-none" aria-hidden="true">
          <div className="wrap flex items-center gap-4">
            <span className="relative block w-px h-12 overflow-hidden" style={{ background: 'var(--line-2)' }}>
              <span className="ab-drip absolute inset-0 block" style={{ background: 'var(--cyan-ink)' }} />
            </span>
            <span className="t-kicker !text-[0.75rem]">Pastga</span>
          </div>
        </div>
      )}
    </section>
  );
};

// ------------------------------------------------------------------ 02 mission + founder
const GOALS = [
  "Zamonaviy va talabgir kasblarni o'rgatish",
  "O'quvchilarda mantiqiy va kreativ fikrlashni rivojlantirish",
  "Xalqaro standartlar asosida sifatli ta'lim berish",
  "Yoshlarni ish bilan ta'minlashga ko'maklashish",
];

export const MissionScene: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const quote = uz(tField(siteContent.aboutQuote)).replace(/^["“«]|["”»]$/g, '');
  const founder = uz(tField(siteContent.founderName));
  const founderTitle = uz(tField(siteContent.founderTitle));
  const reduced = useMotionReduced();
  const figRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: figRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section className="relative py-[16vh]" aria-labelledby="mission-k">
      <div className="wrap">
        <p id="mission-k" className="t-kicker mb-10">02 — Maqsad</p>
        {quote && (
          <p className="ab-statement">
            <ScrollText text={quote} />
          </p>
        )}
        <Reveal>
          <p className="t-lead mt-10 max-w-[44rem]">
            {uz("Biz nafaqat kasb o'rgatamiz, balki o'quvchilarimizning dunyoqarashini kengaytirib, ularni kelajak muammolariga yechim topa oladigan mutaxassislar qilib tayyorlaymiz.")}
          </p>
        </Reveal>

        <div className="mt-[12vh] grid lg:grid-cols-12 gap-x-12 gap-y-14 [&>*]:min-w-0">
          <ol className="lg:col-span-7 hairline flex flex-col">
            {GOALS.map((g, i) => (
              <motion.li
                key={g}
                className="flex items-baseline gap-6 py-7 border-b lg:flex-1 lg:items-center"
                style={{ borderColor: 'var(--line)' }}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
              >
                <span className="mono ink-blue text-sm shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="t-h3" style={{ fontWeight: 500 }}>{uz(g)}</span>
              </motion.li>
            ))}
          </ol>

          <figure ref={figRef} className="lg:col-span-5 lg:col-start-8 m-0">
            <div className="panel relative overflow-hidden aspect-[4/5] max-w-[26rem] lg:max-w-none">
              {siteContent.aboutImage ? (
                <motion.img
                  src={siteContent.aboutImage}
                  alt={founder}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-[112%] object-cover"
                  style={reduced ? undefined : { y: imgY, top: '-6%' }}
                />
              ) : (
                <>
                  <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 85% 0%, rgba(0,97,255,.38), transparent 70%), radial-gradient(70% 60% at 0% 100%, rgba(96,239,255,.14), transparent 70%)' }} />
                  <StarGlyph size="64%" color="var(--blue)" className="absolute -right-[14%] -top-[8%] opacity-30" />
                  <span aria-hidden="true" className="absolute left-7 top-7 t-h2 ink-grad">{initials(founder)}</span>
                </>
              )}
              {siteContent.aboutImage && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.78), transparent)' }} />}
              <figcaption className="absolute left-7 right-7 bottom-7" style={{ color: siteContent.aboutImage ? '#fff' : 'var(--fg)' }}>
                <span className="block t-h3">{founder}</span>
                <span className="block mt-1 text-sm" style={{ color: siteContent.aboutImage ? 'rgba(255,255,255,.82)' : 'var(--fg-2)' }}>{founderTitle}</span>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 03 numbers
export const AboutNumbers: React.FC = () => {
  const { courses } = useStore();
  const stats = [
    { n: 2019, from: 2019, suffix: '', label: 'yildan beri yoshlarni oʻqitamiz', ink: 'ink-blue' },
    { n: courses.length || 14, from: 0, suffix: '', label: 'ta kurs — boshlangʻichdan kasbgacha', ink: 'ink-cyan' },
    { n: 250, from: 0, suffix: '+', label: 'zamonaviy kompyuter: macOS va Windows', ink: 'ink-green' },
    { n: 1600, from: 0, suffix: '+', label: 'oʻquvchi sigʻimi: zamonaviy oʻquv xonalari', ink: '' },
  ];
  return (
    <section className="relative pb-[14vh]" aria-label="DATA raqamlarda">
      <div className="wrap">
        <dl className="grid grid-cols-2 lg:grid-cols-4 hairline">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="pt-8 pb-2 pr-6 lg:border-l lg:pl-8 first:lg:border-l-0 first:lg:pl-0"
              style={{ borderColor: 'var(--line)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <CountUp to={s.n} from={s.from} suffix={s.suffix} className={`block mono ${s.ink}`} style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 500 }} />
                <span className="block t-body mt-4 max-w-[16rem]" aria-hidden="true">{s.label}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 04 chronicle (sticky year + scrolling entries)
const ENTRIES = [
  {
    year: '2019',
    month: 'Sentyabr',
    title: "Xorazmda IT ekotizimini yaratish sari ilk qadam",
    content: "DATA Ta'lim Stansiyasi tashkil etilganda, bizning oldimizda katta bir savol bor edi: Xorazmda IT sohasini qanday rivojlantirish mumkin? Biz shunchaki o'quv markazi emas, balki yoshlar o'z g'oyalarini amalga oshira oladigan makon yaratishni niyat qildik.",
    author: 'Shahzod Sabirov',
  },
  {
    year: '2021',
    month: 'Mart',
    title: "Ta'limda sifat — eng asosiy mezon",
    content: "Biz uchun o'quvchilar soni emas, balki ularning sifati muhim. Har bir bitiruvchi o'z sohasida mustaqil ishlay oladigan darajaga yetishi kerak. Shuning uchun ham biz amaliyotga va real loyihalarga katta e'tibor qaratamiz.",
    author: 'DATA Jamoasi',
  },
  {
    year: '2023',
    month: 'Dekabr',
    title: "Kelajak kasblari va bizning mas'uliyatimiz",
    content: "Dunyo shiddat bilan o'zgarmoqda. Bugun o'rganilgan texnologiya ertaga eskirishi mumkin. Biz o'quvchilarimizga nafaqat kod yozishni, balki doimiy o'rganishni va moslashuvchanlikni o'rgatamiz. Bu ularning umrbod muvaffaqiyati garovidir.",
    author: "Metodika bo'limi",
  },
];

const Entry: React.FC<{ i: number; reduced: boolean; active: boolean; onEnter: (i: number) => void }> = ({ i, reduced, active, onEnter }) => {
  const e = ENTRIES[i];
  const [ref, mid] = useMid<HTMLLIElement>('-45% 0px -45% 0px');
  useEffect(() => {
    if (mid) onEnter(i);
  }, [mid, i, onEnter]);
  const lit = reduced || active;
  return (
    <li
      ref={ref}
      className="ab-row relative pl-9 lg:pl-12 py-10 lg:py-0 lg:min-h-[62vh] flex flex-col justify-center"
      style={{ opacity: lit ? 1 : 0.5, transform: reduced ? undefined : `translate3d(${lit ? 0 : 10}px,0,0)` }}
      aria-current={active ? 'true' : undefined}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
        style={{
          background: lit ? 'var(--cyan-ink)' : 'var(--bg)',
          border: `1.5px solid ${lit ? 'var(--cyan-ink)' : 'var(--line-2)'}`,
          boxShadow: lit ? '0 0 0 6px color-mix(in srgb, var(--cyan-ink) 18%, transparent)' : 'none',
          transition: 'all .45s cubic-bezier(.22,1,.36,1)',
        }}
      />
      <p className="mono ink-blue text-sm">{e.year}, {uz(e.month)}</p>
      <h3 className="t-h3 mt-4 max-w-[26ch]">{uz(e.title)}</h3>
      <p className="t-body mt-5 max-w-[34rem]">{uz(e.content)}</p>
      <p className="mt-6 text-sm ink-3">— {uz(e.author)}</p>
    </li>
  );
};

export const Chronicle: React.FC = () => {
  const reduced = useMotionReduced();
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress: along } = useScroll({ target: listRef, offset: ['start 0.55', 'end 0.55'] });
  const fill = useSpring(along, { stiffness: 140, damping: 26, mass: 0.4 });
  const onEnter = useCallback((i: number) => setActive(i), []);

  return (
    <section className="relative py-[14vh]" aria-labelledby="chron-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <p className="t-kicker mb-6">03 — Hikoya</p>
            <Mask>
              <h2 id="chron-title" className="t-h2 max-w-[20ch]">{uz("Bizning hikoyamiz va ta'limga bo'lgan qarashimiz")}</h2>
            </Mask>
          </div>
          <p className="t-lead max-w-md">{uz("DATA Jurnalidan: bizning qadriyatlarimiz va kelajak haqidagi o'ylarimizni ifodalovchi parchalar.")}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-x-14 gap-y-4 items-start">
          <div className="hidden lg:block lg:col-span-6 lg:sticky lg:top-[22vh] h-[50vh]" aria-hidden="true">
            <div className="relative h-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  className="ab-year mono ink-grad"
                  initial={reduced ? false : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -40 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {ENTRIES[active].year}
                </motion.div>
              </AnimatePresence>
              <span className="absolute left-0 bottom-0 flex gap-1.5 w-[70%]">
                {ENTRIES.map((_, i) => (
                  <span key={i} className="h-[3px] flex-1 rounded-full transition-colors duration-500" style={{ background: i <= active ? 'var(--cyan-ink)' : 'var(--line-2)' }} />
                ))}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative ml-1.5 lg:ml-0">
            <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'var(--line-2)' }} />
            <motion.span
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-px origin-top"
              style={{ scaleY: reduced ? 1 : fill, background: 'linear-gradient(180deg, var(--blue), var(--cyan))' }}
            />
            <ol ref={listRef} className="relative">
              {ENTRIES.map((e, i) => (
                <Entry key={e.year} i={i} reduced={reduced} active={active === i} onEnter={onEnter} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 05 "Stansiya"
export const StationScene: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section ref={ref} className="relative py-[18vh]" aria-labelledby="station-title">
      <Star3D progress={scrollYProgress} spin={70} className="ab-star absolute -right-[16vw] top-[10%] w-[60vw] aspect-square pointer-events-none opacity-[.3] md:-right-[4vw] md:w-[min(38vw,520px)] md:opacity-90" />
      <div className="wrap relative">
        <p className="t-kicker mb-8">04 — Nom</p>
        <Mask>
          <h2 id="station-title" className="t-h2 max-w-[16ch]">
            Nega aynan <span className="ink-grad">«Stansiya»</span>?
          </h2>
        </Mask>
        <p className="ab-statement mt-12" style={{ fontWeight: 500 }}>
          <ScrollText
            text={uz(
              "Stansiya — bu to'xtash joyi emas, balki yangi kuch to'plash va yo'nalishni aniqlab olish maskanidir. O'quvchilarimiz bu yerda bilim bilan \"to'yinadilar\" va katta hayot yo'liga ishonch bilan qadam qo'yadilar. Bu yerda turli taqdirlar kesishadi va yangi muvaffaqiyat hikoyalari boshlanadi.",
            )}
          />
        </p>
        <Reveal>
          <blockquote className="mt-16 max-w-[40rem] pl-6 border-l-2" style={{ borderColor: 'var(--cyan-ink)' }}>
            <p className="t-h3" style={{ fontWeight: 500 }}>
              {uz("«Ta'lim — bu kelajakka kiritilgan eng yaxshi sarmoyadir. Biz har bir o'quvchimizning muvaffaqiyati uchun mas'uliyatni his qilamiz.»")}
            </p>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 06 values
const VALUES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Zap, title: 'Innovatsiya', desc: "Har doim yangilikka intilish va eng so'nggi texnologiyalarni ta'limga tatbiq etish." },
  { icon: Heart, title: 'Sifat', desc: "Har bir dars va har bir loyihada eng yuqori sifat standartlariga amal qilish." },
  { icon: Target, title: 'Natija', desc: "Biz uchun eng muhimi — o'quvchilarimizning real yutuqlari va ish bilan ta'minlanishi." },
  { icon: Globe, title: 'Hamjamiyat', desc: "O'zaro yordam va bilim almashishga asoslangan kuchli IT hamjamiyatini yaratish." },
];

const ValueRow: React.FC<{ i: number; reduced: boolean }> = ({ i, reduced }) => {
  const v = VALUES[i];
  const Icon = v.icon;
  const [ref, mid] = useMid<HTMLLIElement>('-38% 0px -38% 0px');
  const lit = reduced || mid;
  return (
    <li ref={ref} className="ab-row hairline py-8 sm:py-10 grid sm:grid-cols-12 gap-x-8 gap-y-3 items-baseline" style={{ opacity: lit ? 1 : 0.5 }}>
      <span className="sm:col-span-1 mono ink-blue text-sm">{String(i + 1).padStart(2, '0')}</span>
      <h3 className="sm:col-span-5 flex items-center gap-4" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 700 }}>
        <Icon size={28} aria-hidden="true" className="shrink-0 ink-cyan" />
        {v.title}
      </h3>
      <p className="sm:col-span-5 sm:col-start-8 t-body max-w-[28rem]">{uz(v.desc)}</p>
    </li>
  );
};

export const ValuesScene: React.FC = () => {
  const reduced = useMotionReduced();
  return (
    <section className="relative py-[12vh]" aria-labelledby="values-title">
      <div className="wrap">
        <div className="mb-12 lg:mb-16">
          <p className="t-kicker mb-6">05 — Qadriyatlar</p>
          <Mask><h2 id="values-title" className="t-h2">Bizning qadriyatlarimiz</h2></Mask>
          <p className="t-lead mt-6 max-w-xl">{uz("DATA jamoasini birlashtirib turuvchi va bizni olg'a boshlovchi tamoyillar")}</p>
        </div>
        <ul>
          {VALUES.map((_, i) => (
            <ValueRow key={i} i={i} reduced={reduced} />
          ))}
          <li className="hairline" aria-hidden="true" />
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 07 facilities
const FACILITIES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Monitor, title: 'Zamonaviy texnikalar', desc: "O'quv xonalarimiz so'nggi rusumdagi iMac va kuchli Windows kompyuterlari bilan jihozlangan. Bu esa dasturlash va dizayn dasturlarida qotishlarsiz, tezkor ishlash imkonini beradi." },
  { icon: Coffee, title: 'Coworking hududi', desc: "Darsdan tashqari vaqtlarda o'quvchilarimiz bemalol kelib, o'z ustilarida ishlashlari, jamoaviy loyihalar qilishlari uchun maxsus shinam coworking zonalarimiz mavjud." },
  { icon: Wifi, title: 'Yuqori tezlikdagi internet', desc: "Markazimizning barcha hududlarida uzluksiz va yuqori tezlikdagi Wi-Fi tarmog'i ishlab turadi. Kerakli ma'lumotlarni yuklab olish va videodarslarni ko'rishda muammo bo'lmaydi." },
  { icon: Target, title: 'Amaliyot va real loyihalar', desc: "Bizda faqat quruq nazariya emas, balki real loyihalar ustida ishlash imkoniyati mavjud. O'quvchilar o'qish davomidayoq o'z portfoliolarini yig'ishni boshlaydilar." },
  { icon: Award, title: "Sertifikat va ishga yo'naltirish", desc: "Kursni muvaffaqiyatli tamomlagan o'quvchilarga maxsus sertifikat beriladi va eng yaxshi bitiruvchilarni ishga joylashishlarida amaliy yordam ko'rsatiladi." },
  { icon: Users, title: 'Kuchli ustozlar jamoasi', desc: "Darslar o'z sohasining yetuk mutaxassislari, katta tajribaga ega bo'lgan amaliyotchi dasturchi va dizaynerlar tomonidan olib boriladi." },
];

export const FacilitiesScene: React.FC = () => {
  const reduced = useMotionReduced();
  return (
    <section className="relative py-[12vh]" aria-labelledby="fac-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="t-kicker mb-6">06 — Stansiya ichida</p>
            <Mask><h2 id="fac-title" className="t-h2">Nega aynan <span className="ink-grad">DATA</span>?</h2></Mask>
          </div>
          <p className="t-lead max-w-md">{uz("O'quvchilarimiz uchun yaratilgan maxsus sharoitlar va qulayliklar bilan tanishing")}</p>
        </div>
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-px rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--line)' }}>
          {FACILITIES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.li
                key={f.title}
                className="ab-cell p-8 sm:p-10 flex flex-col"
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.07, ease: EASE }}
              >
                <span className="ico inline-flex w-12 h-12 items-center justify-center rounded-2xl ink-2" style={{ background: 'var(--bg-3)' }}>
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="t-h3 mt-8">{uz(f.title)}</h3>
                <p className="t-body mt-4 text-[0.98rem]">{uz(f.desc)}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 08 directions
const DIRECTIONS = [
  { title: 'Dasturlash va maʼlumotlar', blurb: 'Python, frontend, Telegram botlar va BI tahlil. Noldan birinchi real loyihagacha.', color: '#00b26b', ink: 'ink-green' },
  { title: 'Media, dizayn va AI', blurb: 'Grafik dizayn, SMM, mobilografiya va sunʼiy intellekt bilan kontent yaratish.', color: '#60efff', ink: 'ink-cyan' },
  { title: 'Moliya va raqamli ofis', blurb: 'Buxgalteriya va 1C, Excel Pro, HR menejment: biznesni yurgizadigan vositalar.', color: '#0061ff', ink: 'ink-blue' },
  { title: 'Bolalar uchun texnologiya', blurb: 'Robototexnika va web dasturlash. 7 yoshdan muhandislarcha fikrlashni oʻrganamiz.', color: '#60efff', ink: 'ink-cyan' },
];

export const DirectionsScene: React.FC = () => {
  const reduced = useMotionReduced();
  return (
    <section className="relative py-[12vh]" aria-labelledby="dirs-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="t-kicker mb-6">07 — Yoʻnalishlar</p>
            <Mask><h2 id="dirs-title" className="t-h2 max-w-[16ch]">Tanlovingiz uchun toʻrt yoʻnalish.</h2></Mask>
          </div>
          <Link to="/kurslar" className="link-arrow min-h-[44px]">Barcha kurslar →</Link>
        </div>
        <ul className="grid sm:grid-cols-2 gap-5">
          {DIRECTIONS.map((d, i) => (
            <motion.li
              key={d.title}
              initial={reduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.75, delay: (i % 2) * 0.08, ease: EASE }}
            >
              <Link
                to="/kurslar"
                className="dir-card panel relative flex flex-col justify-between gap-12 p-7 sm:p-9 min-h-[15rem] overflow-hidden h-full"
              >
                <span aria-hidden="true" className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-25 blur-3xl" style={{ background: d.color }} />
                <span className="relative flex items-start justify-between">
                  <span className={`mono text-sm ${d.ink}`}>{String(i + 1).padStart(2, '0')}</span>
                  <ArrowUpRight size={22} aria-hidden="true" className="arr ink-3" />
                </span>
                <span className="relative block">
                  <span className="block t-h3">{d.title}</span>
                  <span className="block t-body mt-3 max-w-[26rem]">{d.blurb}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 09 place
export const PlaceScene: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const address = uz(tField(siteContent.contactAddress));
  const landmark = uz(tField(siteContent.contactLandmark));
  const schedule = uz(tField(siteContent.contactSchedule));
  const phone = siteContent.contactPhone;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tField(siteContent.contactAddress) || '')}`;

  const rows: { icon: LucideIcon; k: string; v: string; href?: string }[] = [
    { icon: MapPin, k: 'Manzil', v: [address, landmark].filter(Boolean).join('. ') },
    { icon: Clock, k: 'Ish vaqti', v: schedule },
    { icon: Phone, k: 'Telefon', v: phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined },
  ].filter((r) => r.v);

  return (
    <section className="relative py-[14vh]" aria-labelledby="place-title">
      <div className="wrap grid lg:grid-cols-12 gap-x-14 gap-y-12 items-center [&>*]:min-w-0">
        <div className="lg:col-span-6">
          <p className="t-kicker mb-6">08 — Manzil</p>
          <Mask><h2 id="place-title" className="t-h2 max-w-[14ch]">Urganch markazida.</h2></Mask>
          <dl className="mt-10 grid gap-7">
            {rows.map(({ icon: Icon, k, v, href }) => (
              <div key={k} className="flex gap-4">
                <Icon size={20} className="shrink-0 mt-1 ink-blue" aria-hidden="true" />
                <div>
                  <dt className="t-kicker !text-[0.75rem]">{k}</dt>
                  <dd className="mt-1 leading-relaxed">
                    {href ? <a href={href} className="inline-flex items-center min-h-[44px] -my-2.5 hover:underline underline-offset-4">{v}</a> : v}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <a href={mapHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-10">
            Xaritada ochish <ArrowUpRight size={18} aria-hidden="true" />
            <span className="sr-only"> (yangi oynada ochiladi)</span>
          </a>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="panel relative aspect-[4/3] lg:aspect-square max-h-[28rem] w-full overflow-hidden grain" aria-hidden="true">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(0,97,255,.22), transparent 72%)' }} />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                WebkitMaskImage: 'radial-gradient(70% 70% at 50% 50%, #000 25%, transparent 100%)',
                maskImage: 'radial-gradient(70% 70% at 50% 50%, #000 25%, transparent 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {[0.42, 0.7, 0.98].map((s, i) => (
                <span key={s} className="absolute rounded-full" style={{ width: `${s * 100}%`, aspectRatio: '1', border: '1px solid var(--line-2)' }} />
              ))}
              {!reduced &&
                [0, 1.4, 2.8].map((d) => (
                  <span key={d} className="ab-ping absolute rounded-full" style={{ width: '98%', aspectRatio: '1', border: '1.5px solid var(--cyan-ink)', animationDelay: `${d}s` }} />
                ))}
              <motion.span
                initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE }}
                className="relative flex flex-col items-center gap-3"
              >
                <StarGlyph size={72} color="var(--cyan-ink)" style={{ filter: 'drop-shadow(0 0 24px rgba(96,239,255,.45))' }} />
                <span className="mono text-xs tracking-[0.14em] uppercase ink-2 px-3 py-1.5 rounded-full" style={{ border: '1px solid var(--line-2)', background: 'var(--bg)' }}>
                  Urganch · DATA
                </span>
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ 10 closing
export const AboutClosing: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [consult, setConsult] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section ref={ref} className="relative py-[16vh] overflow-hidden" aria-labelledby="about-cta-title">
      <Star3D progress={scrollYProgress} spin={55} className="ab-star absolute -right-[14vw] top-[6%] w-[44vw] max-w-[560px] aspect-square pointer-events-none opacity-[.35] hidden md:block" />
      <div className="wrap relative">
        <p className="t-kicker mb-6">09 — Boshlash</p>
        <Mask>
          <h2 id="about-cta-title" className="t-display max-w-[14ch]">
            Birinchi qadam — <span className="ink-grad">bepul</span> karyera testi.
          </h2>
        </Mask>
        <p className="t-lead mt-6 max-w-lg">Holland RIASEC metodikasi asosidagi test qiziqishlaringizni olti oʻlchovda baholaydi va sizga mos yoʻnalishni koʻrsatadi.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/karyera-testi" className="btn btn-primary">
            Karyera testini boshlash <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => setConsult(true)}>Bepul konsultatsiya</button>
        </div>
        <p className="mt-6 text-sm ink-3">Test bepul va majburiyatsiz. Natijadan keyin ustozlarimiz kurs tanlashda yordam beradi.</p>
      </div>
      <EnrollModal isOpen={consult} onClose={() => setConsult(false)} courseName="Bepul konsultatsiya" type="consult" />
    </section>
  );
};
