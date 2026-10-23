import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { Logo } from '../BrandElements';
import './v2.css';

const LANGS = [
  { code: 'uz' as const, short: 'UZ', label: 'Oʻzbekcha' },
  { code: 'ru' as const, short: 'RU', label: 'Русский' },
  { code: 'en' as const, short: 'EN', label: 'English' },
];

export const NavbarV2: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastY = useRef(0);
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

  // close menus on route change
  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // mobile menu: lock scroll, Esc closes, focus first link
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
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
      const scroll = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(scroll, 350);
      } else scroll();
    },
    [location.pathname, navigate],
  );

  const active = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const iconBtn = 'w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-3)]';

  return (
    <header className="v2 !bg-transparent fixed top-0 inset-x-0 z-50" style={{ overflow: 'visible' }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn btn-primary z-[60]">
        Asosiy mazmunga oʻtish
      </a>
      <div
        className="transition-[transform,background-color,border-color] duration-500"
        style={{
          transform: hidden && !open ? 'translateY(-100%)' : 'none',
          transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
          background: solid || open ? (isDark ? 'rgba(0,0,0,.72)' : 'rgba(251,252,254,.78)') : 'transparent',
          backdropFilter: solid || open ? 'saturate(180%) blur(20px)' : 'none',
          WebkitBackdropFilter: solid || open ? 'saturate(180%) blur(20px)' : 'none',
          borderBottom: `1px solid ${solid ? 'var(--line)' : 'transparent'}`,
        }}
      >
        <nav className="wrap h-16 flex items-center gap-6" aria-label="Asosiy menyu">
          <Link to="/" className="shrink-0 flex items-center min-h-[44px]" aria-label="DATA Taʼlim Stansiyasi — bosh sahifa" style={{ color: 'var(--fg)' }}>
            <Logo width={104} />
          </Link>

          <ul className="hidden lg:flex items-center gap-1 mx-auto">
            {links.map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path === '/#contact' ? '/' : l.path}
                  onClick={(e) => go(e, l.path)}
                  aria-current={active(l.path) && l.path !== '/#contact' ? 'page' : undefined}
                  className="px-3.5 py-2 rounded-full text-[0.875rem] font-medium transition-colors"
                  style={{ color: active(l.path) && l.path !== '/#contact' ? 'var(--fg)' : 'var(--fg-2)' }}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto lg:ml-0 flex items-center gap-1">
            <button type="button" onClick={toggleTheme} className={iconBtn} aria-label={isDark ? 'Yorugʻ rejimga oʻtish' : 'Qorongʻi rejimga oʻtish'}>
              {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>

            <div ref={langRef} className="relative">
              <button
                type="button"
                className={`${iconBtn} mono text-[0.8rem]`}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={`Til: ${LANGS.find((l) => l.code === lang)?.label}`}
                onClick={() => setLangOpen((v) => !v)}
              >
                {LANGS.find((l) => l.code === lang)?.short}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.ul
                    role="listbox"
                    aria-label="Tilni tanlang"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-44 p-1.5 rounded-2xl panel shadow-2xl"
                  >
                    {LANGS.map((l) => (
                      <li key={l.code} role="option" aria-selected={lang === l.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-[var(--bg-3)]"
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

            <Link to="/karyera-testi" className="btn btn-primary hidden sm:inline-flex !min-h-[40px] !px-4 !text-[0.875rem] ml-2">
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
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="v2-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 overflow-y-auto"
            style={{ background: isDark ? 'rgba(0,0,0,.96)' : 'rgba(251,252,254,.97)' }}
          >
            <ul className="wrap pt-6 pb-10">
              {links.map((l, i) => (
                <motion.li
                  key={l.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3 }}
                  className="hairline"
                >
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={l.path === '/#contact' ? '/' : l.path}
                    onClick={(e) => go(e, l.path)}
                    className="flex items-center py-4 text-[1.6rem] font-semibold tracking-[-0.03em] min-h-[56px]"
                  >
                    {l.name}
                  </Link>
                </motion.li>
              ))}
              <li className="pt-8">
                <Link to="/karyera-testi" className="btn btn-primary w-full">
                  {t('nav.careerTest')}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
