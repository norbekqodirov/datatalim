import React from 'react';
import { useStore } from '../store/useStore';
import { Hero } from '../components/home/Hero';
import { About } from '../components/home/About';
import { TourVideo } from '../components/home/TourVideo';
import { Courses } from '../components/home/Courses';
import { Testimonials } from '../components/home/Testimonials';
import { Facilities } from '../components/home/Facilities';
import { CareerTestSection } from '../components/home/CareerTestSection';
import { Team } from '../components/home/Team';
import { FAQ } from '../components/home/FAQ';
import { Gallery } from '../components/home/Gallery';
import { Contact } from '../components/home/Contact';
import { SEO } from '../components/SEO';

export default function Home() {
  const { visibility } = useStore();

  return (
    <>
      <SEO
        title="Bosh Sahifa"
        description="DATA Ta'lim Stansiyasi - zamonaviy kasblarni biz bilan o'rganing. Dasturlash, dizayn, va moliya bepul ta'lim grantlari mavjud."
      />
      {visibility.hero && <Hero />}
      {visibility.about && <About />}
      {visibility.tourVideo && <TourVideo />}
      {visibility.courses && <Courses />}
      {visibility.testimonials && <Testimonials />}
      {visibility.careerTest && <CareerTestSection />}
      {visibility.facilities && <Facilities />}
      {visibility.team && <Team />}
      {visibility.faq && <FAQ />}
      {visibility.gallery && <Gallery />}
      {visibility.contact && <Contact />}
    </>
  );
}
