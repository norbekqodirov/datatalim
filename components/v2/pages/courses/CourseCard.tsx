import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Course } from '../../../../data/courses';
import { useLanguage } from '../../../../i18n';
import { uz, useMotionReduced } from '../../utils';
import { CAT_LABEL, Cover, splitDuration, splitPrice } from './shared';

/**
 * Katalog kartasi. Skroll bilan: karta pastdan ko'tarilib, kattalashib ochiladi (skrollga bog'liq),
 * muqova kartaning ichida parallaks bilan suriladi. Faqat transform/opacity.
 */
export const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  const { tField } = useLanguage();
  const reduced = useMotionReduced();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.26], [48, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.26], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.14], [0, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const title = uz(tField(course.title));
  const dur = splitDuration(tField(course.duration));
  const price = splitPrice(tField(course.monthlyPrice));

  return (
    <motion.article
      ref={ref}
      data-cat={course.category}
      style={reduced ? undefined : { y, scale, opacity }}
      className="h-full will-change-transform"
    >
      <div className="cc">
        <div className="cc-media">
          <Cover
            src={course.coverImage}
            className="absolute inset-0"
            motionStyle={reduced ? undefined : { y: imgY, scale: 1.14 }}
          />
          <span className="cc-pill cc-idx mono absolute left-3 top-3 z-[2]" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="cc-pill cc-pill-cat absolute right-3 top-3 z-[2]">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--cat)' }} aria-hidden="true" />
            {uz(CAT_LABEL[course.category])}
          </span>
        </div>

        <div className="cc-main">
          <p className="cc-cat t-kicker" aria-hidden="true">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--cat)' }} />
            {uz(CAT_LABEL[course.category])}
          </p>
          <h3 className="cc-title text-balance">
            <Link to={`/kurslar/${course.id}`} className="cc-link">
              {title}
            </Link>
          </h3>
          <p className="cc-desc">{uz(tField(course.description))}</p>
        </div>

        <dl className="cc-meta">
          <div className="min-w-0">
            <dt className="t-kicker">Davomiyligi</dt>
            <dd className="mono">{dur.main}</dd>
          </div>
          <div className="min-w-0">
            <dt className="t-kicker">Oylik toʻlov</dt>
            <dd className="mono">
              {price.num}
              {price.unit && <span className="ink-3 ml-1 text-[0.75rem]">{price.unit}</span>}
            </dd>
          </div>
        </dl>

        <div className="cc-foot">
          <span className="cc-cta">
            Batafsil va yozilish
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};
