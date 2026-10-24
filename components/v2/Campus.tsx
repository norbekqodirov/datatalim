import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { YouTubeFacade } from './YouTubeFacade';
import { youtubeId, useMotionReduced } from './utils';
import { Mask } from './fx';

const FEATURES = [
  { n: '01', t: 'Zamonaviy texnika', d: 'iMac va kuchli Windows kompyuterlari. Dizayn va dasturlash dasturlari qotmasdan ishlaydi.' },
  { n: '02', t: 'Real loyihalar', d: 'Oʻqish davomida portfolio yigʻiladi: har modul amaliy topshiriq bilan yakunlanadi.' },
  { n: '03', t: 'Amaliyotchi ustozlar', d: 'Darslarni oʻz sohasida ishlayotgan dasturchi, dizayner va moliyachilar oʻtadi.' },
  { n: '04', t: 'Coworking hududi', d: 'Darsdan keyin ham kelib, jamoaviy loyiha ustida ishlash mumkin.' },
  { n: '05', t: 'Sertifikat va ishga yoʻnaltirish', d: 'Yakuniy imtihondan soʻng sertifikat, eng yaxshi bitiruvchilarga ish topishda yordam.' },
  { n: '06', t: 'Tezkor internet', d: 'Butun markaz boʻylab barqaror Wi-Fi: videodars va katta fayllar muammosiz.' },
];

export const Campus: React.FC = () => {
  const { siteContent } = useStore();
  const reduced = useMotionReduced();
  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.8, 1]);
  const tilt = useTransform(scrollYProgress, [0, 0.45], [16, 0]);
  const lift = useTransform(scrollYProgress, [0, 0.45], [60, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.45], [48, 28]);
  const vid = youtubeId(siteContent.tourVideoUrl);

  return (
    <section className="relative py-[14vh]" aria-labelledby="campus-title">
      <div className="wrap">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="t-kicker mb-6">06 — Stansiya</p>
            <Mask><h2 id="campus-title" className="t-h2 max-w-[16ch]">Oʻqish uchun qurilgan makon.</h2></Mask>
          </div>
          <p className="t-lead max-w-md">Urganch markazida, Darital savdo markazi yonida. Ichkarini videoda koʻring.</p>
        </div>

        {vid && (
          <div style={{ perspective: '1600px' }}>
            <motion.div
              ref={mediaRef}
              style={reduced ? undefined : { scale, rotateX: tilt, y: lift, borderRadius: radius, transformOrigin: '50% 100%' }}
              className="overflow-hidden will-change-transform shadow-[0_60px_120px_-50px_rgba(0,97,255,.55)]"
            >
              <YouTubeFacade id={vid} title="DATA Taʼlim Stansiyasi — virtual sayohat" />
            </motion.div>
          </div>
        )}

        <ol className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.n}
              className="hairline py-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="mono ink-blue text-sm">{f.n}</span>
              <h3 className="t-h3 mt-3">{f.t}</h3>
              <p className="t-body mt-3">{f.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};
