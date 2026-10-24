import React from 'react';
import { SEO } from '../components/SEO';
import { CoursesCatalog } from '../components/v2/pages/courses/Catalog';
import '../components/v2/v2.css';

// v2 dizayn: /kurslar katalogi. Ma'lumot (useStore.courses) admin paneldan tahrirlanadi.
export default function Courses() {
  return (
    <div className="v2">
      <SEO title="Barcha Kurslar" description="Dasturlash, Media, Moliya va Kids yo'nalishlarida zamonaviy kasblarni o'rganing. Amaliy ta'lim va ish bilan ta'minlash." />
      <CoursesCatalog />
    </div>
  );
}
