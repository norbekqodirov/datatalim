import React from 'react';

/**
 * Shaffof 3D ikonka: `name` — public/images/v2/icons/<name>.webp, yoki "dirs/dir-media" kabi
 * public/images/v2/ ichidagi yo'l. O'lcham klass bilan (w-[..] h-[..]); width/height atributlari CLS uchun.
 * Chiziqli (lucide) ikonkalar faqat UI belgilari (strelka, telefon) uchun qoladi.
 */
export const Icon3D: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 56, className }) => (
  <img
    src={`/images/v2/${name.includes('/') ? name : `icons/${name}`}.webp`}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    draggable={false}
    className={['shrink-0 select-none object-contain', className].filter(Boolean).join(' ')}
  />
);
