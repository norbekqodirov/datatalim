import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Loader2, CheckCircle2, Phone } from 'lucide-react';
import { sendToTelegram } from '../utils/telegram';
import toast from 'react-hot-toast';
import { submitLeadToAPI } from '../utils/api';
import { trackEvent } from '../utils/pixel';
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
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ isOpen, onClose, courseName, type = 'enroll', extraInfo, sourceRef: sourceRefProp, initialName, initialPhone }) => {
    const [formData, setFormData] = useState({ name: initialName || '', phone: initialPhone || '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Telegram parse_mode=HTML: foydalanuvchi kiritgan matn xabarni buzmasligi uchun
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 'Arizangiz qabul qilindi' dan keyingi avtomatik yopilish taymeri — komponent o'chsa ham qolib ketmasin
    useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

    // Qo'lda yopilsa (modal o'chmasdan qolsa ham) taymer va "qabul qilindi" holati tozalanadi —
    // qayta ochilganda eski muvaffaqiyat ekrani va kutilmagan yopilish bo'lmasin
    useEffect(() => {
        if (isOpen) return;
        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
        if (sent) { setSent(false); setFormData({ name: '', phone: '' }); }
    }, [isOpen, sent]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 9) val = val.slice(0, 9);
        let formatted = '';
        if (val.length > 0) formatted += val.substring(0, 2);
        if (val.length > 2) formatted += ' ' + val.substring(2, 5);
        if (val.length > 5) formatted += ' ' + val.substring(5, 7);
        if (val.length > 7) formatted += ' ' + val.substring(7, 9);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || sent) return;
        const rawPhone = formData.phone.replace(/\D/g, '');

        const cleanName = formData.name.trim();
        if (cleanName.length < 2) {
            toast.error('Ismingizni kiriting (kamida 2 harf).', v2Toast());
            return;
        }

        // server bilan bir xil qoida: 9 raqam, operator kodi 2–9 dan boshlanadi
        if (!/^[2-9]\d{8}$/.test(rawPhone)) {
            toast.error(rawPhone.length !== 9 ? "Telefon raqamni to'liq kiriting: 90 123 45 67" : "Telefon raqam noto'g'ri. Masalan: 90 123 45 67", v2Toast());
            return;
        }

        setLoading(true);

        // Determine source explicitly to divide into respective Google Sheet tabs
        const sourceRef = sourceRefProp || (type === 'enroll' ? 'Kursga_Yozilish' : 'Konsultatsiya');
        let crmData: any = null;

        const fullPhone = '+998' + rawPhone;

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

        const emoji = type === 'enroll' ? '📝' : '💡';
        const label = type === 'enroll' ? 'Kursga yozilish' : 'Bepul konsultatsiya';
        const displayRef = crmData?.resolvedSourceRef || sourceRef || 'Organik';

        let text = `${emoji} <b>${label} — DATA Ta'lim Stansiyasi</b>\n\n`;
        text += `👤 <b>Ism:</b> ${esc(cleanName)}\n`;
        text += `📞 <b>Telefon:</b> ${fullPhone}\n`;
        text += `📚 <b>Kurs:</b> ${esc(courseName)}\n`;
        if (extraInfo) {
            text += `\n📊 <b>Qo'shimcha:</b>\n${esc(extraInfo)}\n`;
        }
        text += `🔗 <b>Manba (ref):</b> ${displayRef}\n`;
        text += `\n🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;

        const result = await sendToTelegram(text);
        if (!result.success) {
            // Telegram — faqat menejerlarga tezkor bildirishnoma kanali; lead CRM/Sheetsga
            // allaqachon tushgan bo'lsa (crmData bor), bu yerda muvaffaqiyatsizlik ariza
            // qabul qilinmagan degani emas, shuning uchun foydalanuvchiga xatolik ko'rsatmaymiz.
            console.error('Telegram notification failed (lead is still saved to CRM):', result.error);
        }

        setLoading(false);

        // Ariza CRM'ga yoki (CRM ishlamasa) menejerlar Telegram'iga yetib borgan bo'lsa — qabul qilingan.
        // Aks holda foydalanuvchiga xato ko'rsatib qayta yuborishga majburlash dublikat yaratardi.
        if (crmData || result.success) {
            trackEvent('Lead', { source: type, course: courseName });
            toast.success('Arizangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.', v2Toast());
            setSent(true);
            closeTimerRef.current = setTimeout(() => {
                setSent(false);
                setFormData({ name: '', phone: '' });
                onClose();
            }, 3000);
        } else {
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
                                    className="field"
                                    placeholder="Toʻliq ismingiz"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor={`${titleId}-phone`} className="block text-sm font-medium mb-2">Telefon raqamingiz</label>
                                <div className="field-group">
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
                                        className="bare-input flex-1 min-w-0 h-14 pr-5 outline-none text-[1.0625rem]"
                                        style={{ background: 'transparent', border: 0, color: 'var(--fg)' }}
                                        placeholder="90 123 45 67"
                                        required
                                    />
                                </div>
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
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
