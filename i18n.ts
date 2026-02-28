import { useState, useCallback } from 'react';

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

// Custom hook for language management
export const useLanguage = () => {
    const [lang, setLangState] = useState<Language>(() => {
        const saved = localStorage.getItem('data-talim-lang');
        return (saved as Language) || 'uz';
    });

    const setLang = useCallback((newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('data-talim-lang', newLang);
        document.documentElement.lang = newLang;
    }, []);

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
