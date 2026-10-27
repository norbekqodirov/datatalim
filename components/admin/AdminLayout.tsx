import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Settings, LogOut, Eye, Video, Sun, Moon,
  Target, Menu, X, FileText, Inbox, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../store/ThemeContext';
import './admin.css';

const NAV_GROUPS = [
  {
    label: 'Asosiy',
    items: [
      { path: '/paneladmindata', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { path: '/paneladmindata/leads', icon: Inbox, label: 'Arizalar' },
      { path: '/paneladmindata/marketing', icon: Target, label: 'Marketing' },
    ],
  },
  {
    label: 'Kontent',
    items: [
      { path: '/paneladmindata/courses', icon: BookOpen, label: 'Kurslar' },
      { path: '/paneladmindata/posts', icon: FileText, label: 'Blog' },
      { path: '/paneladmindata/team', icon: Users, label: 'Jamoa' },
      { path: '/paneladmindata/media', icon: Video, label: 'Media & Matnlar' },
    ],
  },
  {
    label: 'Tizim',
    items: [
      { path: '/paneladmindata/visibility', icon: Eye, label: "Boʻlimlar" },
      { path: '/paneladmindata/settings', icon: Settings, label: 'Sozlamalar' },
    ],
  },
];

const CRUMBS: { match: string; label: string }[] = [
  { match: '/leads', label: 'Asosiy / Arizalar' },
  { match: '/marketing', label: 'Asosiy / Marketing' },
  { match: '/courses', label: 'Kontent / Kurslar' },
  { match: '/posts', label: 'Kontent / Blog' },
  { match: '/team', label: 'Kontent / Jamoa' },
  { match: '/media', label: 'Kontent / Media & Matnlar' },
  { match: '/visibility', label: "Tizim / Boʻlimlar" },
  { match: '/settings', label: 'Tizim / Sozlamalar' },
];

const BrandMark: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <span
    aria-hidden="true"
    className="shrink-0 grid place-items-center text-white font-bold a-num"
    style={{
      width: size, height: size, borderRadius: size * 0.32, fontSize: size * 0.46,
      background: 'var(--a-grad)', boxShadow: '0 6px 16px -6px rgba(0,97,255,.65)', letterSpacing: '-0.06em',
    }}
  >
    D
  </span>
);

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuthTime');
    navigate('/paneladmindata/login');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Sahifa almashsa drawer yopiladi
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Drawer: Esc, fokus tuzog'i, scroll qulfi, fokusni qaytarish
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const btn = menuBtnRef.current;
    const focusables = (): HTMLElement[] => {
      const root = drawerRef.current;
      return root ? Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : [];
    };
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      btn?.focus();
    };
  }, [mobileOpen]);

  const crumb = location.pathname.replace(/\/$/, '') === '/paneladmindata'
    ? 'Asosiy / Dashboard'
    : CRUMBS.find(c => location.pathname.includes(c.match))?.label ?? 'Admin panel';

  const navItemCls = (active: boolean) =>
    `relative flex items-center gap-3 px-3 min-h-[44px] lg:min-h-[38px] rounded-[10px] text-[13.5px] font-medium transition-colors ${
      active ? 'text-[var(--a-fg)] bg-[var(--a-surface-2)]' : 'text-[var(--a-fg-2)] hover:text-[var(--a-fg)] hover:bg-[var(--a-surface-2)]'
    }`;

  const NavContent = ({ idPrefix }: { idPrefix: string }) => (
    <div className="flex flex-col h-full min-h-0">
      <nav aria-label="Asosiy navigatsiya" className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="a-kicker px-3 pb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={navItemCls(active)}
                  >
                    {active && (
                      <motion.span
                        layoutId={`${idPrefix}-indicator`}
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                        style={{ background: 'var(--a-grad)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    <item.icon size={17} strokeWidth={active ? 2.2 : 1.8} style={active ? { color: 'var(--a-blue-ink)' } : undefined} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 space-y-0.5" style={{ borderTop: '1px solid var(--a-line)' }}>
        <button type="button" onClick={toggleTheme} className={`${navItemCls(false)} w-full`}>
          {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          {isDark ? 'Yorugʻ rejim' : 'Qorongʻi rejim'}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="relative flex items-center gap-3 px-3 min-h-[44px] lg:min-h-[38px] w-full rounded-[10px] text-[13.5px] font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--a-red)_10%,transparent)]"
          style={{ color: 'var(--a-red-ink)' }}
        >
          <LogOut size={17} strokeWidth={1.8} />
          Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <div className="adm min-h-screen flex transition-colors duration-300">
      {/* Desktop sidebar */}
      <aside
        className="w-60 flex-col fixed h-full z-20 hidden lg:flex"
        style={{ background: 'var(--a-surface)', borderRight: '1px solid var(--a-line)' }}
      >
        <div className="h-16 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid var(--a-line)' }}>
          <Link to="/paneladmindata" className="flex items-center gap-2.5" aria-label="DATA admin">
            <BrandMark />
            <span className="leading-none">
              <span className="block text-[15px] font-bold tracking-tight">DATA</span>
              <span className="a-kicker block mt-1" style={{ fontSize: '.62rem' }}>Admin</span>
            </span>
          </Link>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--a-green)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--a-green) 18%, transparent)' }} title="Online" />
        </div>
        <NavContent idPrefix="d" />
      </aside>

      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-3 pl-4"
        style={{ background: 'color-mix(in srgb, var(--a-surface) 92%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--a-line)' }}
      >
        <Link to="/paneladmindata" className="flex items-center gap-2.5" aria-label="DATA admin">
          <BrandMark size={30} />
          <span className="text-[15px] font-bold tracking-tight">DATA <span className="a-kicker" style={{ fontSize: '.62rem' }}>Admin</span></span>
        </Link>
        <div className="flex items-center gap-1">
          <button type="button" onClick={toggleTheme} className="a-btn a-btn-ghost a-icon-btn" style={{ width: 44, height: 44 }} aria-label={isDark ? 'Yorugʻ rejimga oʻtish' : 'Qorongʻi rejimga oʻtish'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="a-btn a-btn-ghost a-icon-btn"
            style={{ width: 44, height: 44 }}
            aria-label="Menyuni ochish"
            aria-expanded={mobileOpen}
            aria-controls="admin-drawer"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="adm fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)' }}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              id="admin-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigatsiya menyusi"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="adm fixed left-0 top-0 bottom-0 w-[280px] max-w-[86vw] z-50 flex flex-col lg:hidden"
              style={{ background: 'var(--a-surface)', borderRight: '1px solid var(--a-line)' }}
            >
              <div className="h-14 flex items-center justify-between pl-4 pr-2 shrink-0" style={{ borderBottom: '1px solid var(--a-line)' }}>
                <span className="flex items-center gap-2.5">
                  <BrandMark size={30} />
                  <span className="text-[15px] font-bold tracking-tight">DATA <span className="a-kicker" style={{ fontSize: '.62rem' }}>Admin</span></span>
                </span>
                <button type="button" onClick={() => setMobileOpen(false)} className="a-btn a-btn-ghost a-icon-btn" style={{ width: 44, height: 44 }} aria-label="Menyuni yopish">
                  <X size={20} />
                </button>
              </div>
              <NavContent idPrefix="m" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 min-w-0 lg:ml-60 pt-14 lg:pt-0 min-h-screen relative">
        <div
          className="hidden lg:flex items-center justify-between px-8 h-14 sticky top-0 z-10"
          style={{ background: 'color-mix(in srgb, var(--a-bg) 85%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--a-line)' }}
        >
          <div className="a-kicker" style={{ textTransform: 'none', letterSpacing: '.04em', fontSize: '.78rem' }}>{crumb}</div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn-ghost" style={{ minHeight: 36, fontSize: '.8rem' }}>
              <Globe size={15} />
              Saytni ko&apos;rish
            </a>
            <div className="flex items-center gap-2 pl-1.5 pr-3 h-9 rounded-full" style={{ background: 'var(--a-surface)', border: '1px solid var(--a-line)' }}>
              <span className="w-6 h-6 rounded-full grid place-items-center text-white text-[11px] font-bold" style={{ background: 'var(--a-grad)' }}>A</span>
              <span className="text-xs font-semibold">Admin</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8 max-w-[1280px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
