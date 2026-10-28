import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Loader2, CheckCircle2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitLeadToAPI } from '../utils/api';
import { trackEvent, trackLead, newEventId } from '../utils/pixel';
import { useStore } from '../store/useStore';
import { uz, v2Toast } from './v2/utils';
import './v2/v2.css';

interface EnrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseName: string;
    type?: 'enroll' | 'consult';
    extraInfo?: string; // Test natijasi yoki qo'shimcha ma'lumot
    sourceRef?: string; // Sheet tabini aniq belgilash (masalan, 'Karyera_Testi'); bo'lmasa type bo'yicha
    initialName?: string; // Masalan, karyera testi intro'sida allaqachon kiritilgan ism
    initialPhone?: string; // Formatlangan holatda, masalan "90 123 45 67" (+998 siz)
    value?: number; // Kurs narxi (so'm) — ma'lum bo'lsa faqat InitiateCheckout'ga value sifatida qo'shiladi (Lead value'siz)
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ isOpen, onClose, courseName, type = 'enroll', extraInfo, sourceRef: sourceRefProp, initialName, initialPhone, value }) => {
    const [formData, setFormData] = useState({ name: initialName || '', phone: initialPhone || '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [failed, setFailed] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
    const contactPhone = useStore((s) => s.siteContent.contactPhone);
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const doneRef = useRef<HTMLButtonElement>(null);

    // Yopilganda "qabul qilindi" va xato holatlari tozalanadi — qayta ochilganda eski ekran qolmasin
    useEffect(() => {
        if (isOpen) return;
        setFailed(false);
        setErrors({});
        if (sent) { setSent(false); setFormData({ name: '', phone: '' }); }
    }, [isOpen, sent]);

    // Faqat "Kursga yozilish" (type='enroll') oynasi ochilishi — Meta Pixel InitiateCheckout (har ochilishda bir marta).
    // Bepul konsultatsiya "checkout" emas: voronka va retargeting ro'yxati aralashmasin.
    useEffect(() => {
        if (!isOpen || type !== 'enroll') return;
        const data: Record<string, unknown> = { content_name: courseName || 'consult', content_category: type };
        if (value && value > 0) { data.value = value; data.currency = 'UZS'; }
        trackEvent('InitiateCheckout', data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Muvaffaqiyat ekrani chiqqach fokus "Yopish" tugmasiga o'tadi (yuborish tugmasi DOM'dan ketdi)
    useEffect(() => {
        if (sent) doneRef.current?.focus({ preventScroll: true });
    }, [sent]);

    // dialog behaviour: lock page scroll, focus the first empty field, Esc closes,
    // Tab stays inside, focus returns to the trigger on close
    useEffect(() => {
        if (!isOpen) return;
        const opener = document.activeElement as HTMLElement | null;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const firstField = nameRef.current && !nameRef.current.value ? nameRef.current : (phoneRef.current || nameRef.current);
        firstField?.focus({ preventScroll: true });
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const f: HTMLElement[] = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href]'));
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKey, true);
        return () => {
            document.removeEventListener('keydown', onKey, true);
            document.body.style.overflow = prevOverflow;
            opener?.focus?.({ preventScroll: true });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const phoneHref = contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, '')}` : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value: v } = e.target;
        setFormData(prev => ({ ...prev, [name]: v }));
        // shu maydonning xatosi yozishni boshlashi bilan tozalanadi
        setErrors(prev => (prev[name as 'name' | 'phone'] ? { ...prev, [name]: undefined } : prev));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 9) val = val.slice(0, 9);
        let formatted = '';
        if (val.length > 0) formatted += val.substring(0, 2);
        if (val.length > 2) formatted += ' ' + val.substring(2, 5);
        if (val.length > 5) formatted += ' ' + val.substring(5, 7);
        if (val.length > 7) formatted += ' ' + val.substring(7, 9);
        setFormData(prev => ({ ...prev, phone: formatted }));
        setErrors(prev => (prev.phone ? { ...prev, phone: undefined } : prev));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || sent) return;
        const rawPhone = formData.phone.replace(/\D/g, '');

        const cleanName = formData.name.trim();
        const next: typeof errors = {};
        if (cleanName.length < 2) next.name = 'Ismingizni kiriting (kamida 2 harf).';
        // server bilan bir xil qoida: 9 raqam, operator kodi 2–9 dan boshlanadi
        if (!/^[2-9]\d{8}$/.test(rawPhone)) {
            next.phone = rawPhone.length !== 9 ? "Telefon raqamni to'liq kiriting: 90 123 45 67" : "Telefon raqam noto'g'ri. Masalan: 90 123 45 67";
        }
        setErrors(next);
        if (next.name || next.phone) {
            (next.name ? nameRef.current : phoneRef.current)?.focus();
            return;
        }

        setFailed(false);
        setLoading(true);

        // Determine source explicitly to divide into respective Google Sheet tabs
        const sourceRef = sourceRefProp || (type === 'enroll' ? 'Kursga_Yozilish' : 'Konsultatsiya');
        let crmData: any = null;

        const fullPhone = '+998' + rawPhone;
        // Lead eventID submit OLDIN yaratiladi (Meta dedup / kelajakdagi CAPI uchun)
        const leadEventId = newEventId();

        try {
            // Include extraInfo in the CRM record so Admins can see Test Results
            const crmCourseData = extraInfo
                ? `${courseName || 'consult'} | ${extraInfo}`
                : (courseName || 'consult');

            crmData = await submitLeadToAPI({
                name: cleanName,
                phone: fullPhone,
                courseId: crmCourseData,
                sourceRef,
            });
        } catch (e) {
            console.error("Failed to save lead to CRM", e);
        }

        // Menejerlarga Telegram xabarini server /api/leads ichida o'zi yuboradi

        setLoading(false);

        if (crmData) {
            // Server `duplicate:true` qaytarsa ham, shu sessiyada Lead hali yuborilmagan bo'lsa yuboriladi
            // (javob yo'qolib qayta urinish); yuborilgan bo'lsa trackLead qayta sanamaydi.
            // Karyera testi leadi bir sessiyada bir marta (avtomatik yuborish bilan ikkilanmasin).
            const isCareer = sourceRefProp === 'Karyera_Testi';
            trackLead({
                source: isCareer ? 'Karyera_Testi' : type,
                course: courseName,
                eventId: leadEventId,
                duplicate: !!crmData.duplicate,
                onceKey: isCareer ? 'Karyera_Testi' : undefined,
            });
            toast.success('Arizangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.', v2Toast());
            setSent(true);
        } else {
            setFailed(true);
            toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.', v2Toast());
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="v2 fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
            style={{ background: 'rgba(0,0,0,.62)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            onClick={handleBackdropClick}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="panel relative w-full max-w-md max-h-[100svh] overflow-y-auto p-6 pt-8 sm:p-9 rounded-b-none sm:rounded-[28px] animate-in fade-in zoom-in-95 duration-300"
                style={{ background: 'var(--bg-2)', borderColor: 'var(--line-2)', boxShadow: '0 40px 120px -30px rgba(0,0,0,.85)' }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Yopish"
                    className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-3)]"
                    style={{ color: 'var(--fg-2)' }}
                >
                    <X size={20} aria-hidden="true" />
                </button>

                {sent ? (
                    <div className="flex flex-col items-center text-center py-8" role="status">
                        <span className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--green)' }}>
                            <CheckCircle2 color="#fff" size={34} aria-hidden="true" />
                        </span>
                        <h3 id={titleId} className="t-h3">Ariza qabul qilindi!</h3>
                        <p className="t-body mt-3">Mutaxassislarimiz tez orada siz bilan bog{'\u02BB'}lanadi.</p>
                        <button ref={doneRef} type="button" onClick={onClose} className="btn btn-ghost mt-8">Yopish</button>
                    </div>
                ) : (
                    <>
                        <div className="mb-7 pr-10">
                            <h3 id={titleId} className="t-h3">
                                {type === 'enroll' ? 'Kursga yozilish' : 'Bepul konsultatsiya'}
                            </h3>
                            <p className="t-body mt-2 !text-[0.95rem]">
                                <span className="font-semibold" style={{ color: 'var(--fg)' }}>{uz(courseName)}</span> — ma{'\u02BC'}lumotlaringizni qoldiring
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
                            <div>
                                <label htmlFor={`${titleId}-name`} className="block text-sm font-medium mb-2">Ismingiz</label>
                                <input
                                    ref={nameRef}
                                    id={`${titleId}-name`}
                                    type="text"
                                    name="name"
                                    autoComplete="given-name"
                                    maxLength={60}
                                    value={formData.name}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? `${titleId}-name-err` : undefined}
                                    className="field"
                                    placeholder="Toʻliq ismingiz"
                                    required
                                />
                                {errors.name && <p id={`${titleId}-name-err`} role="alert" className="field-err">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor={`${titleId}-phone`} className="block text-sm font-medium mb-2">Telefon raqamingiz</label>
                                <div className="field-group" data-invalid={!!errors.phone || undefined}>
                                    <span className="flex items-center gap-2 pl-4 pr-2 mono ink-3 select-none" aria-hidden="true">
                                        <Phone size={16} /> +998
                                    </span>
                                    <input
                                        ref={phoneRef}
                                        id={`${titleId}-phone`}
                                        type="tel"
                                        name="phone"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        aria-invalid={!!errors.phone}
                                        aria-describedby={errors.phone ? `${titleId}-phone-err` : undefined}
                                        className="bare-input flex-1 min-w-0 h-14 pr-5 outline-none text-[1.0625rem]"
                                        style={{ background: 'transparent', border: 0, color: 'var(--fg)' }}
                                        placeholder="90 123 45 67"
                                        required
                                    />
                                </div>
                                {errors.phone && <p id={`${titleId}-phone-err`} role="alert" className="field-err">{errors.phone}</p>}
                            </div>
                            <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary w-full mt-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Yuborilmoqda...
                                    </>
                                ) : (
                                    type === 'enroll' ? 'Yozilish' : 'Konsultatsiya olish'
                                )}
                            </button>
                            {failed && (
                                <p role="alert" className="field-err !mt-0 text-center">
                                    Yuborilmadi. Internetni tekshirib, qayta urinib koʻring
                                    {phoneHref ? <> yoki qoʻngʻiroq qiling: <a href={phoneHref} className="font-semibold underline underline-offset-4 inline-flex items-center min-h-[44px]">{contactPhone}</a></> : '.'}
                                </p>
                            )}
                            <p className="text-xs ink-3 text-center -mt-2">
                                {uz("Menejer 1 ish kuni ichida qo'ng'iroq qiladi")}. Maʼlumotlaringiz faqat siz bilan bogʻlanish uchun ishlatiladi.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
