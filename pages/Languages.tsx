import React, { useState } from 'react';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';
import { PatternBg, FloatingStars, Star1, Star2 } from '../components/BrandElements';
import { SEO } from '../components/SEO';
import { Globe, Users, Headphones, GraduationCap, Mic, Ticket, MonitorPlay, IceCream2, Citrus, Clock, FileWarning, ArrowRight, ShieldCheck, Gamepad2, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { EnrollModal } from '../components/EnrollModal';
import { motion } from 'framer-motion';

// --- Animated Shapes for Language Brand ---
const AnimatedShapes = ({ color1, color2 }: { color1: string, color2: string }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[5%] w-24 h-24 rounded-full opacity-20"
            style={{ backgroundColor: color1 }}
        />
        <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[25%] right-[10%] w-32 h-32 opacity-15"
            style={{ backgroundColor: color2, borderRadius: '24px' }}
        />
        <motion.div
            animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] left-[15%] w-16 h-16 rounded-full opacity-20"
            style={{ backgroundColor: color2 }}
        />
        <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] right-[20%] w-20 h-20 opacity-15"
            style={{ backgroundColor: color1, borderRadius: '16px' }}
        />
    </div>
);

// Mock test data matching screenshot
const MOCK_TESTS = [
    {
        title: { uz: "Paper-Based Mock Testlar", ru: "Paper-Based Mock Тесты", en: "Paper-Based Mock Tests" },
        desc: { uz: "IELTS kursi mobaynida darajalarini kuzatib borishda va imtihonga tayyorgarliklarini yanada oshirishda eng kerakli testlar", ru: "Необходимые тесты для отслеживания уровня во время курса IELTS и улучшения подготовки к экзамену", en: "Essential tests to track level during the IELTS course and further improve exam preparation" },
        icon: FileWarning,
    },
    {
        title: { uz: "CD Mock Test", ru: "CD Mock Тест", en: "CD Mock Test" },
        desc: { uz: "Viloyatimizda yagona bo'lgan CD testda o'quvchilarimiz haqiqiy imtihon muhitida yuqori sharoitda imtihonga qatnashishadi", ru: "На единственном в нашей области CD-тесте наши ученики участвуют в экзамене в реальных условиях и превосходной обстановке", en: "In the only CD test in our region, our students participate in the exam in a real exam environment with top conditions" },
        icon: MonitorPlay,
    },
    {
        title: { uz: "Multilevel Mock Test", ru: "Multilevel Mock Тест", en: "Multilevel Mock Test" },
        desc: { uz: "Multilevel (CEFR) imtihoniga tayyorgarlik ko'rayotgan o'quvchilarimiz ham o'z ko'nikmalarini muntazam ravishda kuzatib borishadi", ru: "Наши ученики, готовящиеся к экзамену Multilevel (CEFR), также регулярно отслеживают свои навыки", en: "Our students preparing for the Multilevel (CEFR) exam also track their skills regularly" },
        icon: ShieldCheck,
    }
];

// Events data matching screenshot
const SUNDAY_EVENTS = [
    {
        title: { uz: "Karaoke", ru: "Караоке", en: "Karaoke" },
        desc: { uz: "O'quvchilarimiz ingliz tilida birgalikda qo'shiqlar kuylashadi va talaffuzlarini yanada yaxshilashadi", ru: "Наши ученики вместе поют песни на английском языке и улучшают свое произношение", en: "Our students sing songs together in English and further improve their pronunciation" },
        icon: Mic,
    },
    {
        title: { uz: "Quiz", ru: "Викторина", en: "Quiz" },
        desc: { uz: "Qisqa savollardan iborat test va musobaqalar bilan o'quvchilarning bilimlarni baholaymiz, ular esa qiziqarli ma'lumotlarni o'rganishadi", ru: "Мы оцениваем знания студентов с помощью коротких тестов и соревнований, а они узнают интересную информацию", en: "We evaluate students' knowledge with short tests and competitions, while they learn interesting information" },
        icon: Search,
    },
    {
        title: { uz: "Movie Time", ru: "Время кино", en: "Movie Time" },
        desc: { uz: "O'quvchilarimiz ingliz tilida film tomosha qilishadi va talaffuz bilan so'z boyligini yanada oshirib borishadi", ru: "Наши студенты смотрят фильмы на английском языке, улучшая произношение и словарный запас", en: "Our students watch movies in English, improving their pronunciation and vocabulary" },
        icon: Ticket,
    },
    {
        title: { uz: "Popkorn party", ru: "Попкорн вечеринка", en: "Popcorn Party" },
        desc: { uz: "Party davomida turli shirinliklar va popkornlar bilan o'quvchilarga yanada ilhom baxsh etamiz", ru: "Во время вечеринки мы вдохновляем учеников различными сладостями и попкорном", en: "During the party, we inspire students with various sweets and popcorn" },
        icon: IceCream2,
    },
    {
        title: { uz: "Mandarin Party", ru: "Мандариновая вечеринка", en: "Mandarin Party" },
        desc: { uz: "Tadbir davomida shiringina mandarinlar tortiq qilinadi, turli o'yinlar bo'ladi va o'quvchilarga sovg'alar tarqatiladi", ru: "Во время мероприятия угощают сладкими мандаринами, проводятся различные игры и раздаются подарки ученикам", en: "During the event, sweet mandarins are served, various games are played, and gifts are distributed to students" },
        icon: Citrus,
    }
];

const LANGUAGE_COURSES = [
    {
        id: 'english',
        title: { uz: "Ingliz tili", ru: "Английский язык", en: "English" },
        desc: { uz: "IELTS va CEFR imtihonlariga tayyorlovchi, shuningdek, General English darslarini o'z ichiga olgan mukammal kurs.", ru: "Идеальный курс, включающий подготовку к IELTS и CEFR, а также занятия по General English.", en: "A perfect course including IELTS and CEFR preparation, as well as General English lessons." },
        level: { uz: "Boshlang'ichdan IELTS gacha", ru: "От начального до IELTS", en: "Beginner to IELTS" }
    },
    {
        id: 'russian',
        title: { uz: "Rus tili", ru: "Русский язык", en: "Russian" },
        desc: { uz: "Kundalik so'zlashuv va grammatikani oson hamda interaktiv usulda o'rganing. Istalgan yoshdagilar uchun.", ru: "Изучайте повседневный разговорный язык и грамматику легким и интерактивным способом. Для любого возраста.", en: "Learn daily conversation and grammar in an easy and interactive way. For all ages." },
        level: { uz: "A1 - B2 darajalar", ru: "Уровни A1 - B2", en: "A1 - B2 levels" }
    },
    {
        id: 'korean',
        title: { uz: "Koreys tili", ru: "Корейский язык", en: "Korean" },
        desc: { uz: "TOPIK imtihoniga professional tarzda tayyorgarlik ko'rish hamda Koreyada ishlash va o'qish uchun maxsus til kursi.", ru: "Профессиональная подготовка к экзамену TOPIK и специальный языковой курс для работы и учебы в Корее.", en: "Professional TOPIK exam preparation and a special language course for working and studying in Korea." },
        level: { uz: "TOPIK 1 - TOPIK 6", ru: "TOPIK 1 - TOPIK 6", en: "TOPIK 1 - TOPIK 6" }
    },
    {
        id: 'german',
        title: { uz: "Nemis tili", ru: "Немецкий язык", en: "German" },
        desc: { uz: "Goethe-Zertifikat imtihonlariga tayyorlovchi sifatli ta'lim. Germaniyada o'qish va yashash uchun ideal tanlov.", ru: "Качественное образование для подготовки к экзаменам Goethe-Zertifikat. Идеальный выбор для учебы и жизни в Германии.", en: "Quality education to prepare for Goethe-Zertifikat exams. Ideal choice for studying and living in Germany." },
        level: { uz: "A1 - C1 darajalar", ru: "Уровни A1 - C1", en: "A1 - C1 levels" }
    }
];

export default function Languages() {
    const { isDark } = useTheme();
    const { tField } = useLanguage();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');

    // 1) Define explicit colors for the Red theme
    const RED_PRIMARY = '#ff2e2e';
    const RED_SECONDARY = '#ff6b6b';
    const RED_GRADIENT = `linear-gradient(135deg, ${RED_PRIMARY} 0%, ${RED_SECONDARY} 100%)`;

    const handleEnroll = (courseName: string) => {
        setSelectedCourse(courseName);
        setModalOpen(true);
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#000000]' : 'bg-slate-50'}`}>
            <SEO title="Til Kurslari | DATA" description="DATA Ta'lim Stansiyasida Ingliz, Rus, Koreys va Nemis tillari. IELTS, TOPIK va CEFR ga tayyorgarlik." />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <PatternBg color={RED_PRIMARY} opacity={isDark ? 0.05 : 0.03} />
                <FloatingStars color1={RED_PRIMARY} color2={RED_SECONDARY} />
                <AnimatedShapes color1={RED_PRIMARY} color2={RED_SECONDARY} />

                {/* Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff2e2e] blur-[150px] opacity-20 rounded-full pointer-events-none mix-blend-screen"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff6b6b] blur-[150px] opacity-20 rounded-full pointer-events-none mix-blend-screen"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 font-bold border backdrop-blur-md shadow-sm" style={{ background: isDark ? 'rgba(255,46,46,0.1)' : 'rgba(255,46,46,0.05)', color: RED_PRIMARY, borderColor: 'rgba(255,46,46,0.2)' }}>
                        <Globe size={18} /> DATA Languages Academy
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`text-5xl md:text-7xl font-black mb-6 tracking-tight font-sans uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Barcha dunyo tillari <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: RED_GRADIENT }}>bitta joyda</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        DATA bilan zamonaviy usulda, ko'ngilochar tadbirlar va maxsus mock testlar orqali xorijiy tillarni tez va onson o'rganing.
                    </motion.p>
                </div>
            </section>

            {/* --- COURSES SECTION --- */}
            <section className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {LANGUAGE_COURSES.map((course, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                key={course.id} className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden ${isDark ? 'bg-slate-900/80 border-white/5 hover:border-red-500/30' : 'bg-white border-slate-200 hover:border-red-300 shadow-xl shadow-red-500/5'}`}>

                                {/* Decorative circle inside card */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 transition-transform group-hover:scale-110" style={{ background: RED_GRADIENT }}></div>
                                <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-[20px] rotate-12 opacity-[0.03] transition-transform group-hover:rotate-45" style={{ background: RED_PRIMARY }}></div>

                                <h3 className={`text-3xl font-black mb-4 flex items-center gap-3 relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {tField(course.title)}
                                </h3>
                                <p className={`mb-6 text-lg min-h-[80px] relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {tField(course.desc)}
                                </p>
                                <div className="mb-8 flex items-center gap-2 relative z-10">
                                    <div className="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Daraja: {tField(course.level)}</div>
                                </div>
                                <Button onClick={() => handleEnroll(tField(course.title))} className="w-full relative z-10 text-white font-bold h-14 rounded-xl shadow-lg border-0 transition-all hover:scale-[1.02] hover:shadow-red-500/30" style={{ background: RED_GRADIENT }}>
                                    Kursga yozilish <ArrowRight size={20} className="ml-2 inline group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MOCK TESTS SECTION (Matching the provided design) --- */}
            <section className="py-20 relative z-10" style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,46,46,0.02)' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-black uppercase font-sans tracking-tight mb-4`} style={{ color: RED_PRIMARY }}>Bepul Mock Testlar</h2>
                        <p className={`text-lg font-bold max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                            Bu testlar o'quvchilarimizga imtihondan oldin kuchli tayyorgarlik ko'rish va uni muvaffaqiyatli topshirishga yordam beradi.
                        </p>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Decorative floating square behind lists */}
                        <motion.div
                            animate={{ rotate: [0, 90, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -left-16 top-20 w-32 h-32 rounded-[32px] opacity-[0.06] pointer-events-none" style={{ backgroundColor: RED_PRIMARY }} />

                        {MOCK_TESTS.map((test, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                key={idx} className="p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all hover:scale-[1.01] shadow-2xl shadow-red-900/10" style={{ background: RED_PRIMARY }}>

                                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }}></div>

                                <div className="flex-1 text-white relative z-10">
                                    <h3 className="text-2xl font-black mb-3">{tField(test.title)}</h3>
                                    <p className="text-white/90 font-medium leading-relaxed">{tField(test.desc)}</p>
                                </div>
                                <div className="w-24 h-24 bg-white/20 rounded-[28px] flex items-center justify-center shrink-0 relative z-10 backdrop-blur-md shadow-inner border border-white/10">
                                    <test.icon size={48} className="text-white drop-shadow-md" />
                                </div>
                                {/* Decor elements inside the red card */}
                                <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
                                <div className="absolute top-5 left-1/2 w-16 h-16 border-4 border-white/10 rounded-xl rotate-12 pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-3xl md:text-4xl font-black" style={{ color: RED_PRIMARY }}>
                        Har bir muvaffaqiyat biz uchun muhim!
                    </div>
                </div>
            </section>

            {/* --- SUNDAY EVENTS SECTION (Matching the provided design) --- */}
            <section className="py-20 relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className={`text-4xl md:text-5xl font-black uppercase font-sans tracking-tight mb-6`} style={{ color: RED_PRIMARY }}>
                            Ko'ngilochar tadbirlar
                        </h2>
                        <p className={`text-lg font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                            Dam olish kunini maroqli va zavqli o'tkazish uchun har yakshanba <span style={{ color: RED_PRIMARY }}>"Sunday event"</span> lar tashkil etilgan.
                            Ushbu tadbirlar nafaqat dam olish, balki yangi do'stlar orttirish, muloqot ko'nikmalarini rivojlantirish va til o'rganishga bo'lgan qiziqishni orttiradi.
                        </p>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Decorative floating circle behind lists */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-12 bottom-20 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none" style={{ backgroundColor: RED_PRIMARY }} />

                        {SUNDAY_EVENTS.map((event, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                key={idx} className="p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all hover:scale-[1.01] shadow-2xl shadow-red-900/10" style={{ background: RED_PRIMARY }}>

                                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%)' }}></div>

                                <div className="flex-1 text-white relative z-10">
                                    <h3 className="text-2xl font-black mb-3">{tField(event.title)}</h3>
                                    <p className="text-white/90 font-medium leading-relaxed">{tField(event.desc)}</p>
                                </div>
                                <div className="w-24 h-24 bg-white rounded-[28px] flex items-center justify-center shrink-0 relative z-10 shadow-xl border border-white/20 hover:rotate-6 transition-transform">
                                    <event.icon size={40} style={{ color: RED_PRIMARY }} />
                                </div>
                                {/* Decor elements inside the red card */}
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-3xl rotate-45 pointer-events-none"></div>
                                <div className="absolute top-8 right-1/3 w-10 h-10 border-4 border-white/10 rounded-full pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ENROLL MODAL --- */}
            <EnrollModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courseName={selectedCourse}
                type="enroll"
                extraInfo="Language Target"
            />
        </div>
    );
}
