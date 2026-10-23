import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { YouTubeFacade } from './YouTubeFacade';
import { uz, youtubeId } from './utils';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/** Founder pull-quote + student video stories. */
export const Voices: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const quote = uz(tField(siteContent.aboutQuote)).replace(/^["“«]|["”»]$/g, '');
  const founder = uz(tField(siteContent.founderName));
  const founderTitle = uz(tField(siteContent.founderTitle));
  const videos = (siteContent.testimonialVideos || []).map(youtubeId).filter(Boolean).slice(0, 3);

  return (
    <section className="relative py-[14vh]" aria-labelledby="voices-title">
      <div className="wrap">
        <p className="t-kicker mb-10">07 — Ovozlar</p>
        {quote && (
          <figure className="max-w-5xl">
            <blockquote>
              <p id="voices-title" className="t-h2" style={{ fontWeight: 500 }}>
                <span className="ink-grad" aria-hidden="true">«</span>
                {quote}
                <span className="ink-grad" aria-hidden="true">»</span>
              </p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              {siteContent.aboutImage ? (
                <img src={siteContent.aboutImage} alt={founder} className="w-14 h-14 rounded-full object-cover" loading="lazy" width={56} height={56} />
              ) : (
                <span className="w-14 h-14 rounded-full flex items-center justify-center mono" style={{ background: 'var(--bg-3)' }} aria-hidden="true">
                  {initials(founder)}
                </span>
              )}
              <span>
                <span className="block font-semibold">{founder}</span>
                <span className="block text-sm ink-3">{founderTitle}</span>
              </span>
            </figcaption>
          </figure>
        )}

        {videos.length > 0 && (
          <>
            <h3 className="t-h3 mt-24 mb-8">Oʻquvchilarimiz oʻz tajribasi haqida</h3>
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-[var(--gutter)] px-[var(--gutter)] lg:grid lg:grid-cols-3 lg:overflow-visible lg:mx-0 lg:px-0">
              {videos.map((id, i) => (
                <motion.div
                  key={id}
                  className="snap-start shrink-0 w-[72vw] sm:w-[46vw] lg:w-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <YouTubeFacade id={id} vertical title={`Oʻquvchi fikri ${i + 1}`} className="rounded-[24px]" />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export const TeamStrip: React.FC = () => {
  const { team } = useStore();
  const { tField } = useLanguage();
  if (!team.length) return null;
  return (
    <section className="relative py-[12vh]" aria-labelledby="team-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="t-kicker mb-6">08 — Jamoa</p>
            <h2 id="team-title" className="t-h2 max-w-[18ch]">Sizni kasbga olib chiqadigan odamlar.</h2>
          </div>
          <Link to="/jamoa" className="link-arrow">Butun jamoa →</Link>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px rounded-[var(--radius)] overflow-hidden" style={{ background: 'var(--line)' }}>
          {team.slice(0, 6).map((m, i) => {
            const name = uz(tField(m.name));
            return (
              <li key={m.id} className="p-6 flex flex-col" style={{ background: 'var(--bg)' }}>
                <div
                  className="aspect-square w-full rounded-2xl overflow-hidden mb-5"
                  style={{ background: `radial-gradient(120% 120% at 100% 0%, ${['#0061ff', '#60efff', '#00b26b'][i % 3]}33 0%, var(--bg-3) 60%)` }}
                >
                  {m.image ? (
                    <img src={m.image} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center mono text-3xl ink-3" aria-hidden="true">
                      {initials(name)}
                    </span>
                  )}
                </div>
                <span className="font-semibold leading-snug">{name}</span>
                <span className="text-sm ink-3 mt-1">{uz(tField(m.role))}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
