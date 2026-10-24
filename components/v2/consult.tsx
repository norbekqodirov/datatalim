import React, { useEffect, useState } from 'react';
import { EnrollModal } from '../EnrollModal';

// Saytning istalgan joyidan "Bepul konsultatsiya" oynasini ochish: bitta modal PublicLayout'da turadi,
// tugmalar esa faqat hodisa yuboradi (har komponent o'z modalini saqlab yurmasin)
const EVENT = 'v2:open-consult';

export const openConsult = (course?: string) => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { course } }));
};

export const ConsultHost: React.FC = () => {
  const [course, setCourse] = useState<string | null>(null);

  useEffect(() => {
    const on = (e: Event) => setCourse((e as CustomEvent<{ course?: string }>).detail?.course || 'Mos kursni tanlash');
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  return <EnrollModal isOpen={course !== null} onClose={() => setCourse(null)} courseName={course || ''} type="consult" />;
};
