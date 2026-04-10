
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
    courses.push({"id":"videografiya","title":{"uz":"Videografiya","ru":"Видеомонтаж","en":"Videography"},"category":"media","duration":{"uz":"3 oy","ru":"3 месяца","en":"3 months"},"monthlyPrice":{"uz":"1 200 000 so‘m","ru":"1 200 000 сум","en":"1 200 000 UZS"},"totalPrice":{"uz":"3 600 000 so‘m","ru":"3 600 000 сум","en":"3 600 000 UZS"},"discountPrice":{"uz":"3 420 000 so‘m","ru":"3 420 000 сум","en":"3 420 000 UZS"},"description":{"uz":"Kurs so'nggida: Video operatorlik mahoratiga ega bo'lib, sohada texnologik jihatdan xalqaro standart ishlash, har qanday turdagi video mahsulotga shakl berish, montaj qilish, ixchamlash, effekt berish va shu kabi tahrirlash bilan bog'liq ko'plab texnologik bilimlar beriladi.","ru":"По окончании курса вы овладеете навыками видеооператора, научитесь работать по международным стандартам, монтировать, применять эффекты и редактировать видеоматериалы.","en":"By the end of the course, you will acquire videography skills, learn to work according to international technological standards, edit, apply effects, and edit various video products."},"modules":[{"title":{"uz":"1-MODUL: Premiere Pro asoslari va video montaj","ru":"МОДУЛЬ 1: Основы Premiere Pro и видеомонтаж","en":"MODULE 1: Premiere Pro Basics and Video Editing"}},{"title":{"uz":"2-MODUL: Suratga olish va kadrlar","ru":"МОДУЛЬ 2: Съемка и кадры","en":"MODULE 2: Filming and Framing"}},{"title":{"uz":"3-MODUL: Mijoz bilan ishlash va amaliyot","ru":"МОДУЛЬ 3: Работа с клиентами и практика","en":"MODULE 3: Client Relations and Practice"}},{"title":{"uz":"4-MODUL: After Effects asoslari va animatsiya","ru":"МОДУЛЬ 4: Основы After Effects и анимация","en":"MODULE 4: After Effects Basics and Animation"}},{"title":{"uz":"5-MODUL: Vizual effektlar va post-prodaksiya","ru":"МОДУЛЬ 5: Визуальные эффекты и пост-продакшн","en":"MODULE 5: Visual Effects and Post-Production"}}],"technologies":["Premiere Pro","After Effects","Adobe Photoshop","Davinci Resolve","Video operatorlik"],"coverImage":"/images/courses/videografiya.webp","teacher":{"name":{"uz":"Murodbek Ro'zmetov","ru":"Муродбек Рузметов","en":"Murodbek Ruzmetov"},"role":{"uz":"Videomontaj Kursi Ustozi","ru":"Преподаватель по видеомонтажу","en":"Video Editing Instructor"},"image":"/images/team/murodbek.webp","bio":{"uz":"Videomeyekrlik sohasida +4 yillik tajribaga ega. O'z faoliyati davomida 500 dan ortiq videorolik va bir qator kliplarni muvaffaqiyatli topshirgan. Shuningdek, boshqa davlatlar uchun 10 dan ortiq videorolik tayyorlagan.","ru":"Креативный видеомейкер с более чем 4-летним опытом работы. За свою карьеру успешно сдал более 500 видеороликов и ряд клипов. Также подготовил более 10 видеороликов для других стран.","en":"Creative video maker with over +4 years of experience. Successfully delivered over 500 videos and several music videos. Created more than 10 videos for foreign clients."}}});
    db.prepare("UPDATE app_data SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'courses'").run(JSON.stringify(courses));
    console.log('Courses updated!');
}

// Update team
const rowT = db.prepare("SELECT value FROM app_data WHERE key = 'team'").get();
if(rowT) {
    let team = JSON.parse(rowT.value);
    // remove if exists
    team = team.filter(t => t.id !== 'murodbek_rozmetov');
    team.push({"id":"murodbek_rozmetov","name":{"uz":"Murodbek Ro'zmetov","ru":"Муродбек Рузметов","en":"Murodbek Ruzmetov"},"role":{"uz":"Videomontaj Ustoz","ru":"Преподаватель Видеомонтажа","en":"Video Editing Instructor"},"image":"/images/team/murodbek.webp","bio":{"uz":"Videomeyekrlik sohasida +4 yillik tajribaga ega. O'z faoliyati davomida 500 dan ortiq videorolik va bir qator kliplarni muvaffaqiyatli topshirgan.","ru":"Креативный видеомейкер с более чем 4-летним опытом работы. За свою карьеру успешно сдал более 500 видеороликов и ряд клипов.","en":"Creative video maker with over +4 years of experience. Successfully delivered over 500 videos and several music videos."},"skills":[{"uz":"Premiere Pro","ru":"Premiere Pro","en":"Premiere Pro"},{"uz":"After Effects","ru":"After Effects","en":"After Effects"},{"uz":"Videografiya","ru":"Видеосъемка","en":"Videography"}]});
    db.prepare("UPDATE app_data SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'team'").run(JSON.stringify(team));
    console.log('Team updated!');
}
db.close();
