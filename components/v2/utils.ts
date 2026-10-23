import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Uzbek Latin microtypography: turns ASCII/curly apostrophes after o/g into the
 * correct modifier letter (oʻ gʻ, U+02BB) and remaining apostrophes into ʼ (U+02BC).
 * Applied at render time so admin-entered text stays editable as-is.
 */
export function uz(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/([oOgG])['‘’`ʼ]/g, '$1ʻ')
    .replace(/(\w)['’`](\w)/g, '$1ʼ$2');
}

/** Tracks <html class="dark"> so canvas/inline colors follow the theme toggle. */
export function useHtmlDark(): boolean {
  const get = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(get);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/** True on viewports where pinned/horizontal scroll scenes are worth it. */
export function useIsDesktop(query = '(min-width: 1024px)'): boolean {
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setOk(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return ok;
}

/** YouTube id from a full embed/watch URL or a bare id. */
export function youtubeId(input: string | undefined): string {
  if (!input) return '';
  const m = input.match(/(?:embed\/|v=|youtu\.be\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : input.trim().slice(0, 11);
}

/** Prefer the optimized .webp sibling generated for /images/courses/*.png covers. */
export function optimizedCover(src: string | undefined): string {
  if (!src) return '';
  return src.startsWith('/images/courses/') ? src.replace(/\.png$/i, '.webp') : src;
}

/**
 * Reduced-motion preference with a preview override: `?motion=on` forces the full
 * scroll/3D experience for this tab (handy when the OS has animations switched off),
 * `?motion=off` clears it. Without an override the OS setting is respected.
 */
export function useMotionReduced(): boolean {
  const system = useReducedMotion();
  const [forced] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('motion');
      if (q === 'on') sessionStorage.setItem('v2-motion', 'on');
      if (q === 'off') sessionStorage.removeItem('v2-motion');
      return sessionStorage.getItem('v2-motion') === 'on';
    } catch {
      return false;
    }
  });
  return forced ? false : !!system;
}
