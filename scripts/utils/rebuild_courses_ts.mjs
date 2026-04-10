import fs from 'fs';
import path from 'path';

// read the new courses from initialData
const courses = JSON.parse(fs.readFileSync('server/initialData/courses.json', 'utf8'));

// video course from add_video_course.mjs is already in DB, but not in courses.json yet.
const NEW_COURSE = {
    id: "videografiya",
    title: { uz: "Videografiya", ru: "Видеомонтаж", en: "Videography" },
    category: "media",
    duration: { uz: "3 oy", ru: "3 месяца", en: "3 months" },
    monthlyPrice: { uz: "1 200 000 so‘m", ru: "1 200 000 сум", en: "1 200 000 UZS" },
    totalPrice: { uz: "3 600 000 so‘m", ru: "3 600 000 сум", en: "3 600 000 UZS" },
    discountPrice: { uz: "3 420 000 so‘m", ru: "3 420 000 сум", en: "3 420 000 UZS" },
    description: {
        uz: "Kurs so'nggida: Video operatorlik mahoratiga ega bo'lib, sohada texnologik jihatdan xalqaro standart ishlash, har qanday turdagi video mahsulotga shakl berish, montaj qilish, ixchamlash, effekt berish va shu kabi tahrirlash bilan bog'liq ko'plab texnologik bilimlar beriladi.",
        ru: "По окончании курса вы овладеете навыками видеооператора, научитесь работать по международным стандартам, монтировать, применять эффекты и редактировать видеоматериалы.",
        en: "By the end of the course, you will acquire videography skills, learn to work according to international technological standards, edit, apply effects, and edit various video products."
    },
    modules: [
        {
            title: { uz: "1-MODUL: Premiere Pro asoslari va video montaj", ru: "МОДУЛЬ 1: Основы Premiere Pro и видеомонтаж", en: "MODULE 1: Premiere Pro Basics and Video Editing" },
            lessons: [
                { uz: "Premiere Pro interfeysi va asboblari", ru: "Интерфейс и инструменты Premiere Pro", en: "Premiere Pro interface and tools" },
                { uz: "Video va audioni kesish, birlashtirish", ru: "Нарезка и склеивание видео и аудио", en: "Cutting and joining video and audio" },
                { uz: "Kadrlar bilan ishlash va render qilish", ru: "Работа с кадрами и рендер", en: "Working with frames and rendering" }
            ]
        },
        {
            title: { uz: "2-MODUL: Suratga olish va kadrlar", ru: "МОДУЛЬ 2: Съемка и кадры", en: "MODULE 2: Filming and Framing" },
            lessons: [
                { uz: "Kameralar va yorug'lik bilan ishlash", ru: "Работа с камерами и светом", en: "Working with cameras and lighting" },
                { uz: "Ovoz yozish texnikasi", ru: "Техника записи звука", en: "Audio recording techniques" },
                { uz: "To'g'ri kompozitsiya tanlash", ru: "Выбор правильной композиции", en: "Choosing the right composition" }
            ]
        },
        {
            title: { uz: "3-MODUL: Mijoz bilan ishlash va amaliyot", ru: "МОДУЛЬ 3: Работа с клиентами и практика", en: "MODULE 3: Client Relations and Practice" },
            lessons: [
                { uz: "Mijoz talabini to'g'ri tushunish", ru: "Правильное понимание требований клиента", en: "Understanding client requirements properly" },
                { uz: "Ssenariy yozish va tayyorgarlik", ru: "Написание сценария и подготовка", en: "Scriptwriting and preparation" },
                { uz: "Byudjet va narx belgilash", ru: "Установление бюджета и цены", en: "Budgeting and pricing" }
            ]
        },
        {
            title: { uz: "4-MODUL: After Effects asoslari va animatsiya", ru: "МОДУЛЬ 4: Основы After Effects и анимация", en: "MODULE 4: After Effects Basics and Animation" },
            lessons: [
                { uz: "After Effects asoslari", ru: "Основы After Effects", en: "After Effects basics" },
                { uz: "Animatsiya va effektlar qo'shish", ru: "Добавление анимации и эффектов", en: "Adding animation and effects" },
                { uz: "Titrlarni jonlantirish", ru: "Оживление титров", en: "Animating titles" }
            ]
        },
        {
            title: { uz: "5-MODUL: Vizual effektlar va post-prodaksiya", ru: "МОДУЛЬ 5: Визуальные эффекты и пост-продакшн", en: "MODULE 5: Visual Effects and Post-Production" },
            lessons: [
                { uz: "Davinci Resolve yordamida Color Correction", ru: "Color Correction с помощью Davinci Resolve", en: "Color Correction using Davinci Resolve" },
                { uz: "Audioni tozalash va mikslash", ru: "Очистка и микширование аудио", en: "Audio cleaning and mixing" },
                { uz: "Final proyekt ustida ishlash", ru: "Работа над финальным проектом", en: "Working on the final project" }
            ]
        }
    ],
    technologies: ["Premiere Pro", "After Effects", "Adobe Photoshop", "Davinci Resolve", "Video operatorlik"],
    coverImage: "/images/courses/videografiya.webp",
    mentors: [
        {
            name: { uz: "Murodbek Ro'zmetov", ru: "Муродбек Рузметов", en: "Murodbek Ruzmetov" },
            role: { uz: "Videomontaj Kursi Ustozi", ru: "Преподаватель по видеомонтажу", en: "Video Editing Instructor" },
            image: "/images/team/murodbek.webp",
            bio: {
                uz: "Videomeyekrlik sohasida +4 yillik tajribaga ega. O'z faoliyati davomida 500 dan ortiq videorolik va bir qator kliplarni muvaffaqiyatli topshirgan. Shuningdek, boshqa davlatlar uchun 10 dan ortiq videorolik tayyorlagan.",
                ru: "Креативный видеомейкер с более чем 4-летним опытом работы. За свою карьеру успешно сдал более 500 видеороликов и ряд клипов. Также подготовил более 10 видеороликов для других стран.",
                en: "Creative video maker with over +4 years of experience. Successfully delivered over 500 videos and several music videos. Created more than 10 videos for foreign clients."
            }
        }
    ]
};

if (!courses.find(c => c.id === 'videografiya')) {
    courses.push(NEW_COURSE);
}

const fileContent = `import { LocalizedString } from '../types';

export interface Course {
  id: string;
  title: LocalizedString;
  category: 'programming' | 'media' | 'finance' | 'kids';
  duration: LocalizedString;
  monthlyPrice: LocalizedString;
  totalPrice: LocalizedString;
  description: LocalizedString;
  coverImage?: string;
  technologies: string[];
  mentors: {
    name: LocalizedString;
    role: LocalizedString;
    image: string;
  }[];
  modules: {
    title: LocalizedString;
    lessons: LocalizedString[];
  }[];
}

export const coursesData: Course[] = ${JSON.stringify(courses, null, 2)};
`;

fs.writeFileSync('data/courses.ts', fileContent);
console.log('Done writing data/courses.ts');
