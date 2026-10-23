import { useEffect, useState } from 'react';

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
 * Motion preference for the v2 storytelling scenes.
 * Full motion is the default (scroll-linked scenes are driven by the visitor's own
 * scrolling). Visitors can opt out with the footer toggle or `?motion=off`, which is
 * remembered; `?motion=on` clears the opt-out.
 */
const MOTION_KEY = 'v2-motion';
const MOTION_EVENT = 'v2-motion-change';

export function setMotionReduced(reduced: boolean) {
  try {
    if (reduced) localStorage.setItem(MOTION_KEY, 'off');
    else localStorage.removeItem(MOTION_KEY);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
  window.dispatchEvent(new Event(MOTION_EVENT));
}

function readMotionReduced(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('motion');
    if (q === 'off') localStorage.setItem(MOTION_KEY, 'off');
    if (q === 'on') localStorage.removeItem(MOTION_KEY);
    return localStorage.getItem(MOTION_KEY) === 'off';
  } catch {
    return false;
  }
}

export function useMotionReduced(): boolean {
  const [reduced, setReduced] = useState(readMotionReduced);
  useEffect(() => {
    const on = () => setReduced(readMotionReduced());
    window.addEventListener(MOTION_EVENT, on);
    return () => window.removeEventListener(MOTION_EVENT, on);
  }, []);
  return reduced;
}
