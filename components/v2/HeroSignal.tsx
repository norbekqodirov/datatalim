import React, { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { ParticleField } from './particleField';
import { uz, useFontReady, useHtmlDark, useIsDesktop, useMotionReduced } from './utils';

// Weak hardware and in-app browsers (Instagram/Facebook — most of the ad traffic) get a lighter scene:
// ~900 particles at DPR 1. Everything else still adapts at runtime (ParticleField steps down on slow frames).
function lightTier(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 8;
  const mem = nav.deviceMemory || 8;
  return cores <= 4 || mem <= 4 || /Instagram|FBAN|FBAV/i.test(nav.userAgent || '');
}

// right edge of the copy's actual text (the copy box itself is a fixed max-width), measured per block with a Range
function textRight(el: HTMLElement, fallback: number): number {
  let r = 0;
  const range = document.createRange();
  for (const child of Array.from(el.children)) {
    range.selectNodeContents(child);
    r = Math.max(r, range.getBoundingClientRect().right);
  }
  return r > 0 ? Math.min(r, fallback) : fallback;
}

// union of the caption's text lines (not the full-width stage box) in canvas px, padded a little
function textBox(el: HTMLElement, cv: DOMRect): [number, number, number, number] | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const range = document.createRange();
  for (const t of Array.from(el.querySelectorAll('p, h2'))) {
    range.selectNodeContents(t);
    const r = range.getBoundingClientRect();
    if (r.width === 0) continue;
    x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
  }
  return x1 > x0 ? [x0 - cv.left - 12, y0 - cv.top - 12, x1 - cv.left + 12, y1 - cv.top + 12] : null;
}

// scroll progress (0..1 over the pinned section) → hologram story progress:
// 0 A — shapes cycle beside the headline · .5 B — they scatter into a full-screen data cloud ·
// 1 C — the cloud streams into the centre and forms the DATA brand star (reversible: it is a pure function of scroll)
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
  const siteContent = useStore((s) => s.siteContent);
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
    // phones: ≥20px under the navbar (bar ends at 64px; pin tips, star points and the bob need a few px more)
    const top = phone ? 88 : 76;
    // desktop first screen: the hologram keeps a ≥64px gap to the headline and centres in the space to its right
    f.bandX = null;
    if (!phone && v < 0.14 && w >= 1024) {
      const c = copyRef.current;
      if (c) {
        const cv = canvas.getBoundingClientRect();
        const cr = c.getBoundingClientRect();
        // the copy box is a fixed max-width; the hologram keys off the real text edge (narrow 1024–1100px screens)
        const left = textRight(c, cr.right) - cv.left + 64;
        const right = w - (cr.left - cv.left) * 0.5;
        if (right - left > 120) f.bandX = [left, right];
      }
    }
    let bottom = h - 80;
    // stages B/C: the scattered data cloud thins out over the caption text
    f.quiet = null;
    if (v >= 0.14) {
      const cap = v < 0.56 ? capBRef.current : capCRef.current;
      if (cap) f.quiet = textBox(cap, canvas.getBoundingClientRect());
    }
    if (v < 0.14) {
      if (phone) {
        const c = copyRef.current;
        if (c) bottom = c.getBoundingClientRect().top - canvas.getBoundingClientRect().top - 16;
      }
    } else {
      const cap = v < 0.56 ? capBRef.current : capCRef.current;
      // accent glows and stray dust reach past the fitted shape: keep a clear gap above the caption kicker
      if (cap) bottom = cap.offsetTop - (phone ? 28 : 48);
    }
    f.band = [top, Math.max(top + 120, bottom)];
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // ---- particle field lifecycle ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let field: ParticleField;
    const lite = lightTier();
    try {
      field = new ParticleField(canvas, {
        count: lite ? (desktop ? 1800 : 900) : desktop ? 4200 : 2000,
        dark,
        // phones: DPR ≤ 1.5 (the dust is fine-grained anyway); weak devices: 1
        maxDpr: lite ? 1 : desktop ? 2 : 1.5,
      });
    } catch {
      return;
    }
    fieldRef.current = field;
    // QA (dev server only): window.__heroField.qa = { shape, t } pins a shape / morph frame for screenshots
    if (import.meta.env.DEV) (window as unknown as { __heroField?: ParticleField }).__heroField = field;
    // fewer particles: slightly larger dust keeps the hull reading as solid
    const liteK = lite ? 1.25 : 1;
    if (!reduced) requestAnimationFrame(measureBand);
    const portrait = () => window.innerHeight > window.innerWidth * 1.1;
    field.anchorX = desktop ? 0.78 : 0.5;
    // phones: the hologram floats above the headline instead of hiding behind it
    field.anchorY = !desktop && portrait() ? 0.21 : 0.5;
    field.sizeMul = (desktop ? 1 : 0.7) * liteK;
    field.dim = desktop || portrait() ? 1 : 0.3;

    // resize bursts (mobile URL bar, rotation) are folded into one rAF; nothing happens unless the size changed
    let rz = 0;
    const onResize = () => {
      if (rz) return;
      rz = requestAnimationFrame(() => {
        rz = 0;
        const changed = field.resize();
        if (reduced) {
          if (changed) field.renderStatic(1);
        } else {
          measureBand();
        }
      });
    };
    window.addEventListener('resize', onResize);

    if (reduced) {
      // no band in the static layout: keep the (static) brand star clear of the headline
      field.anchorX = desktop ? 0.76 : 0.5;
      field.zoom = desktop ? 0.6 : 0.72;
      // phones: the copy fills the screen, so the star becomes a quiet backdrop behind it
      if (!desktop) { field.anchorY = 0.42; field.dim = 0.3; }
      field.renderStatic(1);
      return () => {
        window.removeEventListener('resize', onResize);
        if (rz) cancelAnimationFrame(rz);
      };
    }

    // fonts swapping in re-wrap the headline: re-measure so the band follows the copy
    document.fonts?.ready.then(() => measureBand());
    // headline text arriving from the API or a language switch re-wraps the copy: follow it
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measureBand()) : null;
    if (copyRef.current) ro?.observe(copyRef.current);

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
      ro?.disconnect();
      if (rz) cancelAnimationFrame(rz);
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
    // desktop first screen: bandX (set in measureBand) places the hologram; this is the fallback
    f.anchorX = desktop && v < 0.14 ? 0.78 : 0.5;
    const phone = !desktop && window.innerHeight > window.innerWidth * 1.1;
    f.anchorY = phone && v < 0.14 ? 0.21 : 0.5;
    // short landscape screens: the hologram sits behind the headline, keep it quiet until the text leaves
    f.dim = !desktop && !phone && v < 0.14 ? 0.3 : 1;
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  // soft edge only: the starfield and planets should reach the corners of the frame
  const vignette = dark
    ? 'radial-gradient(135% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)'
    : 'radial-gradient(135% 100% at 50% 50%, transparent 58%, rgba(251,252,254,.85) 100%)';

  const title = uz(tField(siteContent.heroTitle));
  const subtitle = uz(tField(siteContent.heroSubtitle));
  const description = uz(tField(siteContent.heroDescription));

  // Reduced motion: one static, un-pinned screen with the brand star (no morph, no sway).
  if (reduced) {
    return (
      <section ref={sectionRef} data-hero className="relative min-h-[100svh] flex items-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="wrap relative z-10 pt-32 pb-20" style={copyHide}>
          <HeroCopy title={title} subtitle={subtitle} description={description} fontReady={fontReady} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-hero className="relative" style={{ height: desktop ? '230vh' : '140svh' }} aria-label="DATA Taʼlim Stansiyasi">
      <div className="sticky top-0 h-[100svh] overflow-hidden grain">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: vignette }} />
        {/* exit seam: the pinned frame melts into the page background instead of ending on a hard edge */}
        <div className="hero-fade absolute inset-x-0 bottom-0 pointer-events-none" aria-hidden="true" />

        {/* Stage A — headline + CTAs (left), the morphing hologram (right; above the headline on phones) */}
        <Stage p={scrollYProgress} range={[-1, 0, 0.06, 0.12]} className="absolute inset-0 flex items-end pb-[calc(13svh+2.25rem)] lg:items-center lg:pb-0">
          <div className="wrap pt-24" style={copyHide}>
            <HeroCopy title={title} subtitle={subtitle} description={description} copyRef={copyRef} fontReady={fontReady} />
          </div>
        </Stage>

        {/* Stage B — the hologram scatters into a full-screen data cloud */}
        <Stage p={scrollYProgress} range={[0.18, 0.26, 0.44, 0.52]} innerRef={capBRef} className="cap-stage absolute inset-x-0 text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">01 — Maʼlumot</p>
            <h2 className="t-caption max-w-5xl mx-auto">Dunyo maʼlumotdan iborat.</h2>
          </div>
        </Stage>

        {/* Stage C — the cloud streams together into the DATA brand star */}
        <Stage p={scrollYProgress} range={[0.56, 0.64, 1.2, 1.3]} innerRef={capCRef} className="cap-stage absolute inset-x-0 text-center">
          <div className="wrap">
            <p className="t-kicker mb-4">02 — Bilim</p>
            <h2 className="t-caption max-w-5xl mx-auto">
              Biz uni <span className="ink-grad">kasbga</span> aylantirishni oʻrgatamiz.
            </h2>
            {/* " ·" ajratgich oldingi soʻzga yopishadi: qator nuqta bilan boshlanmaydi */}
            <p className="t-lead mt-5 max-w-2xl mx-auto">{'Dasturlash\u00A0· Sunʼiy intellekt\u00A0· Media\u00A0· Dizayn\u00A0· Moliya'}</p>
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
  { label: 'Maʼlumot', at: [0.14, 0.24, 0.5, 0.58] },
  { label: 'Kasb', at: [0.5, 0.62, 1.1, 1.2] },
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
    <motion.div style={{ opacity: show }} className="absolute inset-x-0 bottom-5 pointer-events-none" aria-hidden="true">
      <div className="wrap">
      <div className="flex justify-between mb-3">
        {STEPS.map((s, i) => (
          <RailStep key={s.label} p={p} label={s.label} at={s.at} i={i} />
        ))}
      </div>
      <div className="h-px w-full" style={{ background: 'var(--line-2)' }}>
        <motion.div className="h-px origin-left" style={{ scaleX: fill, background: 'var(--grad)' }} />
      </div>
      </div>
    </motion.div>
  );
};

const HeroCopy: React.FC<{ title: string; subtitle: string; description: string; copyRef?: React.Ref<HTMLDivElement>; fontReady: boolean }> = ({ title, subtitle, description, copyRef, fontReady }) => {
  const go = (shown: object) => (fontReady ? shown : undefined);
  // a line must never start with the dash: glue it to the previous word (same visible text)
  const dashLead = /^[—–-]/.test(subtitle);
  const dashTail = /\s[—–-]$/.test(title);
  const head = dashTail ? title.replace(/\s([—–-])$/, '\u00A0$1') : title;
  const glue = dashLead ? '\u00A0' : ' ';
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
      {head}{glue}<span className="ink-grad">{subtitle}</span>
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
