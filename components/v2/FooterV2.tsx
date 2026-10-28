import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Send, ArrowUpRight, ArrowRight, Sparkles, MapPin, Mail, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { Logo } from '../BrandElements';
import { uz, useMotionReduced, setMotionReduced } from './utils';
import './v2.css';

const SOCIAL = [
  { icon: Instagram, href: 'https://instagram.com/data_talim_stansiyasi', label: 'Instagram' },
  { icon: Send, href: 'https://t.me/data_talim_stansiyasi', label: 'Telegram' },
];

const Heading: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <p id={id} className="t-kicker mb-4 flex items-center gap-2.5">
    <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rotate-45" style={{ background: 'var(--cyan-ink)' }} />
    {children}
  </p>
);

const OWN_CTA = ['/', '/karyera-testi', '/biz-haqimizda', '/til-kurslari', '/jamoa'];
const hasOwnClosingCta = (path: string) => {
  const p = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return OWN_CTA.includes(p) || /^\/kurslar\/[^/]+$/.test(p);
};

export const FooterV2: React.FC = () => {
  const { siteContent, courses } = useStore();
  const { t, tField } = useLanguage();
  const year = new Date().getFullYear();
  const reduced = useMotionReduced();
  // oʻz yakuniy CTA'si bor sahifalarda footer bandi takrorlanmasin (bitta sahifa — bitta yakuniy CTA)
  const showCta = !hasOwnClosingCta(useLocation().pathname);

  const pages = [
    { to: '/kurslar', name: t('nav.courses') },
    { to: '/karyera-testi', name: t('nav.careerTest') },
    { to: '/til-kurslari', name: t('nav.languages') || 'Til kurslari' },
    { to: '/biz-haqimizda', name: t('nav.about') },
    { to: '/jamoa', name: t('nav.team') },
    { to: '/blog', name: t('nav.blog') || 'Blog' },
  ];
  // mobilda 44px teginish maydoni; sichqoncha bilan ixchamroq ritm
  const linkCls = 'foot-link inline-flex items-center min-h-[44px] lg:min-h-[34px]';

  return (
    <footer className="v2 relative overflow-hidden" style={{ position: 'relative', borderTop: '1px solid var(--line)' }}>
      {/* soft brand glow rising from the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: 'radial-gradient(60% 80% at 50% 100%, color-mix(in srgb, var(--blue) 16%, transparent), transparent 70%)' }}
      />
      <div className="wrap relative pt-10 sm:pt-16 pb-6 sm:pb-8">
        {/* 1 — the one action that matters */}
        {showCta && (
          <div className="foot-cta grid gap-6 lg:gap-10 lg:grid-cols-12 lg:items-center mb-14 sm:mb-16">
            {/* kompas — "yoʻnalishni topish" metaforasi, test CTA'siga ishora */}
            <div className="lg:col-span-3 flex lg:justify-center" aria-hidden="true">
              <img src="/images/v2/icons/why-test.webp" alt="" width={320} height={320} loading="lazy" decoding="async" className="foot-compass" />
            </div>
            <div className="lg:col-span-6">
              <p className="t-kicker mb-4">Boshlash</p>
              <h2 className="t-h2 max-w-[18ch]">Qaysi kasb sizga mos?</h2>
              <p className="t-lead mt-4 max-w-lg">Bepul karyera testi yoʻnalishingizni aniqlashga yordam beradi.</p>
            </div>
            <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col lg:items-stretch gap-3">
              <Link to="/karyera-testi" className="btn btn-primary">
                <Sparkles size={18} aria-hidden="true" /> Kasbingizni aniqlang
              </Link>
              <Link to="/kurslar" className="btn btn-ghost">
                Kurslarni koʻrish <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        {/* 2 — directory */}
        <div className="grid gap-x-6 sm:gap-x-10 gap-y-8 sm:gap-y-10 grid-cols-2 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" aria-label="DATA Taʼlim Stansiyasi — bosh sahifa" className="inline-flex items-center min-h-[44px]" style={{ color: 'var(--fg)' }}>
              <Logo width={150} />
            </Link>
            <p className="t-body mt-3 sm:mt-5 max-w-sm">
              Dasturlash, sunʼiy intellekt, media, dizayn va moliya boʻyicha zamonaviy oʻquv markazi. Urganch, 2019-yildan beri.
            </p>
            <ul className="mt-4 sm:mt-6 flex flex-wrap gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (yangi oynada ochiladi)`}
                    className="foot-chip inline-flex items-center gap-2.5 min-h-[44px] pl-3.5 pr-4 rounded-full text-sm font-medium"
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="col-span-1 lg:col-span-2" aria-labelledby="foot-pages">
            <Heading id="foot-pages">Sahifalar</Heading>
            <ul className="grid">
              {pages.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className={linkCls}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="col-span-1 lg:col-span-3" aria-labelledby="foot-courses">
            <Heading id="foot-courses">Kurslar</Heading>
            <ul className="grid">
              {courses.slice(0, 7).map((c, i) => (
                <li key={c.id} className={i > 4 ? 'hidden sm:block' : undefined}>
                  <Link to={`/kurslar/${c.id}`} className={`${linkCls} leading-snug py-1`}>{uz(tField(c.title))}</Link>
                </li>
              ))}
              <li>
                <Link to="/kurslar" className="link-arrow min-h-[44px] lg:min-h-[34px] mt-1">Barcha kurslar <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </li>
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-3">
            <Heading>Aloqa</Heading>
            <a
              href={`tel:${siteContent.contactPhone.replace(/[^\d+]/g, '')}`}
              className="foot-phone mono inline-flex items-center min-h-[44px] text-[1.35rem] sm:text-[1.5rem] tracking-[-0.03em]"
              style={{ color: 'var(--fg)' }}
            >
              {siteContent.contactPhone}
            </a>
            <address className="not-italic grid gap-1 mt-2 ink-2">
              <a href={`mailto:${siteContent.contactEmail}`} className={`${linkCls} gap-2.5 break-all`}>
                <Mail size={16} className="shrink-0 ink-3" aria-hidden="true" />
                {siteContent.contactEmail}
              </a>
              <span className="flex items-start gap-2.5 py-2">
                <MapPin size={16} className="shrink-0 mt-1 ink-3" aria-hidden="true" />
                <span>
                  {uz(tField(siteContent.contactAddress))}
                  {siteContent.contactLandmark && <span className="block ink-3">{uz(tField(siteContent.contactLandmark))}</span>}
                </span>
              </span>
              <span className="flex items-start gap-2.5 py-2">
                <Clock size={16} className="shrink-0 mt-1 ink-3" aria-hidden="true" />
                {uz(tField(siteContent.contactSchedule))}
              </span>
            </address>
          </div>
        </div>

        {/* 3 — fine print */}
        <div className="mt-8 sm:mt-14 pt-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm ink-3" style={{ borderTop: '1px solid var(--line)' }}>
          <span>© {year} DATA Taʼlim Stansiyasi. {t('footer.rights')}</span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <button
              type="button"
              onClick={() => setMotionReduced(!reduced)}
              role="switch"
              aria-checked={!reduced}
              className="foot-link inline-flex items-center gap-2.5 text-left min-h-[44px] cursor-pointer"
            >
              <span aria-hidden="true" className="relative inline-block w-7 h-4 rounded-full shrink-0 transition-colors" style={{ background: reduced ? 'var(--line-2)' : 'var(--blue)' }}>
                <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: reduced ? 2 : 14 }} />
              </span>
              Animatsiya
            </button>
            <span className="mono text-[0.75rem]">Urganch · Xorazm · Oʻzbekiston</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
