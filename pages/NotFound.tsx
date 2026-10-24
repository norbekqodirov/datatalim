import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import '../components/v2/v2.css';

/** 404 — mavjud bo'lmagan sahifa */
export default function NotFound() {
  return (
    <div className="v2 relative min-h-[100svh] flex items-center overflow-hidden">
      <Helmet>
        <title>Sahifa topilmadi | DATA Taʼlim Stansiyasi</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(50% 45% at 70% 30%, rgba(0,97,255,.16), transparent 70%)' }}
      />
      <div className="wrap relative pt-28 pb-20">
        <p className="t-kicker">Xato 404</p>
        <h1 className="t-display mt-6 max-w-[14ch]">
          Bu sahifa <span className="ink-grad">topilmadi</span>.
        </h1>
        <p className="t-lead mt-6 max-w-[34rem]">
          Havola eskirgan yoki manzil xato yozilgan boʻlishi mumkin. Quyidagi sahifalardan birini oching.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/" className="btn btn-primary">
            Bosh sahifa <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/kurslar" className="btn btn-ghost">Kurslar</Link>
          <Link to="/karyera-testi" className="btn btn-ghost">Karyera testi</Link>
        </div>
      </div>
    </div>
  );
}
