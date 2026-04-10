import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Client } from 'ssh2';

const COURSE_IMG = 'C:/Users/Norbek/.gemini/antigravity/brain/37fed1bb-14a9-468b-9d05-b864b0a9fa48/course_videografiya_1772616701394.png';
const TEACHER_IMG = 'C:/Users/Norbek/.gemini/antigravity/brain/37fed1bb-14a9-468b-9d05-b864b0a9fa48/teacher_murodbek_1772616723734.png';

const OUT_COURSE = 'public/images/courses/videografiya.webp';
const OUT_TEACHER = 'public/images/team/murodbek.webp';

async function processImages() {
    console.log('Compressing Course Banner...');
    await sharp(COURSE_IMG).resize(800).webp({ quality: 85 }).toFile(OUT_COURSE);

    console.log('Compressing Teacher Avatar...');
    await sharp(TEACHER_IMG).resize(400, 500).webp({ quality: 85 }).toFile(OUT_TEACHER);
    console.log('Images compressed to WebP.');
}

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

const NEW_TEAM = {
    id: "murodbek_rozmetov",
    name: { uz: "Murodbek Ro'zmetov", ru: "Муродбек Рузметов", en: "Murodbek Ruzmetov" },
    role: { uz: "Videomontaj Ustoz", ru: "Преподаватель Видеомонтажа", en: "Video Editing Instructor" },
    image: "/images/team/murodbek.webp",
    bio: {
        uz: "Videomeyekrlik sohasida +4 yillik tajribaga ega. O'z faoliyati davomida 500 dan ortiq videorolik va bir qator kliplarni muvaffaqiyatli topshirgan.",
        ru: "Креативный видеомейкер с более чем 4-летним опытом работы. За свою карьеру успешно сдал более 500 видеороликов и ряд клипов.",
        en: "Creative video maker with over +4 years of experience. Successfully delivered over 500 videos and several music videos."
    },
    skills: [
        { uz: "Premiere Pro", ru: "Premiere Pro", en: "Premiere Pro" },
        { uz: "After Effects", ru: "After Effects", en: "After Effects" },
        { uz: "Videografiya", ru: "Видеосъемка", en: "Videography" }
    ]
};

const DUMPSCRIPT = `
const dbPath = '/var/www/datatalim/server/data.db';
const Database = require('better-sqlite3');
const db = new Database(dbPath);

console.log('Connected to DB. Injecting Videography course...');

// Update courses
const rowC = db.prepare("SELECT value FROM app_data WHERE key = 'courses'").get();
if(rowC) {
    let courses = JSON.parse(rowC.value);
    // remove if exists
    courses = courses.filter(c => c.id !== 'videografiya');
    courses.push(${JSON.stringify(NEW_COURSE)});
    db.prepare("UPDATE app_data SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'courses'").run(JSON.stringify(courses));
    console.log('Courses updated!');
}

// Update team
const rowT = db.prepare("SELECT value FROM app_data WHERE key = 'team'").get();
if(rowT) {
    let team = JSON.parse(rowT.value);
    // remove if exists
    team = team.filter(t => t.id !== 'murodbek_rozmetov');
    team.push(${JSON.stringify(NEW_TEAM)});
    db.prepare("UPDATE app_data SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'team'").run(JSON.stringify(team));
    console.log('Team updated!');
}
db.close();
`;

async function deploy() {
    await processImages();
    fs.writeFileSync('remote_update_video.cjs', DUMPSCRIPT);

    const conn = new Client();
    conn.on('ready', () => {
        console.log('SSH Ready');
        conn.sftp((err, sftp) => {
            if (err) throw err;
            sftp.fastPut(OUT_COURSE, '/var/www/datatalim/dist/images/courses/videografiya.webp', (err1) => {
                if (err1) console.error('ERR1:', err1);
                console.log('Course image uploaded');
                sftp.fastPut(OUT_TEACHER, '/var/www/datatalim/dist/images/team/murodbek.webp', (err2) => {
                    if (err2) console.error('ERR2:', err2);
                    console.log('Teacher image uploaded');
                    sftp.fastPut('remote_update_video.cjs', '/var/www/datatalim/server/remote_update_video.cjs', (err3) => {
                        if (err3) console.error('ERR3:', err3);
                        console.log('DB Updater uploaded. Executing...');
                        conn.exec('cd /var/www/datatalim/server && node remote_update_video.cjs && chmod -R 755 /var/www/datatalim/dist/images && rm remote_update_video.cjs', (e, stream) => {
                            if (e) console.error('EXEC ERR:', e);
                            stream.on('close', () => {
                                console.log('Successfully completed. Restarting API...');
                                conn.exec('pm2 restart data-talim-api', (e2, st2) => {
                                    st2.on('close', () => conn.end());
                                });
                            }).on('data', (d) => process.stdout.write(d.toString()))
                                .stderr.on('data', (d) => process.stderr.write(d.toString()));
                        });
                    });
                });
            });
        });
    }).connect({ host: '188.225.74.65', port: 22, username: 'root', password: 'y,Qx9i6-dWMNCi' });
}

deploy().catch(console.error);
