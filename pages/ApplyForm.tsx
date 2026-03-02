import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTheme } from '../store/ThemeContext';
import { sendToTelegram } from '../utils/telegram';
import { submitLeadToAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Logo } from '../components/BrandElements';

export default function ApplyForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { courses, initializeStore } = useStore();

    const [formData, setFormData] = useState({ name: '', phone: '', courseId: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const refCode = searchParams.get('ref') || sessionStorage.getItem('marketing_ref') || undefined;

    useEffect(() => {
        // We only need basic courses for the dropdown
        if (courses.length === 0) {
            initializeStore();
        }
    }, [courses.length, initializeStore]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim() || !formData.courseId) {
            toast.error("Iltimos, barcha maydonlarni to'ldiring!");
            return;
        }
        setLoading(true);

        const selectedCourse = courses.find(c => c.id === formData.courseId);
        const courseName = selectedCourse ? selectedCourse.title.uz : 'Boshqa';

        const text = `🎯 <b>Yangi Ariza (Marketing) — DATA</b>\n\n👤 <b>Ism:</b> ${formData.name}\n📞 <b>Telefon:</b> ${formData.phone}\n📚 <b>Kurs:</b> ${courseName}\n🔗 <b>Manba (ref):</b> ${refCode || 'Organik'}\n\n🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;

        try {
            // 1. O'zimizning CRM ga saqlaymiz
            await submitLeadToAPI({
                name: formData.name,
                phone: formData.phone,
                courseId: courseName,
                sourceRef: refCode,
            });

            // 2. Telegramga yuboramiz
            await sendToTelegram(text);

            setSent(true);
            toast.success('Arizangiz muvaffaqiyatli qabul qilindi!');
        } catch (error) {
            console.error("Xatolik:", error);
            toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
                <div className={`max-w-md w-full p-8 rounded-3xl text-center shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Ajoyib! 🎉
                    </h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Arizangiz muvaffaqiyatli qabul qilindi. Mutaxassislarimiz tez orada siz bilan bog'lanishadi.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#0061ff] text-white px-8 py-4 rounded-xl font-bold w-full flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        Bosh sahifaga qaytish <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-[#0061ff] blur-[150px] opacity-10 rounded-full pointer-events-none"></div>

            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border relative z-10 ${isDark ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        O'qishga yozilish
                    </h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Ma'lumotlaringizni qoldiring, biz sizga o'zingizga mos kursni tanlashga yordam beramiz.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ism va familiya *</label>
                        <input
                            type="text"
                            required
                            disabled={loading}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#0061ff] transition-all outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                            placeholder="Asadbek Ismoilov"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Telefon raqam *</label>
                        <input
                            type="tel"
                            required
                            disabled={loading}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#0061ff] transition-all outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                            placeholder="+998 90 123 45 67"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Yo'nalishni tanlang *</label>
                        <select
                            required
                            disabled={loading}
                            value={formData.courseId}
                            onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                            className={`w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#0061ff] transition-all outline-none appearance-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        >
                            <option value="" disabled>Kursni tanlang...</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title.uz}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0061ff] hover:bg-[#0052cc] text-white px-5 py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-4"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={20} /> Yuborilmoqda...</>
                        ) : (
                            'Ariza qoldirish'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
