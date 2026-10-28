import { FileWarning, MonitorPlay, ShieldCheck, Mic, Ticket, IceCream2, Citrus, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type L3 = { uz: string; ru: string; en: string };
export interface Mock { title: L3; desc: L3; icon: LucideIcon; art?: string }
export interface LangCourse { id: string; title: L3; desc: L3; level: L3 }

// Mock test data matching screenshot
export const MOCK_TESTS: Mock[] = [
    {
        title: { uz: "Paper-Based Mock Testlar", ru: "Paper-Based Mock Тесты", en: "Paper-Based Mock Tests" },
        desc: { uz: "IELTS kursi mobaynida darajalarini kuzatib borishda va imtihonga tayyorgarliklarini yanada oshirishda eng kerakli testlar", ru: "Необходимые тесты для отслеживания уровня во время курса IELTS и улучшения подготовки к экзамену", en: "Essential tests to track level during the IELTS course and further improve exam preparation" },
        icon: FileWarning,
        art: 'why-portfolio',
    },
    {
        title: { uz: "CD Mock Test", ru: "CD Mock Тест", en: "CD Mock Test" },
        desc: { uz: "Viloyatimizda yagona bo'lgan CD testda o'quvchilarimiz haqiqiy imtihon muhitida yuqori sharoitda imtihonga qatnashishadi", ru: "На единственном в нашей области CD-тесте наши ученики участвуют в экзамене в реальных условиях и превосходной обстановке", en: "In the only CD test in our region, our students participate in the exam in a real exam environment with top conditions" },
        icon: MonitorPlay,
        art: 'campus-texnika',
    },
    {
        title: { uz: "Multilevel Mock Test", ru: "Multilevel Mock Тест", en: "Multilevel Mock Test" },
        desc: { uz: "Multilevel (CEFR) imtihoniga tayyorgarlik ko'rayotgan o'quvchilarimiz ham o'z ko'nikmalarini muntazam ravishda kuzatib borishadi", ru: "Наши ученики, готовящиеся к экзамену Multilevel (CEFR), также регулярно отслеживают свои навыки", en: "Our students preparing for the Multilevel (CEFR) exam also track their skills regularly" },
        icon: ShieldCheck,
        art: 'why-sertifikat',
    }
];

// Events data matching screenshot
export const SUNDAY_EVENTS: Mock[] = [
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

export const LANGUAGE_COURSES: LangCourse[] = [
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
