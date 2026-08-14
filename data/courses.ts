import { LocalizedString } from '../types';

export interface Course {
  id: string;
  title: LocalizedString;
  category: 'programming' | 'media' | 'finance' | 'kids';
  duration: LocalizedString;
  monthlyPrice: LocalizedString;
  totalPrice: LocalizedString;
  /** Chegirmali narx — faqat ba'zi kurslarda bo'ladi */
  discountPrice?: LocalizedString;
  description: LocalizedString;
  coverImage?: string;
  technologies: string[];
  mentors: {
    name: LocalizedString;
    role: LocalizedString;
    image: string;
    /** Ba'zi mentorlarda qisqacha tarjimai hol bo'ladi (ixtiyoriy) */
    bio?: LocalizedString;
  }[];
  modules: {
    title: LocalizedString;
    lessons: LocalizedString[];
  }[];
}

export const coursesData: Course[] = [
  {
    "id": "foundation",
    "title": {
      "uz": "Foundation",
      "ru": "Foundation",
      "en": "Foundation"
    },
    "category": "programming",
    "duration": {
      "uz": "2 oy",
      "ru": "2 oy",
      "en": "2 oy"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 so‘m",
      "en": "1 000 000 so‘m"
    },
    "totalPrice": {
      "uz": "2 000 000 so‘m",
      "ru": "2 000 000 so‘m",
      "en": "2 000 000 so‘m"
    },
    "description": {
      "uz": "Kurs davomida o'quvchilar kompyuterning asosiy qismlari Windows, Linux va Mac OS tizimlarida ishlash, Internetda qidiruv tizimidan to'g'ri foydalanish, Axborot xavfsizligi tushunchasiga ega bo'lishadi. Bundan tashqari o'quvchilar Python yordamida dasturlashning boshlang'ich ko'nikmalari, algoritmlari va mantiqiy fikrlash hamda sohaga oid boshqa bilimlarga ega bo'lishadi.",
      "ru": "Kurs davomida o'quvchilar kompyuterning asosiy qismlari Windows, Linux va Mac OS tizimlarida ishlash, Internetda qidiruv tizimidan to'g'ri foydalanish, Axborot xavfsizligi tushunchasiga ega bo'lishadi. Bundan tashqari o'quvchilar Python yordamida dasturlashning boshlang'ich ko'nikmalari, algoritmlari va mantiqiy fikrlash hamda sohaga oid boshqa bilimlarga ega bo'lishadi.",
      "en": "Kurs davomida o'quvchilar kompyuterning asosiy qismlari Windows, Linux va Mac OS tizimlarida ishlash, Internetda qidiruv tizimidan to'g'ri foydalanish, Axborot xavfsizligi tushunchasiga ega bo'lishadi. Bundan tashqari o'quvchilar Python yordamida dasturlashning boshlang'ich ko'nikmalari, algoritmlari va mantiqiy fikrlash hamda sohaga oid boshqa bilimlarga ega bo'lishadi."
    },
    "coverImage": "",
    "technologies": [
      "HTML",
      "CSS",
      "Bootstrap",
      "JavaScript",
      "Python",
      "Java"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Shonazar Xudoyberganov",
          "ru": "Shonazar Xudoyberganov",
          "en": "Shonazar Xudoyberganov"
        },
        "role": {
          "uz": "Foundation kursi ustozi",
          "ru": "Foundation kursi ustozi",
          "en": "Foundation kursi ustozi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Dilshodbek Abdullaev",
          "ru": "Dilshodbek Abdullaev",
          "en": "Dilshodbek Abdullaev"
        },
        "role": {
          "uz": "Foundation kursi ustozi",
          "ru": "Foundation kursi ustozi",
          "en": "Foundation kursi ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Kompyuter Asoslari va Operatsion Tizimlar",
          "ru": "Kompyuter Asoslari va Operatsion Tizimlar",
          "en": "Kompyuter Asoslari va Operatsion Tizimlar"
        },
        "lessons": [
          {
            "uz": "Kompyuterning asosiy qismlari",
            "ru": "Kompyuterning asosiy qismlari",
            "en": "Kompyuterning asosiy qismlari"
          },
          {
            "uz": "Windows operatsion tizimi sozlash",
            "ru": "Windows operatsion tizimi sozlash",
            "en": "Windows operatsion tizimi sozlash"
          },
          {
            "uz": "Papka va fayllarni CMD buyruqlari bilan boshqarish",
            "ru": "Papka va fayllarni CMD buyruqlari bilan boshqarish",
            "en": "Papka va fayllarni CMD buyruqlari bilan boshqarish"
          },
          {
            "uz": "Internetning asosiy tushunchalari",
            "ru": "Internetning asosiy tushunchalari",
            "en": "Internetning asosiy tushunchalari"
          }
        ]
      },
      {
        "title": {
          "uz": "Matematika va Algoritm Asoslari",
          "ru": "Matematika va Algoritm Asoslari",
          "en": "Matematika va Algoritm Asoslari"
        },
        "lessons": [
          {
            "uz": "Matematika va mantiqiy fikrlash asoslari",
            "ru": "Matematika va mantiqiy fikrlash asoslari",
            "en": "Matematika va mantiqiy fikrlash asoslari"
          },
          {
            "uz": "Algoritm asoslari, algoritm nima",
            "ru": "Algoritm asoslari, algoritm nima",
            "en": "Algoritm asoslari, algoritm nima"
          },
          {
            "uz": "Algoritmlar yozish va tahlil qilish",
            "ru": "Algoritmlar yozish va tahlil qilish",
            "en": "Algoritmlar yozish va tahlil qilish"
          }
        ]
      },
      {
        "title": {
          "uz": "Python Dasturlash Asoslari",
          "ru": "Python Dasturlash Asoslari",
          "en": "Python Dasturlash Asoslari"
        },
        "lessons": [
          {
            "uz": "Python dasturlashga kirish",
            "ru": "Python dasturlashga kirish",
            "en": "Python dasturlashga kirish"
          },
          {
            "uz": "O‘zgaruvchilar, ma’lumot turlari",
            "ru": "O‘zgaruvchilar, ma’lumot turlari",
            "en": "O‘zgaruvchilar, ma’lumot turlari"
          },
          {
            "uz": "Shart operatori IF-ELSE",
            "ru": "Shart operatori IF-ELSE",
            "en": "Shart operatori IF-ELSE"
          },
          {
            "uz": "For va While sikl operatorlari",
            "ru": "For va While sikl operatorlari",
            "en": "For va While sikl operatorlari"
          },
          {
            "uz": "Ro'yxat (Lists) va Lug'atlar (Dictionaries)",
            "ru": "Ro'yxat (Lists) va Lug'atlar (Dictionaries)",
            "en": "Ro'yxat (Lists) va Lug'atlar (Dictionaries)"
          }
        ]
      }
    ]
  },
  {
    "id": "python-bi",
    "title": {
      "uz": "Web dasturlash: Python BI",
      "ru": "Web dasturlash: Python BI",
      "en": "Web dasturlash: Python BI"
    },
    "category": "programming",
    "duration": {
      "uz": "7 oy",
      "ru": "7 oy",
      "en": "7 oy"
    },
    "monthlyPrice": {
      "uz": "1 200 000 so‘m",
      "ru": "1 200 000 so‘m",
      "en": "1 200 000 so‘m"
    },
    "totalPrice": {
      "uz": "8 400 000 so‘m",
      "ru": "8 400 000 so‘m",
      "en": "8 400 000 so‘m"
    },
    "description": {
      "uz": "Kurs davomida o'quvchilar Python asoslari, Python orqali ma'lumotlar bilan ishlash, loyihalar yaratish, SQL va Ma'lumotlar bazasi, Telegram bot, Docker orqali loyihani boshqarish, Superset bilan ma'lumotlar vizualizatsiyasi va yana boshqa sohaga oid bilimlarga ega bo'lishadi.",
      "ru": "Kurs davomida o'quvchilar Python asoslari, Python orqali ma'lumotlar bilan ishlash, loyihalar yaratish, SQL va Ma'lumotlar bazasi, Telegram bot, Docker orqali loyihani boshqarish, Superset bilan ma'lumotlar vizualizatsiyasi va yana boshqa sohaga oid bilimlarga ega bo'lishadi.",
      "en": "Kurs davomida o'quvchilar Python asoslari, Python orqali ma'lumotlar bilan ishlash, loyihalar yaratish, SQL va Ma'lumotlar bazasi, Telegram bot, Docker orqali loyihani boshqarish, Superset bilan ma'lumotlar vizualizatsiyasi va yana boshqa sohaga oid bilimlarga ega bo'lishadi."
    },
    "coverImage": "",
    "technologies": [
      "Python",
      "Python OOP",
      "SQL",
      "Telegram bot",
      "Docker",
      "Superset",
      "Django",
      "FastAPI",
      "PostgreSQL"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Shohruhbek Rajabov",
          "ru": "Shohruhbek Rajabov",
          "en": "Shohruhbek Rajabov"
        },
        "role": {
          "uz": "Dasturchi / Python BI ustozi",
          "ru": "Dasturchi / Python BI ustozi",
          "en": "Dasturchi / Python BI ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Python asoslari",
          "ru": "Python asoslari",
          "en": "Python asoslari"
        },
        "lessons": [
          {
            "uz": "Python umumiy tushunchalari",
            "ru": "Python umumiy tushunchalari",
            "en": "Python umumiy tushunchalari"
          },
          {
            "uz": "Sintaksis va o‘zgaruvchilar",
            "ru": "Sintaksis va o‘zgaruvchilar",
            "en": "Sintaksis va o‘zgaruvchilar"
          },
          {
            "uz": "Shart operatorlari",
            "ru": "Shart operatorlari",
            "en": "Shart operatorlari"
          },
          {
            "uz": "Takrorlanish (loops)",
            "ru": "Takrorlanish (loops)",
            "en": "Takrorlanish (loops)"
          },
          {
            "uz": "Matnlar, ro‘yxatlar bilan ishlash",
            "ru": "Matnlar, ro‘yxatlar bilan ishlash",
            "en": "Matnlar, ro‘yxatlar bilan ishlash"
          }
        ]
      },
      {
        "title": {
          "uz": "Python orqali ma’lumotlar bilan ishlash",
          "ru": "Python orqali ma’lumotlar bilan ishlash",
          "en": "Python orqali ma’lumotlar bilan ishlash"
        },
        "lessons": [
          {
            "uz": "Set va dict bilan ishlash",
            "ru": "Set va dict bilan ishlash",
            "en": "Set va dict bilan ishlash"
          },
          {
            "uz": "Funksiyalar, rekursiv funksiyalar",
            "ru": "Funksiyalar, rekursiv funksiyalar",
            "en": "Funksiyalar, rekursiv funksiyalar"
          },
          {
            "uz": "Lambda funksiyalar",
            "ru": "Lambda funksiyalar",
            "en": "Lambda funksiyalar"
          },
          {
            "uz": "Sana va vaqtlar bilan ishlash",
            "ru": "Sana va vaqtlar bilan ishlash",
            "en": "Sana va vaqtlar bilan ishlash"
          },
          {
            "uz": "Xatoliklarni boshqarish",
            "ru": "Xatoliklarni boshqarish",
            "en": "Xatoliklarni boshqarish"
          }
        ]
      },
      {
        "title": {
          "uz": "SQL va ma’lumotlar bazasi",
          "ru": "SQL va ma’lumotlar bazasi",
          "en": "SQL va ma’lumotlar bazasi"
        },
        "lessons": [
          {
            "uz": "SQL asoslari",
            "ru": "SQL asoslari",
            "en": "SQL asoslari"
          },
          {
            "uz": "SELECT, INSERT, UPDATE, DELETE",
            "ru": "SELECT, INSERT, UPDATE, DELETE",
            "en": "SELECT, INSERT, UPDATE, DELETE"
          },
          {
            "uz": "JOIN lar",
            "ru": "JOIN lar",
            "en": "JOIN lar"
          },
          {
            "uz": "PostgreSQL o‘rnatish va sintaksis",
            "ru": "PostgreSQL o‘rnatish va sintaksis",
            "en": "PostgreSQL o‘rnatish va sintaksis"
          }
        ]
      },
      {
        "title": {
          "uz": "Telegram bot dasturlash",
          "ru": "Telegram bot dasturlash",
          "en": "Telegram bot dasturlash"
        },
        "lessons": [
          {
            "uz": "Aiogram frameworkiga kirish",
            "ru": "Aiogram frameworkiga kirish",
            "en": "Aiogram frameworkiga kirish"
          },
          {
            "uz": "Handlerlar bilan ishlash",
            "ru": "Handlerlar bilan ishlash",
            "en": "Handlerlar bilan ishlash"
          },
          {
            "uz": "Inline va default tugmalar",
            "ru": "Inline va default tugmalar",
            "en": "Inline va default tugmalar"
          },
          {
            "uz": "To‘lov tizimlari integratsiyasi",
            "ru": "To‘lov tizimlari integratsiyasi",
            "en": "To‘lov tizimlari integratsiyasi"
          }
        ]
      },
      {
        "title": {
          "uz": "Docker va CI/CD",
          "ru": "Docker va CI/CD",
          "en": "Docker va CI/CD"
        },
        "lessons": [
          {
            "uz": "Dockerni o‘rnatish",
            "ru": "Dockerni o‘rnatish",
            "en": "Dockerni o‘rnatish"
          },
          {
            "uz": "Docker Compose",
            "ru": "Docker Compose",
            "en": "Docker Compose"
          },
          {
            "uz": "CI/CD pipeline yaratish",
            "ru": "CI/CD pipeline yaratish",
            "en": "CI/CD pipeline yaratish"
          }
        ]
      },
      {
        "title": {
          "uz": "Superset bilan ma’lumotlar vizualizatsiyasi",
          "ru": "Superset bilan ma’lumotlar vizualizatsiyasi",
          "en": "Superset bilan ma’lumotlar vizualizatsiyasi"
        },
        "lessons": [
          {
            "uz": "Supersetga kirish",
            "ru": "Supersetga kirish",
            "en": "Supersetga kirish"
          },
          {
            "uz": "Ma’lumotlar manbalarini ulash",
            "ru": "Ma’lumotlar manbalarini ulash",
            "en": "Ma’lumotlar manbalarini ulash"
          },
          {
            "uz": "Dashboard yaratish",
            "ru": "Dashboard yaratish",
            "en": "Dashboard yaratish"
          }
        ]
      }
    ]
  },
  {
    "id": "frontend",
    "title": {
      "uz": "Frontend Web Dasturlash",
      "ru": "Frontend Web Dasturlash",
      "en": "Frontend Web Dasturlash"
    },
    "category": "programming",
    "duration": {
      "uz": "6 oy",
      "ru": "6 oy",
      "en": "6 oy"
    },
    "monthlyPrice": {
      "uz": "1 200 000 so‘m",
      "ru": "1 200 000 so‘m",
      "en": "1 200 000 so‘m"
    },
    "totalPrice": {
      "uz": "7 200 000 so‘m",
      "ru": "7 200 000 so‘m",
      "en": "7 200 000 so‘m"
    },
    "description": {
      "uz": "Loyihani rejalashtirish, foydalanuvchi interfeysini yaratish, 'Verstka' qilish, loyihalarni deploy qilish, serverga joylash, animatsiyalar yaratish va ular bilan ishlash, o'z portfolio saytini yaratish kabi bilim va ko'nikmalar o'rgatiladi.",
      "ru": "Loyihani rejalashtirish, foydalanuvchi interfeysini yaratish, 'Verstka' qilish, loyihalarni deploy qilish, serverga joylash, animatsiyalar yaratish va ular bilan ishlash, o'z portfolio saytini yaratish kabi bilim va ko'nikmalar o'rgatiladi.",
      "en": "Loyihani rejalashtirish, foydalanuvchi interfeysini yaratish, 'Verstka' qilish, loyihalarni deploy qilish, serverga joylash, animatsiyalar yaratish va ular bilan ishlash, o'z portfolio saytini yaratish kabi bilim va ko'nikmalar o'rgatiladi."
    },
    "coverImage": "",
    "technologies": [
      "HTML",
      "CSS",
      "SASS",
      "Bootstrap",
      "Git",
      "JavaScript",
      "React.js",
      "Redux",
      "Next.js",
      "Tailwind CSS"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Hurrambek Sabirov",
          "ru": "Hurrambek Sabirov",
          "en": "Hurrambek Sabirov"
        },
        "role": {
          "uz": "Frontend ustozi",
          "ru": "Frontend ustozi",
          "en": "Frontend ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "HTML va CSS asoslari",
          "ru": "HTML va CSS asoslari",
          "en": "HTML va CSS asoslari"
        },
        "lessons": [
          {
            "uz": "HTML teglar va listlar",
            "ru": "HTML teglar va listlar",
            "en": "HTML teglar va listlar"
          },
          {
            "uz": "Jadvallar va formalar",
            "ru": "Jadvallar va formalar",
            "en": "Jadvallar va formalar"
          },
          {
            "uz": "CSS basics, Box model va Flex",
            "ru": "CSS basics, Box model va Flex",
            "en": "CSS basics, Box model va Flex"
          },
          {
            "uz": "Position va Layout",
            "ru": "Position va Layout",
            "en": "Position va Layout"
          }
        ]
      },
      {
        "title": {
          "uz": "CSS Advanced & SCSS",
          "ru": "CSS Advanced & SCSS",
          "en": "CSS Advanced & SCSS"
        },
        "lessons": [
          {
            "uz": "Pseudo elementlar",
            "ru": "Pseudo elementlar",
            "en": "Pseudo elementlar"
          },
          {
            "uz": "Transforms in CSS",
            "ru": "Transforms in CSS",
            "en": "Transforms in CSS"
          },
          {
            "uz": "SCSS asoslari",
            "ru": "SCSS asoslari",
            "en": "SCSS asoslari"
          },
          {
            "uz": "Figma maketlar bilan ishlash",
            "ru": "Figma maketlar bilan ishlash",
            "en": "Figma maketlar bilan ishlash"
          },
          {
            "uz": "Media query (Responsive)",
            "ru": "Media query (Responsive)",
            "en": "Media query (Responsive)"
          }
        ]
      },
      {
        "title": {
          "uz": "JavaScript asoslari va DOM",
          "ru": "JavaScript asoslari va DOM",
          "en": "JavaScript asoslari va DOM"
        },
        "lessons": [
          {
            "uz": "Function and Strings",
            "ru": "Function and Strings",
            "en": "Function and Strings"
          },
          {
            "uz": "Conditionals, Loops",
            "ru": "Conditionals, Loops",
            "en": "Conditionals, Loops"
          },
          {
            "uz": "Array va Objectlar",
            "ru": "Array va Objectlar",
            "en": "Array va Objectlar"
          },
          {
            "uz": "DOM in JS",
            "ru": "DOM in JS",
            "en": "DOM in JS"
          },
          {
            "uz": "Asinxron JS (Fetch, Promises)",
            "ru": "Asinxron JS (Fetch, Promises)",
            "en": "Asinxron JS (Fetch, Promises)"
          }
        ]
      },
      {
        "title": {
          "uz": "React va Frontend Frameworks",
          "ru": "React va Frontend Frameworks",
          "en": "React va Frontend Frameworks"
        },
        "lessons": [
          {
            "uz": "React.js haqida tushuncha",
            "ru": "React.js haqida tushuncha",
            "en": "React.js haqida tushuncha"
          },
          {
            "uz": "JSX, Komponentlar va Props",
            "ru": "JSX, Komponentlar va Props",
            "en": "JSX, Komponentlar va Props"
          },
          {
            "uz": "React Hooks (useState, useEffect)",
            "ru": "React Hooks (useState, useEffect)",
            "en": "React Hooks (useState, useEffect)"
          },
          {
            "uz": "React Router",
            "ru": "React Router",
            "en": "React Router"
          },
          {
            "uz": "Redux haqida tushuncha",
            "ru": "Redux haqida tushuncha",
            "en": "Redux haqida tushuncha"
          }
        ]
      },
      {
        "title": {
          "uz": "Next.js va Real loyiha",
          "ru": "Next.js va Real loyiha",
          "en": "Next.js va Real loyiha"
        },
        "lessons": [
          {
            "uz": "Next.js asoslari",
            "ru": "Next.js asoslari",
            "en": "Next.js asoslari"
          },
          {
            "uz": "Pages and Routing",
            "ru": "Pages and Routing",
            "en": "Pages and Routing"
          },
          {
            "uz": "Elektron magazin sayt yaratish",
            "ru": "Elektron magazin sayt yaratish",
            "en": "Elektron magazin sayt yaratish"
          }
        ]
      }
    ]
  },
  {
    "id": "mobilografiya",
    "title": {
      "uz": "Mobilografiya",
      "ru": "Mobilografiya",
      "en": "Mobilografiya"
    },
    "category": "media",
    "duration": {
      "uz": "2 oy",
      "ru": "2 oy",
      "en": "2 oy"
    },
    "monthlyPrice": {
      "uz": "1 600 000 so‘m",
      "ru": "1 600 000 so‘m",
      "en": "1 600 000 so‘m"
    },
    "totalPrice": {
      "uz": "3 200 000 so‘m",
      "ru": "3 200 000 so‘m",
      "en": "3 200 000 so‘m"
    },
    "description": {
      "uz": "Sifatli video va foto kontent yaratish, barcha texnikalar bilan ishlash, nazariya va amaliyotlar asosida nafaqat trend videolar shuningdek, har qanday biznes uchun mos kontent yaratishni o'rganishadi.",
      "ru": "Sifatli video va foto kontent yaratish, barcha texnikalar bilan ishlash, nazariya va amaliyotlar asosida nafaqat trend videolar shuningdek, har qanday biznes uchun mos kontent yaratishni o'rganishadi.",
      "en": "Sifatli video va foto kontent yaratish, barcha texnikalar bilan ishlash, nazariya va amaliyotlar asosida nafaqat trend videolar shuningdek, har qanday biznes uchun mos kontent yaratishni o'rganishadi."
    },
    "coverImage": "",
    "technologies": [
      "Capcut",
      "VN",
      "Adobe Lightroom",
      "AI",
      "Blurr"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Akmal Iskandarov",
          "ru": "Akmal Iskandarov",
          "en": "Akmal Iskandarov"
        },
        "role": {
          "uz": "Mobilografiya ustozi",
          "ru": "Mobilografiya ustozi",
          "en": "Mobilografiya ustozi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Asadbek Sobirov",
          "ru": "Asadbek Sobirov",
          "en": "Asadbek Sobirov"
        },
        "role": {
          "uz": "Mobilografiya ustozi",
          "ru": "Mobilografiya ustozi",
          "en": "Mobilografiya ustozi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Otabek Muxammadov",
          "ru": "Otabek Muxammadov",
          "en": "Otabek Muxammadov"
        },
        "role": {
          "uz": "Mobilografiya ustozi",
          "ru": "Mobilografiya ustozi",
          "en": "Mobilografiya ustozi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Omonboyev Shodlik",
          "ru": "Omonboyev Shodlik",
          "en": "Omonboyev Shodlik"
        },
        "role": {
          "uz": "Mobilografiya ustozi",
          "ru": "Mobilografiya ustozi",
          "en": "Mobilografiya ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Tasvirga olish va montaj asoslari",
          "ru": "Tasvirga olish va montaj asoslari",
          "en": "Tasvirga olish va montaj asoslari"
        },
        "lessons": [
          {
            "uz": "Kamera sozlamalari",
            "ru": "Kamera sozlamalari",
            "en": "Kamera sozlamalari"
          },
          {
            "uz": "Planlar va rakurslar",
            "ru": "Planlar va rakurslar",
            "en": "Planlar va rakurslar"
          },
          {
            "uz": "Stabilizator bilan ishlash",
            "ru": "Stabilizator bilan ishlash",
            "en": "Stabilizator bilan ishlash"
          },
          {
            "uz": "Qo‘lda syomka",
            "ru": "Qo‘lda syomka",
            "en": "Qo‘lda syomka"
          }
        ]
      },
      {
        "title": {
          "uz": "Montaj asoslari va tasvir sifati",
          "ru": "Montaj asoslari va tasvir sifati",
          "en": "Montaj asoslari va tasvir sifati"
        },
        "lessons": [
          {
            "uz": "VN klassik montaj",
            "ru": "VN klassik montaj",
            "en": "VN klassik montaj"
          },
          {
            "uz": "CapCut asoslari, tracking va Speed Ramp",
            "ru": "CapCut asoslari, tracking va Speed Ramp",
            "en": "CapCut asoslari, tracking va Speed Ramp"
          },
          {
            "uz": "Yorug‘lik va RGB chiroqlar bilan ishlash",
            "ru": "Yorug‘lik va RGB chiroqlar bilan ishlash",
            "en": "Yorug‘lik va RGB chiroqlar bilan ishlash"
          },
          {
            "uz": "Subtitrlash",
            "ru": "Subtitrlash",
            "en": "Subtitrlash"
          }
        ]
      },
      {
        "title": {
          "uz": "Kontent yaratish va ixtisoslashgan montaj turlari",
          "ru": "Kontent yaratish va ixtisoslashgan montaj turlari",
          "en": "Kontent yaratish va ixtisoslashgan montaj turlari"
        },
        "lessons": [
          {
            "uz": "Trend videolar va maska bilan ishlash",
            "ru": "Trend videolar va maska bilan ishlash",
            "en": "Trend videolar va maska bilan ishlash"
          },
          {
            "uz": "Motion grafika",
            "ru": "Motion grafika",
            "en": "Motion grafika"
          },
          {
            "uz": "Fashion kontent yaratish",
            "ru": "Fashion kontent yaratish",
            "en": "Fashion kontent yaratish"
          },
          {
            "uz": "Instagram uchun kontent strategiyalar",
            "ru": "Instagram uchun kontent strategiyalar",
            "en": "Instagram uchun kontent strategiyalar"
          }
        ]
      },
      {
        "title": {
          "uz": "Zamonaviy professional ko‘nikmalar",
          "ru": "Zamonaviy professional ko‘nikmalar",
          "en": "Zamonaviy professional ko‘nikmalar"
        },
        "lessons": [
          {
            "uz": "Blurr texnologiyasi",
            "ru": "Blurr texnologiyasi",
            "en": "Blurr texnologiyasi"
          },
          {
            "uz": "Sun’iy intellekt (AI) texnologiyalari",
            "ru": "Sun’iy intellekt (AI) texnologiyalari",
            "en": "Sun’iy intellekt (AI) texnologiyalari"
          },
          {
            "uz": "Mijoz topish strategiyalari",
            "ru": "Mijoz topish strategiyalari",
            "en": "Mijoz topish strategiyalari"
          }
        ]
      }
    ]
  },
  {
    "id": "grafik-dizayn",
    "title": {
      "uz": "Grafik Dizayn",
      "ru": "Grafik Dizayn",
      "en": "Grafik Dizayn"
    },
    "category": "media",
    "duration": {
      "uz": "4 oy",
      "ru": "4 oy",
      "en": "4 oy"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 so‘m",
      "en": "1 000 000 so‘m"
    },
    "totalPrice": {
      "uz": "4 000 000 so‘m",
      "ru": "4 000 000 so‘m",
      "en": "4 000 000 so‘m"
    },
    "description": {
      "uz": "Adobe Photoshop, Adobe Illustrator dasturlarida ishlash, tipografiya dizaynlar ishlash, logo dizayn yaratish, ijtimoiy tarmoqlardagi dizaynlarni ishlash, saytlarda dizaynlar sotish kabi bilimlar beriladi.",
      "ru": "Adobe Photoshop, Adobe Illustrator dasturlarida ishlash, tipografiya dizaynlar ishlash, logo dizayn yaratish, ijtimoiy tarmoqlardagi dizaynlarni ishlash, saytlarda dizaynlar sotish kabi bilimlar beriladi.",
      "en": "Adobe Photoshop, Adobe Illustrator dasturlarida ishlash, tipografiya dizaynlar ishlash, logo dizayn yaratish, ijtimoiy tarmoqlardagi dizaynlarni ishlash, saytlarda dizaynlar sotish kabi bilimlar beriladi."
    },
    "coverImage": "",
    "technologies": [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "CorelDRAW"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Temurbek Madirahimov",
          "ru": "Temurbek Madirahimov",
          "en": "Temurbek Madirahimov"
        },
        "role": {
          "uz": "Dizayner",
          "ru": "Dizayner",
          "en": "Dizayner"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Photoshop asoslari va manipulyatsiya dizayni",
          "ru": "Photoshop asoslari va manipulyatsiya dizayni",
          "en": "Photoshop asoslari va manipulyatsiya dizayni"
        },
        "lessons": [
          {
            "uz": "Photoshop interfeysi",
            "ru": "Photoshop interfeysi",
            "en": "Photoshop interfeysi"
          },
          {
            "uz": "Tools bo‘limi",
            "ru": "Tools bo‘limi",
            "en": "Tools bo‘limi"
          },
          {
            "uz": "Pen tool, Lasso tool",
            "ru": "Pen tool, Lasso tool",
            "en": "Pen tool, Lasso tool"
          },
          {
            "uz": "Manipulyatsiya dizayn",
            "ru": "Manipulyatsiya dizayn",
            "en": "Manipulyatsiya dizayn"
          },
          {
            "uz": "Mockup va glasmorfizm",
            "ru": "Mockup va glasmorfizm",
            "en": "Mockup va glasmorfizm"
          }
        ]
      },
      {
        "title": {
          "uz": "Illustrator asoslari va logotip dizayni",
          "ru": "Illustrator asoslari va logotip dizayni",
          "en": "Illustrator asoslari va logotip dizayni"
        },
        "lessons": [
          {
            "uz": "Illustrator interfeysi",
            "ru": "Illustrator interfeysi",
            "en": "Illustrator interfeysi"
          },
          {
            "uz": "Shape builder tool",
            "ru": "Shape builder tool",
            "en": "Shape builder tool"
          },
          {
            "uz": "Logo dizayn",
            "ru": "Logo dizayn",
            "en": "Logo dizayn"
          },
          {
            "uz": "Pattern, blend va repeat",
            "ru": "Pattern, blend va repeat",
            "en": "Pattern, blend va repeat"
          },
          {
            "uz": "Fontlar va ularning turlari",
            "ru": "Fontlar va ularning turlari",
            "en": "Fontlar va ularning turlari"
          }
        ]
      },
      {
        "title": {
          "uz": "Dizayn prinsiplari va kontent yaratish",
          "ru": "Dizayn prinsiplari va kontent yaratish",
          "en": "Dizayn prinsiplari va kontent yaratish"
        },
        "lessons": [
          {
            "uz": "Ranglar bilan ishlash",
            "ru": "Ranglar bilan ishlash",
            "en": "Ranglar bilan ishlash"
          },
          {
            "uz": "Dizaynda balans va iyerarxiya",
            "ru": "Dizaynda balans va iyerarxiya",
            "en": "Dizaynda balans va iyerarxiya"
          },
          {
            "uz": "Web banner dizayn yaratish",
            "ru": "Web banner dizayn yaratish",
            "en": "Web banner dizayn yaratish"
          },
          {
            "uz": "Sticker yaratish",
            "ru": "Sticker yaratish",
            "en": "Sticker yaratish"
          },
          {
            "uz": "Carusel dizayn",
            "ru": "Carusel dizayn",
            "en": "Carusel dizayn"
          }
        ]
      },
      {
        "title": {
          "uz": "Reklama va bosma materiallar dizayni",
          "ru": "Reklama va bosma materiallar dizayni",
          "en": "Reklama va bosma materiallar dizayni"
        },
        "lessons": [
          {
            "uz": "Portfolio yaratish",
            "ru": "Portfolio yaratish",
            "en": "Portfolio yaratish"
          },
          {
            "uz": "Flayer va Billboard dizayn",
            "ru": "Flayer va Billboard dizayn",
            "en": "Flayer va Billboard dizayn"
          },
          {
            "uz": "Qadoq dizayn yaratish",
            "ru": "Qadoq dizayn yaratish",
            "en": "Qadoq dizayn yaratish"
          },
          {
            "uz": "Katalog va Menyu dizayn",
            "ru": "Katalog va Menyu dizayn",
            "en": "Katalog va Menyu dizayn"
          }
        ]
      }
    ]
  },
  {
    "id": "smm",
    "title": {
      "uz": "SMM",
      "ru": "SMM",
      "en": "SMM"
    },
    "category": "media",
    "duration": {
      "uz": "3 oy",
      "ru": "3 oy",
      "en": "3 oy"
    },
    "monthlyPrice": {
      "uz": "1 500 000 so‘m",
      "ru": "1 500 000 so‘m",
      "en": "1 500 000 so‘m"
    },
    "totalPrice": {
      "uz": "4 500 000 so‘m",
      "ru": "4 500 000 so‘m",
      "en": "4 500 000 so‘m"
    },
    "description": {
      "uz": "Ijtimoiy tarmoqlarda brendni tanitish, shaxsiy blogda va biznes profilda kontent yaratish va targeting, maqsadli auditoriyani analiz qilish, mijozlar bilan effektiv ishlash kabi ko‘plab sohaga oid bilim va ko‘nikmalarga ega bo‘lasiz.",
      "ru": "Ijtimoiy tarmoqlarda brendni tanitish, shaxsiy blogda va biznes profilda kontent yaratish va targeting, maqsadli auditoriyani analiz qilish, mijozlar bilan effektiv ishlash kabi ko‘plab sohaga oid bilim va ko‘nikmalarga ega bo‘lasiz.",
      "en": "Ijtimoiy tarmoqlarda brendni tanitish, shaxsiy blogda va biznes profilda kontent yaratish va targeting, maqsadli auditoriyani analiz qilish, mijozlar bilan effektiv ishlash kabi ko‘plab sohaga oid bilim va ko‘nikmalarga ega bo‘lasiz."
    },
    "coverImage": "",
    "technologies": [
      "Instagram",
      "Telegram",
      "Facebook",
      "YouTube",
      "Canva",
      "ManyChat",
      "Meta Ads"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Jamshid Komilov",
          "ru": "Jamshid Komilov",
          "en": "Jamshid Komilov"
        },
        "role": {
          "uz": "SMM Mutaxassisi",
          "ru": "SMM Mutaxassisi",
          "en": "SMM Mutaxassisi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Dilnoza Bobojonova",
          "ru": "Dilnoza Bobojonova",
          "en": "Dilnoza Bobojonova"
        },
        "role": {
          "uz": "SMM kursi ustozi",
          "ru": "SMM kursi ustozi",
          "en": "SMM kursi ustozi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Ruslan Raximberganov",
          "ru": "Ruslan Raximberganov",
          "en": "Ruslan Raximberganov"
        },
        "role": {
          "uz": "SMM kursi ustozi",
          "ru": "SMM kursi ustozi",
          "en": "SMM kursi ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Marketing asoslari va ijodiy jarayonlar",
          "ru": "Marketing asoslari va ijodiy jarayonlar",
          "en": "Marketing asoslari va ijodiy jarayonlar"
        },
        "lessons": [
          {
            "uz": "SMM nima?",
            "ru": "SMM nima?",
            "en": "SMM nima?"
          },
          {
            "uz": "Marketing nazariya (SWOT)",
            "ru": "Marketing nazariya (SWOT)",
            "en": "Marketing nazariya (SWOT)"
          },
          {
            "uz": "Maqsadli auditoriya",
            "ru": "Maqsadli auditoriya",
            "en": "Maqsadli auditoriya"
          },
          {
            "uz": "Raqobatchilar tahlili",
            "ru": "Raqobatchilar tahlili",
            "en": "Raqobatchilar tahlili"
          },
          {
            "uz": "Kontent plan tuzish",
            "ru": "Kontent plan tuzish",
            "en": "Kontent plan tuzish"
          },
          {
            "uz": "ChatGPT bilan ishlash",
            "ru": "ChatGPT bilan ishlash",
            "en": "ChatGPT bilan ishlash"
          }
        ]
      },
      {
        "title": {
          "uz": "Kontent yaratish / Kontent marketing",
          "ru": "Kontent yaratish / Kontent marketing",
          "en": "Kontent yaratish / Kontent marketing"
        },
        "lessons": [
          {
            "uz": "Mobilografiya asoslari",
            "ru": "Mobilografiya asoslari",
            "en": "Mobilografiya asoslari"
          },
          {
            "uz": "Visual Kontent yaratish",
            "ru": "Visual Kontent yaratish",
            "en": "Visual Kontent yaratish"
          },
          {
            "uz": "Shaxsiy Brend qurish",
            "ru": "Shaxsiy Brend qurish",
            "en": "Shaxsiy Brend qurish"
          },
          {
            "uz": "Bloggerlar bilan ishlash",
            "ru": "Bloggerlar bilan ishlash",
            "en": "Bloggerlar bilan ishlash"
          },
          {
            "uz": "Storis bilan ishlash",
            "ru": "Storis bilan ishlash",
            "en": "Storis bilan ishlash"
          }
        ]
      },
      {
        "title": {
          "uz": "Strategik marketing / Targeting",
          "ru": "Strategik marketing / Targeting",
          "en": "Strategik marketing / Targeting"
        },
        "lessons": [
          {
            "uz": "Savdo voronka",
            "ru": "Savdo voronka",
            "en": "Savdo voronka"
          },
          {
            "uz": "Targeting asoslari",
            "ru": "Targeting asoslari",
            "en": "Targeting asoslari"
          },
          {
            "uz": "Meta Business/Business Manager",
            "ru": "Meta Business/Business Manager",
            "en": "Meta Business/Business Manager"
          },
          {
            "uz": "Loyiha topish",
            "ru": "Loyiha topish",
            "en": "Loyiha topish"
          },
          {
            "uz": "SMM strategiya tuzish",
            "ru": "SMM strategiya tuzish",
            "en": "SMM strategiya tuzish"
          }
        ]
      }
    ]
  },
  {
    "id": "buxgalteriya",
    "title": {
      "uz": "Zamonaviy Buxgalteriya: Noldan balansgacha + 1C",
      "ru": "Zamonaviy Buxgalteriya: Noldan balansgacha + 1C",
      "en": "Zamonaviy Buxgalteriya: Noldan balansgacha + 1C"
    },
    "category": "finance",
    "duration": {
      "uz": "4 oy",
      "ru": "4 oy",
      "en": "4 oy"
    },
    "monthlyPrice": {
      "uz": "1 500 000 so‘m",
      "ru": "1 500 000 so‘m",
      "en": "1 500 000 so‘m"
    },
    "totalPrice": {
      "uz": "6 000 000 so‘m",
      "ru": "6 000 000 so‘m",
      "en": "6 000 000 so‘m"
    },
    "description": {
      "uz": "Buxgalteriya hisobining nazariy asoslari; Mehnat haqini hisoblash; Asosiy va aylanma vositalar hisobi; Ishlab chiqarish xarajatlari hisobi va tannarxi kalkulyatsiyasi; Schotlar rejasi bilan ishlash; Soliq hisobotlarini to'ldirish; 1C dasturida korxona bazasini yaratish.",
      "ru": "Buxgalteriya hisobining nazariy asoslari; Mehnat haqini hisoblash; Asosiy va aylanma vositalar hisobi; Ishlab chiqarish xarajatlari hisobi va tannarxi kalkulyatsiyasi; Schotlar rejasi bilan ishlash; Soliq hisobotlarini to'ldirish; 1C dasturida korxona bazasini yaratish.",
      "en": "Buxgalteriya hisobining nazariy asoslari; Mehnat haqini hisoblash; Asosiy va aylanma vositalar hisobi; Ishlab chiqarish xarajatlari hisobi va tannarxi kalkulyatsiyasi; Schotlar rejasi bilan ishlash; Soliq hisobotlarini to'ldirish; 1C dasturida korxona bazasini yaratish."
    },
    "coverImage": "",
    "technologies": [
      "1C 8.3",
      "my.soliq.uz",
      "my.mehnat.uz",
      "Didox.uz",
      "MS Excel"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Faxriddin Raximov",
          "ru": "Faxriddin Raximov",
          "en": "Faxriddin Raximov"
        },
        "role": {
          "uz": "Buxgalter",
          "ru": "Buxgalter",
          "en": "Buxgalter"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Xushnudbek Salimov",
          "ru": "Xushnudbek Salimov",
          "en": "Xushnudbek Salimov"
        },
        "role": {
          "uz": "Buxgalter",
          "ru": "Buxgalter",
          "en": "Buxgalter"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Kirish va Buxgalteriya Fundamenti",
          "ru": "Kirish va Buxgalteriya Fundamenti",
          "en": "Kirish va Buxgalteriya Fundamenti"
        },
        "lessons": [
          {
            "uz": "Buxgalter kim va uning vazifalari",
            "ru": "Buxgalter kim va uning vazifalari",
            "en": "Buxgalter kim va uning vazifalari"
          },
          {
            "uz": "Davlat ro'yxatidan tadbirkor sifatida o'tish",
            "ru": "Davlat ro'yxatidan tadbirkor sifatida o'tish",
            "en": "Davlat ro'yxatidan tadbirkor sifatida o'tish"
          },
          {
            "uz": "Aktiv va Passivlar",
            "ru": "Aktiv va Passivlar",
            "en": "Aktiv va Passivlar"
          },
          {
            "uz": "Ikkiyoqlama yozuv",
            "ru": "Ikkiyoqlama yozuv",
            "en": "Ikkiyoqlama yozuv"
          }
        ]
      },
      {
        "title": {
          "uz": "Moliyaviy Operatsiyalar va Mehnat Haqi",
          "ru": "Moliyaviy Operatsiyalar va Mehnat Haqi",
          "en": "Moliyaviy Operatsiyalar va Mehnat Haqi"
        },
        "lessons": [
          {
            "uz": "Pul mablag'lari, Kassa operatsiyalari, Bank operatsiyalari, Mehnat haqi hisobi, Mehnat haqi bilan bog'liq soliqlar",
            "ru": "Pul mablag'lari, Kassa operatsiyalari, Bank operatsiyalari, Mehnat haqi hisobi, Mehnat haqi bilan bog'liq soliqlar",
            "en": "Pul mablag'lari, Kassa operatsiyalari, Bank operatsiyalari, Mehnat haqi hisobi, Mehnat haqi bilan bog'liq soliqlar"
          }
        ]
      },
      {
        "title": {
          "uz": "Moddiy Qiymatliklar va Asosiy Vositalar",
          "ru": "Moddiy Qiymatliklar va Asosiy Vositalar",
          "en": "Moddiy Qiymatliklar va Asosiy Vositalar"
        },
        "lessons": [
          {
            "uz": "Moddiy qiymatliklar, inventar",
            "ru": "Moddiy qiymatliklar, inventar",
            "en": "Moddiy qiymatliklar, inventar"
          },
          {
            "uz": "QQS hisobi",
            "ru": "QQS hisobi",
            "en": "QQS hisobi"
          },
          {
            "uz": "Asosiy vositalar hisobi",
            "ru": "Asosiy vositalar hisobi",
            "en": "Asosiy vositalar hisobi"
          },
          {
            "uz": "Amortizatsiya hisoblash",
            "ru": "Amortizatsiya hisoblash",
            "en": "Amortizatsiya hisoblash"
          }
        ]
      },
      {
        "title": {
          "uz": "Soliqlar va Soliq Hisobotlari",
          "ru": "Soliqlar va Soliq Hisobotlari",
          "en": "Soliqlar va Soliq Hisobotlari"
        },
        "lessons": [
          {
            "uz": "Soliqlar va ularning turkumlanishi",
            "ru": "Soliqlar va ularning turkumlanishi",
            "en": "Soliqlar va ularning turkumlanishi"
          },
          {
            "uz": "Soliq hisobotlarini shakllantirish va jo'natish",
            "ru": "Soliq hisobotlarini shakllantirish va jo'natish",
            "en": "Soliq hisobotlarini shakllantirish va jo'natish"
          }
        ]
      },
      {
        "title": {
          "uz": "Elektron Hujjatlar va 1C Dasturi",
          "ru": "Elektron Hujjatlar va 1C Dasturi",
          "en": "Elektron Hujjatlar va 1C Dasturi"
        },
        "lessons": [
          {
            "uz": "Elektron hujjatlar bilan ishlash",
            "ru": "Elektron hujjatlar bilan ishlash",
            "en": "Elektron hujjatlar bilan ishlash"
          },
          {
            "uz": "1C dasturida korxona balansini shakllantirish",
            "ru": "1C dasturida korxona balansini shakllantirish",
            "en": "1C dasturida korxona balansini shakllantirish"
          },
          {
            "uz": "1C dasturida hisobotlarni shakllantirish",
            "ru": "1C dasturida hisobotlarni shakllantirish",
            "en": "1C dasturida hisobotlarni shakllantirish"
          }
        ]
      }
    ]
  },
  {
    "id": "ofis-dasturlari",
    "title": {
      "uz": "Ofis Dasturlarida Ishlash",
      "ru": "Ofis Dasturlarida Ishlash",
      "en": "Ofis Dasturlarida Ishlash"
    },
    "category": "finance",
    "duration": {
      "uz": "3 oy",
      "ru": "3 oy",
      "en": "3 oy"
    },
    "monthlyPrice": {
      "uz": "1 200 000 so‘m",
      "ru": "1 200 000 so‘m",
      "en": "1 200 000 so‘m"
    },
    "totalPrice": {
      "uz": "3 600 000 so‘m",
      "ru": "3 600 000 so‘m",
      "en": "3 600 000 so‘m"
    },
    "description": {
      "uz": "Eng talabgor bo'lgan Word, Excel va Power Point dasturlarida professional darajada ishlash; Standart format asosida taqdimotlar tayyorlash; Kitoblarni chop etishga tayyorlash; QR kodlash va davlat xizmatlaridan foydalanish.",
      "ru": "Eng talabgor bo'lgan Word, Excel va Power Point dasturlarida professional darajada ishlash; Standart format asosida taqdimotlar tayyorlash; Kitoblarni chop etishga tayyorlash; QR kodlash va davlat xizmatlaridan foydalanish.",
      "en": "Eng talabgor bo'lgan Word, Excel va Power Point dasturlarida professional darajada ishlash; Standart format asosida taqdimotlar tayyorlash; Kitoblarni chop etishga tayyorlash; QR kodlash va davlat xizmatlaridan foydalanish."
    },
    "coverImage": "",
    "technologies": [
      "MS Word",
      "MS Excel",
      "MS PowerPoint",
      "Google Sheets",
      "Canva",
      "ChatGPT"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Otabek Madraximov",
          "ru": "Otabek Madraximov",
          "en": "Otabek Madraximov"
        },
        "role": {
          "uz": "Ofis dasturlari mutaxassisi",
          "ru": "Ofis dasturlari mutaxassisi",
          "en": "Ofis dasturlari mutaxassisi"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Kamila Matkuliyeva",
          "ru": "Kamila Matkuliyeva",
          "en": "Kamila Matkuliyeva"
        },
        "role": {
          "uz": "Ofis dasturlari mutaxassisi",
          "ru": "Ofis dasturlari mutaxassisi",
          "en": "Ofis dasturlari mutaxassisi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Kompyuter asoslari va davlat xizmatlari",
          "ru": "Kompyuter asoslari va davlat xizmatlari",
          "en": "Kompyuter asoslari va davlat xizmatlari"
        },
        "lessons": [
          {
            "uz": "Windows OS",
            "ru": "Windows OS",
            "en": "Windows OS"
          },
          {
            "uz": "Google qidiruv tizimi",
            "ru": "Google qidiruv tizimi",
            "en": "Google qidiruv tizimi"
          },
          {
            "uz": "my.gov.uz bilan ishlash",
            "ru": "my.gov.uz bilan ishlash",
            "en": "my.gov.uz bilan ishlash"
          },
          {
            "uz": "Microsoft Word menyulari",
            "ru": "Microsoft Word menyulari",
            "en": "Microsoft Word menyulari"
          },
          {
            "uz": "E-imzo dan ro'yxatdan o'tish",
            "ru": "E-imzo dan ro'yxatdan o'tish",
            "en": "E-imzo dan ro'yxatdan o'tish"
          }
        ]
      },
      {
        "title": {
          "uz": "Excel asoslari",
          "ru": "Excel asoslari",
          "en": "Excel asoslari"
        },
        "lessons": [
          {
            "uz": "Jadvallar yaratish",
            "ru": "Jadvallar yaratish",
            "en": "Jadvallar yaratish"
          },
          {
            "uz": "Matematik amallar va formulalar",
            "ru": "Matematik amallar va formulalar",
            "en": "Matematik amallar va formulalar"
          },
          {
            "uz": "Mantiqiy funksiyalar (IF, AND, OR)",
            "ru": "Mantiqiy funksiyalar (IF, AND, OR)",
            "en": "Mantiqiy funksiyalar (IF, AND, OR)"
          },
          {
            "uz": "Moliyaviy hisob-kitoblar",
            "ru": "Moliyaviy hisob-kitoblar",
            "en": "Moliyaviy hisob-kitoblar"
          },
          {
            "uz": "Diagramma va grafiklar",
            "ru": "Diagramma va grafiklar",
            "en": "Diagramma va grafiklar"
          }
        ]
      },
      {
        "title": {
          "uz": "Prezentatsiyalar va AI vositalari",
          "ru": "Prezentatsiyalar va AI vositalari",
          "en": "Prezentatsiyalar va AI vositalari"
        },
        "lessons": [
          {
            "uz": "PowerPoint dasturlari",
            "ru": "PowerPoint dasturlari",
            "en": "PowerPoint dasturlari"
          },
          {
            "uz": "Canva yordamida ijodiy dizayn",
            "ru": "Canva yordamida ijodiy dizayn",
            "en": "Canva yordamida ijodiy dizayn"
          },
          {
            "uz": "ChatGPT, Notion AI yordamida tezkor hujjatlar",
            "ru": "ChatGPT, Notion AI yordamida tezkor hujjatlar",
            "en": "ChatGPT, Notion AI yordamida tezkor hujjatlar"
          },
          {
            "uz": "Yakuniy loyiha himoyasi",
            "ru": "Yakuniy loyiha himoyasi",
            "en": "Yakuniy loyiha himoyasi"
          }
        ]
      }
    ]
  },
  {
    "id": "robototexnika",
    "title": {
      "uz": "Robototexnika",
      "ru": "Robototexnika",
      "en": "Robototexnika"
    },
    "category": "kids",
    "duration": {
      "uz": "4 oy",
      "ru": "4 oy",
      "en": "4 oy"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 so‘m",
      "en": "1 000 000 so‘m"
    },
    "totalPrice": {
      "uz": "4 000 000 so‘m",
      "ru": "4 000 000 so‘m",
      "en": "4 000 000 so‘m"
    },
    "description": {
      "uz": "Robototexnika kelajakning eng istiqbolli yo‘nalishlaridan biridir. Avtomatlashtirish va texnik tizimlarni yaratish bilan shug‘ullanadi va elektronika, mexanika, dasturlash va matematikaning sintezini anglatadi. 8-14 yoshgacha bolalar uchun.",
      "ru": "Robototexnika kelajakning eng istiqbolli yo‘nalishlaridan biridir. Avtomatlashtirish va texnik tizimlarni yaratish bilan shug‘ullanadi va elektronika, mexanika, dasturlash va matematikaning sintezini anglatadi. 8-14 yoshgacha bolalar uchun.",
      "en": "Robototexnika kelajakning eng istiqbolli yo‘nalishlaridan biridir. Avtomatlashtirish va texnik tizimlarni yaratish bilan shug‘ullanadi va elektronika, mexanika, dasturlash va matematikaning sintezini anglatadi. 8-14 yoshgacha bolalar uchun."
    },
    "coverImage": "",
    "technologies": [
      "Lego WeDo 2",
      "Scratch",
      "Lego Mindstorms EV3",
      "Arduino Uno"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Otabek Madraximov",
          "ru": "Otabek Madraximov",
          "en": "Otabek Madraximov"
        },
        "role": {
          "uz": "Robototexnika ustozi",
          "ru": "Robototexnika ustozi",
          "en": "Robototexnika ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Lego WeDo 2",
          "ru": "Lego WeDo 2",
          "en": "Lego WeDo 2"
        },
        "lessons": [
          {
            "uz": "Oddiy qurilmalar yaratish",
            "ru": "Oddiy qurilmalar yaratish",
            "en": "Oddiy qurilmalar yaratish"
          },
          {
            "uz": "Harakat sensorlari bilan ishlash",
            "ru": "Harakat sensorlari bilan ishlash",
            "en": "Harakat sensorlari bilan ishlash"
          },
          {
            "uz": "Modelni avtomatlashtirish",
            "ru": "Modelni avtomatlashtirish",
            "en": "Modelni avtomatlashtirish"
          }
        ]
      },
      {
        "title": {
          "uz": "Scratch",
          "ru": "Scratch",
          "en": "Scratch"
        },
        "lessons": [
          {
            "uz": "Scratch interfeysi",
            "ru": "Scratch interfeysi",
            "en": "Scratch interfeysi"
          },
          {
            "uz": "Oddiy animatsiya",
            "ru": "Oddiy animatsiya",
            "en": "Oddiy animatsiya"
          },
          {
            "uz": "Oddiy o‘yin yaratish – Labirint o‘yini",
            "ru": "Oddiy o‘yin yaratish – Labirint o‘yini",
            "en": "Oddiy o‘yin yaratish – Labirint o‘yini"
          }
        ]
      },
      {
        "title": {
          "uz": "Lego Mindstorms EV3",
          "ru": "Lego Mindstorms EV3",
          "en": "Lego Mindstorms EV3"
        },
        "lessons": [
          {
            "uz": "EV3 komponentlari",
            "ru": "EV3 komponentlari",
            "en": "EV3 komponentlari"
          },
          {
            "uz": "Masofa va tegish sensori",
            "ru": "Masofa va tegish sensori",
            "en": "Masofa va tegish sensori"
          },
          {
            "uz": "Robot manipulyatorini dasturlash",
            "ru": "Robot manipulyatorini dasturlash",
            "en": "Robot manipulyatorini dasturlash"
          }
        ]
      },
      {
        "title": {
          "uz": "Arduino uno",
          "ru": "Arduino uno",
          "en": "Arduino uno"
        },
        "lessons": [
          {
            "uz": "Arduino komponentlari",
            "ru": "Arduino komponentlari",
            "en": "Arduino komponentlari"
          },
          {
            "uz": "Sensorlar bilan ishlash",
            "ru": "Sensorlar bilan ishlash",
            "en": "Sensorlar bilan ishlash"
          },
          {
            "uz": "Servo va DC motorlarni boshqarish",
            "ru": "Servo va DC motorlarni boshqarish",
            "en": "Servo va DC motorlarni boshqarish"
          },
          {
            "uz": "Smart chiroq loyihasi",
            "ru": "Smart chiroq loyihasi",
            "en": "Smart chiroq loyihasi"
          }
        ]
      }
    ]
  },
  {
    "id": "kids-web",
    "title": {
      "uz": "Web Dasturlash (Kids)",
      "ru": "Web Dasturlash (Kids)",
      "en": "Web Dasturlash (Kids)"
    },
    "category": "kids",
    "duration": {
      "uz": "3 oy",
      "ru": "3 oy",
      "en": "3 oy"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 so‘m",
      "en": "1 000 000 so‘m"
    },
    "totalPrice": {
      "uz": "3 000 000 so‘m",
      "ru": "3 000 000 so‘m",
      "en": "3 000 000 so‘m"
    },
    "description": {
      "uz": "Bolalar uchun web dasturlash kurslari qiziqarli va interaktiv bo'lishi uchun mo'ljallangan. Bu kurslar bolalarga dasturlashni o'rganish jarayonida qiziqarli va ijodiy bo'lishiga yordam beradi. 11-15 yoshgacha.",
      "ru": "Bolalar uchun web dasturlash kurslari qiziqarli va interaktiv bo'lishi uchun mo'ljallangan. Bu kurslar bolalarga dasturlashni o'rganish jarayonida qiziqarli va ijodiy bo'lishiga yordam beradi. 11-15 yoshgacha.",
      "en": "Bolalar uchun web dasturlash kurslari qiziqarli va interaktiv bo'lishi uchun mo'ljallangan. Bu kurslar bolalarga dasturlashni o'rganish jarayonida qiziqarli va ijodiy bo'lishiga yordam beradi. 11-15 yoshgacha."
    },
    "coverImage": "",
    "technologies": [
      "Tilda",
      "Wix",
      "WordPress",
      "HTML/CSS asoslari"
    ],
    "mentors": [
      {
        "name": {
          "uz": "Kamronbek Atabayev",
          "ru": "Kamronbek Atabayev",
          "en": "Kamronbek Atabayev"
        },
        "role": {
          "uz": "Web Dasturlash ustozi",
          "ru": "Web Dasturlash ustozi",
          "en": "Web Dasturlash ustozi"
        },
        "image": ""
      }
    ],
    "modules": [
      {
        "title": {
          "uz": "Tilda bilan tanishish",
          "ru": "Tilda bilan tanishish",
          "en": "Tilda bilan tanishish"
        },
        "lessons": [
          {
            "uz": "No-code nima?",
            "ru": "No-code nima?",
            "en": "No-code nima?"
          },
          {
            "uz": "Bloklar bilan ishlash",
            "ru": "Bloklar bilan ishlash",
            "en": "Bloklar bilan ishlash"
          },
          {
            "uz": "Saytni mobil qurilmaga moslashtirish",
            "ru": "Saytni mobil qurilmaga moslashtirish",
            "en": "Saytni mobil qurilmaga moslashtirish"
          },
          {
            "uz": "Mini loyiha – Shaxsiy profil sayti",
            "ru": "Mini loyiha – Shaxsiy profil sayti",
            "en": "Mini loyiha – Shaxsiy profil sayti"
          }
        ]
      },
      {
        "title": {
          "uz": "Wix platformasida amaliyot",
          "ru": "Wix platformasida amaliyot",
          "en": "Wix platformasida amaliyot"
        },
        "lessons": [
          {
            "uz": "Wix bilan tanishish",
            "ru": "Wix bilan tanishish",
            "en": "Wix bilan tanishish"
          },
          {
            "uz": "Bir nechta sahifali sayt yaratish",
            "ru": "Bir nechta sahifali sayt yaratish",
            "en": "Bir nechta sahifali sayt yaratish"
          },
          {
            "uz": "Wix App Market va funksiyalar",
            "ru": "Wix App Market va funksiyalar",
            "en": "Wix App Market va funksiyalar"
          }
        ]
      },
      {
        "title": {
          "uz": "WordPress orqali professional saytlar yaratish",
          "ru": "WordPress orqali professional saytlar yaratish",
          "en": "WordPress orqali professional saytlar yaratish"
        },
        "lessons": [
          {
            "uz": "WordPress bilan tanishuv",
            "ru": "WordPress bilan tanishuv",
            "en": "WordPress bilan tanishuv"
          },
          {
            "uz": "Tema tanlash va faollashtirish",
            "ru": "Tema tanlash va faollashtirish",
            "en": "Tema tanlash va faollashtirish"
          },
          {
            "uz": "Plaginlar bilan tanishuv",
            "ru": "Plaginlar bilan tanishuv",
            "en": "Plaginlar bilan tanishuv"
          },
          {
            "uz": "SEO asoslari",
            "ru": "SEO asoslari",
            "en": "SEO asoslari"
          }
        ]
      }
    ]
  },
  {
    "id": "ai-media",
    "title": {
      "uz": "AI MEDIA",
      "ru": "AI MEDIA",
      "en": "AI MEDIA"
    },
    "category": "media",
    "duration": {
      "uz": "2 oy (12 ta dars)",
      "ru": "2 месяца (12 уроков)",
      "en": "2 months (12 lessons)"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 сум",
      "en": "1 000 000 UZS"
    },
    "totalPrice": {
      "uz": "2 000 000 so‘m",
      "ru": "2 000 000 сум",
      "en": "2 000 000 UZS"
    },
    "description": {
      "uz": "Sun’iy intellekt bugun media, reklama va kontent ishlab chiqarish sohalarini tubdan o‘zgartirmoqda. Tezkorlik, kreativlik va avtomatlashtirish asosiy raqobat ustunligiga aylandi. AI bilan ishlashni boshlash uchun chuqur texnik bilim shart emas, to‘g‘ri o‘quv dasturi va amaliy ko‘nikmalar kifoya.",
      "ru": "Искусственный интеллект кардинально меняет медиа и производство контента. Начните работать с ИИ без глубоких технических знаний.",
      "en": "AI is fundamentally changing media and content production. Start working with AI without deep technical knowledge."
    },
    "coverImage": "",
    "technologies": [
      "100% Amaliyotga asoslangan o'quv dasturi",
      "0 dan boshlab real ishga tayyor darajagacha",
      "100+ Shablon va promptlar bepul beriladi",
      "Real loyihalar va amaliy caselar (shaxsiy portfolio)",
      "100+ Real foydalanish ssenariylari",
      "ChatGPT, Claude, Gemini, Midjourney, Ae, Pr",
      "Tajribali amaliyotchi mentorlar tomonidan dars"
    ],
    "modules": [
      {
        "title": {
          "uz": "Modul 1. AI asoslari va prompt engineering",
          "ru": "Модуль 1. Основы ИИ",
          "en": "Module 1. AI Basics"
        },
        "lessons": [
          {
            "uz": "1-dars. AI asoslari – Sun'iy intellekt qanday ishlashi va asosiy tushunchalar",
            "ru": "Основы ИИ",
            "en": "AI Fundamentals"
          },
          {
            "uz": "2-dars. Media va biznesda AI roli – AIning kontent va reklamadagi amaliy qo'llanilishi",
            "ru": "Роль ИИ в медиа",
            "en": "AI in Media & Business"
          },
          {
            "uz": "3-dars. Prompt engineering asoslari – AIdan to'g'ri natija olish uchun buyruq berish",
            "ru": "Основы Промпт-инжиниринга",
            "en": "Prompt Engineering Basics"
          },
          {
            "uz": "4-dars. Advanced prompt engineering – Murakkab vazifalar uchun professional promptlar",
            "ru": "Продвинутый Промпт",
            "en": "Advanced Prompting"
          }
        ]
      },
      {
        "title": {
          "uz": "Modul 2. AI content creation",
          "ru": "Модуль 2. Создание контента",
          "en": "Module 2. Content Creation"
        },
        "lessons": [
          {
            "uz": "5-dars. AI dizayn va tasvir yaratish – Banner, avatar va vizual kontent yaratish",
            "ru": "Дизайн и изображения",
            "en": "Design & Image Generation"
          },
          {
            "uz": "6-dars. AI audio va ovoz bilan ishlash – Audio reklama, podcast va ovoz klonlash",
            "ru": "Аудио и голос",
            "en": "Audio & Voice Cloning"
          },
          {
            "uz": "7-dars. AI video va reels yaratish – Qisqa video va reklama roliklari tayyorlash",
            "ru": "Создание видео",
            "en": "Video & Reels Creation"
          }
        ]
      },
      {
        "title": {
          "uz": "Modul 3. SMM, reklama va daromad",
          "ru": "Модуль 3. SMM и реклама",
          "en": "Module 3. SMM & Ads"
        },
        "lessons": [
          {
            "uz": "8-dars. AI copywriting – Post va reklama uchun samarali matnlar yozish",
            "ru": "Копирайтинг ИИ",
            "en": "AI Copywriting"
          },
          {
            "uz": "9-dars. AI bilan SMM strategiya – Kontent rejalashtirish",
            "ru": "SMM стратегия",
            "en": "AI SMM Strategy"
          },
          {
            "uz": "10-dars. AI orqali daromad va freelance – Xizmatlar, platformalar",
            "ru": "Фриланс и заработок",
            "en": "Freelance & Income via AI"
          }
        ]
      },
      {
        "title": {
          "uz": "Modul 4. Amaliyot va portfolio",
          "ru": "Модуль 4. Практика",
          "en": "Module 4. Practice & Portfolio"
        },
        "lessons": [
          {
            "uz": "11-dars. Super-praktikum – Real loyiha ustida amaliy ish",
            "ru": "Практикум",
            "en": "Super-practicum"
          },
          {
            "uz": "12-dars. Yakuniy loyiha va portfolio – To'liq AI media paketni taqdim etish",
            "ru": "Финальный проект",
            "en": "Final Project"
          }
        ]
      }
    ],
    "mentors": [
      {
        "name": {
          "uz": "Dadaxon Abdullayev",
          "ru": "Дадахон Абдуллаев",
          "en": "Dadaxon Abdullayev"
        },
        "role": {
          "uz": "AI Expert | Video montajchi",
          "ru": "AI Expert",
          "en": "AI Expert"
        },
        "image": ""
      }
    ]
  },
  {
    "id": "excel-pro",
    "title": {
      "uz": "Excel Pro",
      "ru": "Excel Pro",
      "en": "Excel Pro"
    },
    "category": "finance",
    "duration": {
      "uz": "3 oy. Haftasiga 3 kun, Kuniga 3 soat",
      "ru": "3 месяца",
      "en": "3 months"
    },
    "monthlyPrice": {
      "uz": "1 500 000 so‘m",
      "ru": "1 500 000 сум",
      "en": "1 500 000 UZS"
    },
    "totalPrice": {
      "uz": "3 000 000 so‘m",
      "ru": "3 000 000 сум",
      "en": "3 000 000 UZS"
    },
    "description": {
      "uz": "Excelni chuqur o‘rgatib, amaliyotda yuqori daromad topa oladigan real ko‘nikmalarni beruvchi kurs. Siz rahbarlar uchun aniq va professional hisobotlar tayyorlashni, moliyaviy tahlillarni bajarishni va kundalik jarayonlarni avtomatlashtiruvchi Excel tizimlarini ishlab chiqishni o‘rganasiz.",
      "ru": "Глубокое изучение Excel для создания профессиональных отчетов и финансового анализа.",
      "en": "Deep learning of Excel to create professional reports and perform financial analysis."
    },
    "coverImage": "",
    "technologies": [
      "Ish bozorida talab juda yuqori",
      "Daromad-harajat nazorati, reja tuzish, savdo hisobotlari",
      "Power BI, Google Sheets, SQL va Data Analysis uchun asos",
      "Education Dashboard tizimlari yaratish",
      "100+ eng ko'p ishlatiladigan formulalar",
      "Real loyihalar va keyslar (O'quv markazlar, maktablar uchun tizimlar)"
    ],
    "modules": [
      {
        "title": {
          "uz": "1-MODUL: Excelni 0 dan o'rganish",
          "ru": "Модуль 1",
          "en": "Module 1"
        },
        "lessons": [
          {
            "uz": "Excel asoslari va interfeys",
            "ru": "Основы Excel",
            "en": "Excel Basics"
          },
          {
            "uz": "Ish varoqlari va fayllar bilan ishlash",
            "ru": "Работа с файлами",
            "en": "Working with files"
          },
          {
            "uz": "Ma'lumotlarni formatlash va dizayn",
            "ru": "Форматирование",
            "en": "Formatting"
          },
          {
            "uz": "Matn va oddiy formulalar bilan ishlash",
            "ru": "Простые формулы",
            "en": "Simple formulas"
          },
          {
            "uz": "Matn funksiyalari (TEXT funksiyalar)",
            "ru": "Текстовые функции",
            "en": "TEXT functions"
          },
          {
            "uz": "Asosiy matematik funksiyalar",
            "ru": "Математические функции",
            "en": "Math formulas"
          },
          {
            "uz": "Ro'yxatlar (Data Validation)",
            "ru": "Data Validation",
            "en": "Data Validation"
          },
          {
            "uz": "Ro'yxatlar bo'yicha funksiyalar",
            "ru": "Функции списков",
            "en": "List functions"
          },
          {
            "uz": "Shartli formatlash va shartli funksiyalar",
            "ru": "Условные функции",
            "en": "Conditional functions"
          },
          {
            "uz": "Qidiruv funksiyalari (VLOOKUP, XLOOKUP)",
            "ru": "VLOOKUP, XLOOKUP",
            "en": "VLOOKUP, XLOOKUP"
          },
          {
            "uz": "Kengaytirilgan qidiruv (INDEX, MATCH, XMATCH)",
            "ru": "INDEX, MATCH",
            "en": "INDEX, MATCH"
          },
          {
            "uz": "Ma'lumotlarni import va export qilish",
            "ru": "Импорт и экспорт",
            "en": "Import and Export"
          }
        ]
      },
      {
        "title": {
          "uz": "2-MODUL: Excel Avto",
          "ru": "Модуль 2",
          "en": "Module 2"
        },
        "lessons": [
          {
            "uz": "Formulalar bog'liqligi va auditing",
            "ru": "Аудит",
            "en": "Auditing"
          },
          {
            "uz": "Diagrammalar va vizualizatsiya",
            "ru": "Визуализация",
            "en": "Visualization"
          },
          {
            "uz": "To'g'ri jadvallar yaratish (Excel Table)",
            "ru": "Таблицы Excel",
            "en": "Excel Table"
          },
          {
            "uz": "Jadvallarni bog'lash va ma'lumotlar bazasi",
            "ru": "Базы данных",
            "en": "Databases"
          },
          {
            "uz": "Katta ma'lumotlar bilan ishlash",
            "ru": "Big Data",
            "en": "Working with Big Data"
          },
          {
            "uz": "Pivot jadvallar (asosi)",
            "ru": "Pivot таблицы",
            "en": "Pivot Tables"
          },
          {
            "uz": "PowerQuery va PowerPivot",
            "ru": "PowerQuery",
            "en": "PowerQuery & PowerPivot"
          },
          {
            "uz": "Hisobotlar va Dashboard yaratish",
            "ru": "Dashboard",
            "en": "Dashboard"
          },
          {
            "uz": "Makros va avtomatlashtirish",
            "ru": "Макросы",
            "en": "Macros"
          },
          {
            "uz": "ChatGPT / Makros / AppScript bilan avto",
            "ru": "AI Automation",
            "en": "AI Automation"
          },
          {
            "uz": "Real loyiha 1 (tizim yaratish)",
            "ru": "Проект 1",
            "en": "Project 1"
          },
          {
            "uz": "Real loyiha 2 + amaliy ish",
            "ru": "Проект 2",
            "en": "Project 2"
          }
        ]
      }
    ],
    "mentors": [
      {
        "name": {
          "uz": "Kamila Marksovna",
          "ru": "Камила Марксовна",
          "en": "Kamila Marksovna"
        },
        "role": {
          "uz": "Kurs mentori (3 yillik tajriba)",
          "ru": "Ментор",
          "en": "Mentor"
        },
        "image": ""
      }
    ]
  },
  {
    "id": "hr-menejer",
    "title": {
      "uz": "HR Menejerligi",
      "ru": "HR Менеджмент",
      "en": "HR Management"
    },
    "category": "finance",
    "duration": {
      "uz": "3 oy. Haftasiga 3 kun, Kuniga 3 soat",
      "ru": "3 месяца",
      "en": "3 months"
    },
    "monthlyPrice": {
      "uz": "1 500 000 so‘m",
      "ru": "1 500 000 сум",
      "en": "1 500 000 UZS"
    },
    "totalPrice": {
      "uz": "4 500 000 so‘m",
      "ru": "4 500 000 сум",
      "en": "4 500 000 UZS"
    },
    "description": {
      "uz": "HR — odamlar bilan ishlaydigan, jamoani shakllantiradigan va biznes o‘sishiga ta’sir qiladigan kasb. Boshlash uchun tajriba shart emas — to‘g‘ri o‘quv dasturi kifoya. HR jarayonlarini to‘g‘ri tashkil etish orqali biznesingizni kuchaytiring.",
      "ru": "Научитесь управлять персоналом, формировать команду и влиять на рост бизнеса.",
      "en": "Learn to manage personnel, build a team, and influence business growth."
    },
    "coverImage": "",
    "technologies": [
      "80% Amaliyotga aosslangan o'quv dasturi",
      "0 dan boshlab ishga tayyor darajagacha",
      "20+ Shablon va hujjatlar bepul beriladi",
      "Real loyihalar va amaliy caselar",
      "Talab yuqori: 300+ HR vakansiyalar mavjud",
      "Mentorlar amaldagi HR tajribasi bilan bo'lishadi",
      "hh, My Mehnat, Onework, Google Docs & Sheets"
    ],
    "modules": [
      {
        "title": {
          "uz": "Modul 1-4. HR Asoslari va Rekruting",
          "ru": "Модуль 1-4. Основы и Рекрутинг",
          "en": "Module 1-4. Basics & Recruiting"
        },
        "lessons": [
          {
            "uz": "Modul 1. HR sohasiga kirish (HRning asosiy tushunchalari, rollari, 7/30/90 kunlik starter xarita)",
            "ru": "Введение в HR",
            "en": "Intro to HR"
          },
          {
            "uz": "Modul 2. HR Administration & Hujjatlar (Kadrovik ishlar, JD, SOP, offboarding)",
            "ru": "HR Администрирование",
            "en": "HR Administration"
          },
          {
            "uz": "Modul 3. Hiring / Rekruting (Talant qidirish, intervyu metodlari, hiring funnel)",
            "ru": "Рекрутинг",
            "en": "Recruiting"
          },
          {
            "uz": "Modul 4. Ishga qabul qilish va moslashtirish (Yangi xodimni qabul qilish, onboarding)",
            "ru": "Прием и адаптация",
            "en": "Onboarding"
          }
        ]
      },
      {
        "title": {
          "uz": "Modul 5-8. Boshqaruv va Rivojlantirish",
          "ru": "Модуль 5-8. Управление и Развитие",
          "en": "Module 5-8. Management & Dev"
        },
        "lessons": [
          {
            "uz": "Modul 5. Performance Management (KPI, OKR, performance review)",
            "ru": "Performance Management",
            "en": "Performance Management"
          },
          {
            "uz": "Modul 6. Motivatsiya va korporativ madaniyat (Team-building, motivatsiya)",
            "ru": "Мотивация",
            "en": "Motivation & Culture"
          },
          {
            "uz": "Modul 7. O'qitish va rivojlantirish / TNA (O'qitish ehtiyojlarini aniqlash, IDP, growth plan)",
            "ru": "Обучение и развитие",
            "en": "Training & Dev"
          },
          {
            "uz": "Modul 8. Talent Management (Yuqori potensialdagi xodimlar, iste'dodlarni boshqarish)",
            "ru": "Управление талантами",
            "en": "Talent Management"
          }
        ]
      },
      {
        "title": {
          "uz": "Modul 9-11. Analitika, Liderlik va Loyiha",
          "ru": "Модуль 9-11. Аналитика и Лидерство",
          "en": "Module 9-11. Analytics & Leadership"
        },
        "lessons": [
          {
            "uz": "Modul 9. HR statistika va hisobotlar (HR metrikalar, HR analytics asoslari)",
            "ru": "HR Аналитика",
            "en": "HR Analytics"
          },
          {
            "uz": "Modul 10. HR etikasi va liderlik ko'nikmalari (HRning strategik roli)",
            "ru": "Лидерство в HR",
            "en": "HR Leadership"
          },
          {
            "uz": "Modul 11. Yakuniy loyiha himoyasi (To'liq HR tizimi yaratish)",
            "ru": "Финальный проект",
            "en": "Final Project"
          }
        ]
      }
    ],
    "mentors": [
      {
        "name": {
          "uz": "Zafarbek Ro'zmetov",
          "ru": "Зафарбек Рузметов",
          "en": "Zafarbek Ruzmetov"
        },
        "role": {
          "uz": "Kadrlar masalalari bo'yicha direktor",
          "ru": "HR Директор",
          "en": "HR Director"
        },
        "image": ""
      }
    ]
  },
  {
    "id": "arxitektura-dizayn",
    "title": {
      "uz": "Arxitektura va dizayn",
      "ru": "Архитектура и дизайн",
      "en": "Architecture and Design"
    },
    "category": "media",
    "duration": {
      "uz": "4 oy",
      "ru": "4 месяца",
      "en": "4 months"
    },
    "monthlyPrice": {
      "uz": "1 000 000 so‘m",
      "ru": "1 000 000 сум",
      "en": "1 000 000 UZS"
    },
    "totalPrice": {
      "uz": "4 000 000 so‘m",
      "ru": "4 000 000 сум",
      "en": "4 000 000 UZS"
    },
    "description": {
      "uz": "Arxitektura va 3D dizayn asoslarini o'zlashtiring. Zamonaviy binolar va interyer dizaynlarini yaratish, loyihalash va vizualizatsiya qilishni professional darajada o'rganib, talabgir mutaxassisga aylaning.",
      "ru": "Освойте основы архитектуры и 3D-дизайна. Создавайте и визуализируйте современные здания и интерьеры.",
      "en": "Master the basics of architecture and 3D design. Create and visualize modern buildings and interiors."
    },
    "coverImage": "",
    "technologies": [
      "AutoCAD: Ikki va uch o'lchamli loyihalashtirish",
      "3ds Max: Modellashtirish va vizualizatsiya",
      "Lumion: Landshaft va animatsiya",
      "Uy va ofislarning ichki/tashqi dizayni",
      "Mebel va landshaft dizaynlar yaratish"
    ],
    "modules": [
      {
        "title": {
          "uz": "1-MODUL: AutoCAD bilan chizmachilik va 2D loyihalash",
          "ru": "Модуль 1. AutoCAD 2D",
          "en": "Module 1. AutoCAD 2D"
        },
        "lessons": [
          {
            "uz": "Dars 1: Kirish. AutoCAD ishchi muhiti",
            "ru": "Урок 1: Введение",
            "en": "Lesson 1: Intro"
          },
          {
            "uz": "Dars 2: To'g'ri chiziqlar chizish (Line, Trim, Erase)",
            "ru": "Урок 2: Линии",
            "en": "Lesson 2: Lines"
          },
          {
            "uz": "Dars 3: Parallel chiziqlar (Offset), rang va qalinlik",
            "ru": "Урок 3: Смещение и цвет",
            "en": "Lesson 3: Offset & Color"
          },
          {
            "uz": "Dars 4: Zoom, Pan funksiyalari, aylana va ellipslar",
            "ru": "Урок 4: Масштаб и фигуры",
            "en": "Lesson 4: Zoom & Shapes"
          },
          {
            "uz": "Dars 5: Qatlamlar va qatlamlarni o'zgartirish",
            "ru": "Урок 5: Слои",
            "en": "Lesson 5: Layers"
          },
          {
            "uz": "Dars 6: Tutashma buyruqlar (Fillet, Circle-TTR)",
            "ru": "Урок 6: Соединения",
            "en": "Lesson 6: Fillet"
          },
          {
            "uz": "Dars 7: Matn yozish, Rotate va Mirror",
            "ru": "Урок 7: Текст, Поворот",
            "en": "Lesson 7: Text, Rotate"
          },
          {
            "uz": "Dars 8: Copy, Array, Hatch (shtrixlash)",
            "ru": "Урок 8: Копия, Массив, Штриховка",
            "en": "Lesson 8: Copy, Array, Hatch"
          },
          {
            "uz": "Dars 9: To'rtburchak va ko'pburchak chizish",
            "ru": "Урок 9: Многоугольники",
            "en": "Lesson 9: Polygons"
          },
          {
            "uz": "Dars 10: Move va Scale buyrug'i",
            "ru": "Урок 10: Перемещение",
            "en": "Lesson 10: Move & Scale"
          },
          {
            "uz": "Dars 11: Uch o'lchamli obyekltar (Extrude)",
            "ru": "Урок 11: 3D объекты",
            "en": "Lesson 11: 3D Objects"
          },
          {
            "uz": "Dars 12: Imtihon va amaliy mashg'ulotlar",
            "ru": "Урок 12: Экзамен",
            "en": "Lesson 12: Exam"
          }
        ]
      },
      {
        "title": {
          "uz": "2-MODUL: 3ds MAX asoslari va 3D modellashtirish",
          "ru": "Модуль 2. 3ds MAX",
          "en": "Module 2. 3ds MAX"
        },
        "lessons": [
          {
            "uz": "Dars 1: Kirish. 3ds MAX ishchi muhiti",
            "ru": "Урок 1: Введение",
            "en": "Lesson 1: Intro"
          },
          {
            "uz": "Dars 2: AutoCADdan import va tahrirlash",
            "ru": "Урок 2: Импорт AutoCAD",
            "en": "Lesson 2: Import AutoCAD"
          },
          {
            "uz": "Dars 3: Extrude, Edit Patch va Edit Poly",
            "ru": "Урок 3: Модификаторы",
            "en": "Lesson 3: Modifiers"
          },
          {
            "uz": "Dars 4: Sodda uch o'lchamli obyektlar (Spline)",
            "ru": "Урок 4: Сплайны",
            "en": "Lesson 4: Splines"
          },
          {
            "uz": "Dars 5: Modifikatorlar: Latice, Bend, Taper, Twist",
            "ru": "Урок 5: Искажения",
            "en": "Lesson 5: Distortions"
          },
          {
            "uz": "Dars 6: Matolar simulyatsiyasi va Cloth modifikatori",
            "ru": "Урок 6: Симуляция тканей",
            "en": "Lesson 6: Cloth Simulation"
          },
          {
            "uz": "Dars 7: Corona va V-Ray pluginlari",
            "ru": "Урок 7: Corona и V-Ray",
            "en": "Lesson 7: Corona & V-Ray"
          },
          {
            "uz": "Dars 8: Materiallar va teksturalash",
            "ru": "Урок 8: Материалы",
            "en": "Lesson 8: Materials"
          },
          {
            "uz": "Dars 9: Anturaj va staffaj (Merge buyrug'i)",
            "ru": "Урок 9: Антураж",
            "en": "Lesson 9: Entourage"
          },
          {
            "uz": "Dars 10: Soya va yorug'lik sozlamalari",
            "ru": "Урок 10: Освещение",
            "en": "Lesson 10: Lighting"
          },
          {
            "uz": "Dars 11: Kamera sozlash va render",
            "ru": "Урок 11: Камера и рендер",
            "en": "Lesson 11: Camera & Render"
          },
          {
            "uz": "Dars 12: Imtihon va amaliy mashg'ulotlar",
            "ru": "Урок 12: Экзамен",
            "en": "Lesson 12: Exam"
          }
        ]
      },
      {
        "title": {
          "uz": "3-MODUL: Lumion va eksterior dizayni",
          "ru": "Модуль 3. Lumion",
          "en": "Module 3. Lumion"
        },
        "lessons": [
          {
            "uz": "Dars 1: Lumion bilan tanishuv, landshaft",
            "ru": "Урок 1: Введение",
            "en": "Lesson 1: Intro"
          },
          {
            "uz": "Dars 2: Loyihani joylashtirish, modellarni o'rnatish",
            "ru": "Урок 2: Модели",
            "en": "Lesson 2: Models"
          },
          {
            "uz": "Dars 3: Teksturalash va materiallar",
            "ru": "Урок 3: Текстуры",
            "en": "Lesson 3: Textures"
          },
          {
            "uz": "Dars 4: Harakatli modellar joylash va sozlash",
            "ru": "Урок 4: Анимация",
            "en": "Lesson 4: Animation"
          },
          {
            "uz": "Dars 5: Transport vositalari harakatlanishi",
            "ru": "Урок 5: Транспорт",
            "en": "Lesson 5: Vehicles"
          },
          {
            "uz": "Dars 6: Yorug'lik manbalari va chiroqlar",
            "ru": "Урок 6: Освещение",
            "en": "Lesson 6: Lighting"
          },
          {
            "uz": "Dars 7: Foto render va eksport",
            "ru": "Урок 7: Фото рендер",
            "en": "Lesson 7: Photo Render"
          },
          {
            "uz": "Dars 8: Kamera harakatlari va fasllar boshqarish",
            "ru": "Урок 8: Камера и сезоны",
            "en": "Lesson 8: Camera & Seasons"
          },
          {
            "uz": "Dars 9: Video render",
            "ru": "Урок 9: Видео рендер",
            "en": "Lesson 9: Video Render"
          },
          {
            "uz": "Dars 10: Photoshopda planshet yig'ish",
            "ru": "Урок 10: Photoshop",
            "en": "Lesson 10: Photoshop"
          },
          {
            "uz": "Dars 11: Loyihani yakunlash",
            "ru": "Урок 11: Завершение",
            "en": "Lesson 11: Finalization"
          },
          {
            "uz": "Dars 12: Imtihon va amaliy",
            "ru": "Урок 12: Экзамен",
            "en": "Lesson 12: Exam"
          }
        ]
      },
      {
        "title": {
          "uz": "4-MODUL: Amaliy loyihalar va maxsus modifikatorlar",
          "ru": "Модуль 4. Проекты",
          "en": "Module 4. Projects"
        },
        "lessons": [
          {
            "uz": "Dars 1-3: Qurilish chizmalari, Devorlar (eshik-deraza), Tom",
            "ru": "Урок 1-3: Чертежи",
            "en": "Lesson 1-3: Drawings"
          },
          {
            "uz": "Dars 4-6: Ustun, Landshaft, Maxsus effektlar",
            "ru": "Урок 4-6: Детали",
            "en": "Lesson 4-6: Details"
          },
          {
            "uz": "Dars 7-9: Materiallar, Matolar, Transport modellar",
            "ru": "Урок 7-9: Материалы",
            "en": "Lesson 7-9: Materials"
          },
          {
            "uz": "Dars 10-12: Kamera, Video taqdimot, Final imtihon",
            "ru": "Урок 10-12: Финал",
            "en": "Lesson 10-12: Final"
          }
        ]
      }
    ],
    "mentors": [
      {
        "name": {
          "uz": "Sherzod Duschanov",
          "ru": "Шерзод Дусчанов",
          "en": "Sherzod Duschanov"
        },
        "role": {
          "uz": "Arxitektor Dizayner (23 yillik tajriba)",
          "ru": "Архитектор Дизайнер",
          "en": "Architect Designer"
        },
        "image": ""
      },
      {
        "name": {
          "uz": "Musobek Atajanov",
          "ru": "Мусобек Атажанов",
          "en": "Musobek Atajanov"
        },
        "role": {
          "uz": "Arxitektor Dizayner (5 yillik tajriba)",
          "ru": "Архитектор Дизайнер",
          "en": "Architect Designer"
        },
        "image": ""
      }
    ]
  },
  {
    "id": "videografiya",
    "title": {
      "uz": "Videografiya",
      "ru": "Видеомонтаж",
      "en": "Videography"
    },
    "category": "media",
    "duration": {
      "uz": "3 oy",
      "ru": "3 месяца",
      "en": "3 months"
    },
    "monthlyPrice": {
      "uz": "1 200 000 so‘m",
      "ru": "1 200 000 сум",
      "en": "1 200 000 UZS"
    },
    "totalPrice": {
      "uz": "3 600 000 so‘m",
      "ru": "3 600 000 сум",
      "en": "3 600 000 UZS"
    },
    "discountPrice": {
      "uz": "3 420 000 so‘m",
      "ru": "3 420 000 сум",
      "en": "3 420 000 UZS"
    },
    "description": {
      "uz": "Kurs so'nggida: Video operatorlik mahoratiga ega bo'lib, sohada texnologik jihatdan xalqaro standart ishlash, har qanday turdagi video mahsulotga shakl berish, montaj qilish, ixchamlash, effekt berish va shu kabi tahrirlash bilan bog'liq ko'plab texnologik bilimlar beriladi.",
      "ru": "По окончании курса вы овладеете навыками видеооператора, научитесь работать по международным стандартам, монтировать, применять эффекты и редактировать видеоматериалы.",
      "en": "By the end of the course, you will acquire videography skills, learn to work according to international technological standards, edit, apply effects, and edit various video products."
    },
    "modules": [
      {
        "title": {
          "uz": "1-MODUL: Premiere Pro asoslari va video montaj",
          "ru": "МОДУЛЬ 1: Основы Premiere Pro и видеомонтаж",
          "en": "MODULE 1: Premiere Pro Basics and Video Editing"
        },
        "lessons": [
          {
            "uz": "Premiere Pro interfeysi va asboblari",
            "ru": "Интерфейс и инструменты Premiere Pro",
            "en": "Premiere Pro interface and tools"
          },
          {
            "uz": "Video va audioni kesish, birlashtirish",
            "ru": "Нарезка и склеивание видео и аудио",
            "en": "Cutting and joining video and audio"
          },
          {
            "uz": "Kadrlar bilan ishlash va render qilish",
            "ru": "Работа с кадрами и рендер",
            "en": "Working with frames and rendering"
          }
        ]
      },
      {
        "title": {
          "uz": "2-MODUL: Suratga olish va kadrlar",
          "ru": "МОДУЛЬ 2: Съемка и кадры",
          "en": "MODULE 2: Filming and Framing"
        },
        "lessons": [
          {
            "uz": "Kameralar va yorug'lik bilan ishlash",
            "ru": "Работа с камерами и светом",
            "en": "Working with cameras and lighting"
          },
          {
            "uz": "Ovoz yozish texnikasi",
            "ru": "Техника записи звука",
            "en": "Audio recording techniques"
          },
          {
            "uz": "To'g'ri kompozitsiya tanlash",
            "ru": "Выбор правильной композиции",
            "en": "Choosing the right composition"
          }
        ]
      },
      {
        "title": {
          "uz": "3-MODUL: Mijoz bilan ishlash va amaliyot",
          "ru": "МОДУЛЬ 3: Работа с клиентами и практика",
          "en": "MODULE 3: Client Relations and Practice"
        },
        "lessons": [
          {
            "uz": "Mijoz talabini to'g'ri tushunish",
            "ru": "Правильное понимание требований клиента",
            "en": "Understanding client requirements properly"
          },
          {
            "uz": "Ssenariy yozish va tayyorgarlik",
            "ru": "Написание сценария и подготовка",
            "en": "Scriptwriting and preparation"
          },
          {
            "uz": "Byudjet va narx belgilash",
            "ru": "Установление бюджета и цены",
            "en": "Budgeting and pricing"
          }
        ]
      },
      {
        "title": {
          "uz": "4-MODUL: After Effects asoslari va animatsiya",
          "ru": "МОДУЛЬ 4: Основы After Effects и анимация",
          "en": "MODULE 4: After Effects Basics and Animation"
        },
        "lessons": [
          {
            "uz": "After Effects asoslari",
            "ru": "Основы After Effects",
            "en": "After Effects basics"
          },
          {
            "uz": "Animatsiya va effektlar qo'shish",
            "ru": "Добавление анимации и эффектов",
            "en": "Adding animation and effects"
          },
          {
            "uz": "Titrlarni jonlantirish",
            "ru": "Оживление титров",
            "en": "Animating titles"
          }
        ]
      },
      {
        "title": {
          "uz": "5-MODUL: Vizual effektlar va post-prodaksiya",
          "ru": "МОДУЛЬ 5: Визуальные эффекты и пост-продакшн",
          "en": "MODULE 5: Visual Effects and Post-Production"
        },
        "lessons": [
          {
            "uz": "Davinci Resolve yordamida Color Correction",
            "ru": "Color Correction с помощью Davinci Resolve",
            "en": "Color Correction using Davinci Resolve"
          },
          {
            "uz": "Audioni tozalash va mikslash",
            "ru": "Очистка и микширование аудио",
            "en": "Audio cleaning and mixing"
          },
          {
            "uz": "Final proyekt ustida ishlash",
            "ru": "Работа над финальным проектом",
            "en": "Working on the final project"
          }
        ]
      }
    ],
    "technologies": [
      "Premiere Pro",
      "After Effects",
      "Adobe Photoshop",
      "Davinci Resolve",
      "Video operatorlik"
    ],
    "coverImage": "/images/courses/videografiya.webp",
    "mentors": [
      {
        "name": {
          "uz": "Murodbek Ro'zmetov",
          "ru": "Муродбек Рузметов",
          "en": "Murodbek Ruzmetov"
        },
        "role": {
          "uz": "Videomontaj Kursi Ustozi",
          "ru": "Преподаватель по видеомонтажу",
          "en": "Video Editing Instructor"
        },
        "image": "/images/team/murodbek.webp",
        "bio": {
          "uz": "Videomeyekrlik sohasida +4 yillik tajribaga ega. O'z faoliyati davomida 500 dan ortiq videorolik va bir qator kliplarni muvaffaqiyatli topshirgan. Shuningdek, boshqa davlatlar uchun 10 dan ortiq videorolik tayyorlagan.",
          "ru": "Креативный видеомейкер с более чем 4-летним опытом работы. За свою карьеру успешно сдал более 500 видеороликов и ряд клипов. Также подготовил более 10 видеороликов для других стран.",
          "en": "Creative video maker with over +4 years of experience. Successfully delivered over 500 videos and several music videos. Created more than 10 videos for foreign clients."
        }
      }
    ]
  }
];
