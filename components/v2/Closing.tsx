import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Check, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { submitLeadToAPI } from '../../utils/api';
import { trackEvent } from '../../utils/pixel';
import { uz, v2Toast } from './utils';
import { StartSteps } from './Sales';
import { Mask } from './fx';
import { openConsult } from './consult';

// ------------------------------------------------------------------ FAQ
interface FAQItem {
  id: number;
  question_uz: string;
  question_ru?: string;
  question_en?: string;
  answer_uz: string;
  answer_ru?: string;
  answer_en?: string;
}

const DEFAULT_FAQ: FAQItem[] = [
  { id: 1, question_uz: "O'qishni boshlash uchun qanday bilimlar kerak?", answer_uz: "Hech qanday dastlabki bilim talab qilinmaydi. Kurslar noldan boshlanadi; kompyuterdan foydalana olish va o'rganish istagi yetarli." },
  { id: 2, question_uz: 'Kursni tugatgach ishga joylashishga yordam berasizlarmi?', answer_uz: "Ha. Rezyume tayyorlash, intervyuga tayyorgarlik va hamkor kompaniyalarga tavsiya qilishda amaliy yordam beramiz." },
  { id: 3, question_uz: 'Darslar qanday formatda o‘tadi?', answer_uz: "Darslar oflayn, zamonaviy jihozlangan xonalarda, kichik guruhlarda o'tadi. Uy vazifalari va qo'shimcha materiallar beriladi." },
  { id: 4, question_uz: "Kompyuterim yo'q, o'qiy olamanmi?", answer_uz: "Ha. Dars vaqtida markaz kompyuterlari beriladi. Mustaqil mashq uchun shaxsiy kompyuter bo'lsa yaxshi, lekin shart emas." },
  { id: 5, question_uz: 'Sertifikat beriladimi?', answer_uz: "Ha. Kursni yakunlab, yakuniy imtihondan o'tgan o'quvchilarga DATA Ta'lim Stansiyasi sertifikati beriladi." },
];

export const FaqV2: React.FC = () => {
  const { lang } = useLanguage();
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQ);
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  useEffect(() => {
    let alive = true;
    fetch('/api/faqs')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: FAQItem[] | null) => {
        if (alive && Array.isArray(d) && d.length) setFaqs(d);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const q = (f: FAQItem) => uz((f[`question_${lang}` as keyof FAQItem] as string) || f.question_uz);
  const a = (f: FAQItem) => uz((f[`answer_${lang}` as keyof FAQItem] as string) || f.answer_uz);

  return (
    <section className="relative sec" aria-labelledby="faq-title">
      <div className="wrap grid lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <p className="t-kicker mb-6">09 — Savollar</p>
          <Mask><h2 id="faq-title" className="t-h2">Koʻp beriladigan savollar</h2></Mask>
          {/* javob topilmasa — keyingi qadam shu yerning oʻzida */}
          <div className="faq-help panel mt-8 sm:mt-10">
            <span className="faq-bubble" aria-hidden="true">💬</span>
            <p className="font-semibold text-[1.1rem] tracking-[-0.01em]">Javobini topmadingizmi?</p>
            <p className="t-body mt-2 !text-[0.95rem]">Savolingizni yozing — maslahatchimiz tushuntirib beradi.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" className="btn btn-primary" onClick={() => openConsult()}>
                Bepul konsultatsiya
              </button>
              <a href="https://t.me/data_talim_stansiyasi" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <Send size={16} aria-hidden="true" /> Telegram
              </a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const pid = `${baseId}-p${i}`;
            const bid = `${baseId}-b${i}`;
            return (
              <div key={f.id} className="hairline">
                <h3>
                  <button
                    id={bid}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={pid}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 sm:gap-6 py-4 sm:py-6 text-left cursor-pointer min-h-[44px]"
                  >
                    <span className="flex-1 min-w-0 break-words text-[1.02rem] sm:text-[1.15rem] font-semibold tracking-[-0.015em]">{q(f)}</span>
                    <Plus
                      size={22}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-300"
                      style={{ transform: isOpen ? 'rotate(45deg)' : 'none', color: 'var(--fg-3)' }}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={pid}
                      role="region"
                      aria-labelledby={bid}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="t-body pb-5 pr-8 sm:pb-7 sm:pr-12 max-w-[62ch]">{a(f)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------------ Contact / final CTA

const formatPhone = (raw: string) => {
  const v = raw.replace(/\D/g, '').slice(0, 9);
  return [v.slice(0, 2), v.slice(2, 5), v.slice(5, 7), v.slice(7, 9)].filter(Boolean).join(' ');
};

export const ContactV2: React.FC = () => {
  const { siteContent, courses } = useStore();
  const { tField } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Ismingizni kiriting';
    if (digits.length !== 9) next.phone = 'Raqamni toʻliq kiriting: 90 123 45 67';
    // the server rejects numbers that start with 0 or 1
    else if (!/^[2-9]\d{8}$/.test(digits)) next.phone = 'Telefon raqam notoʻgʻri. Masalan: 90 123 45 67';
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(next.name ? 'v2-name' : 'v2-phone')?.focus();
      return;
    }

    setState('loading');
    const fullPhone = '+998' + digits;
    const courseTitle = course ? tField(courses.find((c) => c.id === course)?.title) : '';
    let crm: any = null;
    try {
      crm = await submitLeadToAPI({ name: name.trim(), phone: fullPhone, courseId: courseTitle || course || 'Contact Form', sourceRef: 'Aloqa' });
    } catch (err) {
      console.error('Lead save failed', err);
    }

    if (!crm) {
      setState('idle');
      toast.error('Yuborilmadi. Internetni tekshirib, qayta urinib koʻring yoki qoʻngʻiroq qiling.', v2Toast());
      return;
    }

    // Menejerlarga Telegram xabarini server /api/leads ichida o'zi yuboradi
    trackEvent('Lead', { source: 'Contact' });
    setState('sent');
    setName('');
    setPhone('');
    setCourse('');
  };


  return (
    <section id="contact" className="relative sec overflow-hidden" aria-labelledby="contact-title">
      {/* sarlavha qatori: chapda sarlavha, oʻngda izoh — ikki tomon teng ogʻirlikda */}
      <div className="wrap grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-end relative z-10 mb-7 sm:mb-10 lg:mb-12">
        <div className="lg:col-span-7">
          <p className="t-kicker mb-6">10 — Boshlash</p>
          <Mask>
            <h2 id="contact-title" className="t-h2">
              Birinchi qadam — <span className="ink-grad">bepul</span> konsultatsiya.
            </h2>
          </Mask>
        </div>
        <p className="lg:col-span-5 t-lead max-w-lg">Raqamingizni qoldiring: menejer 1 ish kuni ichida qoʻngʻiroq qilib, sizga mos kurs va jadvalni tanlab beradi.</p>
      </div>

      <div className="wrap grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch relative z-10 [&>*]:min-w-0">
        <div className="lg:col-span-6 contact-steps order-2 lg:order-1">
          <StartSteps />
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="panel p-5 sm:p-9 h-full">
            {state === 'sent' ? (
              <div className="py-10 text-center" role="status">
                <span className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--green)' }}>
                  <Check size={30} color="#fff" aria-hidden="true" />
                </span>
                <p className="t-h3 mt-6">Arizangiz qabul qilindi</p>
                <p className="t-body mt-3">Tez orada siz bilan bogʻlanamiz.</p>
                <button type="button" className="btn btn-ghost mt-8" onClick={() => setState('idle')}>
                  Yana ariza yuborish
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-4 sm:gap-5">
                <div>
                  <label htmlFor="v2-name" className="block text-sm font-medium mb-2">Ismingiz</label>
                  <input
                    id="v2-name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'v2-name-err' : undefined}
                    maxLength={60}
                    className="field"
                    placeholder="Masalan, Dilnoza"
                  />
                  {errors.name && <p id="v2-name-err" role="alert" className="field-err">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="v2-phone" className="block text-sm font-medium mb-2">Telefon raqamingiz</label>
                  <div className="field-group" data-invalid={!!errors.phone || undefined}>
                    <span className="flex items-center pl-5 pr-2 mono ink-3 select-none" aria-hidden="true">+998</span>
                    <input
                      id="v2-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'v2-phone-err' : undefined}
                      className="bare-input flex-1 min-w-0 h-14 pr-5 outline-none text-[1.0625rem]"
                      style={{ background: 'transparent', border: 0, color: 'var(--fg)' }}
                      placeholder="90 123 45 67"
                    />
                  </div>
                  {errors.phone && <p id="v2-phone-err" role="alert" className="field-err">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="v2-course" className="block text-sm font-medium mb-2">
                    Qiziqqan kurs <span className="ink-3 font-normal">(ixtiyoriy)</span>
                  </label>
                  <select id="v2-course" value={course} onChange={(e) => setCourse(e.target.value)} className="field cursor-pointer">
                    <option value="">Hali bilmayman — maslahat kerak</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{uz(tField(c.title))}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2" disabled={state === 'loading'} aria-busy={state === 'loading'}>
                  {state === 'loading' ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
                  {state === 'loading' ? 'Yuborilmoqda…' : 'Konsultatsiyaga yozilish'}
                </button>
                <p className="text-xs ink-3 text-center">Maʼlumotlaringiz faqat siz bilan bogʻlanish uchun ishlatiladi.</p>
              </form>
            )}
          </div>
        </div>
      </div>

    </section>
  );
};
