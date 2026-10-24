import React from 'react';
import { useStore } from '../store/useStore';
import { SEO } from '../components/SEO';
import { HeroSignal } from '../components/v2/HeroSignal';
import { Manifesto, Numbers } from '../components/v2/Manifesto';
import { Directions } from '../components/v2/Directions';
import { CareerLab } from '../components/v2/CareerLab';
import { Campus } from '../components/v2/Campus';
import { Voices, TeamStrip } from '../components/v2/People';
import { FaqV2, ContactV2 } from '../components/v2/Closing';
import { StarSeam } from '../components/v2/fx';
import { Gallery } from '../components/v2/Gallery';
import '../components/v2/v2.css';

// v2 landing ("DATA · Signal"). The previous homepage lives on in pages/HomeClassic.tsx
// (route /eski-dizayn) so both can be compared. Admin visibility toggles still apply.
export default function Home() {
  const { visibility: v } = useStore();

  return (
    <div className="v2">
      <SEO
        title="IT va zamonaviy kasblar kurslari — Urganch"
        description="DATA Taʼlim Stansiyasi — Urganchdagi dasturlash, sunʼiy intellekt, media, dizayn va moliya boʻyicha zamonaviy oʻquv markazi. Bepul karyera testi va konsultatsiya."
      />
      {v.hero && <HeroSignal />}
      {v.about && (
        <>
          <Manifesto />
          <Numbers />
        </>
      )}
      {v.courses && <Directions />}
      {v.careerTest && (
        <>
          <StarSeam />
          <CareerLab />
        </>
      )}
      {(v.facilities || v.tourVideo) && (
        <>
          <StarSeam />
          <Campus />
        </>
      )}
      {v.gallery && <Gallery />}
      {v.testimonials && <Voices />}
      {v.team && <TeamStrip />}
      {v.faq && (
        <>
          <StarSeam />
          <FaqV2 />
        </>
      )}
      {v.contact && <ContactV2 />}
    </div>
  );
}
