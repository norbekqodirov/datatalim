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
      {/* qorong'i rejim: ekran chetigacha yoyilgan sahna */}
      <img
        src="/images/v2/lost-star.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 nf-dark h-full w-full object-cover opacity-40 md:w-[62%] md:opacity-90"
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 35%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 35%)' }}
      />
      {/* yorug' rejim: qora tasvir navbar ostiga yoyilib ketmasin — ramkali kartochka */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[5vw] top-1/2 h-[min(56vh,460px)] w-[min(38vw,520px)] -translate-y-1/2 nf-light overflow-hidden"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}
      >
        <img src="/images/v2/lost-star.webp" alt="" className="h-full w-full object-cover" style={{ objectPosition: '100% 70%' }} />
      </div>
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
