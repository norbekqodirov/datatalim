import React, { useState } from 'react';

/**
 * Shaffof 3D ikonka: `name` — public/images/v2/icons/<name>.webp, yoki "dirs/dir-media" kabi
 * public/images/v2/ ichidagi yo'l. O'lcham klass bilan (w-[..] h-[..]); width/height atributlari CLS uchun.
 * Kichik variant `<nom>-sm.webp` (icons: 192px, dirs: 256px) srcset orqali tanlanadi: 1x/2x ekranda ~5x yengil,
 * 3x ekranda to'liq fayl. Rasm yuklanmasa: avval srcSet olib tashlanib to'liq src sinaladi, u ham bo'lmasa ikonka yashiriladi (singan rasm belgisi chiqmaydi).
 * Chiziqli (lucide) ikonkalar faqat UI belgilari (strelka, telefon) uchun qoladi.
 */
const SM_W = { icons: 192, dirs: 256 } as const;

export const Icon3D: React.FC<{ name: string; size?: number; className?: string; sizes?: string }> = ({ name, size = 56, className, sizes }) => {
  // 0: srcSet bilan; 1: srcSet olib tashlandi (to'liq src); 2: yashirin
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  if (stage === 2) return null;
  const base = `/images/v2/${name.includes('/') ? name : `icons/${name}`}`;
  const smW = name.startsWith('dirs/') ? SM_W.dirs : SM_W.icons;
  const fullW = name.startsWith('dirs/') ? 800 : 320;
  return (
    <img
      src={`${base}.webp`}
      srcSet={stage === 0 ? `${base}-sm.webp ${smW}w, ${base}.webp ${fullW}w` : undefined}
      sizes={stage === 0 ? sizes || `${size}px` : undefined}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setStage((v) => (v === 0 ? 1 : 2))}
      className={['shrink-0 select-none object-contain', className].filter(Boolean).join(' ')}
    />
  );
};
