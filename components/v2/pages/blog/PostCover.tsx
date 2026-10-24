import React, { useEffect, useState } from 'react';
import { uz } from '../../utils';
import { Star4 } from './Star';

const TONES: { a: string; b: string }[] = [
  { a: '#0061ff', b: '#60efff' },
  { a: '#00b26b', b: '#60efff' },
  { a: '#0061ff', b: '#00b26b' },
];

/**
 * Cover for a post. With an uploaded image it shows the image; without one it draws a typographic
 * cover (category kicker, oversized initial, brand star) so the grid never has holes.
 */
export const PostCover: React.FC<{
  src?: string;
  title: string;
  category?: string;
  seed: number;
  className?: string;
  big?: boolean;
}> = ({ src, title, category, seed, className = '', big }) => {
  const tone = TONES[Math.abs(seed) % TONES.length];
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (src && !broken) {
    return (
      <div className={`pcover ${className}`}>
        <img src={src} alt="" loading="lazy" decoding="async" className="pcover-img" onError={() => setBroken(true)} />
      </div>
    );
  }
  // Asosiy (katta) maqolada muqova bo'lmasa — umumiy brend illyustratsiyasi; to'rdagi kichik kartalarda
  // takrorlanmasligi uchun tipografik muqova qoladi
  if (big) {
    return (
      <div className={`pcover ${className}`} aria-hidden="true">
        <img src="/images/v2/blog-cover.webp" alt="" loading="lazy" decoding="async" className="pcover-img" />
        {category && <span className="pcover-cat mono">{uz(category)}</span>}
      </div>
    );
  }
  const initial = (uz(title).trim().match(/[\p{L}\p{N}]/u) || ['D'])[0].toUpperCase();
  return (
    <div
      className={`pcover pcover-fallback ${className}`}
      aria-hidden="true"
      style={{ ['--ta' as string]: tone.a, ['--tb' as string]: tone.b }}
    >
      <span className="pcover-glow" />
      <Star4 className="pcover-star" fill="none" stroke="var(--tb)" strokeWidth={1.5} />
      <Star4 className="pcover-star-sm" fill="var(--tb)" />
      <span className={`pcover-initial ${big ? 'is-big' : ''}`}>{initial}</span>
      {category && <span className="pcover-cat mono">{uz(category)}</span>}
    </div>
  );
};
