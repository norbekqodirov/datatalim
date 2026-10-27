import React, { useEffect, useRef } from 'react';
import { useMotionReduced } from './utils';

type P = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; r: number; c: string; ph: number; dust: boolean };

const COLORS = ['#0061ff', '#2f86ff', '#60efff', '#9af6ff'];

// 4 uchli brend yulduzi: uchlari radius 1 da, botiq tomonlari 0.26 radiusda
const STAR: [number, number][] = Array.from({ length: 8 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 4;
  const r = i % 2 === 0 ? 1 : 0.26;
  return [Math.cos(a) * r, Math.sin(a) * r];
});
const inStar = (x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i];
    const [xj, yj] = STAR[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** A brand star assembled from particles: gathers when it scrolls into view, scatters from the pointer. */
export const ParticleStar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useMotionReduced();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = false, t = 0;
    let parts: P[] = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const rect = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h / 2;
      const n = Math.round(Math.min(1100, Math.max(380, (w * h) / 55)));
      parts = [];
      while (parts.length < n) {
        const dust = parts.length > n * 0.8;
        let x: number, y: number;
        if (dust) {
          // yulduz atrofidagi siyrak "chang" — orbitada suzib yuradi
          const a = Math.random() * Math.PI * 2;
          const d = R * (0.5 + Math.random() * 0.75);
          x = Math.cos(a) * d; y = Math.sin(a) * d;
        } else {
          x = Math.random() * 2 - 1; y = Math.random() * 2 - 1;
          if (!inStar(x, y)) continue;
          // markazga zichroq: chetlarga yaqin nuqtalarni ozroq qoldiramiz
          if (Math.hypot(x, y) > 0.55 && Math.random() < 0.35) continue;
          x *= R; y *= R;
        }
        const hx = cx + x, hy = cy + y;
        const start = reduced ? { x: hx, y: hy } : { x: Math.random() * w, y: Math.random() * h };
        parts.push({
          hx, hy, x: start.x, y: start.y, vx: 0, vy: 0,
          r: dust ? 0.5 + Math.random() * 0.9 : 0.6 + Math.random() * 1.4,
          c: Math.random() < 0.06 ? '#00b26b' : COLORS[(Math.random() * COLORS.length) | 0],
          ph: Math.random() * Math.PI * 2, dust,
        });
      }
    };

    const draw = () => {
      const dark = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
      const cx = w / 2, cy = h / 2;
      const breathe = 1 + Math.sin(t * 0.9) * 0.025;
      for (const p of parts) {
        if (!reduced) {
          // uy nuqtasi: yulduz sekin "nafas oladi", chang orbitada aylanadi
          let tx = cx + (p.hx - cx) * breathe, ty = cy + (p.hy - cy) * breathe;
          if (p.dust) {
            const a = t * 0.12 + p.ph * 0.02;
            const dx = p.hx - cx, dy = p.hy - cy;
            tx = cx + dx * Math.cos(a) - dy * Math.sin(a);
            ty = cy + dx * Math.sin(a) + dy * Math.cos(a);
          }
          tx += Math.sin(t * 1.3 + p.ph) * 1.4; ty += Math.cos(t * 1.1 + p.ph) * 1.4;
          p.vx += (tx - p.x) * 0.018; p.vy += (ty - p.y) * 0.018;
          const mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
          if (md < 5200) { const f = (5200 - md) / 5200; p.vx += mx * f * 0.09; p.vy += my * f * 0.09; }
          p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
        }
        const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + p.ph * 3);
        ctx.globalAlpha = (p.dust ? 0.45 : 0.9) * (reduced ? 0.85 : tw) * (dark ? 1 : 0.95);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 1 / 60;
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    build();
    draw();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => { build(); draw(); });
    ro.observe(cv);
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = mouse.y = -9999; };
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
};
