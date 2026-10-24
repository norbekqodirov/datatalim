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
  const y = useTransform(scrollYProgress, [0, 0.26], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.26], [0.9, 1]);
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
          <span className="cc-pill mono absolute left-4 top-4 z-[2]" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="cc-pill absolute right-4 top-4 z-[2]">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--cat)' }} aria-hidden="true" />
            {uz(CAT_LABEL[course.category])}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="t-h3 text-balance">
            <Link to={`/kurslar/${course.id}`} className="cc-link">
              {title}
            </Link>
          </h3>
          <p className="t-body mt-3 line-clamp-3" style={{ fontSize: '0.975rem' }}>
            {uz(tField(course.description))}
          </p>

          <dl className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <div className="min-w-0">
              <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Davomiyligi</dt>
              <dd className="mono mt-1.5 text-[1.05rem]" style={{ color: 'var(--fg)' }}>{dur.main}</dd>
            </div>
            <div className="min-w-0">
              <dt className="t-kicker" style={{ fontSize: '0.6875rem' }}>Oylik toʻlov</dt>
              <dd className="mono mt-1.5 text-[1.05rem]" style={{ color: 'var(--fg)' }}>
                {price.num}
                {price.unit && <span className="ink-3 ml-1 text-[0.8rem]">{price.unit}</span>}
              </dd>
            </div>
          </dl>

          <div className="hairline mt-6 flex items-center justify-between pt-5">
            <span className="font-semibold tracking-[-0.01em]">Batafsil maʼlumot</span>
            <span className="cc-arrow" aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
