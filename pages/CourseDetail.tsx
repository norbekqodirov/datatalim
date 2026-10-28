import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EnrollModal } from '../components/EnrollModal';
import { useStore } from '../store/useStore';
import { useLanguage } from '../i18n';
import { SEO, SITE_URL, courseSchema, breadcrumbSchema } from '../components/SEO';
import { trackEvent, parsePriceUZS } from '../utils/pixel';
import { CourseDetailView } from '../components/v2/pages/courses/Detail';
import '../components/v2/v2.css';

// v2 dizayn: /kurslar/:id. Ma'lumot (useStore.courses) admin paneldan tahrirlanadi.
export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'enroll' | 'consult'>('enroll');
  const { tField } = useLanguage();
  const { courses } = useStore();

  const course = courses.find(c => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Meta Pixel ViewContent: kurs ma'lumoti yuklangach (store async) bir marta, kurs almashganda qayta
  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!course || viewedRef.current === course.id) return; // StrictMode / qayta chizishda ikkilanmasin
    viewedRef.current = course.id;
    const monthly = parsePriceUZS(tField(course.monthlyPrice));
    trackEvent('ViewContent', {
      content_ids: [course.id],
      content_type: 'product',
      content_name: tField(course.title),
      content_category: course.category,
      ...(monthly ? { value: monthly, currency: 'UZS' } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  if (!course) {
    return (
      <div className="v2 flex min-h-[100svh] items-center">
        <SEO title="Kurs topilmadi" noindex />
        <div className="wrap pb-20 pt-28">
          <p className="t-kicker">Xato 404</p>
          <h1 className="t-display mt-6 max-w-[14ch]">Kurs <span className="ink-grad">topilmadi</span></h1>
          <div className="mt-10">
            <Link to="/kurslar" className="btn btn-primary">
              Kurslar roʻyxatiga qaytish <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SEO: kurs sahifasi uchun o'z sarlavha/tavsif/kanonik manzil va Course + BreadcrumbList JSON-LD
  const courseTitle = tField(course.title);
  const courseDesc = String(tField(course.description) || '').replace(/\s+/g, ' ').trim();
  const seoDesc = courseDesc.length > 158 ? `${courseDesc.slice(0, 155).trimEnd()}...` : courseDesc;
  const courseUrl = `${SITE_URL}/kurslar/${course.id}`;
  // Narx: chegirmali bo'lsa o'sha, bo'lmasa jami kurs narxi, u ham bo'lmasa oylik (faqat mavjud maydonlar)
  const monthlyPrice = parsePriceUZS(tField(course.monthlyPrice));
  const offerPrice =
    parsePriceUZS(course.discountPrice ? tField(course.discountPrice) : null) ??
    parsePriceUZS(tField(course.totalPrice)) ??
    monthlyPrice;
  const courseCover = course.coverImage ? (course.coverImage.startsWith('http') ? course.coverImage : `${SITE_URL}${course.coverImage}`) : undefined;

  return (
    <div className="v2">
      <SEO
        title={`${courseTitle} kursi — Urganch`}
        description={seoDesc || undefined}
        url={courseUrl}
        image={courseCover}
        type="course"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            courseSchema({ name: courseTitle, description: seoDesc || courseTitle, url: courseUrl, image: courseCover, ...(offerPrice ? { price: offerPrice, currency: 'UZS' } : {}) }),
            breadcrumbSchema([
              { name: 'Bosh sahifa', url: `${SITE_URL}/` },
              { name: 'Kurslar', url: `${SITE_URL}/kurslar` },
              { name: courseTitle, url: courseUrl },
            ]),
          ],
        }}
      />

      <CourseDetailView course={course} onOpen={(t) => { setModalType(t); setModalOpen(true); }} />

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        courseName={tField(course.title)}
        type={modalType}
        value={monthlyPrice ?? undefined}
      />
    </div>
  );
}
