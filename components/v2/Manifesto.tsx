import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { Star3D, ScrollText } from './fx';

const TEXT =
  'Har bir kurs real loyiha bilan tugaydi: sayt, Telegram bot, brend, video yoki moliyaviy hisobot. ' +
  'Darslar kichik guruhlarda, amaliyotchi ustozlar bilan oʻtadi. Siz bizdan sertifikat bilan birga portfolio olib chiqasiz.';

export const Manifesto: React.FC = () => {
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start end', 'end start'] });

  return (
    <section ref={secRef} className="relative py-[18vh]" aria-labelledby="manifesto-k">
      {/* the hero's star keeps turning here: scroll-linked 3D object that carries the story over */}
      <Star3D progress={scrollYProgress} className="absolute -right-[4vw] top-[14%] w-[min(36vw,520px)] aspect-square opacity-[.9] pointer-events-none hidden md:block" />
      <div className="wrap relative">
        <div className="md:pr-[30vw] lg:pr-[28vw]">
        <p id="manifesto-k" className="t-kicker mb-10">03 — Yondashuv</p>
        <p className="t-h2 max-w-[22ch] sm:max-w-[26ch]" style={{ fontWeight: 600 }}>
          <ScrollText text={TEXT} />
        </p>
        </div>
      </div>
    </section>
  );
};
