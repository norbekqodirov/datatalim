import { Question, Course, ResultContent } from './types';

export const QUESTIONS: Question[] = [
  {"id":"Q001","text":"Men chiroyli ko‘rinadigan ish qilganda ko‘proq zavqlanaman.","section":"interest","traits":{"creative":2,"visual":2},"courses":{"graphic_design":2,"videography":1,"mobileography":1}},
  {"id":"Q002","text":"Bir ishni qilayotganda tartib menga juda muhim.","section":"interest","traits":{"structure":2},"courses":{"accounting":2,"architecture":1,"foundation_programming":1}},
  {"id":"Q003","text":"Odamlar bilan gaplashib ishlash menga yoqadi.","section":"interest","traits":{"communication":2},"courses":{"smm":2}},
  {"id":"Q004","text":"Raqamlar bilan ishlashda o‘zimni ishonchli his qilaman.","section":"interest","traits":{"numeric":2},"courses":{"accounting":2}},
  {"id":"Q005","text":"Telefon bilan tezkor kontent qilish menga oson.","section":"interest","traits":{"mobility":2,"visual":1},"courses":{"mobileography":2,"smm":1}},
  {"id":"Q006","text":"Video montaj yoki syomka qilish menga qiziq.","section":"creative","traits":{"visual":2,"focus":1},"courses":{"videography":2}},
  {"id":"Q007","text":"Bir xil ishni uzoq vaqt qilganda zerikaman.","section":"creative","traits":{"creative":1},"courses":{"graphic_design":1,"smm":1}},
  {"id":"Q008","text":"Chizmalar va maketlar bilan ishlash menga yoqadi.","section":"creative","traits":{"visual":2,"structure":1},"courses":{"architecture":2}},
  {"id":"Q009","text":"Kod yoki texnik jarayonlarni tushunishga qiziqaman.","section":"technical","traits":{"technical":2},"courses":{"foundation_programming":2}},
  {"id":"Q010","text":"Xatolarni topish va tuzatish menga yoqadi.","section":"technical","traits":{"focus":2,"structure":1},"courses":{"accounting":1,"foundation_programming":1}},
  {"id":"Q011","text":"Ishda tez natija ko‘rish meni motivatsiya qiladi.","section":"outcome","traits":{"mobility":1},"courses":{"smm":2,"mobileography":1}},
  {"id":"Q012","text":"Ishni asta‑sekin, puxta qilishni afzal ko‘raman.","section":"outcome","traits":{"focus":2},"courses":{"accounting":1,"architecture":1}},
  {"id":"Q013","text":"Kompyuterda murakkab narsalarni o‘rganishdan qo‘rqmayman.","section":"technical","traits":{"technical":2,"focus":1},"courses":{"foundation_programming":2}},
  {"id":"Q014","text":"Rasm yoki dizayn orqali fikrni ifodalash menga oson.","section":"creative","traits":{"creative":2,"visual":1},"courses":{"graphic_design":2}},
  {"id":"Q015","text":"Ijtimoiy tarmoqlarda faol bo‘lish menga yoqadi.","section":"communication","traits":{"communication":2,"mobility":1},"courses":{"smm":2}},
  {"id":"Q016","text":"Hujjat va jadval bilan ishlash menga qulay.","section":"structure","traits":{"structure":2,"numeric":1},"courses":{"accounting":2}},
  {"id":"Q017","text":"Reja tuzib ishlasam o‘zimni yaxshi his qilaman.","section":"structure","traits":{"structure":2},"courses":{"architecture":1,"foundation_programming":1}},
  {"id":"Q018","text":"Telefon orqali video olishni tez o‘rganib ketaman.","section":"mobility","traits":{"mobility":2,"visual":1},"courses":{"mobileography":2}},
  {"id":"Q019","text":"Texnik muammolarni mustaqil hal qilishga harakat qilaman.","section":"technical","traits":{"technical":2},"courses":{"foundation_programming":2}},
  {"id":"Q020","text":"Bir ishda mayda detallar menga muhim.","section":"focus","traits":{"focus":2},"courses":{"accounting":1,"architecture":1}},
  {"id":"Q021","text":"Kontent orqali odamlar e’tiborini jalb qilish qiziq.","section":"communication","traits":{"communication":2,"creative":1},"courses":{"smm":2}},
  {"id":"Q022","text":"Kamera bilan ishlash menga qiziqarli.","section":"creative","traits":{"visual":2},"courses":{"videography":2}},
  {"id":"Q023","text":"Hisob‑kitobni tekshirib chiqishni yoqtiraman.","section":"numeric","traits":{"numeric":2,"focus":1},"courses":{"accounting":2}},
  {"id":"Q024","text":"Yangi dasturlarni tez o‘rganaman.","section":"technical","traits":{"technical":2},"courses":{"foundation_programming":1,"graphic_design":1}},
  {"id":"Q025","text":"Bir ishni boshlashdan oldin qanday natija bo‘lishini tasavvur qilaman.","section":"interest","traits":{"creative":1,"structure":1},"courses":{"architecture":1,"graphic_design":1}},
  {"id":"Q026","text":"Jamoa bilan ishlash menga yoqadi.","section":"communication","traits":{"communication":2},"courses":{"smm":1,"architecture":1}},
  {"id":"Q027","text":"Uzoq vaqt diqqatni jamlab ishlay olaman.","section":"focus","traits":{"focus":2},"courses":{"foundation_programming":1,"architecture":1}},
  {"id":"Q028","text":"Raqamlar bilan xato qilishdan qo‘rqmayman.","section":"numeric","traits":{"numeric":2},"courses":{"accounting":2}},
  {"id":"Q029","text":"Vizual misollar bilan tushuntirish menga oson.","section":"creative","traits":{"visual":2},"courses":{"graphic_design":1,"videography":1}},
  {"id":"Q030","text":"Telefonimda kontent qilishni tez-tez qilaman.","section":"mobility","traits":{"mobility":2},"courses":{"mobileography":2}},
  {"id":"Q031","text":"Biror tizim qanday ishlashini bilishga qiziqaman.","section":"technical","traits":{"technical":2},"courses":{"foundation_programming":2}},
  {"id":"Q032","text":"Rasm va ranglar bilan ishlash menga zavq beradi.","section":"creative","traits":{"creative":2,"visual":1},"courses":{"graphic_design":2}},
  {"id":"Q033","text":"Natijani raqam bilan ko‘rish menga yoqadi.","section":"numeric","traits":{"numeric":2},"courses":{"accounting":1,"smm":1}},
  {"id":"Q034","text":"Videoni bosqichma‑bosqich tayyorlash menga qulay.","section":"focus","traits":{"focus":2},"courses":{"videography":1,"architecture":1}},
  {"id":"Q035","text":"Post yoki reklama g‘oyasi o‘ylab topish qiziq.","section":"creative","traits":{"creative":2,"communication":1},"courses":{"smm":2}},
  {"id":"Q036","text":"Bir ishni qoidaga mos qilib qilish menga muhim.","section":"structure","traits":{"structure":2},"courses":{"accounting":1,"foundation_programming":1}},
  {"id":"Q037","text":"Texnik qurilmalar bilan ishlashdan qo‘rqmayman.","section":"technical","traits":{"technical":2},"courses":{"videography":1,"foundation_programming":1}},
  {"id":"Q038","text":"Rasm, video yoki dizayn orqali daromad qilishni xohlayman.","section":"interest","traits":{"creative":2},"courses":{"graphic_design":1,"videography":1,"mobileography":1}},
  {"id":"Q039","text":"Uzoq muddatli loyiha ustida ishlashga tayyorman.","section":"focus","traits":{"focus":2},"courses":{"architecture":1,"foundation_programming":1}},
  {"id":"Q040","text":"Ijtimoiy tarmoqlarda trendlarni kuzatib boraman.","section":"communication","traits":{"communication":1,"mobility":1},"courses":{"smm":2}}
];

export const COURSE_NAMES: Record<Course, string> = {
  graphic_design: "Grafik Dizayn",
  smm: "SMM (Social Media Marketing)",
  accounting: "Buxgalteriya",
  videography: "Videografiya",
  architecture: "Arxitektura va Dizayn",
  foundation_programming: "Foundation (Dasturlash)",
  mobileography: "Mobilografiya"
};

export const COURSE_RESULTS: Record<Course, ResultContent> = {
  graphic_design: {
    title: "Grafik Dizayn",
    description: [
      "Siz vizual fikrlaysiz va chiroyli natija sizni motivatsiya qiladi. Grafik dizayn sizga mos boshlang‘ich yo‘nalish.",
      "Siz rang, shakl va dizayn orqali fikrni ifodalashga moyilsiz. Grafik dizayn siz uchun qulay.",
      "Vizual ishlar sizga tez o‘sish va daromad imkonini beradi. Grafik dizayn kursi tavsiya etiladi."
    ]
  },
  smm: {
    title: "SMM",
    description: [
      "Siz odamlar bilan ishlashni va tez natija ko‘rishni yoqtirasiz. SMM siz uchun mos.",
      "Kontent va muloqot orqali natija chiqarish sizga qulay. SMM kursidan boshlash to‘g‘ri qaror.",
      "Marketingga qiziqishingiz bor. SMM — eng yaxshi boshlang‘ich yo‘l."
    ]
  },
  accounting: {
    title: "Buxgalteriya",
    description: [
      "Siz raqamlar va aniqlikni yaxshi ko‘rasiz. Buxgalteriya sizga mos.",
      "Tartibli va mas’uliyatli ishlar sizni charchatmaydi. Buxgalteriya kursi tavsiya etiladi.",
      "Hisob‑kitob va hujjatlar bilan ishlash sizning kuchli tomoningiz."
    ]
  },
  videography: {
    title: "Videografiya",
    description: [
      "Siz video va dinamik ishlarni yoqtirasiz. Videografiya sizga mos.",
      "Kamera va montaj bilan ishlash sizni qiziqtiradi. Videografiya kursidan boshlash mumkin.",
      "Vizual kontent orqali daromad qilish sizga qulay."
    ]
  },
  architecture: {
    title: "Arxitektura",
    description: [
      "Siz texnik va vizual fikrlashni birlashtira olasiz. Arxitektura sizga mos.",
      "Reja va chizmalar bilan ishlash sizni qiziqtiradi.",
      "Uzoq muddatli loyihalar sizga to‘g‘ri keladi."
    ]
  },
  foundation_programming: {
    title: "Foundation (Dasturlash)",
    description: [
      "Siz mantiqiy va texnik fikrlaysiz. Dasturlashdan boshlash sizga mos.",
      "Murakkab jarayonlarni tushunish sizni qiziqtiradi.",
      "Texnik sohada barqaror o‘sish uchun foundation kursi tavsiya etiladi."
    ]
  },
  mobileography: {
    title: "Mobilografiya",
    description: [
      "Siz telefon orqali tezkor kontent qilishga moyilsiz. Mobilografiya sizga mos.",
      "Harakatchan va kreativ ishlar sizni motivatsiya qiladi.",
      "Mobilografiya — tez natija beradigan yo‘nalish."
    ]
  }
};
