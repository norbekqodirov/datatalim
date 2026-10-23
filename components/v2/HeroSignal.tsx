import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { ParticleField } from './particleField';
import { uz, useHtmlDark, useIsDesktop, useMotionReduced } from './utils';

// scroll progress (0..1 over the pinned section) → formation progress (0 chaos, .5 globe, 1 star)
function formationAt(v: number) {
  if (v < 0.12) return 0;
  if (v < 0.42) return ((v - 0.12) / 0.3) * 0.5;
  if (v < 0.52) return 0.5;
  if (v < 0.8) return 0.5 + ((v - 0.52) / 0.28) * 0.5;
  return 1;
}

const Stage: React.FC<{ p: MotionValue<number>; range: [number, number, number, number]; className?: string; children: React.ReactNode }> = ({ p, range, className, children }) => {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, range, [40, 0, 0, -40]);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? 'hidden' : 'visible'));
  return (
    <motion.div style={{ opacity, y, visibility }} className={className}>
      {children}
    </motion.div>
  );
};

export const HeroSignal: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const dark = useHtmlDark();
  const desktop = useIsDesktop();
  const reduced = useMotionReduced();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // ---- particle field lifecycle ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let field: ParticleField;
    try {
      field = new ParticleField(canvas, { count: desktop ? 2600 : 1300, dark });
    } catch {
      return;
    }
    fieldRef.current = field;
    field.anchorX = desktop ? 0.7 : 0.5;
    field.dim = desktop ? 1 : 0.38;

    const onResize = () => {
      field.resize();
      if (reduced) field.renderStatic(1);
    };
    window.addEventListener('resize', onResize);

    if (reduced) {
      field.anchorX = desktop ? 0.72 : 0.5;
      field.renderStatic(1);
      return () => window.removeEventListener('resize', onResize);
    }

    // only animate while the hero is on screen
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? field.start() : field.stop()), { threshold: 0 });
    io.observe(canvas);
    const onVis = () => (document.hidden ? field.stop() : field.start());
    document.addEventListener('visibilitychange', onVis);

    const onMove = (e: PointerEvent) => {
      field.pointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      io.disconnect();
      field.stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      fieldRef.current = null;
    };
    // dark is synced separately below; rebuilding on theme change is unnecessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop, reduced]);

  useEffect(() => {
    fieldRef.current?.setDark(dark);
    if (reduced) fieldRef.current?.renderStatic(1);
  }, [dark, reduced]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const f = fieldRef.current;
    if (!f || reduced) return;
    f.progress = formationAt(v);
    f.anchorX = desktop && v < 0.14 ? 0.7 : 0.5;
    // on narrow screens the cloud sits behind the headline: keep it quiet until the text leaves
    f.dim = !desktop && v < 0.14 ? 0.38 : 1;
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const vignette = dark
    ? 'radial-gradient(120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,.85) 100%)'
    : 'radial-gradient(120% 80% at 50% 50%, transparent 45%, rgba(251,252,254,.9) 100%)';

  const title = uz(tField(siteContent.heroTitle));
  const subtitle = uz(tField(siteContent.heroSubtitle));
  const description = uz(tField(siteContent.heroDescription));

  // Reduced motion: one static, un-pinned screen with the finished star.
  if (reduced) {
    return (
      <section ref={sectionRef} className="relative min-h-[100svh] flex items-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="wrap relative z-10 pt-32 pb-20">
          <HeroCopy title={title} subtitle={subtitle} description={description} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: desktop ? '330vh' : '280vh' }} aria-label="DATA Taʼlim Stansiyasi">
      <div className="sticky top-0 h-[100svh] overflow-hidden grain">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: vignette }} />

        {/* Stage A — headline + CTAs (left), chaos cloud (right) */}
        <Stage p={scrollYProgress} range={[-1, 0, 0.08, 0.16]} className="absolute inset-0 flex items-center">
          <div className="wrap pt-24">
            <HeroCopy title={title} subtitle={subtitle} description={description} />
          </div>
        </Stage>

        {/* Stage B — the globe */}
        <Stage p={scrollYProgress} range={[0.2, 0.3, 0.42, 0.5]} className="absolute inset-x-0 bottom-[9vh] text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">01 — Maʼlumot</p>
            <h2 className="t-display max-w-4xl mx-auto">Dunyo maʼlumotdan iborat.</h2>
          </div>
        </Stage>

        {/* Stage C — the brand star */}
        <Stage p={scrollYProgress} range={[0.62, 0.72, 0.9, 1.05]} className="absolute inset-x-0 bottom-[8vh] text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">02 — Bilim</p>
            <h2 className="t-display max-w-5xl mx-auto">
              Biz uni <span className="ink-grad">kasbga</span> aylantirishni oʻrgatamiz.
            </h2>
            <p className="t-lead mt-5 max-w-2xl mx-auto">Dasturlash · Sunʼiy intellekt · Media · Dizayn · Moliya</p>
          </div>
        </Stage>

        {/* scroll hint */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
          <span className="t-kicker">Pastga suring</span>
          <span className="block w-px h-10 overflow-hidden" style={{ background: 'var(--line-2)' }}>
            <motion.span
              className="block w-px h-4"
              style={{ background: 'var(--cyan)' }}
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
};

const HeroCopy: React.FC<{ title: string; subtitle: string; description: string }> = ({ title, subtitle, description }) => (
  <div className="max-w-[46rem]">
    <motion.p
      className="t-kicker mb-6 flex items-center gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 12px var(--green)' }} />
      Urganch · 2019-yildan beri
    </motion.p>
    <motion.h1
      className="t-display"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {title} <span className="ink-grad">{subtitle}</span>
    </motion.h1>
    <motion.p
      className="t-lead mt-7 max-w-[34rem]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {description}
    </motion.p>
    <motion.div
      className="mt-10 flex flex-col sm:flex-row gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/karyera-testi" className="btn btn-primary">
        <Sparkles size={18} aria-hidden="true" /> Kasbingizni aniqlang
      </Link>
      <Link to="/kurslar" className="btn btn-ghost">
        Kurslarni koʻrish <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </motion.div>
  </div>
);
