import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { EnrollModal } from '../EnrollModal';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';

// Saytning istalgan joyidan "Bepul konsultatsiya" oynasini ochish: bitta modal PublicLayout'da turadi,
// tugmalar esa faqat hodisa yuboradi (har komponent o'z modalini saqlab yurmasin)
const EVENT = 'v2:open-consult';

export const openConsult = (course?: string) => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { course } }));
};

// Buzuq URL (masalan kesilgan "%E0%A4%A") butun saytni qulatmasin
const safeDecode = (s: string) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

export const ConsultHost: React.FC = () => {
  const [course, setCourse] = useState<string | null>(null);
  const { pathname } = useLocation();
  const courses = useStore((s) => s.courses);
  const { tField } = useLanguage();

  // /kurslar/:id sahifasida ochilsa — shu kurs nomi kontekst bo'ladi (CRM va Lead.content_name'da qaysi kursdan ekani ko'rinsin)
  const pageCourse = useRef<string | null>(null);
  const m = pathname.match(/^\/kurslar\/([^/]+)\/?$/);
  const current = m ? courses.find((c) => c.id === safeDecode(m[1])) : undefined;
  pageCourse.current = current ? tField(current.title) : null;

  useEffect(() => {
    const on = (e: Event) =>
      setCourse((e as CustomEvent<{ course?: string }>).detail?.course || pageCourse.current || 'Mos kursni tanlash');
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  return <EnrollModal isOpen={course !== null} onClose={() => setCourse(null)} courseName={course || ''} type="consult" />;
};
