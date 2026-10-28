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

/**
 * Suzuvchi tugmalar (MobileCtaBar, BackToTop) chiqadigan scroll nuqtasi. Bosh sahifada — hero (`[data-hero]`, pinned sahna) tugagach, uning oxirgi
 * ekranining yarmi o'tganda: hikoya ichida kontekstsiz tugma chiqmaydi. Boshqa sahifalarda `fallback`.
 */
export function afterHeroY(fallback: number): number {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return fallback;
  const top = hero.getBoundingClientRect().top + window.scrollY;
  return Math.max(fallback, top + hero.offsetHeight - window.innerHeight * 0.5);
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
 * Default follows the OS setting (`prefers-reduced-motion`). An explicit choice — the footer
 * toggle or `?motion=off|on` — is remembered in localStorage and wins over the OS setting.
 */
const MOTION_KEY = 'v2-motion';
const MOTION_EVENT = 'v2-motion-change';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

export function setMotionReduced(reduced: boolean) {
  try {
    // choosing what the OS already says clears the override — the site follows the system setting again
    const os = !!window.matchMedia?.(REDUCE_QUERY).matches;
    if (reduced === os) localStorage.removeItem(MOTION_KEY);
    else localStorage.setItem(MOTION_KEY, reduced ? 'off' : 'on');
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
  window.dispatchEvent(new Event(MOTION_EVENT));
}

function readMotionReduced(): boolean {
  if (typeof window === 'undefined') return false;
  let stored: string | null = null;
  try {
    const q = new URLSearchParams(window.location.search).get('motion');
    if (q === 'off' || q === 'on') localStorage.setItem(MOTION_KEY, q);
    stored = localStorage.getItem(MOTION_KEY);
  } catch {
    /* storage unavailable — fall back to the OS setting */
  }
  if (stored === 'off') return true;
  if (stored === 'on') return false;
  return !!window.matchMedia?.(REDUCE_QUERY).matches;
}

export function useMotionReduced(): boolean {
  const [reduced, setReduced] = useState(readMotionReduced);
  useEffect(() => {
    const on = () => setReduced(readMotionReduced());
    const mq = window.matchMedia?.(REDUCE_QUERY);
    window.addEventListener(MOTION_EVENT, on);
    mq?.addEventListener?.('change', on);
    return () => {
      window.removeEventListener(MOTION_EVENT, on);
      mq?.removeEventListener?.('change', on);
    };
  }, []);
  return reduced;
}

/**
 * Pinned horizontal scenes (Directions, Campus, Gallery) move their track with a transform inside an
 * `overflow:hidden` sticky box. When Tab lands on an off-screen item the browser scrolls that box
 * sideways (scrollLeft), which fights the transform. This undoes that and scrolls the page to the
 * point where the focused item sits in view, so keyboard focus and the scroll story stay in sync.
 * `dist` = how far the track travels (px) over the section's scroll range.
 */
export function syncPinnedFocus(
  target: HTMLElement,
  section: HTMLElement | null,
  viewport: HTMLElement | null,
  track: HTMLElement | null,
  dist: number,
) {
  const reset = () => {
    if (viewport) { viewport.scrollLeft = 0; viewport.scrollTop = 0; }
  };
  reset();
  requestAnimationFrame(reset);
  if (!section || !track || dist <= 0) return;
  const r = target.getBoundingClientRect();
  // already fully on screen (e.g. a mouse click) — leave the page where it is
  if (r.left >= 0 && r.right <= window.innerWidth) return;
  const center = r.left - track.getBoundingClientRect().left + r.width / 2;
  const want = Math.min(1, Math.max(0, (center - window.innerWidth / 2) / dist));
  const top = section.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: top + want * (section.offsetHeight - window.innerHeight), behavior: 'instant' as ScrollBehavior });
}

/**
 * react-hot-toast options matching the v2 surfaces. Toasts render outside `.v2`
 * (no CSS variables there), so colours are resolved from <html class="dark"> at call time.
 */
export function v2Toast(extra: Record<string, unknown> = {}) {
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return {
    style: {
      background: dark ? '#13151b' : '#ffffff',
      color: dark ? '#f5f7fa' : '#05070d',
      border: `1px solid ${dark ? 'rgba(255,255,255,.16)' : 'rgba(5,7,13,.16)'}`,
      borderRadius: '16px',
      padding: '12px 16px',
      fontSize: '0.9375rem',
      lineHeight: 1.45,
      maxWidth: '26rem',
      boxShadow: dark ? '0 24px 60px -24px rgba(0,0,0,.9)' : '0 24px 60px -28px rgba(5,7,13,.35)',
    },
    iconTheme: { primary: dark ? '#60efff' : '#0061ff', secondary: dark ? '#000000' : '#ffffff' },
    ...extra,
  };
}

/**
 * True once the Poppins webfont is in (or after `maxMs`, so a slow font never hides content for long).
 * Poppins loads non-blocking with display=swap; the hero headline waits for it so the swap cannot
 * re-wrap it on screen (that re-wrap was the mobile/desktop layout shift).
 */
export function useFontReady(maxMs = 1400): boolean {
  const [ready, setReady] = useState(() => typeof document === 'undefined' || !document.fonts);
  useEffect(() => {
    if (ready) return;
    const fonts = document.fonts;
    const loaded = () => {
      let ok = false;
      fonts.forEach((f) => {
        if (f.family.replace(/["']/g, '') === 'Poppins' && f.status === 'loaded') ok = true;
      });
      return ok;
    };
    if (loaded()) {
      setReady(true);
      return;
    }
    const done = () => loaded() && setReady(true);
    fonts.addEventListener('loadingdone', done);
    const t = window.setTimeout(() => setReady(true), maxMs);
    return () => {
      fonts.removeEventListener('loadingdone', done);
      window.clearTimeout(t);
    };
  }, [ready, maxMs]);
  return ready;
}
