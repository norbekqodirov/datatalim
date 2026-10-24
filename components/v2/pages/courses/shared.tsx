import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Course } from '../../../../data/courses';
import { optimizedCover, uz } from '../../utils';
import './courses.css';

export type CatId = Course['category'];

/** Kategoriya nomlari: oldingi sahifadagi matnlar o'zgarmagan. */
export const CAT_LABEL: Record<CatId, string> = {
  programming: 'Dasturlash',
  media: 'Media & Dizayn',
  finance: 'Moliya va Ofis',
  kids: 'Bolalar uchun',
};
export const CAT_ORDER: CatId[] = ['programming', 'media', 'finance', 'kids'];

export const STAR_PATH =
  'M28.06.91l2.46,10.03c1.5,6.09,6.25,10.85,12.35,12.35l10.03,2.46c1.21.3,1.21,2.02,0,2.31l-10.03,2.46c-6.09,1.5-10.85,6.25-12.35,12.35l-2.46,10.03c-.3,1.21-2.02,1.21-2.31,0l-2.46-10.03c-1.5-6.09-6.25-10.85-12.35-12.35L.91,28.06c-1.21-.3-1.21-2.02,0-2.31l10.03-2.46c6.09-1.5,10.85-6.25,12.35-12.35L25.75.91c.3-1.21,2.02-1.21,2.31,0Z';

/** DATA brendining 4 nuqtali yulduzi */
export const StarMark: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 16, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 53.82 53.82" className={className} style={style} aria-hidden="true" focusable="false">
    <path fill="currentColor" d={STAR_PATH} />
  </svg>
);

/** "3 oy. Haftasiga 3 kun" -> { main: "3 oy", note: "Haftasiga 3 kun" } */
export function splitDuration(raw: string | undefined | null): { main: string; note: string } {
  const t = uz(raw).trim();
  const idx = t.search(/[.(]/);
  if (idx <= 0) return { main: t, note: '' };
  const main = t.slice(0, idx).trim();
  const note = t.slice(idx).replace(/^[.(]\s*/, '').replace(/[)\s.]+$/, '').trim();
  return { main, note };
}

/** "1 000 000 soʻm" -> { num: "1 000 000", unit: "soʻm" } (bo'shliqlar bo'linmaydi) */
export function splitPrice(raw: string | undefined | null): { num: string; unit: string } {
  const t = uz(raw).trim();
  const m = t.match(/^([\d\s .,]*\d)\s*(.*)$/);
  if (!m) return { num: t, unit: '' };
  return { num: m[1].replace(/\s+/g, ' '), unit: m[2] };
}

export function countLessons(c: Course): number {
  return c.modules.reduce((n, m) => n + m.lessons.length, 0);
}

/** Muqova: .webp variant, topilmasa asl yo'l; muqova bo'lmasa brend yulduzli joy egasi. */
export const Cover: React.FC<{
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  eager?: boolean;
  motionStyle?: React.ComponentProps<typeof motion.img>['style'];
}> = ({ src, alt = '', className, style, eager, motionStyle }) => {
  const [fallback, setFallback] = useState(false);
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={`cover-ph ${className || ''}`} style={style} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
        <StarMark size={72} />
      </div>
    );
  }
  return (
    <motion.img
      src={fallback ? src : optimizedCover(src)}
      alt={alt}
      width={640}
      height={640}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => (fallback ? setBroken(true) : setFallback(true))}
      className={className}
      style={{ ...style, ...(motionStyle as object) }}
    />
  );
};

/** Hero va yopuvchi blok uchun umumiy "kurs sahifasi" bo'lim sarlavhasi */
export const SectionHead: React.FC<{ kicker: string; id: string; children: React.ReactNode; className?: string }> = ({ kicker, id, children, className }) => (
  <div className={className}>
    <p className="t-kicker mb-4">{kicker}</p>
    <h2 id={id} className="t-h2">
      {children}
    </h2>
  </div>
);
