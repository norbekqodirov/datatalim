import React from 'react';
import { SEO } from '../components/SEO';
import { StarSeam, CinemaBand } from '../components/v2/fx';
import {
  AboutHero,
  MissionScene,
  AboutNumbers,
  Chronicle,
  StationScene,
  ValuesScene,
  FacilitiesScene,
  DirectionsScene,
  PlaceScene,
  AboutClosing,
} from '../components/v2/pages/about/AboutScenes';
import '../components/v2/v2.css';

// v2 "Biz haqimizda": scroll-driven story of DATA Ta'lim Stansiyasi.
// Admin-editable data (siteContent.aboutTitle / aboutDescription / aboutQuote / aboutImage /
// founder* / contact*) is read inside the scenes; the previous page lives in git history.
export default function About() {
  return (
    <div className="v2">
      <SEO title="Biz haqimizda" description="DATA Ta'lim Stansiyasi — Urganchdagi zamonaviy o'quv markazi: 250+ kompyuter, 1600+ o'quvchi sig'imi, amaliy darslar va ish bilan ta'minlash." />
      <AboutHero />
      <MissionScene />
      <AboutNumbers />
      <StarSeam />
      <Chronicle />
      <CinemaBand src="/images/v2/about-star.webp" className="py-[6vh]" />
      <StationScene />
      <StarSeam />
      <ValuesScene />
      <FacilitiesScene />
      <DirectionsScene />
      <StarSeam />
      <PlaceScene />
      <AboutClosing />
    </div>
  );
}
