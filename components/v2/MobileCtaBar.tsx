import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { openConsult } from './consult';
import { afterHeroY, useIsDesktop } from './utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// O'z pastki paneli/oqimi bor sahifalar: kurs sahifasi (narx + yozilish paneli) va karyera testi
const hiddenOn = (path: string) => {
  const p = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return p === '/karyera-testi' || /^\/kurslar\/[^/]+$/.test(p);
};

// Ko'rinib turganda panel yashirinadi: o'zi CTA bo'lgan bloklar (forma, yakuniy CTA) va footer.
// Sahifalar yakuniy CTA/forma bo'limiga `data-hide-mcta` atributini qo'yadi; bosh sahifa formasi — #contact.
const HIDE_SEL = '[data-hide-mcta], #contact, footer';

/** Mobil pastki CTA paneli — barcha ommaviy sahifalar uchun bitta (App.tsx › PublicLayout). */
export const MobileCtaBar: React.FC = () => {
  const contactPhone = useStore((s) => s.siteContent.contactPhone);
  const { pathname } = useLocation();
  // lg+ ekranda panel umuman yo'q — scroll/resize listener va observer'lar ham ishlamaydi
  const desktop = useIsDesktop();
  const off = desktop || hiddenOn(pathname);
  const [past, setPast] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // ~0.6 ekrandan keyin chiqadi; bosh sahifada — hero sahnasi tugagach (afterHeroY)
  useEffect(() => {
    if (off) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setPast(window.scrollY > afterHeroY(window.innerHeight * 0.6));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [off, pathname]);

  // yashiruvchi bloklar IntersectionObserver bilan kuzatiladi (scroll kadrida layout o'qilmaydi);
  // lazy sahifa kontenti keyin paydo bo'lgani uchun DOM o'zgarsa qayta qidiriladi
  useEffect(() => {
    if (off) return;
    const seen = new Set<Element>();
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setBlocked(visible.size > 0);
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    const scan = () => {
      seen.forEach((el) => {
        if (!el.isConnected) { io.unobserve(el); seen.delete(el); visible.delete(el); }
      });
      document.querySelectorAll(HIDE_SEL).forEach((el) => {
        if (!seen.has(el)) { seen.add(el); io.observe(el); }
      });
      setBlocked(visible.size > 0);
    };
    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      if (!t) t = window.setTimeout(() => { t = 0; scan(); }, 250);
    });
    mo.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [off, pathname]);

  if (off) return null;
  const show = past && !blocked;
  const tel = (contactPhone || '').replace(/[^\d+]/g, '');

  return (
    <div className="v2 mcta-host">
      <AnimatePresence>
        {show && (
          <motion.div
            className="mobile-cta lg:hidden"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {tel && (
              <a href={`tel:${tel}`} className="mobile-cta-call" aria-label={`Qoʻngʻiroq qilish: ${contactPhone}`}>
                <Phone size={20} aria-hidden="true" />
              </a>
            )}
            <button type="button" onClick={() => openConsult()} className="btn btn-primary flex-1 !min-h-[48px]">
              Bepul konsultatsiya
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
