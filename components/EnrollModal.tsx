import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, User, Phone } from 'lucide-react';
import { Button } from './Button';
import { sendToTelegram } from '../utils/telegram';
import toast from 'react-hot-toast';
import { submitLeadToAPI } from '../utils/api';
import { trackEvent } from '../utils/pixel';

interface EnrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseName: string;
    type?: 'enroll' | 'consult';
    extraInfo?: string; // Test natijasi yoki qo'shimcha ma'lumot
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ isOpen, onClose, courseName, type = 'enroll', extraInfo }) => {
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

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
        const rawPhone = formData.phone.replace(/\D/g, '');

        if (!formData.name.trim()) {
            toast.error('Ismingizni kiriting!');
            return;
        }

        if (rawPhone.length !== 9) {
            toast.error("Telefon raqamni to'liq kiriting: 90 123 45 67");
            return;
        }

        setLoading(true);

        // Determine source explicitly to divide into respective Google Sheet tabs
        const sourceRef = extraInfo ? 'Karyera_Testi' : (type === 'enroll' ? 'Kursga_Yozilish' : 'Konsultatsiya');
        let crmData: any = null;

        const fullPhone = '+998' + rawPhone;

        try {
            // Include extraInfo in the CRM record so Admins can see Test Results
            const crmCourseData = extraInfo
                ? `${courseName || 'consult'} | ${extraInfo}`
                : (courseName || 'consult');

            crmData = await submitLeadToAPI({
                name: formData.name,
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
        text += `👤 <b>Ism:</b> ${formData.name}\n`;
        text += `📞 <b>Telefon:</b> ${fullPhone}\n`;
        text += `📚 <b>Kurs:</b> ${courseName}\n`;
        if (extraInfo) {
            text += `\n📊 <b>Qo'shimcha:</b>\n${extraInfo}\n`;
        }
        text += `🔗 <b>Manba (ref):</b> ${displayRef}\n`;
        text += `\n🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;

        const result = await sendToTelegram(text);

        setLoading(false);

        if (result.success) {
            trackEvent('Lead', { source: type, course: courseName });
            toast.success('Arizangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setFormData({ name: '', phone: '' });
                onClose();
            }, 3000);
        } else {
            toast.error(result.error || 'Xatolik yuz berdi.');
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                    <X size={20} />
                </button>

                {sent ? (
                    <div className="flex flex-col items-center text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="text-green-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Ariza qabul qilindi!</h3>
                        <p className="text-slate-500">Mutaxassislarimiz tez orada siz bilan bog'lanadi.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                {type === 'enroll' ? 'Kursga yozilish' : 'Bepul konsultatsiya'}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                <span className="font-bold text-blue-600">{courseName}</span> — ma'lumotlaringizni qoldiring
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Ismingiz</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        placeholder="To'liq ismingiz"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Telefon raqamingiz</label>
                                <div className="relative flex items-center w-full rounded-xl border border-slate-200 focus-within:border-[#0061ff] focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden bg-white">
                                    <div className="pl-4 pr-3 py-3 border-r border-slate-200 text-slate-600 font-medium flex items-center gap-2 bg-slate-50">
                                        <Phone size={16} className="text-slate-400" />
                                        <span>+998</span>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="w-full pl-3 pr-4 py-3 outline-none bg-transparent"
                                        placeholder="90 123 45 67"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#0061ff] hover:bg-blue-700 text-white text-lg rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={20} /> Yuborilmoqda...
                                    </span>
                                ) : (
                                    type === 'enroll' ? 'Yozilish' : 'Konsultatsiya olish'
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
