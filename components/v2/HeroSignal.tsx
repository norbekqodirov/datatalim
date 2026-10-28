import React, { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { ParticleField } from './particleField';
import { uz, useFontReady, useHtmlDark, useIsDesktop, useMotionReduced } from './utils';

// scroll progress (0..1 over the pinned section) → station story progress
// (0 far-away station, .5 approach — data pulses, 1 arrival — the brand star faces us)
function formationAt(v: number) {
  if (v < 0.12) return 0;
  if (v < 0.42) return ((v - 0.12) / 0.3) * 0.5;
  if (v < 0.52) return 0.5;
  if (v < 0.8) return 0.5 + ((v - 0.52) / 0.28) * 0.5;
  return 1;
}

const Stage: React.FC<{ p: MotionValue<number>; range: [number, number, number, number]; className?: string; children: React.ReactNode; innerRef?: React.Ref<HTMLDivElement> }> = ({ p, range, className, children, innerRef }) => {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, range, [40, 0, 0, -40]);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? 'hidden' : 'visible'));
  return (
    <motion.div ref={innerRef} style={{ opacity, y, visibility }} className={className}>
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
  // hold the entrance until Poppins is in, so the font swap never re-wraps the headline on screen
  const fontReady = useFontReady();
  const copyHide: React.CSSProperties = { visibility: fontReady ? 'visible' : 'hidden' };
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const capBRef = useRef<HTMLDivElement>(null);
  const capCRef = useRef<HTMLDivElement>(null);
  const vRef = useRef(0);
  // band faqat bosqich almashganda (A → B → C), resize va shrift yuklanganda qayta o'lchanadi — har scroll kadrida emas
  const phaseRef = useRef(-1);

  // The formation lives in a vertical band: below the navbar, above whatever text is on screen
  // (headline on phones, captions otherwise). The field centres itself in it and shrinks to fit.
  const measureBand = useCallback(() => {
    const f = fieldRef.current;
    const canvas = canvasRef.current;
    if (!f || !canvas) return;
    const h = canvas.getBoundingClientRect().height;
    const w = canvas.getBoundingClientRect().width;
    const phone = w < 1024 && h > w * 1.1;
    const v = vRef.current;
    const top = phone ? 58 : 76;
    let bottom = h - 80;
    if (v < 0.14) {
      if (phone) {
        const c = copyRef.current;
        if (c) bottom = c.getBoundingClientRect().top - canvas.getBoundingClientRect().top - 6;
      }
    } else {
      const cap = v < 0.56 ? capBRef.current : capCRef.current;
      if (cap) bottom = cap.offsetTop - (phone ? 10 : 8);
    }
    f.band = [top, Math.max(top + 120, bottom)];
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // ---- particle field lifecycle ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let field: ParticleField;
    try {
      field = new ParticleField(canvas, { count: desktop ? 4200 : 2000, dark });
    } catch {
      return;
    }
    fieldRef.current = field;
    if (!reduced) requestAnimationFrame(measureBand);
    const portrait = () => window.innerHeight > window.innerWidth * 1.1;
    field.anchorX = desktop ? 0.75 : 0.5;
    // phones: the station floats above the headline instead of hiding behind it
    field.anchorY = !desktop && portrait() ? 0.21 : 0.5;
    field.sizeMul = desktop ? 1 : 0.7;
    field.dim = desktop || portrait() ? 1 : 0.3;

    const onResize = () => {
      field.resize();
      measureBand();
      if (reduced) field.renderStatic(1);
    };
    window.addEventListener('resize', onResize);

    if (reduced) {
      // no band in the static layout: keep the station clear of the headline
      field.anchorX = desktop ? 0.76 : 0.5;
      field.zoom = desktop ? 0.66 : 0.72;
      // phones: the copy fills the screen, so the station becomes a quiet backdrop behind it
      if (!desktop) { field.anchorY = 0.42; field.dim = 0.3; }
      field.renderStatic(1);
      return () => window.removeEventListener('resize', onResize);
    }

    // fonts swapping in re-wrap the headline: re-measure so the band follows the copy
    document.fonts?.ready.then(() => measureBand());

    // only animate while the hero is on screen
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen && !document.hidden) field.start();
      else field.stop();
    }, { threshold: 0 });
    io.observe(canvas);
    // tabga qaytilganda faqat hero ekranda bo'lsa davom etadi
    const onVis = () => (!document.hidden && onScreen ? field.start() : field.stop());
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
    vRef.current = v;
    const phase = v < 0.14 ? 0 : v < 0.56 ? 1 : 2;
    if (phase !== phaseRef.current) {
      phaseRef.current = phase;
      measureBand();
    }
    f.progress = formationAt(v);
    f.anchorX = desktop && v < 0.14 ? 0.75 : 0.5;
    const phone = !desktop && window.innerHeight > window.innerWidth * 1.1;
    f.anchorY = phone && v < 0.14 ? 0.21 : 0.5;
    // short landscape screens: the station sits behind the headline, keep it quiet until the text leaves
    f.dim = !desktop && !phone && v < 0.14 ? 0.3 : 1;
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  // soft edge only: the starfield and planets should reach the corners of the frame
  const vignette = dark
    ? 'radial-gradient(135% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)'
    : 'radial-gradient(135% 100% at 50% 50%, transparent 58%, rgba(251,252,254,.7) 100%)';

  const title = uz(tField(siteContent.heroTitle));
  const subtitle = uz(tField(siteContent.heroSubtitle));
  const description = uz(tField(siteContent.heroDescription));

  // Reduced motion: one static, un-pinned screen with the arrived station (brand star facing us).
  if (reduced) {
    return (
      <section ref={sectionRef} className="relative min-h-[100svh] flex items-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="wrap relative z-10 pt-32 pb-20" style={copyHide}>
          <HeroCopy title={title} subtitle={subtitle} description={description} fontReady={fontReady} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: desktop ? '230vh' : '140svh' }} aria-label="DATA Taʼlim Stansiyasi">
      <div className="sticky top-0 h-[100svh] overflow-hidden grain">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: vignette }} />

        {/* Stage A — headline + CTAs (left), the space station far away (right) */}
        <Stage p={scrollYProgress} range={[-1, 0, 0.08, 0.16]} className="absolute inset-0 flex items-end pb-[13svh] lg:items-center lg:pb-0">
          <div className="wrap pt-24" style={copyHide}>
            <HeroCopy title={title} subtitle={subtitle} description={description} copyRef={copyRef} fontReady={fontReady} />
          </div>
        </Stage>

        {/* Stage B — approach: data races round the station */}
        <Stage p={scrollYProgress} range={[0.2, 0.3, 0.42, 0.5]} innerRef={capBRef} className="cap-stage absolute inset-x-0 text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">01 — Maʼlumot</p>
            <h2 className="t-caption max-w-5xl mx-auto">Dunyo maʼlumotdan iborat.</h2>
          </div>
        </Stage>

        {/* Stage C — arrival: the brand star in the station's hub */}
        <Stage p={scrollYProgress} range={[0.62, 0.72, 0.9, 1.05]} innerRef={capCRef} className="cap-stage absolute inset-x-0 text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">02 — Bilim</p>
            <h2 className="t-caption max-w-5xl mx-auto">
              Biz uni <span className="ink-grad">kasbga</span> aylantirishni oʻrgatamiz.
            </h2>
            <p className="t-lead mt-5 max-w-2xl mx-auto">Dasturlash · Sunʼiy intellekt · Media · Dizayn · Moliya</p>
          </div>
        </Stage>

        <StoryRail p={scrollYProgress} />

        {/* scroll hint */}
        <motion.div style={{ opacity: hintOpacity }} className="scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
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

// three-step progress rail: makes the scroll story legible (world → data → profession)
const STEPS: { label: string; at: [number, number, number, number] }[] = [
  { label: 'Dunyo', at: [-1, 0, 0.16, 0.24] },
  { label: 'Maʼlumot', at: [0.16, 0.26, 0.5, 0.6] },
  { label: 'Kasb', at: [0.5, 0.68, 1.1, 1.2] },
];

const RailStep: React.FC<{ p: MotionValue<number>; label: string; at: [number, number, number, number]; i: number }> = ({ p, label, at, i }) => {
  const opacity = useTransform(p, at, [0.35, 1, 1, 0.35]);
  return (
    <motion.span style={{ opacity }} className="t-kicker !text-[0.7rem] sm:!text-[0.75rem] flex items-center gap-2" >
      <span style={{ color: 'var(--cyan-ink)' }}>{String(i + 1).padStart(2, '0')}</span>
      {label}
    </motion.span>
  );
};

const StoryRail: React.FC<{ p: MotionValue<number> }> = ({ p }) => {
  const show = useTransform(p, [0.03, 0.1, 0.94, 1], [0, 1, 1, 0]);
  const fill = useTransform(p, [0.02, 0.9], [0, 1]);
  return (
    <motion.div style={{ opacity: show }} className="absolute left-[var(--gutter)] right-[var(--gutter)] bottom-5 pointer-events-none" aria-hidden="true">
      <div className="flex justify-between mb-3">
        {STEPS.map((s, i) => (
          <RailStep key={s.label} p={p} label={s.label} at={s.at} i={i} />
        ))}
      </div>
      <div className="h-px w-full" style={{ background: 'var(--line-2)' }}>
        <motion.div className="h-px origin-left" style={{ scaleX: fill, background: 'var(--grad)' }} />
      </div>
    </motion.div>
  );
};

const HeroCopy: React.FC<{ title: string; subtitle: string; description: string; copyRef?: React.Ref<HTMLDivElement>; fontReady: boolean }> = ({ title, subtitle, description, copyRef, fontReady }) => {
  const go = (shown: object) => (fontReady ? shown : undefined);
  return (
  <div ref={copyRef} className="hero-copy max-w-[46rem]">
    <motion.p
      className="t-kicker mb-6 flex items-center gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={go({ opacity: 1, y: 0 })}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--green)', boxShadow: '0 0 12px var(--green)' }} />
      Urganch · 2019-yildan beri
    </motion.p>
    <motion.h1
      className="t-display"
      initial={{ opacity: 0, y: 24 }}
      animate={go({ opacity: 1, y: 0 })}
      transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {title} <span className="ink-grad">{subtitle}</span>
    </motion.h1>
    <motion.p
      className="t-lead mt-5 lg:mt-7 max-w-[34rem]"
      initial={{ opacity: 0, y: 16 }}
      animate={go({ opacity: 1, y: 0 })}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {description}
    </motion.p>
    <motion.div
      className="hero-cta mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={go({ opacity: 1, y: 0 })}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/karyera-testi" className="btn btn-primary">
        <Sparkles size={18} aria-hidden="true" /> Kasbingizni aniqlang
      </Link>
      <Link to="/kurslar" className="btn btn-ghost">
        Kurslarni koʻrish <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </motion.div>
    {/* qaror oldidan ishonch: saytda allaqachon aytilgan uchta vaʼda */}
    <motion.ul
      className="hero-proof mt-8 flex flex-wrap gap-x-5 gap-y-2"
      initial={{ opacity: 0 }}
      animate={go({ opacity: 1 })}
      transition={{ duration: 0.8, delay: 0.45 }}
    >
      {['Kichik guruhlar', 'Real loyiha', 'Sertifikat + portfolio'].map((t) => (
        <li key={t} className="flex items-center gap-2 text-[0.85rem]" style={{ color: 'var(--fg-2)' }}>
          <Check size={15} className="ink-green" aria-hidden="true" /> {t}
        </li>
      ))}
    </motion.ul>
  </div>
  );
};
