import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Plus, MapPin, Phone, Mail, Clock, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { submitLeadToAPI } from '../../utils/api';
import { sendToTelegram } from '../../utils/telegram';
import { trackEvent } from '../../utils/pixel';
import { uz, v2Toast } from './utils';
import { Mask, Star3D } from './fx';

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
    <section className="relative py-[12vh]" aria-labelledby="faq-title">
      <div className="wrap grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <p className="t-kicker mb-6">09 — Savollar</p>
          <Mask><h2 id="faq-title" className="t-h2">Koʻp beriladigan savollar</h2></Mask>
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
                    className="w-full flex items-center gap-6 py-6 text-left cursor-pointer min-h-[44px]"
                  >
                    <span className="flex-1 min-w-0 break-words text-[1.15rem] font-semibold tracking-[-0.015em]">{q(f)}</span>
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
                      <p className="t-body pb-7 pr-12 max-w-[62ch]">{a(f)}</p>
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
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
  const closeRef = useRef<HTMLElement>(null);
  const { scrollYProgress: closeP } = useScroll({ target: closeRef, offset: ['start end', 'end start'] });

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
      crm = await submitLeadToAPI({ name: name.trim(), phone: fullPhone, courseId: course || 'Contact Form', sourceRef: 'Aloqa' });
    } catch (err) {
      console.error('Lead save failed', err);
    }

    if (!crm) {
      setState('idle');
      toast.error('Yuborilmadi. Internetni tekshirib, qayta urinib koʻring yoki qoʻngʻiroq qiling.', v2Toast());
      return;
    }

    const ref = crm?.resolvedSourceRef || 'Aloqa';
    const text =
      `📩 <b>Yangi ariza — DATA Ta'lim Stansiyasi</b>\n\n👤 <b>Ism:</b> ${escapeHtml(name.trim())}\n📞 <b>Telefon:</b> ${fullPhone}` +
      `\n📚 <b>Kurs:</b> ${escapeHtml(courseTitle || '—')}\n🔗 <b>Manba (ref):</b> ${escapeHtml(ref)}\n\n🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;
    // Telegram is only a manager notification; the lead is already saved.
    sendToTelegram(text).then((r) => !r.success && console.error('Telegram notify failed:', r.error));

    trackEvent('Lead', { source: 'Contact' });
    setState('sent');
    setName('');
    setPhone('');
    setCourse('');
  };


  return (
    <section ref={closeRef} id="contact" className="relative py-[14vh] overflow-hidden" aria-labelledby="contact-title">
      {/* closing star */}
      <Star3D progress={closeP} spin={55} className="absolute -right-[10vw] top-[8%] w-[46vw] max-w-[620px] aspect-square pointer-events-none opacity-[.4] hidden lg:block" />

      <div className="wrap grid lg:grid-cols-12 gap-12 relative z-10 [&>*]:min-w-0">
        <div className="lg:col-span-6">
          <p className="t-kicker mb-6">10 — Boshlash</p>
          <Mask>
            <h2 id="contact-title" className="t-display">
              Birinchi qadam — <span className="ink-grad">bepul</span> konsultatsiya.
            </h2>
          </Mask>
          <p className="t-lead mt-6 max-w-lg">Raqamingizni qoldiring: menejer 1 ish kuni ichida qoʻngʻiroq qilib, sizga mos kurs va jadvalni tanlab beradi.</p>

          <dl className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { icon: MapPin, k: 'Manzil', v: `${uz(tField(siteContent.contactAddress))}. ${uz(tField(siteContent.contactLandmark))}` },
              { icon: Clock, k: 'Ish vaqti', v: uz(tField(siteContent.contactSchedule)) },
              { icon: Phone, k: 'Telefon', v: siteContent.contactPhone, href: `tel:${siteContent.contactPhone.replace(/[^\d+]/g, '')}` },
              { icon: Mail, k: 'Email', v: siteContent.contactEmail, href: `mailto:${siteContent.contactEmail}` },
            ].map(({ icon: Icon, k, v, href }) => (
              <div key={k} className="flex gap-4">
                <Icon size={20} className="shrink-0 mt-1 ink-blue" aria-hidden="true" />
                <div>
                  <dt className="t-kicker !text-[0.75rem]">{k}</dt>
                  <dd className="mt-1 leading-relaxed">{href ? <a href={href} className="inline-flex items-center min-h-[44px] -my-2.5 hover:underline underline-offset-4">{v}</a> : v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="panel p-7 sm:p-9">
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
              <form onSubmit={submit} noValidate className="grid gap-5">
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
