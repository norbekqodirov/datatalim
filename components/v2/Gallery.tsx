import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useMotionReduced, syncPinnedFocus } from './utils';
import { Mask } from './fx';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Admin "Media" bo'limidan yuklangan haqiqiy suratlar. Namuna (picsum) yoki bo'sh qiymatlar ko'rsatilmaydi —
// haqiqiy surat bo'lmasa bo'lim umuman chiqmaydi.
const isRealPhoto = (u: unknown): u is string => typeof u === 'string' && u.trim() !== '' && !/picsum\.photos/i.test(u);

// ------------------------------------------------------------------ lightbox
const Lightbox: React.FC<{ images: string[]; index: number; onClose: () => void; onStep: (d: number) => void }> = ({ images, index, onClose, onStep }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'Tab') {
        // fokus oynadan tashqariga chiqib ketmasin
        const btns: HTMLButtonElement[] = dialogRef.current ? Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button')) : [];
        if (btns.length === 0) return;
        const first = btns[0], last = btns[btns.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose, onStep]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Surat ${index + 1} / ${images.length}`}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
      style={{ background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`DATA Taʼlim Stansiyasi — surat ${index + 1}`}
          className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: EASE }}
        />
      </AnimatePresence>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Yopish"
        className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white"
        style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
        <X size={22} aria-hidden="true" />
      </button>
      {images.length > 1 && (
        <>
          <button type="button" onClick={() => onStep(-1)} aria-label="Oldingi surat"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label="Keyingi surat"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
            <ChevronRight size={24} aria-hidden="true" />
          </button>
          <p className="mono absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </p>
        </>
      )}
    </motion.div>
  );
};

// ------------------------------------------------------------------ one frame of the filmstrip
const Frame: React.FC<{ src: string; i: number; total: number; p: MotionValue<number>; onOpen: () => void }> = ({ src, i, total, p, onOpen }) => {
  // har bir kadr lentadagi o'rniga qarab ozgina buriladi va kattalashadi — chuqurlik hissi
  const mid = total > 1 ? i / (total - 1) : 0.5;
  const rotateY = useTransform(p, [mid - 0.5, mid, mid + 0.5], [7, 0, -7]);
  const scale = useTransform(p, [mid - 0.4, mid, mid + 0.4], [0.9, 1, 0.9]);
  const imgX = useTransform(p, [0, 1], ['-6%', '6%']);
  const tall = i % 3 === 1;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Suratni kattalashtirish: ${i + 1} / ${total}`}
      className="relative shrink-0 overflow-hidden rounded-[22px] focus-visible:outline-2"
      style={{
        rotateY, scale,
        width: tall ? 'min(26vw, 380px)' : 'min(36vw, 540px)',
        height: tall ? 'min(62vh, 560px)' : 'min(48vh, 420px)',
        alignSelf: tall ? 'center' : i % 2 ? 'flex-end' : 'flex-start',
        border: '1px solid var(--line)',
        transformPerspective: 1200,
      }}
    >
      <motion.img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-[112%] max-w-none object-cover" style={{ x: imgX, left: '-6%' }} />
      <span className="mono absolute left-4 top-4 text-[0.72rem] text-white/80" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
    </motion.button>
  );
};

// ------------------------------------------------------------------ section
export const Gallery: React.FC = () => {
  const { siteContent } = useStore();
  const images = (siteContent.galleryImages || []).filter(isRealPhoto);
  const reduced = useMotionReduced();
  const [open, setOpen] = useState<number | null>(null);
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // lentaning ortiqcha kengligi — vertikal scroll shu masofaga gorizontal siljishga aylanadi
  useEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      if (t) setShift(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [images.length, wide]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(p, [0, 1], [0, -shift]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + images.length) % images.length)), [images.length]);
  const close = useCallback(() => setOpen(null), []);

  if (images.length === 0) return null;

  const heading = (
    <div className="wrap">
      <p className="t-kicker mb-6">06 — Stansiya kadrlarda</p>
      <Mask><h2 id="gallery-title" className="t-h2 max-w-[18ch]">Bir kunimiz — <span className="ink-grad">suratlarda</span>.</h2></Mask>
    </div>
  );

  const pinned = wide && !reduced && images.length > 2;

  return (
    <section ref={sectionRef} aria-labelledby="gallery-title" className="relative"
      style={pinned ? { height: `calc(100svh + ${Math.round(shift * 1.1)}px)` } : undefined}>
      {pinned ? (
        <div ref={stickyRef} className="sticky top-0 h-[100svh] flex flex-col justify-center gap-10 overflow-hidden pt-20">
          {heading}
          <motion.div ref={trackRef} style={{ x, perspective: 1200 }}
            onFocus={(e) => syncPinnedFocus(e.target as HTMLElement, sectionRef.current, stickyRef.current, trackRef.current, shift)}
            className="flex items-stretch gap-12 pl-[var(--gutter)] h-[min(62vh,560px)]">
            {images.map((src, i) => (
              <Frame key={src + i} src={src} i={i} total={images.length} p={p} onOpen={() => setOpen(i)} />
            ))}
            {/* oxirgi kadr ekran chetiga yopishmasin (flex padding-end scrollWidth'ga har doim kirmaydi) */}
            <div aria-hidden="true" className="shrink-0 w-[var(--gutter)]" />
          </motion.div>
          <div className="wrap" aria-hidden="true">
            <div className="h-px w-full relative" style={{ background: 'var(--line)' }}>
              <motion.div className="absolute inset-y-0 left-0 w-full origin-left" style={{ scaleX: bar, background: 'linear-gradient(90deg,#0061ff,#60efff)' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-[12vh]">
          {heading}
          <div className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-[var(--gutter)] [scrollbar-width:none]">
            {images.map((src, i) => (
              <motion.button
                key={src + i}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Suratni kattalashtirish: ${i + 1} / ${images.length}`}
                className="relative shrink-0 snap-center overflow-hidden rounded-[20px] w-[78vw] max-w-[420px] aspect-[4/5]"
                style={{ border: '1px solid var(--line)' }}
                initial={reduced ? undefined : { opacity: 0, y: 28 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.7, delay: Math.min(i, 4) * 0.06, ease: EASE }}
              >
                <img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <span className="mono absolute left-4 top-4 text-[0.72rem] text-white/80" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {open !== null && <Lightbox images={images} index={open} onClose={close} onStep={step} />}
      </AnimatePresence>
    </section>
  );
};
