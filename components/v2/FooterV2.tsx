import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Send, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { Logo } from '../BrandElements';
import { uz, useMotionReduced, setMotionReduced } from './utils';
import './v2.css';

const SOCIAL = [
  { icon: Instagram, href: 'https://instagram.com/data_talim_stansiyasi', label: 'Instagram' },
  { icon: Send, href: 'https://t.me/data_talim_stansiyasi', label: 'Telegram' },
];

export const FooterV2: React.FC = () => {
  const { siteContent, courses } = useStore();
  const { t, tField } = useLanguage();
  const year = new Date().getFullYear();
  const reduced = useMotionReduced();

  const pages = [
    { to: '/kurslar', name: t('nav.courses') },
    { to: '/karyera-testi', name: t('nav.careerTest') },
    { to: '/til-kurslari', name: t('nav.languages') || 'Til kurslari' },
    { to: '/biz-haqimizda', name: t('nav.about') },
    { to: '/jamoa', name: t('nav.team') },
    { to: '/blog', name: t('nav.blog') || 'Blog' },
  ];

  return (
    <footer className="v2 relative overflow-hidden" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="wrap pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" aria-label="DATA Taʼlim Stansiyasi — bosh sahifa" className="inline-flex" style={{ color: 'var(--fg)' }}>
              <Logo width={150} />
            </Link>
            <p className="t-body mt-6 max-w-sm">
              Dasturlash, sunʼiy intellekt, media, dizayn va moliya boʻyicha zamonaviy oʻquv markazi. Urganch, 2019-yildan beri.
            </p>
            <ul className="mt-6 flex gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (yangi oynada ochiladi)`}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-3)]"
                    style={{ border: '1px solid var(--line-2)' }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="lg:col-span-2" aria-label="Sahifalar">
            <p className="t-kicker mb-5">Sahifalar</p>
            <ul className="grid">
              {pages.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="ink-2 inline-flex items-center min-h-[44px] hover:underline underline-offset-4">{p.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-3" aria-label="Kurslar">
            <p className="t-kicker mb-5">Kurslar</p>
            <ul className="grid">
              {courses.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link to={`/kurslar/${c.id}`} className="ink-2 inline-flex items-center min-h-[44px] hover:underline underline-offset-4">{uz(tField(c.title))}</Link>
                </li>
              ))}
              <li>
                <Link to="/kurslar" className="link-arrow min-h-[44px]">Barcha kurslar <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="t-kicker mb-5">Aloqa</p>
            <address className="not-italic grid gap-1 ink-2">
              <span className="py-2">{uz(tField(siteContent.contactAddress))}</span>
              <a href={`tel:${siteContent.contactPhone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4" style={{ color: 'var(--fg)' }}>
                {siteContent.contactPhone}
              </a>
              <a href={`mailto:${siteContent.contactEmail}`} className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4">{siteContent.contactEmail}</a>
              <span className="py-2">{uz(tField(siteContent.contactSchedule))}</span>
            </address>
          </div>
        </div>

        {/* oversized wordmark — the page's sign-off */}
        <div className="mt-20 select-none pointer-events-none" aria-hidden="true" style={{ color: 'var(--bg-3)' }}>
          <Logo width={0} className="w-full h-auto" />
        </div>

        <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-3 justify-between text-sm ink-3" style={{ borderTop: '1px solid var(--line)' }}>
          <span>© {year} DATA Taʼlim Stansiyasi. {t('footer.rights')}</span>
          <span className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setMotionReduced(!reduced)}
              aria-pressed={reduced}
              className="inline-flex items-center min-h-[44px] hover:underline underline-offset-4 cursor-pointer"
            >
              {reduced ? 'Animatsiyani yoqish' : 'Harakatni kamaytirish'}
            </button>
            <span className="mono text-[0.75rem]">Urganch · Xorazm · Oʻzbekiston</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
