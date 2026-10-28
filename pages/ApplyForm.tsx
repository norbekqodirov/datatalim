import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { submitLeadToAPI } from '../utils/api';
import { trackSiteEventOncePerSession } from '../utils/analytics';
import { trackLead, newEventId } from '../utils/pixel';
import { SEO } from '../components/SEO';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight, Check, ChevronDown, Phone } from 'lucide-react';
import { Logo } from '../components/BrandElements';
import { useStore } from '../store/useStore';
import { Mask, Star3D } from '../components/v2/fx';
import { uz, v2Toast, useMotionReduced } from '../components/v2/utils';
import '../components/v2/v2.css';
import '../components/v2/pages/about/about.css';

interface LightCourse {
    id: string;
    title: { uz: string; ru?: string; en?: string } | string;
}

// Til target formalari (marketing_links.category === 'Language') uchun alohida, qattiq belgilangan ro'yxat —
// bular asosiy `courses` jadvalida yo'q, Languages.tsx sahifasidagi til kurslariga mos keladi.
const LANGUAGE_COURSES: LightCourse[] = [
    { id: 'english', title: 'Ingliz tili' },
    { id: 'russian', title: 'Rus tili' },
    { id: 'korean', title: 'Koreys tili' },
    { id: 'german', title: 'Nemis tili' },
];

/** 9 raqamgacha, "90 123 45 67" ko'rinishida. "+998 90…" / "998 90…" yopishtirilsa, prefiks olib tashlanadi. */
const formatPhone = (raw: string) => {
    let v = raw.replace(/\D/g, '');
    if (v.length >= 12 && v.startsWith('998')) v = v.slice(3);
    v = v.slice(0, 9);
    return [v.slice(0, 2), v.slice(2, 5), v.slice(5, 7), v.slice(7, 9)].filter(Boolean).join(' ');
};

const STEPS = [
    "Ma'lumotlaringizni qoldiring",
    "Menejer 1 ish kuni ichida qo'ng'iroq qiladi",
    "Sizga mos kurs va jadval tanlab beriladi",
];

export default function ApplyForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reduced = useMotionReduced();
    const { siteContent } = useStore();

    const [courses, setCourses] = useState<LightCourse[]>([]);
    const [formData, setFormData] = useState({ name: '', phone: '', courseId: '' });
    const [loading, setLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [sent, setSent] = useState(false);
    const [linkCategory, setLinkCategory] = useState<'IT' | 'Language'>('IT');
    const [errors, setErrors] = useState<{ name?: string; phone?: string; courseId?: string }>({});

    const refCode = searchParams.get('ref') || sessionStorage.getItem('marketing_ref') || undefined;

    // the brand star follows the pointer across the page (mouse only; static when motion is off)
    const pointer = useMotionValue(0.5);
    const starP = useSpring(pointer, { stiffness: 60, damping: 20, mass: 0.6 });
    const onPointerMove = (e: React.PointerEvent) => {
        if (reduced || e.pointerType !== 'mouse') return;
        pointer.set(e.clientX / window.innerWidth);
    };

    useEffect(() => {
        trackSiteEventOncePerSession('ariza_view');
    }, []);

    useEffect(() => {
        // Target forma qaysi marketing linkdan kelganini aniqlab, IT/Til kategoriyasiga qarab kurslar ro'yxatini tanlaydi.
        if (!refCode) return;
        fetch(`/api/marketing-links/info/${refCode}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.category === 'Language') setLinkCategory('Language');
            })
            .catch(() => { });
    }, [refCode]);

    useEffect(() => {
        // /api/courses endi og'ir emas — coverImage fayl yo'li sifatida saqlanadi (base64 emas),
        // shuning uchun to'liq ro'yxatni olib, faqat id/title'ni ishlatish xavfsiz va yengil.
        fetch('/api/courses')
            .then(r => r.json())
            .then(data => setCourses(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, title: c.title })) : []))
            .catch(() => setCourses([]))
            .finally(() => setCoursesLoading(false));
    }, []);

    const getTitle = (course: LightCourse) => {
        if (typeof course.title === 'string') return course.title;
        return course.title?.uz || '';
    };

    const activeCourses = linkCategory === 'Language' ? LANGUAGE_COURSES : courses;
    const activeCoursesLoading = linkCategory === 'Language' ? false : coursesLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side tekshiruv (UI): server telefon raqami 0/1 bilan boshlansa rad etadi.
        const digits = formData.phone.replace(/\D/g, '');
        const next: typeof errors = {};
        if (!formData.name.trim()) next.name = 'Ismingizni kiriting';
        if (digits.length !== 9) next.phone = 'Raqamni toʻliq kiriting: 90 123 45 67';
        else if (!/^[2-9]\d{8}$/.test(digits)) next.phone = 'Telefon raqam notoʻgʻri. Masalan: 90 123 45 67';
        if (!formData.courseId) next.courseId = 'Yoʻnalishni tanlang';
        setErrors(next);
        if (Object.keys(next).length) {
            const first = next.name ? 'ap-name' : next.phone ? 'ap-phone' : 'ap-course';
            document.getElementById(first)?.focus();
            return;
        }
        setLoading(true);

        // Yuboriladigan telefon avvalgidek "+998 90 123 45 67" ko'rinishida
        const phone = `+998 ${formatPhone(formData.phone)}`;

        const selectedCourse = activeCourses.find(c => c.id === formData.courseId);
        const courseName = selectedCourse ? getTitle(selectedCourse) : 'Boshqa';

        // eventID yuborishdan oldin: javob yo'qolib qayta urinilsa ham Lead bitta bo'lib qoladi
        const eventId = newEventId();
        try {
            const res = await submitLeadToAPI({
                name: formData.name,
                phone,
                courseId: courseName,
                sourceRef: refCode,
            });

            // Meta Pixel: server qabul qilgach; takroriy ariza shu sessiyada qayta sanalmaydi
            trackLead({ source: 'Ariza', course: courseName, eventId, duplicate: !!res?.duplicate, phone });

            // Menejerlarga Telegram xabarini server /api/leads ichida o'zi yuboradi (ref nomi bilan)
            setSent(true);
            toast.success('Arizangiz muvaffaqiyatli qabul qilindi!', v2Toast());
        } catch (error) {
            console.error("Xatolik:", error);
            toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.", v2Toast());
        } finally {
            setLoading(false);
        }
    };

    const phoneHref = siteContent.contactPhone ? `tel:${siteContent.contactPhone.replace(/[^\d+]/g, '')}` : undefined;

    return (
        <div className="v2 relative min-h-[100svh] flex flex-col overflow-hidden" onPointerMove={onPointerMove}>
            <SEO title="Oʻqishga yozilish — ariza" noindex />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(55% 50% at 82% 30%, rgba(0,97,255,.17), transparent 70%), radial-gradient(40% 40% at 8% 90%, rgba(96,239,255,.07), transparent 70%)' }} />
            <Star3D progress={starP} spin={55} className="ab-star absolute -left-[16vw] bottom-[-10%] w-[56vw] max-w-[640px] aspect-square pointer-events-none opacity-[.22] hidden md:block" />

            <header className="wrap relative z-10 h-20 flex items-center">
                <Link to="/" className="inline-flex items-center min-h-[44px]" aria-label="DATA Taʼlim Stansiyasi — bosh sahifa" style={{ color: 'var(--fg)' }}>
                    <Logo width={104} />
                </Link>
            </header>

            <main className="wrap relative z-10 flex-1 flex items-center pb-16 pt-4 lg:pt-0">
                {sent ? (
                    <div className="w-full max-w-xl mx-auto">
                        <motion.div
                            role="status"
                            className="panel p-8 sm:p-12 text-center"
                            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.span
                                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--green)', boxShadow: '0 20px 50px -18px rgba(0,178,107,.8)' }}
                                initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Check size={38} color="#fff" aria-hidden="true" />
                            </motion.span>
                            <h1 className="t-h2 mt-8">Ajoyib!</h1>
                            <p className="t-lead mt-4">{uz("Arizangiz muvaffaqiyatli qabul qilindi. Mutaxassislarimiz tez orada siz bilan bog'lanishadi.")}</p>
                            <button type="button" onClick={() => navigate('/')} className="btn btn-primary w-full mt-10">
                                Bosh sahifaga qaytish <ArrowRight size={18} aria-hidden="true" />
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    <div className="w-full grid lg:grid-cols-12 gap-x-16 gap-y-10 lg:content-center [&>*]:min-w-0">
                        <div className="lg:col-span-6 lg:row-start-1 lg:self-end">
                            <p className="t-kicker mb-6">Ariza</p>
                            <Mask>
                                <h1 className="t-display" style={{ fontSize: 'clamp(2.6rem, 6.2vw, 5.4rem)' }}>
                                    Oʻqishga <span className="ink-grad">yozilish</span>
                                </h1>
                            </Mask>
                            <p className="t-lead mt-6 max-w-[34rem]">{uz("Ma'lumotlaringizni qoldiring, biz sizga o'zingizga mos kursni tanlashga yordam beramiz.")}</p>
                        </div>

                        <motion.div
                            className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center"
                            initial={reduced ? false : { opacity: 0, y: 36 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="panel p-7 sm:p-9 relative overflow-hidden">
                                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-5" aria-label="Oʻqishga yozilish arizasi">
                                    <div>
                                        <label htmlFor="ap-name" className="block text-sm font-medium mb-2">Ism va familiya</label>
                                        <input
                                            id="ap-name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            disabled={loading}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            aria-invalid={!!errors.name}
                                            aria-describedby={errors.name ? 'ap-name-err' : undefined}
                                            maxLength={60}
                                            className="field"
                                            placeholder="Asadbek Ismoilov"
                                        />
                                        {errors.name && <p id="ap-name-err" role="alert" className="field-err">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="ap-phone" className="block text-sm font-medium mb-2">Telefon raqam</label>
                                        <div className="field-group" data-invalid={!!errors.phone || undefined}>
                                            <span className="flex items-center pl-5 pr-2 mono ink-3 select-none" aria-hidden="true">+998</span>
                                            <input
                                                id="ap-phone"
                                                name="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                autoComplete="tel-national"
                                                disabled={loading}
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                                aria-invalid={!!errors.phone}
                                                aria-describedby={errors.phone ? 'ap-phone-err' : undefined}
                                                className="bare-input flex-1 min-w-0 h-14 pr-5 outline-none text-[1.0625rem]"
                                                style={{ background: 'transparent', border: 0, color: 'var(--fg)' }}
                                                placeholder="90 123 45 67"
                                            />
                                        </div>
                                        {errors.phone && <p id="ap-phone-err" role="alert" className="field-err">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="ap-course" className="block text-sm font-medium mb-2">Yoʻnalishni tanlang</label>
                                        {activeCoursesLoading ? (
                                            <div className="field flex items-center gap-3 ink-3" role="status">
                                                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                                <span className="text-sm">Kurslar yuklanmoqda…</span>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    id="ap-course"
                                                    name="course"
                                                    disabled={loading}
                                                    value={formData.courseId}
                                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                                    aria-invalid={!!errors.courseId}
                                                    aria-describedby={errors.courseId ? 'ap-course-err' : undefined}
                                                    data-empty={formData.courseId ? undefined : ''}
                                                    className="field ap-select"
                                                >
                                                    <option value="" disabled>Kursni tanlang…</option>
                                                    {activeCourses.map(c => (
                                                        <option key={c.id} value={c.id}>{uz(getTitle(c))}</option>
                                                    ))}
                                                    <option value="other">Boshqa / Bilmadim</option>
                                                </select>
                                                <ChevronDown size={18} aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ink-3" />
                                            </div>
                                        )}
                                        {errors.courseId && <p id="ap-course-err" role="alert" className="field-err">{errors.courseId}</p>}
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading || activeCoursesLoading} aria-busy={loading}>
                                        {loading ? (
                                            <><Loader2 className="animate-spin" size={20} aria-hidden="true" /> Yuborilmoqda…</>
                                        ) : (
                                            <>Ariza qoldirish <ArrowRight size={18} aria-hidden="true" /></>
                                        )}
                                    </button>
                                    <p className="text-xs ink-3 text-center">Maʼlumotlaringiz faqat siz bilan bogʻlanish uchun ishlatiladi.</p>
                                </form>
                            </div>
                            <div className="mt-8 px-1">
                            <ol className="grid gap-4" style={{ counterReset: 'ap' }}>
                                {STEPS.map((s, i) => (
                                    <motion.li
                                        key={s}
                                        className="ap-step flex items-baseline gap-5 pb-4 border-b"
                                        style={{ borderColor: 'var(--line)' }}
                                        initial={reduced ? false : { opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <span className="font-medium">{uz(s)}</span>
                                    </motion.li>
                                ))}
                            </ol>
                            {phoneHref && (
                                <a href={phoneHref} className="mt-4 inline-flex items-center gap-3 min-h-[44px] ink-2 hover:underline underline-offset-4">
                                    <Phone size={18} aria-hidden="true" className="ink-blue" />
                                    <span>Savolingiz bormi? <span className="mono" style={{ color: 'var(--fg)' }}>{siteContent.contactPhone}</span></span>
                                </a>
                            )}
                            </div>
                        </motion.div>

                        <div className="hidden lg:block lg:col-span-6 lg:row-start-2 lg:self-start">
                            <img src="/images/v2/apply-steps.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"
                                className="hidden lg:block w-full max-w-[34rem] aspect-[16/9] object-cover rounded-2xl"
                                style={{ border: '1px solid var(--line)' }} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
