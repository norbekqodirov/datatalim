import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Moon, Sun, Check, ArrowUpRight, Instagram, Send, Sparkles } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { Logo } from '../BrandElements';
import './v2.css';

const LANGS = [
  { code: 'uz' as const, short: 'UZ', label: 'Oʻzbekcha' },
  { code: 'ru' as const, short: 'RU', label: 'Русский' },
  { code: 'en' as const, short: 'EN', label: 'English' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const NavbarV2: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { siteContent } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [contactInView, setContactInView] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const links = [
    { name: t('nav.courses'), path: '/kurslar' },
    { name: t('nav.about'), path: '/biz-haqimizda' },
    { name: t('nav.team'), path: '/jamoa' },
    { name: t('nav.languages') || 'Til kurslari', path: '/til-kurslari' },
    { name: t('nav.blog') || 'Blog', path: '/blog' },
    { name: t('nav.contact'), path: '/#contact' },
  ];

  // hide on scroll down, reveal on scroll up (rAF-throttled, state only changes on flips)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolid(y > 12);
        setHidden(y > lastY.current && y > 120);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // scroll-spy: on the landing page the "Aloqa" link lights up while the contact section is on screen
  useEffect(() => {
    setContactInView(false);
    if (location.pathname !== '/') return;
    let io: IntersectionObserver | null = null;
    let tries = 0;
    const attach = () => {
      const el = document.getElementById('contact');
      if (!el) {
        if (tries++ < 20) timer = window.setTimeout(attach, 250);
        return;
      }
      io = new IntersectionObserver(([e]) => setContactInView(e.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
      io.observe(el);
    };
    let timer = window.setTimeout(attach, 0);
    return () => {
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, [location.pathname]);

  // close menus on route change
  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // mobile menu: lock scroll, Esc closes, focus first link, Tab stays inside the header
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t0 = window.setTimeout(() => firstLinkRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !headerRef.current) return;
      const items = Array.from<HTMLElement>(headerRef.current.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const cur = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (cur === first || !headerRef.current.contains(cur))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (cur === last || !headerRef.current.contains(cur))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t0);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // language popover: click outside / Esc closes
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLangOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const go = useCallback(
    (e: React.MouseEvent, path: string) => {
      if (path !== '/#contact') return;
      e.preventDefault();
      setOpen(false);
      // Home is lazy-loaded: after navigating, poll (up to ~3s) until #contact exists, then scroll to it
      const scroll = () => {
        let tries = 0;
        const tick = () => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else if (tries++ < 30) window.setTimeout(tick, 100);
        };
        tick();
      };
      if (location.pathname !== '/') {
        navigate('/');
        window.setTimeout(scroll, 120); // let the route's own scroll-to-top run first
      } else scroll();
    },
    [location.pathname, navigate],
  );

  const isContact = (path: string) => path === '/#contact';
  const active = (path: string) => (isContact(path) ? location.pathname === '/' && contactInView : location.pathname.startsWith(path));
  const activePath = links.find((l) => active(l.path))?.path ?? null;
  const lit = hover ?? activePath;
  const navH = 64; // constant: a height change on scroll would register as layout shift
  const iconBtn = 'w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-3)]';
  const phone = siteContent.contactPhone;

  return (
    <header ref={headerRef} className="v2 !bg-transparent fixed top-0 inset-x-0 z-50" style={{ overflow: 'visible' }} onFocusCapture={() => setHidden(false)}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn btn-primary z-[60]">
        Asosiy mazmunga oʻtish
      </a>
      <div
        className="relative transition-[transform,background-color,box-shadow] duration-500"
        style={{
          transform: hidden && !open ? 'translateY(-100%)' : 'none',
          transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
          background: solid || open ? (isDark ? 'rgba(0,0,0,.72)' : 'rgba(251,252,254,.78)') : 'transparent',
          backdropFilter: solid || open ? 'saturate(180%) blur(20px)' : 'none',
          WebkitBackdropFilter: solid || open ? 'saturate(180%) blur(20px)' : 'none',
          boxShadow: solid ? (isDark ? '0 18px 40px -28px rgba(0,97,255,.55)' : '0 18px 40px -30px rgba(5,7,13,.35)') : 'none',
        }}
      >
        <nav className="wrap flex items-center gap-6" style={{ height: navH }} aria-label="Asosiy menyu">
          <Link to="/" className="shrink-0 flex items-center min-h-[44px]" aria-label="DATA Taʼlim Stansiyasi — bosh sahifa" style={{ color: 'var(--fg)' }}>
            <Logo width={104} />
          </Link>

          <ul className="hidden lg:flex items-center gap-0.5 mx-auto" onMouseLeave={() => setHover(null)}>
            {links.map((l) => {
              const on = active(l.path);
              return (
                <li key={l.path} className="relative">
                  {lit === l.path && (
                    <motion.span
                      layoutId="v2-nav-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--bg-3)' }}
                      transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
                    />
                  )}
                  <Link
                    to={isContact(l.path) ? '/' : l.path}
                    onClick={(e) => go(e, l.path)}
                    onMouseEnter={() => setHover(l.path)}
                    onFocus={() => setHover(l.path)}
                    onBlur={() => setHover(null)}
                    aria-current={on ? (isContact(l.path) ? 'location' : 'page') : undefined}
                    className="relative inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-full text-[0.875rem] font-medium transition-colors"
                    style={{ color: on || hover === l.path ? 'var(--fg)' : 'var(--fg-2)' }}
                  >
                    {l.name}
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: 'var(--cyan-ink)', opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(0)', boxShadow: on ? '0 0 8px var(--cyan-ink)' : 'none' }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto lg:ml-0 flex items-center gap-1">
            <button type="button" onClick={toggleTheme} className={iconBtn} aria-label={isDark ? 'Yorugʻ rejimga oʻtish' : 'Qorongʻi rejimga oʻtish'}>
              {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>

            <div ref={langRef} className="relative">
              <button
                type="button"
                className={`${iconBtn} mono text-[0.8rem]`}
                aria-expanded={langOpen}
                aria-controls="v2-lang-menu"
                aria-label={`Til: ${LANGS.find((l) => l.code === lang)?.label}`}
                onClick={() => setLangOpen((v) => !v)}
              >
                {LANGS.find((l) => l.code === lang)?.short}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.ul
                    id="v2-lang-menu"
                    aria-label="Tilni tanlang"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-44 p-1.5 rounded-2xl panel shadow-2xl"
                  >
                    {LANGS.map((l) => (
                      <li key={l.code}>
                        <button
                          type="button"
                          aria-current={lang === l.code ? 'true' : undefined}
                          lang={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 min-h-[44px] rounded-xl text-sm cursor-pointer hover:bg-[var(--bg-3)]"
                        >
                          {l.label}
                          {lang === l.code && <Check size={16} className="ink-blue" aria-hidden="true" />}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <Link to="/karyera-testi" className="btn btn-primary nav-cta !min-h-[44px] !px-4 !text-[0.875rem] ml-2">
              {t('nav.careerTest')}
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              className={`${iconBtn} lg:hidden`}
              aria-expanded={open}
              aria-controls="v2-mobile-menu"
              aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? 'x' : 'm'}
                  initial={{ rotate: open ? -80 : 80, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: open ? 80 : -80, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
        {/* brand hairline under the bar once the page has scrolled */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px transition-opacity duration-500"
          style={{ opacity: solid ? 1 : 0, background: 'linear-gradient(90deg, transparent, var(--line-2) 18%, var(--line-2) 82%, transparent)' }}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="v2-mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.42, ease: EASE }}
            className="lg:hidden fixed inset-x-0 bottom-0 overflow-y-auto"
            style={{ top: navH, background: isDark ? '#000' : '#fbfcfe' }}
          >
            {/* a faint 4-point star as a backdrop */}
            <svg aria-hidden="true" viewBox="0 0 53.82 53.82" className="pointer-events-none absolute -right-16 top-10 w-[18rem] opacity-[.07]" style={{ color: 'var(--blue-ink)' }}>
              <path
                fill="currentColor"
                d="M28.06.91l2.46,10.03c1.5,6.09,6.25,10.85,12.35,12.35l10.03,2.46c1.21.3,1.21,2.02,0,2.31l-10.03,2.46c-6.09,1.5-10.85,6.25-12.35,12.35l-2.46,10.03c-.3,1.21-2.02,1.21-2.31,0l-2.46-10.03c-1.5-6.09-6.25-10.85-12.35-12.35L.91,28.06c-1.21-.3-1.21-2.02,0-2.31l10.03-2.46c6.09-1.5,10.85-6.25,12.35-12.35L25.75.91c.3-1.21,2.02-1.21,2.31,0Z"
              />
            </svg>
            <div className="wrap relative pt-4 pb-10">
              <ul>
                {links.map((l, i) => {
                  const on = active(l.path);
                  return (
                    <motion.li
                      key={l.path}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + 0.045 * i, duration: 0.4, ease: EASE }}
                      className="hairline"
                    >
                      <Link
                        ref={i === 0 ? firstLinkRef : undefined}
                        to={isContact(l.path) ? '/' : l.path}
                        onClick={(e) => go(e, l.path)}
                        aria-current={on ? (isContact(l.path) ? 'location' : 'page') : undefined}
                        className="group flex items-center gap-4 py-3.5 min-h-[60px]"
                      >
                        <span className="mono text-[0.75rem] w-6" style={{ color: on ? 'var(--cyan-ink)' : 'var(--fg-3)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`flex-1 text-[1.6rem] font-semibold tracking-[-0.03em] ${on ? 'ink-grad' : ''}`}>{l.name}</span>
                        <ArrowUpRight size={20} aria-hidden="true" style={{ color: on ? 'var(--cyan-ink)' : 'var(--fg-3)' }} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + 0.045 * links.length, duration: 0.4, ease: EASE }}
                className="hairline pt-8"
              >
                <Link to="/karyera-testi" className="btn btn-primary w-full">
                  <Sparkles size={18} aria-hidden="true" /> {t('nav.careerTest')}
                </Link>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="mono inline-flex items-center min-h-[44px] text-[1.05rem]" style={{ color: 'var(--fg)' }}>
                    {phone}
                  </a>
                  <ul className="flex gap-2">
                    <li>
                      <a href="https://instagram.com/data_talim_stansiyasi" target="_blank" rel="noopener noreferrer" aria-label="Instagram (yangi oynada ochiladi)" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--line-2)' }}>
                        <Instagram size={18} aria-hidden="true" />
                      </a>
                    </li>
                    <li>
                      <a href="https://t.me/data_talim_stansiyasi" target="_blank" rel="noopener noreferrer" aria-label="Telegram (yangi oynada ochiladi)" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--line-2)' }}>
                        <Send size={18} aria-hidden="true" />
                      </a>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
