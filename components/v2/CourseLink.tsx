import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../data/courses';

/** Kursning alohida landing sahifasi bo'lsa (masalan https://ai.datatalim.uz) — o'sha manzil, aks holda null. */
export function courseExternalUrl(c: Pick<Course, 'externalUrl'>): string | null {
  const u = c.externalUrl?.trim();
  if (!u) return null;
  try {
    const url = new URL(u);
    // faqat o'zimizning https subdomenlarimiz: admin xatosi foydalanuvchini begona saytga olib ketmasin
    return url.protocol === 'https:' && (url.hostname === 'datatalim.uz' || url.hostname.endsWith('.datatalim.uz')) ? url.href : null;
  } catch {
    return null;
  }
}

/** Kurs havolasi: alohida landingi bo'lsa o'sha subdomenga (oddiy <a>), aks holda /kurslar/:id ga. */
export const CourseLink: React.FC<{ course: Course; className?: string; children: React.ReactNode }> = ({ course, className, children }) => {
  const ext = courseExternalUrl(course);
  if (ext) return <a href={ext} className={className}>{children}</a>;
  return <Link to={`/kurslar/${course.id}`} className={className}>{children}</Link>;
};
