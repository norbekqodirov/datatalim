import { useState, useRef, useEffect } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, ChevronRight, RotateCcw, BookOpen, Award, Target, TrendingUp,
  CheckCircle, Star, Download, Loader2, Wrench, FlaskConical, Palette, Heart,
  Rocket, ClipboardList, Sparkles, Trophy, MessageCircle, Brain, HeartHandshake,
  CalendarCheck, Crown, Cpu, Search, Users, ShieldCheck, GraduationCap,
  Hammer, Lightbulb, Brush, Megaphone, Calculator, Trees, Music, Microscope,
  Handshake, FileText, Cog, Telescope, Building2, PenTool, Database, Atom,
  Receipt, HandHeart, Library, Camera, LineChart, ClipboardCheck, User, Gauge,
  Scale, Ruler, Layers,
} from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, FloatingStars } from '../components/BrandElements';
import { SEO } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';
import { trackSiteEvent } from '../utils/analytics';

// ─── Types ───────────────────────────────────────────────────────────────────
type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
type Gender = 'male' | 'female' | '';
type View = 'intro' | 'test' | 'calculating' | 'result';
type Stage = 1 | 2 | 3;
type LucideIcon = ComponentType<{ size?: number; className?: string; style?: CSSProperties }>;

interface ForcedChoiceQ {
  id: number;
  text: string;
  optionA: { icon: LucideIcon; text: string; type: RiasecType };
  optionB: { icon: LucideIcon; text: string; type: RiasecType };
}

interface LikertQ {
  id: number;
  text: string;
  type: RiasecType;
}

interface MultiChoiceQ {
  id: number;
  text: string;
  options: { label: 'A' | 'B' | 'C' | 'D'; text: string; type: RiasecType; icon: LucideIcon }[];
}

interface Course {
  id: string;
  name: string;
  url: string;
  riasec: Record<RiasecType, number>;
  desc: string;
  minAge: number;
  maxAge: number;
}

interface CourseResult {
  course: Course;
  matchScore: number;
  rank: number;
}

interface QualityMetrics {
  differentiation: number;      // eng yuqori va eng past tip orasidagi farq (%)
  consistencyDistance: number;  // Holland olti burchagida top-2 tip orasidagi masofa (1..3)
  distinctRatings: number;      // Likertda ishlatilgan turli baholar soni
  confidence: number;           // 0..99 — natijaning ishonchlilik darajasi
}

// ─── Holland olti burchagi (hexagon) ─────────────────────────────────────────
// Holland nazariyasida tiplar aylana bo'ylab joylashadi: qo'shni tiplar o'xshash,
// qarama-qarshi tiplar (R↔S, I↔E, A↔C) bir-biriga eng uzoq.
const HEX_ORDER: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const TYPES: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

function hexDistance(a: RiasecType, b: RiasecType): number {
  const i = HEX_ORDER.indexOf(a);
  const j = HEX_ORDER.indexOf(b);
  const d = Math.abs(i - j);
  return Math.min(d, 6 - d); // 0..3
}

// ─── Bosqich 1 — Majburiy tanlov (15 ta: barcha 15 ta tip juftligi aynan 1 martadan) ─
// Har bir tip aynan 5 marta uchraydi → mukammal muvozanat va to'liq taqqoslash qamrovi.
const FORCED_CHOICE: ForcedChoiceQ[] = [
  { id:1,  text:"Qaysi faoliyat sizga ko'proq yoqadi?",              optionA:{icon:Wrench,      text:"Texnik qurilmalarni yig'ish yoki ta'mirlash",   type:'R'}, optionB:{icon:Microscope,  text:"Ilmiy eksperiment o'tkazish va natijani tahlil qilish", type:'I'} },
  { id:2,  text:"Qaysi ish sizni ko'proq qiziqtiradi?",              optionA:{icon:Hammer,      text:"O'z qo'lim bilan buyum yoki konstruksiya yasash", type:'R'}, optionB:{icon:Brush,       text:"Rasm chizish yoki vizual dizayn yaratish",             type:'A'} },
  { id:3,  text:"Qaysi muhitda o'zingizni yaxshi his qilasiz?",      optionA:{icon:Cog,         text:"Asbob-uskunalar bilan texnik ishlash",           type:'R'}, optionB:{icon:GraduationCap,text:"Odamlarga o'rgatish va yordam berish",                type:'S'} },
  { id:4,  text:"Qaysi rolni tanlagan bo'lardingiz?",                optionA:{icon:Trees,       text:"Mahsulotni o'z qo'lim bilan tayyorlash",         type:'R'}, optionB:{icon:Handshake,   text:"Mahsulotni sotish va biznesni yuritish",               type:'E'} },
  { id:5,  text:"Qaysi vazifa sizga qulayroq?",                      optionA:{icon:Cpu,         text:"Qurilma yoki mexanizmni sozlash",                type:'R'}, optionB:{icon:FileText,    text:"Hujjat va ma'lumotlarni tartibga solish",              type:'C'} },
  { id:6,  text:"Qaysi jarayon sizni ko'proq jalb qiladi?",          optionA:{icon:Telescope,   text:"Ma'lumotlarni chuqur tahlil qilib qonuniyat topish", type:'I'}, optionB:{icon:Sparkles,   text:"Butunlay yangi, original g'oya o'ylab topish",         type:'A'} },
  { id:7,  text:"Qaysi muammo sizga yaqinroq?",                      optionA:{icon:FlaskConical,text:"Ilmiy gipotezani tekshirish",                    type:'I'}, optionB:{icon:HeartHandshake,text:"Insonning shaxsiy muammosini tinglab yordam berish",type:'S'} },
  { id:8,  text:"Qaysi loyiha sizni ko'proq hayajonlantiradi?",      optionA:{icon:Library,     text:"Uzoq muddatli tadqiqot olib borish",             type:'I'}, optionB:{icon:Building2,   text:"Yangi biznes yoki startap boshlash",                   type:'E'} },
  { id:9,  text:"Qaysi ish uslubi sizga mos?",                       optionA:{icon:Atom,        text:"Sabab-oqibatni izlab, mustaqil xulosa chiqarish", type:'I'}, optionB:{icon:Receipt,     text:"Aniq shakl bo'yicha hisobot va hujjat yuritish",       type:'C'} },
  { id:10, text:"Qaysi muhitda ishlashni xohlaysiz?",                optionA:{icon:Palette,     text:"Ijodiy studiya yoki dizayn bo'limida",           type:'A'}, optionB:{icon:Users,       text:"Odamlar bilan bevosita muloqotda",                    type:'S'} },
  { id:11, text:"Qaysi natija sizga ko'proq qoniqish beradi?",       optionA:{icon:Music,       text:"O'zim yaratgan san'at yoki media asari",         type:'A'}, optionB:{icon:Megaphone,   text:"Jamoani boshqarib, katta maqsadga erishish",           type:'E'} },
  { id:12, text:"Qaysi ish sharoiti sizga mos keladi?",              optionA:{icon:PenTool,     text:"Erkin ijod va o'z uslubimni qo'llash",           type:'A'}, optionB:{icon:Ruler,       text:"Aniq qoida va standartlar asosida ishlash",            type:'C'} },
  { id:13, text:"Qaysi muloqot turi sizga yaqin?",                   optionA:{icon:MessageCircle,text:"Odamga g'amxo'rlik qilib, maslahat berish",     type:'S'}, optionB:{icon:LineChart,   text:"Odamni ishontirib, kelishuvga erishish",               type:'E'} },
  { id:14, text:"Qaysi vazifani tanlar edingiz?",                    optionA:{icon:BookOpen,    text:"O'quvchilarga dars berish va yo'naltirish",      type:'S'}, optionB:{icon:Database,    text:"Ma'lumotlar bazasini yuritish va tekshirish",          type:'C'} },
  { id:15, text:"Qaysi yondashuv sizga xos?",                        optionA:{icon:Rocket,      text:"Tavakkal qilib, yangi imkoniyatni sinash",       type:'E'}, optionB:{icon:ClipboardCheck,text:"Barqaror, oldindan rejalashtirilgan yo'ldan borish", type:'C'} },
];

// ─── Bosqich 2 — Baholash (24 ta: har bir tip uchun 4 tadan mustaqil savol) ──
// 2 tadan 4 taga oshirildi — bu ichki ishonchlilikni (reliability) sezilarli oshiradi.
const LIKERT: LikertQ[] = [
  { id:16, text:"Qo'limda biror narsani yig'ish, ta'mirlash yoki qurish menga yoqadi.",              type:'R' },
  { id:17, text:"Texnik asboblar yoki mexanizmlar bilan ishlashda o'zimni erkin his qilaman.",       type:'R' },
  { id:18, text:"Nazariyani o'qishdan ko'ra, amalda sinab ko'rishni afzal ko'raman.",                type:'R' },
  { id:19, text:"Ko'zga ko'rinadigan, aniq natija beruvchi ish menga ko'proq qoniqish beradi.",      type:'R' },
  { id:20, text:"Murakkab muammoni yechishdan oldin uni chuqur tahlil qilishni yaxshi ko'raman.",    type:'I' },
  { id:21, text:"Yangi ilmiy yoki texnik bilimlarni o'rganish meni qiziqtiradi.",                    type:'I' },
  { id:22, text:"Narsalarning qanday ishlashini tushunish uchun sababini izlayman.",                 type:'I' },
  { id:23, text:"Savolga javob topish uchun ma'lumot yig'ib, taqqoslashni yoqtiraman.",              type:'I' },
  { id:24, text:"O'z fikr va hissiyotlarimni ijodiy tarzda ifodalashni yaxshi ko'raman.",            type:'A' },
  { id:25, text:"Qat'iy qoidalardan ko'ra, erkin va original yondashuvni afzal ko'raman.",           type:'A' },
  { id:26, text:"Rang, shakl va kompozitsiyaga nisbatan tabiiy sezgirligim bor.",                    type:'A' },
  { id:27, text:"Odatiy yechim o'rniga yangi va kutilmagan g'oyalar taklif qilaman.",                type:'A' },
  { id:28, text:"Boshqalarga yordam berish yoki ularni o'qitish menga zavq bag'ishlaydi.",           type:'S' },
  { id:29, text:"Odamning muammosini tinglab, unga qo'llab-quvvatlash ko'rsatishni yaxshi ko'raman.",type:'S' },
  { id:30, text:"Jamoa bilan birga ishlaganda o'zimni yaxshi his qilaman.",                          type:'S' },
  { id:31, text:"Atrofimdagilarning kayfiyati va ehtiyojini tez sezaman.",                           type:'S' },
  { id:32, text:"Jamoani boshqarish yoki loyihani yetaklashdan qochmayman.",                         type:'E' },
  { id:33, text:"Yangi g'oya yoki mahsulotni odamlarga taqdim etib, ularni ishontira olaman.",       type:'E' },
  { id:34, text:"Maqsadga erishish uchun tavakkal qilishdan qo'rqmayman.",                           type:'E' },
  { id:35, text:"Raqobat muhiti meni tushkunlikka emas, balki harakatga undaydi.",                   type:'E' },
  { id:36, text:"Ma'lumotlarni tartibga solish va aniq hisob-kitob qilish menga yoqadi.",            type:'C' },
  { id:37, text:"Ishni oldindan rejalashtirib, bosqichma-bosqich bajarishni afzal ko'raman.",        type:'C' },
  { id:38, text:"Hujjat va raqamlardagi mayda xatolarni tez payqayman.",                             type:'C' },
  { id:39, text:"Aniq qoida va tartib mavjud bo'lgan muhitda samarali ishlayman.",                   type:'C' },
];

// ─── Bosqich 3 — Vaziyatli qaror (6 ta: har bir tip aynan 4 martadan) ────────
const MULTI_CHOICE: MultiChoiceQ[] = [
  {
    id:40,
    text:"Yangi startap loyihasi uchun jamoa yig'ilmoqda. Qaysi vazifani o'z zimmangizga olasiz?",
    options:[
      {label:'A',text:"Loyihaning vizual ko'rinishi va brendini yarataman",type:'A',icon:Palette},
      {label:'B',text:"Jamoa a'zolari bilan muloqotni yo'lga qo'yib, kayfiyatni saqlayman",type:'S',icon:Users},
      {label:'C',text:"Investorlar bilan uchrashib, loyihani taqdim etaman",type:'E',icon:Megaphone},
      {label:'D',text:"Byudjet va vazifalar jadvalini tuzib, nazorat qilaman",type:'C',icon:ClipboardList},
    ]
  },
  {
    id:41,
    text:"Maktabda \"Kasblar kuni\" tashkil etilmoqda va sizga vazifa berishdi:",
    options:[
      {label:'A',text:"Stend va jihozlarni o'z qo'lim bilan yig'aman",type:'R',icon:Hammer},
      {label:'B',text:"O'quvchilar bilan suhbat qurib, savollariga javob beraman",type:'S',icon:MessageCircle},
      {label:'C',text:"Tadbirni boshqarib, dasturni e'lon qilaman",type:'E',icon:Megaphone},
      {label:'D',text:"Ishtirokchilar ro'yxati va vaqt jadvalini yurataman",type:'C',icon:FileText},
    ]
  },
  {
    id:42,
    text:"Uy-ro'zg'or texnikasi ishdan chiqdi. Birinchi navbatda nima qilasiz?",
    options:[
      {label:'A',text:"Uni ochib, o'zim tuzatishga harakat qilaman",type:'R',icon:Wrench},
      {label:'B',text:"Internetdan sabab va yechimni izlab, tahlil qilaman",type:'I',icon:Search},
      {label:'C',text:"Yangisini xarid qilish uchun eng qulay taklifni topaman",type:'E',icon:TrendingUp},
      {label:'D',text:"Kafolat va texnik xizmat shartlarini diqqat bilan o'qib chiqaman",type:'C',icon:FileText},
    ]
  },
  {
    id:43,
    text:"Do'stingiz sizdan uyi uchun kitob javoni loyihalashni so'radi:",
    options:[
      {label:'A',text:"Yog'och va asboblar bilan o'zim yasab beraman",type:'R',icon:Cog},
      {label:'B',text:"Eng mustahkam va tejamli konstruksiyani hisoblab chiqaman",type:'I',icon:Calculator},
      {label:'C',text:"Chiroyli va original dizaynini chizib beraman",type:'A',icon:PenTool},
      {label:'D',text:"Aniq o'lcham va material ro'yxatini tayyorlayman",type:'C',icon:ClipboardList},
    ]
  },
  {
    id:44,
    text:"Bo'sh vaqtingizni qanday o'tkazishni afzal ko'rasiz?",
    options:[
      {label:'A',text:"Velosiped yoki texnikani ta'mirlab",type:'R',icon:Wrench},
      {label:'B',text:"Ilmiy-ommabop kitob yoki hujjatli film ko'rib",type:'I',icon:BookOpen},
      {label:'C',text:"Rasm chizib yoki musiqa yozib",type:'A',icon:Palette},
      {label:'D',text:"Do'stlar bilan uchrashib, suhbatlashib",type:'S',icon:Users},
    ]
  },
  {
    id:45,
    text:"Jamoada muhim qaror qabul qilish kerak bo'lganda, siz odatda:",
    options:[
      {label:'A',text:"Barcha ma'lumotni yig'ib, mantiqiy tahlil qilaman",type:'I',icon:FlaskConical},
      {label:'B',text:"Odatiy bo'lmagan, ijodiy yechim taklif qilaman",type:'A',icon:Sparkles},
      {label:'C',text:"Hammaning fikrini eshitib, umumiy kelishuvga harakat qilaman",type:'S',icon:HeartHandshake},
      {label:'D',text:"Tezda qaror qabul qilib, mas'uliyatni o'z zimmamga olaman",type:'E',icon:Rocket},
    ]
  },
];

const S2_PER_PAGE = 4;
const S2_PAGES = Math.ceil(LIKERT.length / S2_PER_PAGE);
const TOTAL_Q = FORCED_CHOICE.length + LIKERT.length + MULTI_CHOICE.length;

const COURSES: Course[] = [
  { id:'foundation',         name:'Foundation',                   url:'/kurslar/foundation',         riasec:{R:20,I:40,A:5, S:5, E:10,C:20}, desc:"Python, algoritm va dasturlash asoslari. IT ga birinchi qadam.", minAge:15, maxAge:99 },
  { id:'python-bi',          name:'Web dasturlash: Python BI',     url:'/kurslar/python-bi',          riasec:{R:15,I:45,A:5, S:5, E:10,C:20}, desc:"Python yordamida web va biznes tahlil (BI) dasturlash.", minAge:15, maxAge:99 },
  { id:'frontend',           name:'Frontend Web Dasturlash',       url:'/kurslar/frontend',           riasec:{R:10,I:35,A:25,S:5, E:10,C:15}, desc:"HTML, CSS, JavaScript va React bilan zamonaviy saytlar yaratish.", minAge:15, maxAge:99 },
  { id:'robototexnika',      name:'Robototexnika',                 url:'/kurslar/robototexnika',      riasec:{R:35,I:30,A:5, S:5, E:10,C:15}, desc:"Robot qurish, dasturlash va muhandislik asoslari.", minAge:7, maxAge:15 },
  { id:'grafik-dizayn',      name:'Grafik Dizayn',                 url:'/kurslar/grafik-dizayn',      riasec:{R:5, I:10,A:55,S:5, E:10,C:15}, desc:"Logo, brend va vizual materiallar yaratish. Photoshop, Illustrator.", minAge:15, maxAge:99 },
  { id:'arxitektura-dizayn', name:'Arxitektura va Dizayn',         url:'/kurslar/arxitektura-dizayn', riasec:{R:15,I:20,A:45,S:5, E:10,C:5},  desc:"Arxitektura loyihalash va interyer dizayn asoslari.", minAge:15, maxAge:99 },
  { id:'videografiya',       name:'Videografiya',                  url:'/kurslar/videografiya',       riasec:{R:10,I:10,A:50,S:10,E:15,C:5},  desc:"Video suratga olish, montaj va professional kontent yaratish.", minAge:15, maxAge:99 },
  { id:'mobilografiya',      name:'Mobilografiya',                 url:'/kurslar/mobilografiya',      riasec:{R:10,I:10,A:45,S:15,E:10,C:10}, desc:"Telefon orqali professional foto va video olish mahorati.", minAge:15, maxAge:99 },
  { id:'ai-media',           name:'AI MEDIA',                      url:'/kurslar/ai-media',           riasec:{R:5, I:20,A:40,S:10,E:15,C:10}, desc:"Sun'iy intellekt vositalari bilan media kontent yaratish.", minAge:15, maxAge:99 },
  { id:'smm',                name:'SMM',                           url:'/kurslar/smm',                riasec:{R:5, I:15,A:30,S:25,E:20,C:5},  desc:"Ijtimoiy tarmoqlarni boshqarish, kontent strategiyasi.", minAge:15, maxAge:99 },
  { id:'buxgalteriya',       name:'Zamonaviy Buxgalteriya (1C)',   url:'/kurslar/buxgalteriya',       riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Buxgalteriya asoslari va 1C dasturida ishlash.", minAge:15, maxAge:99 },
  { id:'excel-pro',          name:'Excel Pro',                     url:'/kurslar/excel-pro',          riasec:{R:5, I:25,A:5, S:10,E:15,C:40}, desc:"Microsoft Excel da professional darajada ishlash.", minAge:15, maxAge:99 },
  { id:'hr-menejer',         name:'HR Menejerligi',                url:'/kurslar/hr-menejer',         riasec:{R:5, I:20,A:10,S:30,E:25,C:10}, desc:"Kadrlar boshqaruvi, suhbat o'tkazish va HR strategiyasi.", minAge:15, maxAge:99 },
  { id:'ofis-dasturlari',    name:'Ofis Dasturlarida Ishlash',     url:'/kurslar/ofis-dasturlari',    riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Word, Excel, PowerPoint va ofis vositalari bilan ishlash.", minAge:15, maxAge:99 },
  { id:'kids-web',           name:'Web Dasturlash (Kids)',         url:'/kurslar/kids-web',           riasec:{R:15,I:30,A:25,S:15,E:5, C:10}, desc:"Bolalar uchun qiziqarli dasturlash kursi — o'yin orqali o'rganish.", minAge:7, maxAge:13 },
];

const RIASEC_INFO: Record<RiasecType, { name: string; short: string; desc: string; careers: string; color: string; icon: LucideIcon }> = {
  R: { name:'Amaliy (Realistic)', short:'Amaliy',
       desc:"Aniq, qo'l bilan bajariladigan va o'lchanadigan natija beruvchi ishlarga moyilsiz. Texnik tizimlar, asboblar va jismoniy jarayonlar bilan ishlash sizga tabiiy keladi.",
       careers:"Muhandis, texnik mutaxassis, robototexnik, ishlab chiqarish operatori",
       color:'#f59e0b', icon: Wrench },
  I: { name:'Tadqiqotchi (Investigative)', short:'Tadqiqotchi',
       desc:"Tahlil qilish, kuzatish va mantiqiy xulosa chiqarish sizning kuchli tomoningiz. Murakkab muammolarni tushunish va ilmiy yondashuv sizni qiziqtiradi.",
       careers:"Dasturchi, ma'lumot tahlilchisi, tadqiqotchi, tizim arxitektori",
       color:'#8b5cf6', icon: FlaskConical },
  A: { name:'Ijodkor (Artistic)', short:'Ijodkor',
       desc:"Erkin, original va estetik ifodaga moyilsiz. Qat'iy tuzilmadan ko'ra, yangi g'oyalar va o'ziga xos yechimlar yaratish sizga yaqin.",
       careers:"Grafik dizayner, videograf, kontent yaratuvchi, arxitektor",
       color:'#ec4899', icon: Palette },
  S: { name:'Ijtimoiy (Social)', short:'Ijtimoiy',
       desc:"Odamlar bilan ishlash, ularga yordam berish va o'rgatish sizga energiya beradi. Empatiya va muloqot sizning tabiiy qobiliyatingiz.",
       careers:"O'qituvchi, HR mutaxassisi, murabbiy, mijozlar bilan ishlash menejeri",
       color:'#10b981', icon: Heart },
  E: { name:'Tadbirkor (Enterprising)', short:'Tadbirkor',
       desc:"Boshqarish, ishontirish va natijaga erishish uchun harakat qilish sizga xos. Tashabbuskorlik va raqobat muhiti sizni ilhomlantiradi.",
       careers:"Marketolog, loyiha menejeri, tadbirkor, savdo bo'limi rahbari",
       color:'#0061ff', icon: Rocket },
  C: { name:'Tartibli (Conventional)', short:'Tartibli',
       desc:"Tizimlilik, aniqlik va tartibga rioya qilish sizga mos. Ma'lumotlar bilan ishlash va belgilangan qoidalar doirasida samarali ishlaysiz.",
       careers:"Buxgalter, ma'lumotlar operatori, ofis menejeri, moliyaviy tahlilchi",
       color:'#06b6d4', icon: ClipboardList },
};

const STRENGTHS: Record<number, { name: string; icon: LucideIcon; desc: string }> = {
  16: { name:'Amaliy mahorat',        icon: Wrench,          desc:"Qo'l bilan ishlashda va texnik vazifalarda kuchlisiz" },
  17: { name:'Texnik qobiliyat',      icon: Cpu,             desc:"Texnologik vositalarni tez o'rganasiz" },
  18: { name:'Amaliy yondashuv',      icon: Hammer,          desc:"Nazariyani amalda sinab ko'rishni afzal ko'rasiz" },
  19: { name:"Natijaga yo'naltirilgan", icon: Target,        desc:"Aniq va ko'zga ko'rinadigan natijaga intilasiz" },
  20: { name:'Tahliliy fikrlash',     icon: Brain,           desc:"Muammolarni mantiqiy va tizimli hal qilasiz" },
  21: { name:'Bilimga chanqoqlik',    icon: Search,          desc:"Yangi bilim va tadqiqotga qiziqasiz" },
  22: { name:'Sababni izlash',        icon: Telescope,       desc:"Narsalarning mohiyatini tushunishga intilasiz" },
  23: { name:'Ma\'lumot bilan ishlash',icon: Library,        desc:"Ma'lumot yig'ib, taqqoslab xulosa chiqarasiz" },
  24: { name:'Kreativlik',            icon: Sparkles,        desc:"Yangi g'oyalar va noodatiy yechimlar topasiz" },
  25: { name:'Original fikrlash',     icon: Palette,         desc:"Erkin va o'ziga xos yondashuvni afzal ko'rasiz" },
  26: { name:'Estetik sezgi',         icon: Brush,           desc:"Rang, shakl va kompozitsiyani nozik his qilasiz" },
  27: { name:'Innovatsion g\'oyalar', icon: Lightbulb,       desc:"Kutilmagan va yangicha yechimlar taklif qilasiz" },
  28: { name:'Pedagogik qobiliyat',   icon: GraduationCap,   desc:"Bilimingizni boshqalarga tushuntira olasiz" },
  29: { name:'Empatiya',              icon: HeartHandshake,  desc:"Odamlarni tushunib, ular bilan ishonch o'rnata olasiz" },
  30: { name:'Jamoaviylik',           icon: Users,           desc:"Jamoada birgalikda samarali ishlaysiz" },
  31: { name:'Ijtimoiy sezgirlik',    icon: HandHeart,       desc:"Atrofdagilarning ehtiyojini tez sezasiz" },
  32: { name:'Yetakchilik',           icon: Crown,           desc:"Jamoani boshqarish va yo'naltirish sizga mos" },
  33: { name:'Ishontirish',           icon: Megaphone,       desc:"G'oyalaringizni taqdim etib, odamlarni ishontira olasiz" },
  34: { name:'Tashabbuskorlik',       icon: Rocket,          desc:"Tavakkal qilib, yangi imkoniyatlarni sinaysiz" },
  35: { name:'Raqobatbardoshlik',     icon: TrendingUp,      desc:"Raqobat muhitida yanada faol ishlaysiz" },
  36: { name:'Aniqlik',               icon: Calculator,      desc:"Hisob-kitob va ma'lumot bilan aniq ishlaysiz" },
  37: { name:'Rejalashtirish',        icon: CalendarCheck,   desc:"Ishni bosqichma-bosqich va tartibli bajarasiz" },
  38: { name:'Diqqatlilik',           icon: ClipboardCheck,  desc:"Mayda tafsilotlarga e'tibor berib, sifatni ta'minlaysiz" },
  39: { name:'Tartiblilik',           icon: Layers,          desc:"Tizimli va tartibli muhitda samarali ishlaysiz" },
};

// ─── Yordamchi: tasodifiy tartib (pozitsion moyillikni yo'qotish uchun) ──────
function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Ballash: har bir bosqich normallashtiriladi va teng hissa qo'shadi ──────
// Bu — avvalgi versiyadagi 37.5% / 25% / 37.5% nomutanosibligini bartaraf etadi.
function computePercentages(
  s1Answers: Record<number, 'a' | 'b'>,
  s2Answers: Record<number, number>,
  s3Answers: Record<number, 'A' | 'B' | 'C' | 'D'>
): Record<RiasecType, number> {
  const s1: Record<RiasecType, number> = { R:0,I:0,A:0,S:0,E:0,C:0 };
  const s2: Record<RiasecType, number> = { R:0,I:0,A:0,S:0,E:0,C:0 };
  const s3: Record<RiasecType, number> = { R:0,I:0,A:0,S:0,E:0,C:0 };

  FORCED_CHOICE.forEach(q => {
    const ans = s1Answers[q.id];
    if (ans === 'a') s1[q.optionA.type] += 1;
    else if (ans === 'b') s1[q.optionB.type] += 1;
  });
  LIKERT.forEach(q => {
    const v = s2Answers[q.id];
    if (v) s2[q.type] += v;
  });
  MULTI_CHOICE.forEach(q => {
    const ans = s3Answers[q.id];
    if (ans) {
      const opt = q.options.find(o => o.label === ans);
      if (opt) s3[opt.type] += 1;
    }
  });

  // Har bosqichda tipning maksimal mumkin bo'lgan balli
  const S1_MAX = 5;              // har tip 5 ta juftlikda uchraydi
  const S2_MIN = 4, S2_MAX = 20; // 4 ta savol × (1..5)
  const S3_MAX = 4;              // har tip 4 ta vaziyatda variant sifatida uchraydi

  const combined = {} as Record<RiasecType, number>;
  TYPES.forEach(t => {
    const n1 = s1[t] / S1_MAX;
    const n2 = Math.max(0, (s2[t] - S2_MIN) / (S2_MAX - S2_MIN));
    const n3 = s3[t] / S3_MAX;
    combined[t] = (n1 + n2 + n3) / 3; // 0..1, uchala bosqich teng hissa
  });

  const total = TYPES.reduce((sum, t) => sum + combined[t], 0);
  const result = {} as Record<RiasecType, number>;
  if (!total) { TYPES.forEach(t => result[t] = 0); return result; }

  // Yig'indi aynan 100% bo'lishi uchun eng katta qoldiqqa yaxlitlash
  const exact = TYPES.map(t => ({ t, v: combined[t] / total * 100 }));
  exact.forEach(e => result[e.t] = Math.floor(e.v));
  let remainder = 100 - TYPES.reduce((s, t) => s + result[t], 0);
  exact.sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)));
  for (let i = 0; i < remainder; i++) result[exact[i % exact.length].t] += 1;
  return result;
}

/** Tiplarni foiz bo'yicha tartiblash (teng bo'lsa olti burchak tartibi bilan barqaror ajratish) */
function sortedTypes(pcts: Record<RiasecType, number>): RiasecType[] {
  return [...TYPES].sort((a, b) => (pcts[b] - pcts[a]) || (HEX_ORDER.indexOf(a) - HEX_ORDER.indexOf(b)));
}

/** Holland Kodi — eng yuqori 3 ta tip (masalan "SEC") */
function getHollandCode(pcts: Record<RiasecType, number>): RiasecType[] {
  return sortedTypes(pcts).slice(0, 3);
}

/** Natija sifati: differensiatsiya, izchillik va ishonchlilik darajasi */
function computeQuality(pcts: Record<RiasecType, number>, s2Answers: Record<number, number>): QualityMetrics {
  const s = sortedTypes(pcts);
  const differentiation = pcts[s[0]] - pcts[s[5]];
  const consistencyDistance = hexDistance(s[0], s[1]); // 1 = qo'shni (izchil), 3 = qarama-qarshi
  const distinctRatings = new Set(Object.values(s2Answers)).size;

  let confidence = 45;
  confidence += Math.min(30, differentiation * 1.1);                                  // aniq ajralgan profil
  confidence += consistencyDistance === 1 ? 15 : consistencyDistance === 2 ? 8 : 0;    // Holland izchilligi
  confidence += distinctRatings >= 4 ? 10 : distinctRatings >= 3 ? 5 : 0;              // javoblar xilma-xilligi
  confidence = Math.max(20, Math.min(99, Math.round(confidence)));

  return { differentiation, consistencyDistance, distinctRatings, confidence };
}

/**
 * Iachan moslik indeksi (Iachan, 1984) — vokatsion psixologiyada standart.
 * Shaxs va kasb Holland kodlarining har bir o'rnidagi mos kelishini vaznlaydi.
 */
const IACHAN = [[22, 10, 4], [10, 5, 2], [4, 2, 1]];
function iachanAgreement(personCode: RiasecType[], courseCode: RiasecType[]): number {
  let sum = 0;
  personCode.slice(0, 3).forEach((t, pi) => {
    const ci = courseCode.indexOf(t);
    if (ci >= 0 && ci < 3) sum += IACHAN[pi][ci];
  });
  return sum / 28; // 0..1
}

function matchCourses(pcts: Record<RiasecType, number>, age: number | null): CourseResult[] {
  const personCode = getHollandCode(pcts);

  const scored = COURSES.map(course => {
    const courseTotal = TYPES.reduce((s, t) => s + course.riasec[t], 0);

    // 1) Kosinus o'xshashligi — to'liq 6 o'lchovli profil shakli
    let dot = 0, magU = 0, magC = 0;
    TYPES.forEach(t => {
      const u = pcts[t] / 100;
      const c = course.riasec[t] / courseTotal;
      dot += u * c; magU += u * u; magC += c * c;
    });
    const denom = Math.sqrt(magU) * Math.sqrt(magC);
    const cosine = denom > 0 ? dot / denom : 0;

    // 2) Iachan indeksi — Holland kodlari darajasidagi moslik
    const courseCode = [...TYPES].sort((a, b) => course.riasec[b] - course.riasec[a]).slice(0, 3);
    const iachan = iachanAgreement(personCode, courseCode);

    const matchScore = Math.min(99, Math.max(15, Math.round((0.6 * cosine + 0.4 * iachan) * 100)));
    const ageOk = age == null || (age >= course.minAge && age <= course.maxAge);
    return { course, matchScore, rank: 0, ageOk };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Yoshga mos kelmaydigan kurslar butunlay chiqarib tashlanadi — ular ro'yxatni
  // to'ldirish uchun ham ishlatilmaydi. Aks holda 10 yoshli bolaga 15+ kurs, yoki
  // kattaga bolalar kursi tavsiya qilinib qolardi.
  const appropriate = scored.filter(s => s.ageOk);
  // Himoya choragi: agar yoshga mos kurs umuman topilmasa, bo'sh ekran o'rniga
  // eng mos 3 tasi ko'rsatiladi (amaldagi yosh oralig'ida bunday holat yuz bermaydi).
  const pool = appropriate.length > 0 ? appropriate : scored;
  return pool
    .slice(0, 3)
    .map(({ course, matchScore }, i) => ({ course, matchScore, rank: i + 1 }));
}

function topStrengthsOf(s2Answers: Record<number, number>) {
  const entries = Object.entries(s2Answers) as unknown as [string, number][];
  const strong = entries
    .filter(([, v]) => v >= 4)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([id]) => STRENGTHS[Number(id)])
    .filter(Boolean);
  if (strong.length > 0) return strong;
  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([id]) => STRENGTHS[Number(id)])
    .filter(Boolean);
}

const diffLabel = (d: number) => d >= 25 ? 'Yuqori' : d >= 15 ? "O'rtacha" : 'Past';
const consLabel = (d: number) => d === 1 ? 'Yuqori' : d === 2 ? "O'rtacha" : 'Past';

// ─── Sub-components ───────────────────────────────────────────────────────────
function StageProgress({ stage, current, total, isDark }: { stage: Stage; current: number; total: number; isDark: boolean }) {
  const pct = Math.round((current / total) * 100);
  const stageLabels = ['Majburiy Tanlov', 'Baholash', 'Vaziyatli Qaror'];
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#0061ff' }}
                initial={{ width: 0 }}
                animate={{ width: s < stage ? '100%' : s === stage ? `${pct}%` : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Bosqich {stage} / 3 · {stageLabels[stage - 1]}
        </span>
        <span className="text-xs font-black" style={{ color: '#0061ff' }}>Savol {current} / {total}</span>
      </div>
    </div>
  );
}

function CircularProgress({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── PDF: jsPDF bilan vektor chizma (sahifa skrinshoti emas) ────────────────
async function generateCareerTestPdf(params: {
  name: string;
  age: string;
  gender: Gender;
  percentages: Record<RiasecType, number>;
  hollandCode: RiasecType[];
  results: CourseResult[];
  strengths: { name: string; desc: string }[];
  quality: QualityMetrics;
}) {
  const { jsPDF } = await import('jspdf');
  const { name, age, gender, percentages, hollandCode, results, strengths, quality } = params;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 18;
  const contentW = pageW - marginX * 2;
  const brand = { r: 0, g: 97, b: 255 };
  let y = 0;
  let pageNum = 1;

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)] as [number, number, number];
  };

  const drawFooter = () => {
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text("DATA Ta'lim Stansiyasi · Holland RIASEC Karyera Testi Hisoboti", marginX, pageH - 10);
    doc.text(`${pageNum}-bet`, pageW - marginX, pageH - 10, { align: 'right' });
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 18) { drawFooter(); doc.addPage(); pageNum += 1; y = 18; }
  };

  const heading = (t: string, size = 13) => {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(15, 23, 42);
    doc.text(t, marginX, y);
    y += 2;
    doc.setDrawColor(brand.r, brand.g, brand.b); doc.setLineWidth(0.6);
    doc.line(marginX, y, marginX + 14, y);
    y += 7;
  };

  const paragraph = (t: string, size = 10, color: [number, number, number] = [71, 85, 105]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    (doc.splitTextToSize(t, contentW) as string[]).forEach(line => {
      ensureSpace(6); doc.text(line, marginX, y); y += 5.2;
    });
  };

  // ── Sarlavha ──
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('DATA', marginX, 13);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text("TA'LIM STANSIYASI", marginX, 19);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('KARYERA TESTI HISOBOTI', pageW - marginX, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }), pageW - marginX, 18, { align: 'right' });
  y = 38;

  // ── Ishtirokchi ──
  heading("Ishtirokchi Ma'lumotlari", 12);
  const genderLabel = gender === 'male' ? 'Erkak' : gender === 'female' ? 'Ayol' : "Ko'rsatilmagan";
  doc.setFontSize(10); doc.setTextColor(51, 65, 85); doc.setFont('helvetica', 'normal');
  doc.text(`Ism: ${name || "Ko'rsatilmagan"}     Yosh: ${age || "Ko'rsatilmagan"}     Jins: ${genderLabel}`, marginX, y);
  y += 10;

  // ── Metodologiya ──
  heading('Metodologiya');
  paragraph(
    "Hisobot Jon Holland (John L. Holland, 1997) RIASEC kasbiy qiziqishlar nazariyasiga asoslanadi. " +
    `Test ${TOTAL_Q} ta savoldan iborat: ${FORCED_CHOICE.length} ta majburiy tanlov (barcha 15 ta tip juftligi aynan bir martadan taqqoslanadi), ` +
    `${LIKERT.length} ta o'z-o'zini baholash (har bir tip uchun 4 tadan mustaqil savol) va ${MULTI_CHOICE.length} ta vaziyatli qaror. ` +
    "Har uchala bosqich normallashtirilib, yakuniy ballga teng hissa qo'shadi. Variantlar tasodifiy tartibda ko'rsatiladi — " +
    "bu javob berishdagi pozitsion moyillikning oldini oladi."
  );
  y += 3;

  // ── Holland kodi ──
  ensureSpace(24);
  doc.setFillColor(240, 246, 255);
  doc.roundedRect(marginX, y, contentW, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(brand.r, brand.g, brand.b);
  doc.text('SIZNING HOLLAND KODINGIZ', marginX + 6, y + 8);
  doc.setFontSize(16);
  doc.text(hollandCode.join(''), marginX + 6, y + 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
  doc.text(hollandCode.map(t => RIASEC_INFO[t].short).join('  >  '), marginX + 45, y + 13);
  y += 28;

  // ── Olti burchakli profil grafigi ──
  heading('RIASEC Profil Grafigi');
  ensureSpace(90);
  const cx = pageW / 2, cy = y + 40, R = 32;
  const pt = (r: number, i: number) => {
    const ang = (-90 + i * 60) * Math.PI / 180;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as [number, number];
  };
  // to'r
  doc.setDrawColor(214, 222, 233); doc.setLineWidth(0.2);
  [0.25, 0.5, 0.75, 1].forEach(f => {
    for (let i = 0; i < 6; i++) {
      const p1 = pt(R * f, i), p2 = pt(R * f, (i + 1) % 6);
      doc.line(p1[0], p1[1], p2[0], p2[1]);
    }
  });
  for (let i = 0; i < 6; i++) { const p = pt(R, i); doc.line(cx, cy, p[0], p[1]); }
  // ma'lumot ko'pburchagi (50% = to'liq radius)
  const dataPts = HEX_ORDER.map((t, i) => pt(R * Math.min(1, percentages[t] / 50), i));
  doc.setDrawColor(brand.r, brand.g, brand.b); doc.setLineWidth(0.9);
  doc.setFillColor(0, 97, 255);
  for (let i = 0; i < 6; i++) {
    const p1 = dataPts[i], p2 = dataPts[(i + 1) % 6];
    doc.line(p1[0], p1[1], p2[0], p2[1]);
  }
  dataPts.forEach(p => doc.circle(p[0], p[1], 1.1, 'F'));
  // yorliqlar
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  HEX_ORDER.forEach((t, i) => {
    const p = pt(R + 8, i);
    const [rr, gg, bb] = hexToRgb(RIASEC_INFO[t].color);
    doc.setTextColor(rr, gg, bb);
    doc.text(`${RIASEC_INFO[t].short} ${percentages[t]}%`, p[0], p[1], { align: 'center' });
  });
  y = cy + R + 18;

  // ── Sifat ko'rsatkichlari ──
  heading('Natijaning Ishonchlilik Ko\'rsatkichlari');
  ensureSpace(30);
  const boxW = (contentW - 8) / 3;
  const boxes = [
    ['Ishonchlilik', `${quality.confidence}%`],
    ['Differensiatsiya', `${diffLabel(quality.differentiation)} (${quality.differentiation}%)`],
    ['Izchillik', consLabel(quality.consistencyDistance)],
  ];
  boxes.forEach(([label, val], i) => {
    const bx = marginX + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(bx, y, boxW, 18, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), bx + 4, y + 6.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(brand.r, brand.g, brand.b);
    doc.text(String(val), bx + 4, y + 14);
  });
  y += 24;
  paragraph(
    "Differensiatsiya — profilingizdagi eng yuqori va eng past tip orasidagi farq: yuqori bo'lsa qiziqishlaringiz aniq ajralgan. " +
    "Izchillik — Holland olti burchagida ustuvor ikki tipingiz qanchalik yaqin joylashgani: yuqori bo'lsa ular bir-birini tabiiy to'ldiradi.",
    8.7, [100, 116, 139]
  );
  y += 3;

  // ── To'liq RIASEC tavsifi ──
  heading('RIASEC Profili — Barcha Tiplar');
  sortedTypes(percentages).forEach(t => {
    ensureSpace(26);
    const info = RIASEC_INFO[t];
    const [rr, gg, bb] = hexToRgb(info.color);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
    doc.text(info.name, marginX, y);
    doc.setTextColor(rr, gg, bb);
    doc.text(`${percentages[t]}%`, marginX + contentW, y, { align: 'right' });
    y += 3;
    doc.setFillColor(238, 242, 247);
    doc.roundedRect(marginX, y, contentW, 3, 1.5, 1.5, 'F');
    doc.setFillColor(rr, gg, bb);
    doc.roundedRect(marginX, y, Math.max(contentW * (percentages[t] / 100), 3), 3, 1.5, 1.5, 'F');
    y += 6;
    paragraph(info.desc, 8.7, [100, 116, 139]);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120, 130, 145);
    ensureSpace(6);
    doc.text(`Tipik kasblar: ${info.careers}`, marginX, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  });

  // ── Kuchli tomonlar ──
  if (strengths.length > 0) {
    heading('Kuchli Tomonlar');
    strengths.forEach(s => {
      ensureSpace(7);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(15, 23, 42);
      doc.text(`•  ${s.name}`, marginX, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.setFontSize(8.7);
      doc.text(s.desc, marginX + 48, y);
      y += 6.2;
    });
    y += 3;
  }

  // ── Kurslar ──
  heading('Tavsiya Etilgan Kurslar');
  paragraph(
    "Moslik foizi ikki ko'rsatkich asosida hisoblanadi: profil shakli o'xshashligi (kosinus) va Holland kodlari mosligi (Iachan indeksi, 1984). " +
    "Kurslar yosh chegarasi bo'yicha ham filtrlanadi.",
    8.7, [100, 116, 139]
  );
  y += 2;
  results.forEach(r => {
    ensureSpace(26);
    const isTop = r.rank === 1;
    doc.setFillColor(isTop ? 240 : 248, isTop ? 246 : 250, isTop ? 255 : 252);
    doc.roundedRect(marginX, y, contentW, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(brand.r, brand.g, brand.b);
    doc.text(`#${r.rank}`, marginX + 5, y + 9);
    doc.setTextColor(15, 23, 42);
    doc.text(r.course.name, marginX + 16, y + 9);
    doc.setFontSize(13); doc.setTextColor(brand.r, brand.g, brand.b);
    doc.text(`${r.matchScore}%`, marginX + contentW - 5, y + 9, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
    doc.text((doc.splitTextToSize(r.course.desc, contentW - 22) as string[]).slice(0, 2), marginX + 16, y + 15);
    y += 26;
  });

  drawFooter();
  return doc;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerTest() {
  const { isDark } = useTheme();
  const [view, setView] = useState<View>('intro');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState<Gender>('');
  const [stage, setStage] = useState<Stage>(1);
  const [currentQ, setCurrentQ] = useState(0);
  const [s1Answers, setS1Answers] = useState<Record<number, 'a' | 'b'>>({});
  const [s2Answers, setS2Answers] = useState<Record<number, number>>({});
  const [s3Answers, setS3Answers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [s2Page, setS2Page] = useState(0);
  const [results, setResults] = useState<CourseResult[]>([]);
  const [percentages, setPercentages] = useState<Record<RiasecType, number>>({ R:0,I:0,A:0,S:0,E:0,C:0 });
  const [quality, setQuality] = useState<QualityMetrics>({ differentiation:0, consistencyDistance:1, distinctRatings:0, confidence:0 });
  const [enrollCourse, setEnrollCourse] = useState<{ name: string; id: string } | null>(null);
  const [calcDots, setCalcDots] = useState(0);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  // Variantlar tasodifiy tartibda — pozitsion moyillikning oldini oladi
  const [fcSwap, setFcSwap] = useState<boolean[]>(() => FORCED_CHOICE.map(() => Math.random() < 0.5));
  const [mcOrder, setMcOrder] = useState<number[][]>(() => MULTI_CHOICE.map(() => shuffledIndices(4)));
  const calcTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionLockRef = useRef(false);
  // Kutilayotgan animatsiya taymerlari. Ular bekor qilinmasa, "Qayta"/"Orqaga"
  // bosilganda eski taymer allaqachon almashgan ekranning holatini o'zgartirib
  // yuboradi va AnimatePresence chiqish animatsiyasida qotib qoladi.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** setTimeout — bekor qilinishi mumkin bo'lgan ro'yxatga yozib boradi */
  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    pendingTimersRef.current.push(id);
    return id;
  }

  /** Barcha kutilayotgan taymerlarni to'xtatadi va o'tish qulfini ochadi */
  function clearPending() {
    pendingTimersRef.current.forEach(clearTimeout);
    pendingTimersRef.current = [];
    if (calcTimerRef.current) { clearInterval(calcTimerRef.current); calcTimerRef.current = null; }
    transitionLockRef.current = false;
  }

  // Komponent yopilganda ham taymerlar qolib ketmasligi kerak
  useEffect(() => clearPending, []);

  const overallQ = stage === 1 ? currentQ + 1
    : stage === 2 ? FORCED_CHOICE.length + s2Page * S2_PER_PAGE + 1
    : FORCED_CHOICE.length + LIKERT.length + currentQ + 1;

  const bg = isDark ? 'transparent' : 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 30%, #ffffff 100%)';
  const card = isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';

  const ageNum = parseInt(userAge, 10);
  const ageValid = userAge.trim() !== '' && Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 90;
  const genderValid = userGender !== '';
  const canStart = ageValid && genderValid;

  function startTest() {
    if (!canStart) return;
    clearPending();
    setView('test'); setStage(1); setCurrentQ(0);
    setS1Answers({}); setS2Answers({}); setS3Answers({}); setS2Page(0);
    setFcSwap(FORCED_CHOICE.map(() => Math.random() < 0.5));
    setMcOrder(MULTI_CHOICE.map(() => shuffledIndices(4)));
    window.scrollTo(0, 0);
  }

  function restartTest() {
    clearPending();
    setView('intro'); setResults([]); setPercentages({ R:0,I:0,A:0,S:0,E:0,C:0 });
    window.scrollTo(0, 0);
  }

  function goBack() {
    clearPending();
    if (stage === 1) { if (currentQ > 0) setCurrentQ(q => q - 1); }
    else if (stage === 2) {
      if (s2Page > 0) setS2Page(p => p - 1);
      else { setStage(1); setCurrentQ(FORCED_CHOICE.length - 1); }
    } else {
      if (currentQ > 0) setCurrentQ(q => q - 1);
      else { setStage(2); setS2Page(S2_PAGES - 1); }
    }
  }

  function handleS1(answer: 'a' | 'b') {
    if (transitionLockRef.current) return;
    // Indeks chegaralanadi va keyingi qadam absolyut qiymat bilan o'rnatiladi —
    // bu tez ketma-ket bosishda indeksning massivdan oshib ketishini butunlay yo'q qiladi.
    const idx = Math.min(currentQ, FORCED_CHOICE.length - 1);
    const q = FORCED_CHOICE[idx];
    if (!q) return;
    transitionLockRef.current = true;
    setS1Answers(prev => ({ ...prev, [q.id]: answer }));
    schedule(() => {
      if (idx < FORCED_CHOICE.length - 1) setCurrentQ(idx + 1);
      else { setStage(2); setS2Page(0); setCurrentQ(0); }
    }, 350);
    schedule(() => { transitionLockRef.current = false; }, 700);
  }

  function handleS2Next() {
    if (s2Page < S2_PAGES - 1) setS2Page(p => p + 1);
    else { setStage(3); setCurrentQ(0); }
  }

  function handleS3(answer: 'A' | 'B' | 'C' | 'D') {
    if (transitionLockRef.current) return;
    const idx = Math.min(currentQ, MULTI_CHOICE.length - 1);
    const q = MULTI_CHOICE[idx];
    if (!q) return;
    transitionLockRef.current = true;
    const newS3 = { ...s3Answers, [q.id]: answer };
    setS3Answers(newS3);
    const isLast = idx >= MULTI_CHOICE.length - 1;
    schedule(() => {
      if (!isLast) {
        setCurrentQ(idx + 1);
      } else {
        setView('calculating');
        window.scrollTo(0, 0);
        calcTimerRef.current = setInterval(() => setCalcDots(d => (d + 1) % 4), 500);
        schedule(() => {
          if (calcTimerRef.current) { clearInterval(calcTimerRef.current); calcTimerRef.current = null; }
          const pcts = computePercentages(s1Answers, s2Answers, newS3);
          setPercentages(pcts);
          setQuality(computeQuality(pcts, s2Answers));
          setResults(matchCourses(pcts, ageValid ? ageNum : null));
          setView('result');
          window.scrollTo(0, 0);
          trackSiteEvent('career_test_complete');
        }, 2500);
      }
    }, 350);
    schedule(() => { transitionLockRef.current = false; }, isLast ? 350 : 700);
  }

  async function handleDownloadPdf() {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const doc = await generateCareerTestPdf({
        name: userName, age: userAge, gender: userGender,
        percentages, hollandCode, results, strengths: displayStrengths, quality,
      });
      doc.save(`Karyera-Testi-Natijasi${userName ? '-' + userName.replace(/\s+/g, '_') : ''}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setGeneratingPdf(false);
    }
  }

  const likertPageQs = LIKERT.slice(s2Page * S2_PER_PAGE, s2Page * S2_PER_PAGE + S2_PER_PAGE);
  const s2PageComplete = likertPageQs.every(q => s2Answers[q.id] !== undefined);
  const likertScale = [1, 2, 3, 4, 5];

  const displayStrengths = topStrengthsOf(s2Answers);
  const hollandCode = getHollandCode(percentages);
  const ordered = sortedTypes(percentages);
  const radarData = HEX_ORDER.map(t => ({ type: RIASEC_INFO[t].short, value: percentages[t] }));

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: bg }}>
      <SEO
        title="Karyera Testi | Data Talim"
        description="Holland RIASEC ilmiy modeliga asoslangan karyera testi. O'zingizga mos IT kursini toping."
      />
      <PatternBg color={isDark ? '#ffffff' : '#0061ff'} opacity={isDark ? 0.02 : 0.025} />
      <FloatingStars />

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {view === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }}
            transition={{ duration:0.5 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-6"
          >
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className={`text-2xl sm:text-3xl md:text-4xl font-black text-center mb-2 tracking-tight uppercase ${text}`}>
              Kelajak kasbingizni <span className="text-[#0061ff]">aniqlang</span>
            </motion.h1>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }} className={`text-sm sm:text-base text-center max-w-xl mb-1 leading-snug ${sub}`}>
              Holland RIASEC ilmiy modeliga asoslangan {TOTAL_Q} ta savol — sizga eng mos IT yo'nalishini aniqlaymiz.
            </motion.p>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.26 }} className={`text-[11px] text-center max-w-2xl mb-3 leading-snug ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              J. Holland (1997) nazariyasi · barcha 15 ta tip juftligi taqqoslanadi · har bosqich teng vaznda · variantlar tasodifiy tartibda
            </motion.p>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} className="flex flex-wrap gap-2 justify-center mb-4">
              {[
                { icon: ClipboardCheck, label: '~12 daqiqa' },
                { icon: Target, label: `${TOTAL_Q} savol` },
                { icon: Trophy, label: '3 bosqich' },
                { icon: FileText, label: 'PDF hisobot' },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${isDark ? 'bg-slate-800/60 border-white/10 text-slate-300 backdrop-blur-xl' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                  <item.icon size={12} style={{ color: '#0061ff' }} /><span>{item.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Demographics */}
            <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.36 }} className={`w-full max-w-2xl mb-4 rounded-2xl border p-4 backdrop-blur-xl ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 text-center ${sub}`}>Hisobotni shaxsiylashtirish uchun</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ismingiz (ixtiyoriy)</label>
                  <div className="relative">
                    <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text" value={userName} onChange={e => setUserName(e.target.value)}
                      placeholder="Ismingiz" maxLength={60}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border font-medium outline-none transition-all focus:ring-2 focus:ring-blue-400/40 text-sm ${
                        isDark ? 'bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yoshingiz *</label>
                  <input
                    type="number" value={userAge} onChange={e => setUserAge(e.target.value)}
                    placeholder="17" min={10} max={90}
                    className={`w-full px-3 py-2 rounded-xl border font-medium outline-none transition-all focus:ring-2 focus:ring-blue-400/40 text-sm ${
                      isDark ? 'bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jinsingiz *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([['male', 'Erkak'], ['female', 'Ayol']] as [Gender, string][]).map(([val, label]) => (
                      <button
                        key={val} type="button" onClick={() => setUserGender(val)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          userGender === val
                            ? 'border-[#0061ff] bg-[#0061ff] text-white'
                            : isDark ? 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.42 }}>
              <button
                onClick={startTest} disabled={!canStart}
                className={`px-8 py-3 rounded-2xl text-white font-bold text-base shadow-lg transition-all duration-300 ${canStart ? 'hover:shadow-xl hover:scale-105' : 'opacity-40 cursor-not-allowed'}`}
                style={{ background: '#0061ff', boxShadow: canStart ? '0 10px 40px rgba(0,97,255,0.35)' : undefined }}
              >
                Testni Boshlash →
              </button>
              {!canStart && (
                <p className={`text-xs text-center mt-2 ${sub}`}>Yosh va jinsni to'ldiring (* majburiy)</p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* TEST */}
        {view === 'test' && (
          <motion.div key="test" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="relative z-10 min-h-screen px-4 pt-36 pb-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <button onClick={goBack} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <ArrowLeft size={16} /><span className="text-sm">Orqaga</span>
                </button>
                <button onClick={restartTest} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                  <RotateCcw size={14} /><span className="text-sm">Qayta</span>
                </button>
              </div>

              <StageProgress stage={stage} current={overallQ} total={TOTAL_Q} isDark={isDark} />

              {/* Stage 1 */}
              {stage === 1 && (() => {
                const fcIdx = Math.min(currentQ, FORCED_CHOICE.length - 1);
                const fcQ = FORCED_CHOICE[fcIdx];
                const slots: ('a' | 'b')[] = fcSwap[fcIdx] ? ['b', 'a'] : ['a', 'b'];
                return (
                <AnimatePresence mode="wait">
                  <motion.div key={fcQ.id} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <h2 className={`text-xl md:text-2xl font-bold text-center mb-8 ${text}`}>{fcQ.text}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {slots.map(key => {
                        const opt = key === 'a' ? fcQ.optionA : fcQ.optionB;
                        const isSelected = s1Answers[fcQ.id] === key;
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={key}
                            onClick={() => handleS1(key)}
                            whileHover={{ scale:1.02, y:-3 }} whileTap={{ scale:0.98 }}
                            className={`relative flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-center backdrop-blur-xl ${
                              isSelected ? 'border-[#0061ff] shadow-lg' : isDark ? 'border-white/10 bg-slate-800/60 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                            }`}
                            style={isSelected ? { background: isDark ? 'rgba(0,97,255,0.12)' : 'rgba(0,97,255,0.05)' } : {}}
                          >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? '' : isDark ? 'bg-slate-700/60' : 'bg-slate-100'}`} style={isSelected ? { background: '#0061ff' } : {}}>
                              <Icon size={26} className={isSelected ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-500'} />
                            </div>
                            <p className={`text-base font-medium leading-snug ${text}`}>{opt.text}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
                );
              })()}

              {/* Stage 2 */}
              {stage === 2 && (
                <AnimatePresence mode="wait">
                  <motion.div key={s2Page} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <h2 className={`text-lg font-bold text-center mb-2 ${text}`}>Quyidagi iboralarga qanchalik qo'shilasiz?</h2>
                    <p className={`text-sm text-center mb-6 ${sub}`}>1 = Umuman yo'q · 5 = To'liq qo'shilaman</p>
                    <div className="space-y-5">
                      {likertPageQs.map((q, qi) => (
                        <div key={q.id} className={`rounded-2xl border p-5 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200'}`}>
                          <p className={`font-normal mb-4 ${text}`}>
                            <span style={{ color: '#0061ff' }} className="font-bold mr-2">{qi + 1}.</span>{q.text}
                          </p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {likertScale.map(val => {
                              const selected = s2Answers[q.id] === val;
                              const intensity = 0.15 + (val - 1) * 0.2125;
                              return (
                                <motion.button
                                  key={val}
                                  whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
                                  onClick={() => setS2Answers(prev => ({ ...prev, [q.id]: val }))}
                                  className="w-12 h-12 rounded-xl font-bold text-base flex items-center justify-center transition-all duration-200"
                                  style={{
                                    background: selected ? '#0061ff' : isDark ? `rgba(0,97,255,${intensity * 0.6})` : `rgba(0,97,255,${intensity * 0.35})`,
                                    color: selected ? '#fff' : isDark ? '#cbd5e1' : '#334155',
                                    boxShadow: selected ? '0 4px 16px rgba(0,97,255,0.4)' : undefined,
                                    transform: selected ? 'scale(1.08)' : undefined,
                                  }}
                                >
                                  {val}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <motion.button
                        whileHover={{ scale: s2PageComplete ? 1.04 : 1 }} whileTap={{ scale: s2PageComplete ? 0.97 : 1 }}
                        onClick={handleS2Next} disabled={!s2PageComplete}
                        className={`px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 transition-all duration-300 ${s2PageComplete ? 'shadow-lg' : 'opacity-40 cursor-not-allowed'}`}
                        style={{ background: s2PageComplete ? '#0061ff' : '#6b7280' }}
                      >
                        {s2Page < S2_PAGES - 1 ? 'Keyingisi' : 'Yakunlash'}
                        <ChevronRight size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Stage 3 */}
              {stage === 3 && (() => {
                const mcIdx = Math.min(currentQ, MULTI_CHOICE.length - 1);
                const mcQ = MULTI_CHOICE[mcIdx];
                const order = mcOrder[mcIdx] || [0, 1, 2, 3];
                const orderedOptions = order.map(i => mcQ.options[i]);
                return (
                <AnimatePresence mode="wait">
                  <motion.div key={mcQ.id} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-center mb-3" style={{ color: '#0061ff' }}>
                      Vaziyat {mcIdx + 1} / {MULTI_CHOICE.length}
                    </div>
                    <h2 className={`text-lg md:text-xl font-bold text-center mb-8 ${text}`}>{mcQ.text}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orderedOptions.map(opt => {
                        const isSelected = s3Answers[mcQ.id] === opt.label;
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={opt.label}
                            onClick={() => handleS3(opt.label)}
                            whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
                            className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                              isSelected ? 'border-[#0061ff] shadow-lg' : isDark ? 'border-white/10 bg-slate-800/60 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                            }`}
                            style={isSelected ? { background: isDark ? 'rgba(0,97,255,0.1)' : 'rgba(0,97,255,0.05)' } : {}}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? '#0061ff' : isDark ? '#334155' : '#f1f5f9' }}>
                              <Icon size={17} className={isSelected ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-500'} />
                            </div>
                            <p className={`text-sm font-normal leading-relaxed pt-1.5 ${text}`}>{opt.text}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* CALCULATING */}
        {view === 'calculating' && (
          <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
            <motion.div
              animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:'linear' }}
              className="w-20 h-20 rounded-full mb-8"
              style={{ border:'4px solid #0061ff', borderTopColor:'transparent' }}
            />
            <h2 className={`text-2xl font-bold mb-3 ${text}`}>Natijalar hisoblanmoqda{'.'.repeat(calcDots)}</h2>
            <p className={`text-center ${sub}`}>Javoblaringiz RIASEC modeli asosida tahlil qilinmoqda</p>
            <div className="flex gap-2 mt-8">
              {TYPES.map((t, i) => (
                <motion.div
                  key={t} className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: RIASEC_INFO[t].color }}
                  animate={{ scale:[1,1.5,1], opacity:[0.5,1,0.5] }}
                  transition={{ duration:1, repeat:Infinity, delay:i*0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {view === 'result' && (
          <motion.div key="result" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="relative z-10 min-h-screen px-4 pt-36 pb-12">
            <div className="max-w-4xl mx-auto">

              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,97,255,0.1)' }}>
                  <Trophy size={30} style={{ color: '#0061ff' }} />
                </div>
                <h1 className={`text-3xl md:text-4xl font-black mb-3 ${text}`}>
                  {userName ? `Ajoyib, ${userName}!` : 'Sizning Natijangiz'}
                </h1>
                <p className={`text-lg ${sub}`}>Holland RIASEC modeli asosida siz uchun mos kurslar aniqlandi</p>
              </motion.div>

              {/* Holland Code */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className={`rounded-3xl border p-6 mb-6 flex items-center gap-5 ${isDark ? 'bg-[#0061ff]/10 border-[#0061ff]/25' : 'bg-blue-50 border-blue-100'}`}>
                <div className="text-center shrink-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-blue-300' : 'text-blue-500'}`}>Holland Kodi</p>
                  <p className="text-3xl font-black tracking-wider" style={{ color: '#0061ff' }}>{hollandCode.join('')}</p>
                </div>
                <div className={`h-12 w-px ${isDark ? 'bg-white/10' : 'bg-blue-200'}`} />
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {hollandCode.map(t => RIASEC_INFO[t].short).join(' → ')} — bu uch tip sizning kasbiy qiziqishlaringizning ustuvor kombinatsiyasini ilmiy tarzda ifodalaydi.
                </p>
              </motion.div>

              {/* Radar + Quality */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className={`rounded-3xl border p-6 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Layers size={20} style={{ color: '#0061ff' }} />
                    <h2 className={`text-lg font-bold ${text}`}>Profil Grafigi</h2>
                  </div>
                  <p className={`text-xs mb-2 ${sub}`}>Holland olti burchagi bo'yicha qiziqishlar taqsimoti</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'} />
                      <PolarAngleAxis dataKey="type" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis domain={[0, 50]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#0061ff" fill="#0061ff" fillOpacity={0.35} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }} className={`rounded-3xl border p-6 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={20} style={{ color: '#0061ff' }} />
                    <h2 className={`text-lg font-bold ${text}`}>Natija Ishonchliligi</h2>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <CircularProgress pct={quality.confidence} color="#0061ff" size={84} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black" style={{ color: '#0061ff' }}>{quality.confidence}%</span>
                      </div>
                    </div>
                    <p className={`text-xs leading-relaxed ${sub}`}>
                      {quality.confidence >= 75
                        ? "Javoblaringiz izchil va profilingiz aniq ajralgan — natija yuqori ishonchli."
                        : quality.confidence >= 55
                        ? "Natija ishonchli, ammo ba'zi tiplar bir-biriga yaqin — kurs tanlashda ikkinchi variantni ham ko'rib chiqing."
                        : "Profilingiz nisbatan tekis chiqdi. Aniqroq natija uchun testni shoshilmasdan qayta topshirishni tavsiya qilamiz."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Scale, label: 'Differensiatsiya', val: `${diffLabel(quality.differentiation)} · ${quality.differentiation}%`, hint: 'Tiplar orasidagi farq aniqligi' },
                      { icon: Gauge, label: 'Izchillik', val: consLabel(quality.consistencyDistance), hint: 'Ustuvor 2 tipning o\'zaro yaqinligi' },
                    ].map(m => (
                      <div key={m.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-700/40' : 'bg-slate-50'}`}>
                        <m.icon size={15} style={{ color: '#0061ff' }} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${text}`}>{m.label}</span>
                            <span className="text-xs font-black" style={{ color: '#0061ff' }}>{m.val}</span>
                          </div>
                          <p className={`text-[10px] ${sub}`}>{m.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Full profile */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className={`rounded-3xl border p-6 mb-6 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                <div className="flex items-center gap-3 mb-5">
                  <Award size={20} style={{ color: '#0061ff' }} />
                  <h2 className={`text-lg font-bold ${text}`}>Sizning Holland Profilingiz</h2>
                </div>
                <div className="space-y-4">
                  {ordered.map(t => {
                    const Icon = RIASEC_INFO[t].icon;
                    return (
                      <div key={t} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${RIASEC_INFO[t].color}1f` }}>
                          <Icon size={16} style={{ color: RIASEC_INFO[t].color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-bold truncate ${text}`}>{RIASEC_INFO[t].name}</span>
                            <span className="text-sm font-black shrink-0 ml-2" style={{ color:RIASEC_INFO[t].color }}>{percentages[t]}%</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden mb-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor:RIASEC_INFO[t].color }}
                              initial={{ width:0 }} animate={{ width:`${percentages[t]}%` }}
                              transition={{ duration:1, delay:0.3 }}
                            />
                          </div>
                          <p className={`text-xs leading-relaxed mb-1 ${sub}`}>{RIASEC_INFO[t].desc}</p>
                          <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tipik kasblar: {RIASEC_INFO[t].careers}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* PDF */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.24 }} className="mb-8">
                <button
                  onClick={handleDownloadPdf} disabled={generatingPdf}
                  className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                    generatingPdf ? 'opacity-60 cursor-wait' : 'hover:-translate-y-0.5'
                  } ${isDark ? 'border-[#0061ff]/40 bg-[#0061ff]/10 text-[#60efff] hover:bg-[#0061ff]/15' : 'border-[#0061ff]/30 bg-blue-50 text-[#0061ff] hover:bg-blue-100'}`}
                >
                  {generatingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {generatingPdf ? 'PDF tayyorlanmoqda...' : "To'liq ilmiy hisobotni PDF sifatida yuklab olish"}
                </button>
              </motion.div>

              {/* Strengths */}
              {displayStrengths.length > 0 && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }} className={`rounded-3xl border p-6 mb-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={20} style={{ color: '#0061ff' }} />
                    <h2 className={`text-lg font-bold ${text}`}>Sizning Kuchli Tomonlaringiz</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayStrengths.map(s => (
                      <div key={s.name} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,97,255,0.1)' }}>
                          <s.icon size={15} style={{ color: '#0061ff' }} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${text}`}>{s.name}</p>
                          <p className={`text-[11px] leading-snug ${sub}`}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Courses */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.32 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Target size={20} style={{ color:'#0061ff' }} />
                  <h2 className={`text-xl font-bold ${text}`}>Mos Kurslar</h2>
                </div>
                <p className={`text-xs mb-5 ${sub}`}>
                  Moslik profil shakli (kosinus) va Holland kodlari mosligi (Iachan indeksi) asosida hisoblangan · yosh bo'yicha filtrlangan
                </p>
                {results.length < 3 && ageValid && (
                  <div className={`text-xs mb-5 px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-white/10 text-slate-300' : 'bg-blue-50/60 border-blue-100 text-slate-600'}`}>
                    {ageNum} yosh uchun ayni paytda {results.length} ta kurs mavjud — qolgan yo'nalishlarimiz 15 yoshdan boshlanadi.
                  </div>
                )}
                <div className="space-y-5">
                  {results.map((r, idx) => {
                    const topTypes = [...TYPES].sort((a,b) => r.course.riasec[b]-r.course.riasec[a]).slice(0,3);
                    return (
                      <motion.div
                        key={r.course.id}
                        initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:0.36+idx*0.1 }}
                        className={`rounded-2xl overflow-hidden border ${idx === 0 ? 'border-[#0061ff]' : card}`}
                      >
                        <div className={`p-6 ${idx === 0 ? (isDark ? 'bg-[#0061ff]/10' : 'bg-blue-50/50') : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                                  style={{ background: idx === 0 ? '#0061ff' : isDark ? '#334155' : '#e2e8f0', color: idx === 0 ? '#fff' : isDark ? '#cbd5e1' : '#475569' }}
                                >
                                  {r.rank}
                                </span>
                                <span className="text-sm font-bold" style={{ color: idx === 0 ? '#0061ff' : isDark ? '#94a3b8' : '#64748b' }}>
                                  #{r.rank} O'rin
                                </span>
                              </div>
                              <h3 className={`text-xl font-black mb-1 ${text}`}>{r.course.name}</h3>
                              <p className={`text-sm mb-3 ${sub}`}>{r.course.desc}</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {topTypes.map(t => (
                                  <span key={t} className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ backgroundColor:RIASEC_INFO[t].color }}>
                                    {RIASEC_INFO[t].short}
                                  </span>
                                ))}
                              </div>
                              <p className={`text-xs flex items-start gap-1.5 ${sub}`}>
                                <Star size={12} className="mt-0.5 shrink-0" style={{ color:'#0061ff' }} />
                                Nima uchun mos: sizning {topTypes.slice(0,2).map(t => RIASEC_INFO[t].short).join(' va ')} qobiliyatlaringiz bu kurs talablariga yaqin
                              </p>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="relative">
                                <CircularProgress pct={r.matchScore} color="#0061ff" size={72} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-base font-black" style={{ color: '#0061ff' }}>{r.matchScore}%</span>
                                </div>
                              </div>
                              <span className={`text-xs mt-1 ${sub}`}>Moslik</span>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 flex-wrap">
                            <Link to={r.course.url}>
                              <motion.button
                                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                                className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all"
                                style={{ background: '#0061ff' }}
                              >
                                <BookOpen size={15} />Kursga o'tish
                              </motion.button>
                            </Link>
                            <motion.button
                              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                              onClick={() => setEnrollCourse({ name:r.course.name, id:r.course.id })}
                              className={`px-5 py-2.5 rounded-xl font-semibold text-sm border-2 flex items-center gap-2 transition-all ${isDark ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
                            >
                              <CheckCircle size={15} />Yozilish
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={restartTest}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  <RotateCcw size={16} />Testni qayta boshlash
                </motion.button>
                <Link to="/kurslar">
                  <motion.button
                    whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all"
                    style={{ background: '#0061ff' }}
                  >
                    <TrendingUp size={16} />Barcha kurslar
                  </motion.button>
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {enrollCourse && (
        <EnrollModal
          isOpen={!!enrollCourse}
          onClose={() => setEnrollCourse(null)}
          courseName={enrollCourse.name}
          extraInfo="Karyera testi natijasi asosida tavsiya etildi"
        />
      )}
    </div>
  );
}
