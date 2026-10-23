import { useCallback } from 'react';
import { create } from 'zustand';

export type Language = 'uz' | 'ru' | 'en';

export const translations: Record<Language, Record<string, string>> = {
    uz: {
        // Navbar
        'nav.home': 'Bosh sahifa',
        'nav.courses': 'Kurslar',
        'nav.about': 'Biz haqimizda',
        'nav.team': 'Jamoa',
        'nav.contact': 'Aloqa',
        'nav.careerTest': 'Karyera Testi',
        'nav.languages': 'Til kurslari',
        'nav.blog': 'Blog',

        // Blog
        'blog.title': 'Blog',
        'blog.subtitle': 'Eng so\'nggi maqolalar va yangiliklar',
        'blog.search': 'Qidirish...',
        'blog.all': 'Barchasi',
        'blog.empty': 'Maqolalar topilmadi',
        'blog.readMore': 'Davomini o\'qish',
        'blog.back': 'Blogga qaytish',

        // Hero
        'hero.cta.test': 'Kasbni aniqlash',
        'hero.cta.courses': 'Kurslarni ko\'rish',

        // Courses
        'courses.title': 'Barcha Kurslar',
        'courses.all': 'Barcha kurslar',
        'courses.detail': 'Batafsil ma\'lumot',

        // Footer
        'footer.rights': 'Barcha huquqlar himoyalangan.',
        'footer.quickLinks': 'Tezkor havolalar',
        'footer.contact': 'Bog\'lanish',

        // Career Test
        'test.start': 'Testni boshlash',
        'test.restart': 'Testni qayta ishlash',
        'test.results': 'Sizning natijalaringiz',
        'test.download': 'Natijani yuklab olish (PDF)',
        'test.enroll': 'Kursga yozilish',
        'test.consult': 'Bepul konsultatsiya',

        // Contact
        'contact.title': 'Biz bilan bog\'laning',
        'contact.send': 'Xabarni yuborish',
        'contact.name': 'Ismingiz',
        'contact.phone': 'Telefon raqamingiz',
        'contact.message': 'Xabaringiz',
    },
    ru: {
        // Navbar
        'nav.home': 'Главная',
        'nav.courses': 'Курсы',
        'nav.about': 'О нас',
        'nav.team': 'Команда',
        'nav.contact': 'Контакт',
        'nav.careerTest': 'Тест Карьеры',
        'nav.languages': 'Языковые курсы',
        'nav.blog': 'Блог',

        // Blog
        'blog.title': 'Блог',
        'blog.subtitle': 'Последние статьи и новости',
        'blog.search': 'Поиск...',
        'blog.all': 'Все',
        'blog.empty': 'Статьи не найдены',
        'blog.readMore': 'Читать далее',
        'blog.back': 'Вернуться к блогу',

        // Hero
        'hero.cta.test': 'Определить профессию',
        'hero.cta.courses': 'Смотреть курсы',

        // Courses
        'courses.title': 'Все Курсы',
        'courses.all': 'Все курсы',
        'courses.detail': 'Подробнее',

        // Footer
        'footer.rights': 'Все права защищены.',
        'footer.quickLinks': 'Быстрые ссылки',
        'footer.contact': 'Контакты',

        // Career Test
        'test.start': 'Начать тест',
        'test.restart': 'Пройти тест заново',
        'test.results': 'Ваши результаты',
        'test.download': 'Скачать результат (PDF)',
        'test.enroll': 'Записаться на курс',
        'test.consult': 'Бесплатная консультация',

        // Contact
        'contact.title': 'Свяжитесь с нами',
        'contact.send': 'Отправить',
        'contact.name': 'Ваше имя',
        'contact.phone': 'Номер телефона',
        'contact.message': 'Сообщение',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.courses': 'Courses',
        'nav.about': 'About',
        'nav.team': 'Team',
        'nav.contact': 'Contact',
        'nav.careerTest': 'Career Test',
        'nav.languages': 'Languages',
        'nav.blog': 'Blog',

        // Blog
        'blog.title': 'Blog',
        'blog.subtitle': 'Latest articles and news',
        'blog.search': 'Search...',
        'blog.all': 'All',
        'blog.empty': 'No articles found',
        'blog.readMore': 'Read more',
        'blog.back': 'Back to blog',

        // Hero
        'hero.cta.test': 'Find Your Career',
        'hero.cta.courses': 'View Courses',

        // Courses
        'courses.title': 'All Courses',
        'courses.all': 'All courses',
        'courses.detail': 'Learn more',

        // Footer
        'footer.rights': 'All rights reserved.',
        'footer.quickLinks': 'Quick Links',
        'footer.contact': 'Contact',

        // Career Test
        'test.start': 'Start Test',
        'test.restart': 'Retake Test',
        'test.results': 'Your Results',
        'test.download': 'Download Results (PDF)',
        'test.enroll': 'Enroll Now',
        'test.consult': 'Free Consultation',

        // Contact
        'contact.title': 'Contact Us',
        'contact.send': 'Send Message',
        'contact.name': 'Your Name',
        'contact.phone': 'Phone Number',
        'contact.message': 'Message',
    },
};

// --- Umumiy til holati (shared store) ---
// Avval har bir komponent o'z useState'iga ega edi, shuning uchun til almashtirgich faqat Navbar'ni o'zgartirardi.
const LANG_KEY = 'data-talim-lang';
const isLanguage = (v: unknown): v is Language => v === 'uz' || v === 'ru' || v === 'en';

const readSavedLang = (): Language => {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (isLanguage(saved)) return saved;
    } catch { /* localStorage mavjud emas (private mode va h.k.) */ }
    return 'uz';
};

interface LanguageState {
    lang: Language;
    setLang: (lang: Language) => void;
}

const useLanguageStore = create<LanguageState>((set) => ({
    lang: readSavedLang(),
    setLang: (newLang) => {
        if (!isLanguage(newLang)) return;
        try { localStorage.setItem(LANG_KEY, newLang); } catch { /* ignore */ }
        if (typeof document !== 'undefined') document.documentElement.lang = newLang;
        set({ lang: newLang });
    },
}));

// <html lang> ni boshlang'ich yuklashda ham to'g'rilab qo'yamiz
if (typeof document !== 'undefined') {
    document.documentElement.lang = useLanguageStore.getState().lang;
}

// Custom hook for language management (API o'zgarmagan: {lang, setLang, t, tField})
export const useLanguage = () => {
    const lang = useLanguageStore((s) => s.lang);
    const setLang = useLanguageStore((s) => s.setLang);

    const t = useCallback((key: string): string => {
        return translations[lang][key] || translations['uz'][key] || key;
    }, [lang]);

    const tField = useCallback((field: any | string): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field['uz'] || '';
    }, [lang]);

    return { lang, setLang, t, tField };
};
