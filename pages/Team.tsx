import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Award, Star, ArrowRight, type LucideIcon } from 'lucide-react';
import { SEO } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';
import { useStore } from '../store/useStore';
import { Mask, Star3D, StarSeam } from '../components/v2/fx';
import { uz, useMotionReduced } from '../components/v2/utils';
import { Reveal, StarGlyph } from '../components/v2/pages/about/AboutScenes';
import { TeamCard } from '../components/v2/pages/about/TeamCard';
import '../components/v2/v2.css';

const values: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Star, title: 'Tajriba va Malaka', desc: "Jamoamiz a'zolari o'z sohasining yetuk mutaxassislari hisoblanadi." },
  { icon: Users, title: "Do'stona Muhit", desc: "Bizda ustoz va shogird o'rtasida erkin va do'stona munosabat o'rnatilgan." },
  { icon: Award, title: 'Doimiy Rivojlanish', desc: "Ustozlarimiz ham doimiy ravishda o'z ustilarida ishlab, yangi bilimlarni o'zlashtiradilar." },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Team() {
  const { team } = useStore();
  const navigate = useNavigate();
  const reduced = useMotionReduced();
  const [consult, setConsult] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const starP = useTransform(scrollYProgress, [0, 1], [0.46, 1]);

  // same behaviour as the navbar "Aloqa" link: go home, wait for the lazy section, scroll to the form
  const goContact = () => {
    navigate('/');
    window.setTimeout(() => {
      let tries = 0;
      const tick = () => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else if (tries++ < 30) window.setTimeout(tick, 100);
      };
      tick();
    }, 120);
  };

  return (
    <div className="v2">
      <SEO title="Jamoa" description="DATA Ta'lim Stansiyasining professional jamoasi va tajribali ustozlari bilan tanishing." />

      {/* hero */}
      <section ref={heroRef} className="relative min-h-[88svh] flex items-center pt-28 pb-[10vh]" aria-labelledby="team-page-title">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(55% 50% at 80% 25%, rgba(0,97,255,.15), transparent 70%)' }} />
        <Star3D
          progress={starP}
          spin={60}
          className="ab-star absolute -right-[22vw] top-[10%] w-[76vw] aspect-square pointer-events-none opacity-[.36] md:-right-[4vw] md:w-[min(40vw,560px)] md:opacity-90"
        />
        <motion.div className="wrap relative" style={reduced ? undefined : { y: textY, opacity: textOpacity }}>
          <p className="t-kicker mb-8">01 — Bizning jamoa</p>
          <Mask>
            <h1 id="team-page-title" className="t-display" style={{ fontSize: 'clamp(1.75rem, 8.6vw, 5rem)' }}>
              <span className="block">Muvaffaqiyatimiz</span>
              <span className="block ink-grad">siri</span>
            </h1>
          </Mask>
          <Reveal delay={0.25}>
            <p className="t-lead mt-8 max-w-[40rem]">
              {uz("DATA Ta'lim Stansiyasining eng katta boyligi — bu uning jamoasi. Biz o'z ishining ustalari, yoshlarga bilim berishdan zavq oladigan professionallarni bir joyga jamlaganmiz.")}
            </p>
          </Reveal>
        </motion.div>
      </section>

      {/* values */}
      <section className="relative pb-[10vh]" aria-label="Jamoa tamoyillari">
        <div className="wrap">
          <ul className="grid md:grid-cols-3 hairline">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.li
                  key={v.title}
                  className="pt-8 pb-4 md:pr-8 md:border-l md:pl-8 first:md:border-l-0 first:md:pl-0"
                  style={{ borderColor: 'var(--line)' }}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-8% 0px' }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
                >
                  <Icon size={22} aria-hidden="true" className="ink-cyan" />
                  <h2 className="t-h3 mt-5">{uz(v.title)}</h2>
                  <p className="t-body mt-3 max-w-[22rem]">{uz(v.desc)}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      <StarSeam />

      {/* members */}
      <section className="relative py-[10vh]" aria-labelledby="members-title">
        <div className="wrap">
          <div className="mb-14 lg:mb-20">
            <p className="t-kicker mb-6">02 — Ustozlar</p>
            <Mask>
              <h2 id="members-title" className="t-h2 max-w-[16ch]">
                Rahbariyat va <span className="ink-grad">ustozlar</span>
              </h2>
            </Mask>
            <p className="t-lead mt-6 max-w-xl">{uz("Sizning kelajagingiz uchun qayg'uradigan va doim yordamga tayyor insonlar")}</p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {team.map((m, i) => (
              <TeamCard key={m.id} member={m} index={i} />
            ))}
          </ul>
        </div>
      </section>

      {/* next step for students first, hiring second */}
      <section className="relative py-[14vh] overflow-hidden" aria-labelledby="join-title">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 60% at 50% 100%, rgba(0,97,255,.14), transparent 70%)' }} />
        <div className="wrap relative grid lg:grid-cols-12 gap-x-14 gap-y-12 items-end [&>*]:min-w-0">
          <div className="lg:col-span-7">
            <p className="t-kicker mb-6">03 — Boshlash</p>
            <Mask>
              <h2 id="join-title" className="t-display max-w-[14ch]">
                Ustozlar bilan <span className="ink-grad">tanishing</span>
              </h2>
            </Mask>
            <p className="t-lead mt-6 max-w-xl">{uz("Qaysi yo'nalish sizga mosligini birga aniqlaymiz: bepul konsultatsiyada savollaringizga javob beramiz.")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={() => setConsult(true)}>
                Bepul konsultatsiya <ArrowRight size={18} aria-hidden="true" />
              </button>
              <Link to="/kurslar" className="btn btn-ghost">Kurslarni koʻrish</Link>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 panel p-7 sm:p-8 relative overflow-hidden">
            <StarGlyph size="9rem" color="var(--blue)" className="absolute -right-8 -top-8 opacity-[.12] pointer-events-none" />
            <p className="t-kicker mb-4">Hamkorlik</p>
            <h3 className="t-h3">Ustoz boʻlmoqchimisiz?</h3>
            <p className="t-body mt-3">{uz("O'z sohangizning yetuk mutaxassisi bo'lsangiz va yoshlarga bilim berishni xohlasangiz, biz sizni kutamiz!")}</p>
            <button type="button" className="link-arrow mt-5 min-h-[44px]" onClick={goContact}>
              Biz bilan bogʻlanish →
            </button>
          </div>
        </div>
      </section>
      <EnrollModal isOpen={consult} onClose={() => setConsult(false)} courseName="Bepul konsultatsiya" type="consult" />
    </div>
  );
}
