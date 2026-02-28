import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { Button } from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage, translations } from '../../i18n';
import { Logo } from '../BrandElements';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.courses'), path: '/courses' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.team'), path: '/team' },
    { name: t('nav.contact'), path: '/#contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Glass pill follows: hoveredLink > active route
  const activePath = navLinks.find(l => isActive(l.path))?.path || '/';
  const glassTarget = hoveredLink || activePath;

  const languages = [
    { code: 'uz' as const, label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru' as const, label: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-4 left-0 right-0 mx-auto w-[calc(100%-2rem)] md:top-6 md:w-[calc(100%-3rem)] max-w-7xl z-50 transition-all duration-500 rounded-[2rem]`}
      style={{
        background: isDark
          ? (scrolled ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)')
          : (scrolled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)'),
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: isDark
          ? `1px solid rgba(255,255,255,${scrolled ? '0.08' : '0.04'})`
          : `1px solid rgba(255,255,255,${scrolled ? '0.5' : '0.3'})`,
        boxShadow: isDark
          ? (scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.2)')
          : (scrolled ? '0 8px 32px rgba(0,0,0,0.08)' : '0 4px 24px rgba(0,0,0,0.04)'),
      }}
    >
      <div className="px-6 md:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo width={160} style={{ color: isDark ? '#ffffff' : '#0061ff' }} className="group-hover:scale-105 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation — Liquid Glass Pill */}
          <div
            className="hidden md:flex items-center gap-0.5 p-1.5 rounded-full relative"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(148,163,184,0.12)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.6)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className="relative px-5 py-2.5 text-sm font-bold rounded-full transition-colors duration-200 z-10"
                style={{
                  color: glassTarget === link.path
                    ? (isDark ? '#60efff' : '#0061ff')
                    : (isDark ? '#94a3b8' : '#475569'),
                }}
                onMouseEnter={() => setHoveredLink(link.path)}
              >
                {/* Glass pill indicator */}
                {glassTarget === link.path && (
                  <motion.div
                    layoutId="navbar-glass-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(255,255,255,0.8)',
                      boxShadow: isDark
                        ? '0 2px 16px rgba(0,97,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 2px 16px rgba(0,97,255,0.08), inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Right side: Theme + Language + CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.15)',
                color: isDark ? '#94a3b8' : '#64748b',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
              title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-bold"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.15)',
                  color: isDark ? '#94a3b8' : '#64748b',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
                title="Tilni tanlash"
              >
                {lang.toUpperCase()}
              </button>
              {langMenuOpen && (
                <div
                  className="absolute right-0 top-12 rounded-2xl shadow-xl p-2 min-w-[160px] z-50"
                  style={{
                    background: isDark ? 'rgba(10,10,10,0.95)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    backdropFilter: isDark ? 'blur(24px)' : 'none',
                  }}
                >
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                      className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-bold flex items-center gap-3 transition-colors ${lang === l.code
                        ? (isDark ? 'bg-blue-500/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]')
                        : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
                        }`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/career-test">
              <Button className="!px-6 !py-3 !rounded-full bg-gradient-to-r from-[#0061ff] to-[#60efff] text-white shadow-[0_8px_16px_-6px_rgba(0,97,255,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(0,97,255,0.5)] border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105">
                {t('nav.careerTest')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full shadow-sm"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                color: isDark ? '#94a3b8' : '#475569',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.5)',
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-12 h-12 flex items-center justify-center rounded-full shadow-sm transition-colors"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                color: isDark ? '#e2e8f0' : '#475569',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.5)',
              }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden rounded-b-[2rem]"
            style={{
              background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px)',
              borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.5)',
            }}
          >
            <div className="px-6 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className={`block px-6 py-4 text-lg font-bold rounded-2xl transition-all ${isActive(link.path)
                    ? (isDark ? 'bg-blue-500/10 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]')
                    : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              {/* Mobile language selector */}
              <div className="flex gap-2 px-6 py-3">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${lang === l.code
                      ? (isDark ? 'bg-blue-500/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]')
                      : (isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-500')
                      }`}
                  >
                    {l.flag} {l.code.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/career-test" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#0061ff] to-[#60efff] text-white rounded-2xl py-6 text-lg font-bold shadow-lg shadow-blue-500/30 border-0">
                    {t('nav.careerTest')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
