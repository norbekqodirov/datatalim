import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { YouTubeFacade } from './YouTubeFacade';
import { uz, youtubeId } from './utils';
import { Mask, ScrollText } from './fx';
import { openConsult } from './consult';
import { ArrowRight } from 'lucide-react';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

// lavozim matnidan mos emoji: rasm boʻlmasa ham chipta "tirik" koʻrinsin
const ROLE_EMOJI: [RegExp, string][] = [
  [/direktor/i, '🧭'],
  [/ta.lim/i, '🎓'],
  [/language|til|ingliz|rus/i, '🌍'],
  [/moliya|buxgalter|hisob/i, '📊'],
  [/dastur|developer|python|frontend/i, '💻'],
  [/dizayn|design|grafik/i, '🎨'],
  [/smm|marketing|media|video/i, '🎬'],
  [/robot/i, '🤖'],
];
const roleEmoji = (role: string) => ROLE_EMOJI.find(([re]) => re.test(role))?.[1] ?? '✦';

/** Founder pull-quote + student video stories. */
export const Voices: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const quote = uz(tField(siteContent.aboutQuote)).replace(/^["“«]|["”»]$/g, '');
  const founder = uz(tField(siteContent.founderName));
  const founderTitle = uz(tField(siteContent.founderTitle));
  const videos = (siteContent.testimonialVideos || []).map(youtubeId).filter(Boolean).slice(0, 3);

  return (
    <section className="relative sec" aria-labelledby="voices-title">
      {/* 2 ustun: chapda asoschi so'zi + keyingi qadam, o'ngda o'quvchi videolari — vazn teng */}
      <div className={`wrap grid grid-cols-1 gap-9 sm:gap-12 lg:gap-8 [&>*]:min-w-0 ${videos.length ? 'lg:grid-cols-12 lg:items-center' : ''}`}>
        <div className={videos.length ? 'lg:col-span-5' : 'max-w-4xl mx-auto text-center'}>
          <p className="t-kicker mb-8">07 — Ovozlar</p>
          {quote && (
            <figure>
              <blockquote>
                <p id="voices-title" className="voice-quote">
                  <span className="ink-grad" aria-hidden="true">«</span>
                  <ScrollText text={quote} />
                  <span className="ink-grad" aria-hidden="true">»</span>
                </p>
              </blockquote>
              <figcaption className={`mt-5 sm:mt-7 flex items-center gap-4 text-left ${videos.length ? '' : 'justify-center'}`}>
                {siteContent.aboutImage ? (
                  <img src={siteContent.aboutImage} alt={founder} className="w-12 h-12 rounded-full object-cover" loading="lazy" width={48} height={48} />
                ) : (
                  <span className="w-12 h-12 rounded-full flex items-center justify-center mono" style={{ background: 'var(--bg-3)' }} aria-hidden="true">
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

          {/* ijtimoiy isbotdan keyin — keyingi qadam */}
          <div className={`voice-next mt-10 pt-8 flex flex-col gap-4 ${videos.length ? 'items-start' : 'items-center'}`}>
            <p className="t-lead">Siz ham shu yoʻlni boshlashingiz mumkin — bitta qoʻngʻiroqdan.</p>
            <button type="button" onClick={() => openConsult()} className="btn btn-primary">
              Konsultatsiyaga yozilish <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="lg:col-span-7">
            <h3 className="t-kicker mb-4 sm:mb-5">Oʻquvchilarimiz oʻz tajribasi haqida</h3>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-[var(--gutter)] pb-4 -mx-[var(--gutter)] px-[var(--gutter)] lg:grid lg:grid-cols-3 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
              {videos.map((id, i) => (
                <motion.div
                  key={id}
                  className="snap-start shrink-0 w-[44vw] sm:w-[40vw] lg:w-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <YouTubeFacade id={id} vertical title={`Oʻquvchi fikri ${i + 1}`} className="rounded-[20px]" />
                </motion.div>
              ))}
            </div>
          </div>
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
    <section className="relative sec" aria-labelledby="team-title">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="t-kicker mb-6">08 — Jamoa</p>
            <Mask><h2 id="team-title" className="t-h2 max-w-[18ch]">Sizni kasbga olib chiqadigan odamlar.</h2></Mask>
          </div>
          <Link to="/jamoa" className="link-arrow min-h-[44px]">Butun jamoa →</Link>
        </div>
        {/* "stansiya chiptasi": har bir ustoz — alohida yoʻnalishga olib boruvchi chipta */}
        <ul className="tk-grid">
          {team.slice(0, 6).map((m, i) => {
            const name = uz(tField(m.name));
            const role = uz(tField(m.role));
            return (
              <motion.li
                key={m.id}
                className="tk"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.07 }}
              >
                <div className="tk-stub" style={{ ['--tk-c' as string]: ['#0061ff', '#60efff', '#00b26b'][i % 3] }}>
                  <span className="tk-avatar">
                    {m.image ? (
                      <img src={m.image} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <span className="mono" aria-hidden="true">{initials(name)}</span>
                    )}
                  </span>
                </div>
                <div className="tk-body">
                  <span className="flex items-center justify-between gap-3">
                    <span className="mono tk-code">DTS · {String(i + 1).padStart(2, '0')}</span>
                    <span className="tk-emoji" aria-hidden="true">{roleEmoji(role)}</span>
                  </span>
                  <span className="tk-name block font-semibold leading-snug mt-3 text-[1.05rem]">{name}</span>
                  <span className="block text-sm ink-3 mt-1">{role}</span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
