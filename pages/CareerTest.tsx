import { useState, useRef, useEffect, useId, useMemo } from 'react';
import type { ComponentType, CSSProperties, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ChevronRight, RotateCcw, BookOpen, Award, Target, TrendingUp,
  CheckCircle, Star, Download, Loader2, Wrench, FlaskConical, Palette, Heart,
  Rocket, ClipboardList, Sparkles, Trophy, MessageCircle, Brain, HeartHandshake,
  CalendarCheck, Crown, Cpu, Search, Users, ShieldCheck, GraduationCap,
  Hammer, Lightbulb, Brush, Megaphone, Calculator, Trees, Music, Microscope,
  Handshake, FileText, Cog, Telescope, Building2, PenTool, Database, Atom,
  Receipt, HandHeart, Library, Camera, LineChart, ClipboardCheck, User, Gauge,
  Scale, Ruler, Layers, Phone, ArrowRight, Share2,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';
import { trackSiteEvent } from '../utils/analytics';
import { submitLeadToAPI, submitCareerTestResult } from '../utils/api';
import { uz, useMotionReduced, v2Toast } from '../components/v2/utils';
import { useStore } from '../store/useStore';
import '../components/v2/v2.css';

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
  { id:7,  text:"Qaysi ish sizga yaqinroq?",                      optionA:{icon:FlaskConical,text:"Ilmiy gipotezani tekshirish",                    type:'I'}, optionB:{icon:HeartHandshake,text:"Insonning shaxsiy muammosini tinglab yordam berish",type:'S'} },
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
  { id:16, text:"Qo'lim bilan biror narsani yig'ish, ta'mirlash yoki qurish menga yoqadi.",              type:'R' },
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
  { id:29, text:"Odamning muammosini tinglab, uni qo'llab-quvvatlashni yaxshi ko'raman.",type:'S' },
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
    text:"Maktabda \"Kasblar kuni\" tashkil etilmoqda. Qaysi vazifani o'z zimmangizga olasiz?",
    options:[
      {label:'A',text:"Stend va jihozlarni o'z qo'lim bilan yig'aman",type:'R',icon:Hammer},
      {label:'B',text:"O'quvchilar bilan suhbat qurib, savollariga javob beraman",type:'S',icon:MessageCircle},
      {label:'C',text:"Tadbirni boshqarib, dasturni e'lon qilaman",type:'E',icon:Megaphone},
      {label:'D',text:"Ishtirokchilar ro'yxati va vaqt jadvalini yuritaman",type:'C',icon:FileText},
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
    text:"Do'stingiz sizdan uyi uchun kitob javoni loyihalashni so'radi. Nima qilasiz?",
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
  { id:'foundation',         name:'Foundation',                   url:'/kurslar/foundation',         riasec:{R:20,I:40,A:5, S:5, E:10,C:20}, desc:"Kompyuter savodxonligi, Python va mantiqiy fikrlash asoslari. IT'ga birinchi qadam.", minAge:15, maxAge:99 },
  { id:'python-bi',          name:'Web dasturlash: Python BI',     url:'/kurslar/python-bi',          riasec:{R:15,I:45,A:5, S:5, E:10,C:20}, desc:"Python yordamida web va biznes tahlil (BI) dasturlash.", minAge:15, maxAge:99 },
  { id:'frontend',           name:'Frontend Web Dasturlash',       url:'/kurslar/frontend',           riasec:{R:10,I:35,A:25,S:5, E:10,C:15}, desc:"HTML, CSS, JavaScript va React bilan zamonaviy saytlar yaratish.", minAge:15, maxAge:99 },
  { id:'robototexnika',      name:'Robototexnika',                 url:'/kurslar/robototexnika',      riasec:{R:35,I:30,A:5, S:5, E:10,C:15}, desc:"Robot qurish, dasturlash va muhandislik asoslari. 8–14 yosh uchun.", minAge:8, maxAge:14 },
  { id:'grafik-dizayn',      name:'Grafik Dizayn',                 url:'/kurslar/grafik-dizayn',      riasec:{R:5, I:10,A:55,S:5, E:10,C:15}, desc:"Logo, brend va vizual materiallar yaratish. Photoshop, Illustrator.", minAge:15, maxAge:99 },
  { id:'arxitektura-dizayn', name:'Arxitektura va Dizayn',         url:'/kurslar/arxitektura-dizayn', riasec:{R:15,I:20,A:45,S:5, E:10,C:5},  desc:"Arxitektura loyihalash va interyer dizayn asoslari.", minAge:15, maxAge:99 },
  { id:'videografiya',       name:'Videografiya',                  url:'/kurslar/videografiya',       riasec:{R:10,I:10,A:50,S:10,E:15,C:5},  desc:"Video suratga olish, montaj va professional kontent yaratish.", minAge:15, maxAge:99 },
  { id:'mobilografiya',      name:'Mobilografiya',                 url:'/kurslar/mobilografiya',      riasec:{R:10,I:10,A:45,S:15,E:10,C:10}, desc:"Telefon orqali professional foto va video olish mahorati.", minAge:15, maxAge:99 },
  { id:'ai-media',           name:'AI MEDIA',                      url:'/kurslar/ai-media',           riasec:{R:5, I:20,A:40,S:10,E:15,C:10}, desc:"Sun'iy intellekt vositalari bilan media kontent yaratish.", minAge:15, maxAge:99 },
  { id:'smm',                name:'SMM',                           url:'/kurslar/smm',                riasec:{R:5, I:15,A:30,S:25,E:20,C:5},  desc:"Ijtimoiy tarmoqlarni boshqarish, kontent strategiyasi.", minAge:15, maxAge:99 },
  { id:'buxgalteriya',       name:'Zamonaviy Buxgalteriya (1C)',   url:'/kurslar/buxgalteriya',       riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Buxgalteriya asoslari va 1C dasturida ishlash.", minAge:15, maxAge:99 },
  { id:'excel-pro',          name:'Excel Pro',                     url:'/kurslar/excel-pro',          riasec:{R:5, I:25,A:5, S:10,E:15,C:40}, desc:"Microsoft Excelda professional darajada ishlash.", minAge:15, maxAge:99 },
  { id:'hr-menejer',         name:'HR Menejerligi',                url:'/kurslar/hr-menejer',         riasec:{R:5, I:20,A:10,S:30,E:25,C:10}, desc:"Kadrlar boshqaruvi, suhbat o'tkazish va HR strategiyasi.", minAge:15, maxAge:99 },
  { id:'ofis-dasturlari',    name:'Ofis Dasturlarida Ishlash',     url:'/kurslar/ofis-dasturlari',    riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Word, Excel, PowerPoint va ofis vositalari bilan ishlash.", minAge:15, maxAge:99 },
  { id:'kids-web',           name:'Web Dasturlash (Kids)',         url:'/kurslar/kids-web',           riasec:{R:15,I:30,A:25,S:15,E:5, C:10}, desc:"Bolalar uchun qiziqarli dasturlash kursi — o'yin orqali o'rganish. 11–15 yosh uchun.", minAge:11, maxAge:15 },
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

// Yaxlitlangan foizlar teng chiqqanda (masalan 22% va 22%) haqiqiy tartibni aniqlash uchun
// yaxlitlanmagan qiymatlar shu yerda saqlanadi. Aks holda teng natijada doim olti burchakdagi
// oldingi tip (R, I, A...) yutib, Holland kodi bir tomonga og'ib ketardi.
const EXACT_PCTS = new WeakMap<object, Record<RiasecType, number>>();

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
  EXACT_PCTS.set(result, Object.fromEntries(exact.map(e => [e.t, e.v])) as Record<RiasecType, number>);
  exact.forEach(e => result[e.t] = Math.floor(e.v));
  let remainder = 100 - TYPES.reduce((s, t) => s + result[t], 0);
  exact.sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)));
  for (let i = 0; i < remainder; i++) result[exact[i % exact.length].t] += 1;
  return result;
}

/** Tiplarni foiz bo'yicha tartiblash (teng bo'lsa — yaxlitlanmagan qiymat, so'ng olti burchak tartibi) */
function sortedTypes(pcts: Record<RiasecType, number>): RiasecType[] {
  const ex = EXACT_PCTS.get(pcts);
  return [...TYPES].sort((a, b) =>
    (pcts[b] - pcts[a]) || (ex ? ex[b] - ex[a] : 0) || (HEX_ORDER.indexOf(a) - HEX_ORDER.indexOf(b)));
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

function matchCourses(pcts: Record<RiasecType, number>, age: number | null, availableIds?: ReadonlySet<string> | null): CourseResult[] {
  const personCode = getHollandCode(pcts);
  // Saytda (admin/API orqali) mavjud bo'lmagan kurs tavsiya qilinmaydi — aks holda havola "topilmadi" sahifasiga olib boradi
  const pool0 = availableIds && availableIds.size > 0 ? COURSES.filter(c => availableIds.has(c.id)) : COURSES;

  const scored = pool0.map(course => {
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

/**
 * Kuchli tomonlar: faqat 4–5 baho berilgan fikrlar (past baho "kuchli tomon" bo'la olmaydi).
 * Teng bahoda foydalanuvchining o'z profilida yuqori turgan tip oldinga chiqadi — aks holda
 * ro'yxat doim R/I savollaridan (id tartibi bo'yicha) boshlanib qolardi.
 */
function topStrengthsOf(s2Answers: Record<number, number>, pcts: Record<RiasecType, number>) {
  const typeOf = new Map(LIKERT.map(q => [q.id, q.type] as const));
  const rank = sortedTypes(pcts);
  const entries = (Object.entries(s2Answers) as unknown as [string, number][])
    .map(([id, v]) => ({ id: Number(id), v, r: rank.indexOf(typeOf.get(Number(id)) ?? 'R') }))
    .filter(e => e.v >= 4 && STRENGTHS[e.id])
    .sort((a, b) => (b.v - a.v) || (a.r - b.r) || (a.id - b.id));
  // bir tipdan ko'pi bilan 3 ta — ro'yxat xilma-xil bo'lsin
  const perType: Partial<Record<RiasecType, number>> = {};
  const picked: number[] = [];
  entries.forEach(e => {
    const t = typeOf.get(e.id) ?? 'R';
    if (picked.length < 6 && (perType[t] ?? 0) < 3) { picked.push(e.id); perType[t] = (perType[t] ?? 0) + 1; }
  });
  return picked.map(id => STRENGTHS[id]);
}

const diffLabel = (d: number) => d >= 25 ? 'Yuqori' : d >= 15 ? "O'rtacha" : 'Past';
const consLabel = (d: number) => d === 1 ? 'Yuqori' : d === 2 ? "O'rtacha" : 'Past';

// ─── UI (v2 dizayn tizimi) ───────────────────────────────────────────────────
type S1Answers = Record<number, 'a' | 'b'>;
type S3Answers = Record<number, 'A' | 'B' | 'C' | 'D'>;

interface Outcome {
  pcts: Record<RiasecType, number>;
  results: CourseResult[];
  quality: QualityMetrics;
}

const STAGE_LABELS = ['Majburiy tanlov', 'Oʻzini baholash', 'Vaziyatli qaror'];
const LIKERT_HINTS = ['Umuman yoʻq', 'Koʻproq yoʻq', 'Betaraf', 'Koʻproq ha', 'Toʻliq qoʻshilaman'];
const CALC_STEPS = [
  'Javoblar normallashtirilmoqda',
  '15 ta tip juftligi taqqoslanmoqda',
  'Holland kodi aniqlanmoqda',
  'Kurslar bilan solishtirilmoqda',
];
const CALC_MS = 2600;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function parseAge(age: string): number | null {
  const n = parseInt(age, 10);
  return age.trim() !== '' && Number.isFinite(n) && n >= 10 && n <= 90 ? n : null;
}

const idsOf = (list: { id: string }[]): ReadonlySet<string> => new Set(list.map(c => c.id));

function buildOutcome(s1: S1Answers, s2: Record<number, number>, s3: S3Answers, age: string, availableIds?: ReadonlySet<string>): Outcome {
  const pcts = computePercentages(s1, s2, s3);
  return { pcts, results: matchCourses(pcts, parseAge(age), availableIds), quality: computeQuality(pcts, s2) };
}

// ─── Jarayonni saqlash: sahifa yangilansa ham javoblar yo'qolmaydi ───────────
// sessionStorage — faqat shu brauzer oynasida, oyna yopilganda o'chadi.
const STORE_KEY = 'data-career-test-v2';

interface SavedProgress {
  v: 1;
  view: View;
  stage: Stage;
  currentQ: number;
  s2Page: number;
  s1: S1Answers;
  s2: Record<number, number>;
  s3: S3Answers;
  fcSwap: boolean[];
  mcOrder: number[][];
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  submitted: boolean;
}

const isPerm4 = (a: unknown) => Array.isArray(a) && a.length === 4 && [0, 1, 2, 3].every(i => a.includes(i));

function loadProgress(): SavedProgress | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as SavedProgress;
    const valid = d && d.v === 1
      && ['test', 'calculating', 'result'].includes(d.view)
      && [1, 2, 3].includes(d.stage)
      && Array.isArray(d.fcSwap) && d.fcSwap.length === FORCED_CHOICE.length
      && Array.isArray(d.mcOrder) && d.mcOrder.length === MULTI_CHOICE.length && d.mcOrder.every(isPerm4)
      && typeof d.name === 'string' && typeof d.phone === 'string' && typeof d.age === 'string';
    if (!valid) return null;
    d.s1 = d.s1 || {}; d.s2 = d.s2 || {}; d.s3 = d.s3 || {};
    const stageLen = d.stage === 1 ? FORCED_CHOICE.length : MULTI_CHOICE.length;
    d.currentQ = Math.max(0, Math.min(Number(d.currentQ) || 0, stageLen - 1));
    d.s2Page = Math.max(0, Math.min(Number(d.s2Page) || 0, S2_PAGES - 1));
    if (d.view !== 'test') {
      // natija faqat barcha savollarga javob bo'lsa tiklanadi
      const complete = FORCED_CHOICE.every(q => d.s1[q.id])
        && LIKERT.every(q => d.s2[q.id])
        && MULTI_CHOICE.every(q => d.s3[q.id]);
      if (!complete) return null;
      d.view = 'result';
    }
    return d;
  } catch {
    return null;
  }
}

function saveProgress(d: SavedProgress | null) {
  try {
    if (d) sessionStorage.setItem(STORE_KEY, JSON.stringify(d));
    else sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* private rejim yoki to'lgan xotira — test baribir ishlayveradi */
  }
}

// ─── Holland olti burchagi (SVG, kutubxonasiz) ───────────────────────────────
function HexChart({ pcts, reduced, size = 460 }: { pcts: Record<RiasecType, number>; reduced: boolean; size?: number }) {
  const gid = useId().replace(/:/g, '');
  const C = size / 2;
  const R = size * 0.3;
  const top = Math.max(...HEX_ORDER.map(t => pcts[t]));
  const domain = Math.max(30, Math.ceil(top / 10) * 10);
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const;
  };
  const poly = (radius: (i: number) => number) =>
    HEX_ORDER.map((_, i) => pt(i, radius(i)).map(n => n.toFixed(1)).join(',')).join(' ');
  const rOf = (t: RiasecType) => R * Math.min(1, pcts[t] / domain);
  const shape = poly(i => rOf(HEX_ORDER[i]));
  const code = getHollandCode(pcts);
  const transition = { duration: reduced ? 0 : 1.2, ease: EASE_OUT, delay: reduced ? 0 : 0.15 };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label={`RIASEC profili: ${HEX_ORDER.map(t => `${RIASEC_INFO[t].short} ${pcts[t]}%`).join(', ')}`}
    >
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0061ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#60efff" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={poly(() => R * f)} fill="none" stroke="var(--line-2)" strokeWidth={1} />
      ))}
      {HEX_ORDER.map((t, i) => {
        const [x, y] = pt(i, R);
        return <line key={t} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <motion.polygon
        initial={reduced ? false : { points: poly(() => 0.5), opacity: 0 }}
        animate={{ points: shape, opacity: 1 }}
        transition={transition}
        fill={`url(#${gid}-fill)`}
        stroke="#60efff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {HEX_ORDER.map((t, i) => {
        const [x, y] = pt(i, rOf(t));
        const lead = code.includes(t);
        return (
          <motion.circle
            key={t}
            initial={reduced ? false : { cx: C, cy: C }}
            animate={{ cx: x, cy: y }}
            transition={transition}
            r={lead ? 5.5 : 3.5}
            fill={lead ? RIASEC_INFO[t].color : 'var(--bg)'}
            stroke={lead ? 'var(--bg)' : '#60efff'}
            strokeWidth={1.5}
          />
        );
      })}
      {HEX_ORDER.map((t, i) => {
        const [lx, ly] = pt(i, R + 44);
        const lead = code.includes(t);
        return (
          <g key={t}>
            <text x={lx} y={ly - 7} textAnchor="middle" fontSize="19" className="mono" fill={lead ? 'var(--fg)' : 'var(--fg-3)'} style={{ fontWeight: 500 }}>
              {t}
            </text>
            <text x={lx} y={ly + 14} textAnchor="middle" fontSize="16" fill="var(--fg-2)">
              {RIASEC_INFO[t].short} · {pcts[t]}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Kirish sahifasi orqasidagi sekin aylanuvchi olti burchak to'ri */
function HexBackdrop({ reduced }: { reduced: boolean }) {
  const S = 600, C = S / 2;
  const ring = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      return `${(C + Math.cos(a) * r).toFixed(1)},${(C + Math.sin(a) * r).toFixed(1)}`;
    }).join(' ');
  return (
    <motion.svg
      viewBox={`0 0 ${S} ${S}`}
      aria-hidden="true"
      className="pointer-events-none absolute -right-[22vw] top-[6vh] w-[min(130vw,980px)] h-auto opacity-60 lg:right-[-8vw] lg:top-[8vh] lg:w-[min(64vw,980px)]"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 160, repeat: Infinity, ease: 'linear' }}
    >
      {[60, 120, 180, 240, 290].map((r, i) => (
        <polygon key={r} points={ring(r)} fill="none" stroke={i === 4 ? 'rgba(0,97,255,.45)' : 'var(--line-2)'} strokeWidth={1} />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        return <line key={i} x1={C} y1={C} x2={C + Math.cos(a) * 290} y2={C + Math.sin(a) * 290} stroke="var(--line)" />;
      })}
      <polygon points={ring(150)} fill="rgba(0,97,255,.10)" stroke="#60efff" strokeOpacity={0.35} />
    </motion.svg>
  );
}


// ─── PDF hisobot: jsPDF bilan vektor chizma (brend shrifti Poppins, 3 sahifa) ──
type RGB = [number, number, number];
const PDF_C = {
  ink: [5, 7, 13] as RGB,
  ink2: [74, 82, 97] as RGB,
  ink3: [125, 134, 148] as RGB,
  line: [228, 232, 239] as RGB,
  soft: [243, 246, 251] as RGB,
  blue: [0, 97, 255] as RGB,
  cyan: [96, 239, 255] as RGB,
  night: [5, 7, 13] as RGB,
  nightLine: [38, 44, 58] as RGB,
  white: [255, 255, 255] as RGB,
};
const PDF_FONTS = [
  ['Poppins-Regular.ttf', 'normal'],
  ['Poppins-Medium.ttf', 'medium'],
  ['Poppins-SemiBold.ttf', 'semibold'],
  ['Poppins-Bold.ttf', 'bold'],
] as const;
type PdfWeight = typeof PDF_FONTS[number][1];

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function bufToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

const hexRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;

async function generateCareerTestPdf(params: {
  name: string;
  age: string;
  gender: Gender;
  percentages: Record<RiasecType, number>;
  hollandCode: RiasecType[];
  results: CourseResult[];
  strengths: { name: string; desc: string }[];
  quality: QualityMetrics;
  contact?: { phone?: string; address?: string };
}) {
  const { jsPDF } = await import('jspdf');
  const { name, age, gender, percentages, hollandCode, results, strengths, quality, contact } = params;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  const CW = W - M * 2;

  // Brend shrifti yuklanadi; tarmoq xatosida Helvetica bilan davom etadi
  let brandFont = true;
  try {
    const files = await Promise.all(PDF_FONTS.map(async ([file]) => {
      const res = await fetch(`/fonts/pdf/${file}`);
      if (!res.ok) throw new Error(`font ${file}: ${res.status}`);
      return bufToBase64(await res.arrayBuffer());
    }));
    PDF_FONTS.forEach(([file, weight], i) => {
      doc.addFileToVFS(file, files[i]);
      doc.addFont(file, `Poppins-${weight}`, 'normal');
    });
  } catch (e) {
    console.warn('PDF: brend shrifti yuklanmadi, Helvetica ishlatiladi', e);
    brandFont = false;
  }

  /** O'zbek apostroflari: Poppins'da ʻ yo'q, shuning uchun ‘ (U+2018) va ’ (U+2019) */
  const tx = (s: string) => {
    const t = s.replace(/([oOgG])['‘ʻ`]/g, '$1‘').replace(/['ʼ`]/g, '’');
    return brandFont ? t : t.replace(/[‘’]/g, "'").replace(/[—–]/g, '-').replace(/[·•]/g, '-').replace(/…/g, '...');
  };
  const font = (weight: PdfWeight, size: number, color: RGB) => {
    if (brandFont) doc.setFont(`Poppins-${weight}`, 'normal');
    else doc.setFont('helvetica', weight === 'normal' ? 'normal' : 'bold');
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const text = (s: string, x: number, y: number, opts?: { align?: 'left' | 'right' | 'center'; charSpace?: number }) => {
    doc.text(tx(s), x, y, { align: opts?.align, charSpace: opts?.charSpace });
  };
  const wrap = (s: string, width: number) => doc.splitTextToSize(tx(s), width) as string[];
  /** wrap + bo'sh joysiz juda uzun so'zni belgilar bo'yicha sindirish (joriy shrift o'lchamida) */
  const wrapHard = (s: string, width: number) => wrap(s, width).flatMap(l => {
    if (doc.getTextWidth(l) <= width) return [l];
    const out: string[] = [];
    let cur = '';
    for (const ch of l) {
      if (cur && doc.getTextWidth(cur + ch) > width) { out.push(cur); cur = ch; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  });
  /** bir qatorga sig'maydigan matnni "…" bilan qisqartirish (joriy shrift o'lchamida) */
  const fitText = (s: string, width: number) => {
    let t = tx(s);
    if (doc.getTextWidth(t) <= width) return t;
    const ell = brandFont ? '…' : '...';
    while (t.length > 1 && doc.getTextWidth(t + ell) > width) t = t.slice(0, -1);
    return t.trimEnd() + ell;
  };
  const kicker = (s: string, x: number, y: number, color: RGB = PDF_C.ink3) => {
    font('medium', 7, color);
    text(s.toUpperCase(), x, y, { charSpace: 0.6 });
  };
  const opacity = (o: number) => {
    const G = (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState;
    (doc as unknown as { setGState: (g: unknown) => void }).setGState(new G({ opacity: o }));
  };
  /** Gorizontal brend gradienti (ko'k → moviy) ingichka vektor bo'laklar bilan */
  const gradBar = (x: number, y: number, w: number, h: number) => {
    const n = 48;
    for (let i = 0; i < n; i++) {
      doc.setFillColor(...mix(PDF_C.blue, PDF_C.cyan, i / (n - 1)));
      doc.rect(x + (w * i) / n, y, w / n + 0.35, h, 'F');
    }
  };
  /** Brend yulduzi: |x|^k + |y|^k = 1 (k<1) — saytdagi 4 qirrali yulduz */
  const star = (cx: number, cy: number, r: number, color: RGB) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
      const rr = r / Math.pow(Math.pow(c, 0.62) + Math.pow(s, 0.62), 1 / 0.62);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    polygon(pts, 'F', color);
  };
  const polygon = (pts: [number, number][], style: 'F' | 'S' | 'FD', fill?: RGB, stroke?: RGB) => {
    if (fill) doc.setFillColor(...fill);
    if (stroke) doc.setDrawColor(...stroke);
    const segs = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.lines(segs, pts[0][0], pts[0][1], [1, 1], style, true);
  };
  const hexPts = (cx: number, cy: number, radius: (i: number) => number): [number, number][] =>
    HEX_ORDER.map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      const r = radius(i);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  const domain = Math.max(30, Math.ceil(Math.max(...HEX_ORDER.map(t => percentages[t])) / 10) * 10);
  const profileR = (R: number) => (i: number) => R * Math.min(1, percentages[HEX_ORDER[i]] / domain);
  const pageHeader = (title: string) => {
    star(M + 2.2, 15.2, 2.6, PDF_C.blue);
    font('bold', 9.5, PDF_C.ink);
    text('DATA', M + 6.5, 16.6);
    font('normal', 7.5, PDF_C.ink3);
    text(fitText(title, CW - 40), W - M, 16.6, { align: 'right' });
    doc.setDrawColor(...PDF_C.line); doc.setLineWidth(0.25);
    doc.line(M, 21, W - M, 21);
  };
  const sectionTitle = (num: string, title: string, y: number) => {
    font('medium', 8, PDF_C.blue);
    text(num, M, y);
    font('semibold', 17, PDF_C.ink);
    text(title, M + 10, y + 0.4);
    return y + 9;
  };

  const now = new Date();
  const dateStr = `${now.getDate()}-${UZ_MONTHS[now.getMonth()]}, ${now.getFullYear()}`;
  const genderLabel = gender === 'male' ? 'Erkak' : gender === 'female' ? 'Ayol' : '';
  const ordered = sortedTypes(percentages);
  const reportTitle = `Karyera testi hisoboti${name ? ` — ${name}` : ''}`;

  // ═══ 1-SAHIFA: muqova + asosiy xulosa ═══
  // uzun ism: shrift kichraytirib 2 qatorga sig'diriladi, sig'masa oxirgi qator "…" bilan qisqartiriladi
  const nameW = 100;
  const nameStr = name || 'Sizning natijangiz';
  let nameSize = 22;
  let nameLines: string[] = [];
  for (const sz of [22, 19, 16, 14]) {
    nameSize = sz;
    font('semibold', sz, PDF_C.white);
    nameLines = wrapHard(nameStr, nameW);
    if (nameLines.length <= 2) break;
  }
  if (nameLines.length > 2) nameLines = [nameLines[0], fitText(nameLines.slice(1).join(' '), nameW)];
  const nameLH = nameSize * 0.41;
  const afterName = 51 + (nameLines.length - 1) * nameLH;
  // ism 2 qatorga o'tsa, muqova bandi shunga qarab kengayadi (matn o'zaro ustma-ust tushmasligi uchun)
  const bandH = 104 + (afterName - 51);
  doc.setFillColor(...PDF_C.night);
  doc.rect(0, 0, W, bandH, 'F');

  // muqovadagi san'at: foydalanuvchining haqiqiy RIASEC olti burchagi
  const hx = 156, hy = 54, hR = 36;
  doc.setLineWidth(0.2);
  [0.25, 0.5, 0.75, 1].forEach(f => polygon(hexPts(hx, hy, () => hR * f), 'S', undefined, PDF_C.nightLine));
  hexPts(hx, hy, () => hR).forEach(([x, y]) => { doc.setDrawColor(...PDF_C.nightLine); doc.line(hx, hy, x, y); });
  opacity(0.5);
  polygon(hexPts(hx, hy, profileR(hR)), 'F', PDF_C.blue);
  opacity(1);
  doc.setLineWidth(0.45);
  polygon(hexPts(hx, hy, profileR(hR)), 'S', undefined, PDF_C.cyan);
  hexPts(hx, hy, profileR(hR)).forEach(([x, y], i) => {
    const lead = hollandCode.includes(HEX_ORDER[i]);
    doc.setFillColor(...(lead ? hexRgb(RIASEC_INFO[HEX_ORDER[i]].color) : PDF_C.cyan));
    doc.circle(x, y, lead ? 1.1 : 0.6, 'F');
  });
  hexPts(hx, hy, () => hR + 7).forEach(([x, y], i) => {
    const t = HEX_ORDER[i];
    font('semibold', 8, hollandCode.includes(t) ? PDF_C.white : [110, 118, 134]);
    text(t, x, y - 0.6, { align: 'center' });
    font('normal', 6, [110, 118, 134]);
    text(`${percentages[t]}%`, x, y + 2.6, { align: 'center' });
  });

  // logotip
  star(M + 3, 17, 3.4, PDF_C.white);
  font('bold', 13, PDF_C.white);
  text('DATA', M + 8.6, 19.3);
  font('medium', 5.6, [150, 158, 172]);
  text('TA’LIM STANSIYASI', M + 8.8, 22.6, { charSpace: 0.5 });

  kicker('Karyera testi hisoboti · Holland RIASEC', M, 40, PDF_C.cyan);
  font('semibold', nameSize, PDF_C.white);
  nameLines.forEach((l, i) => doc.text(l, M, 51 + i * nameLH));

  kicker('Holland kodingiz', M, afterName + 13, [150, 158, 172]);
  font('bold', 42, PDF_C.cyan);
  text(hollandCode.join(''), M - 0.6, afterName + 30, { charSpace: 2.2 });
  font('normal', 9, [200, 206, 216]);
  text(hollandCode.map(t => RIASEC_INFO[t].short).join('  ·  '), M, afterName + 38);

  font('normal', 7.2, [125, 134, 148]);
  text([dateStr, age ? `${age} yosh` : '', genderLabel].filter(Boolean).join('   ·   '), M, bandH - 7);
  gradBar(0, bandH, W, 1.6);

  // ishonchlilik ko'rsatkichlari
  let y = bandH + 13;
  const tiles = [
    ['Ishonchlilik', `${quality.confidence}%`, 'Javoblar izchilligi'],
    ['Farqlanish', diffLabel(quality.differentiation), `${quality.differentiation}% farq`],
    ['Izchillik', consLabel(quality.consistencyDistance), 'Ustuvor 2 tip yaqinligi'],
  ];
  const tw = (CW - 8) / 3;
  tiles.forEach(([k, v, h], i) => {
    const x = M + i * (tw + 4);
    doc.setFillColor(...PDF_C.soft);
    doc.roundedRect(x, y, tw, 22, 2.5, 2.5, 'F');
    kicker(k, x + 5, y + 6.5);
    font('semibold', 14, PDF_C.ink);
    text(v, x + 5, y + 14.5);
    font('normal', 6.8, PDF_C.ink3);
    text(h, x + 5, y + 19);
  });
  y += 29;
  font('normal', 8.4, PDF_C.ink2);
  const verdict = quality.confidence >= 75
    ? "Javoblaringiz izchil va profilingiz aniq ajralgan — natija yuqori ishonchli."
    : quality.confidence >= 55
      ? "Natija ishonchli, ammo ba'zi tiplar bir-biriga yaqin — kurs tanlashda ikkinchi variantni ham ko'rib chiqing."
      : "Profilingiz nisbatan tekis chiqdi. Aniqroq natija uchun testni shoshilmasdan qayta topshirishni tavsiya qilamiz.";
  wrap(verdict, CW).forEach(l => { doc.text(l, M, y); y += 4.3; });

  // ustuvor 3 tip
  y += 6;
  y = sectionTitle('01', 'Sizning kodingiz nimani anglatadi', y);
  const colW = (CW - 12) / 3;
  let maxBottom = y;
  hollandCode.forEach((t, i) => {
    const info = RIASEC_INFO[t];
    const x = M + i * (colW + 6);
    let cy = y + 2;
    doc.setFillColor(...hexRgb(info.color));
    doc.roundedRect(x, cy, 9, 9, 2, 2, 'F');
    font('bold', 10, PDF_C.white);
    text(t, x + 4.5, cy + 6.3, { align: 'center' });
    font('semibold', 18, PDF_C.ink);
    text(`${percentages[t]}%`, x + colW, cy + 7, { align: 'right' });
    cy += 15;
    font('semibold', 10.5, PDF_C.ink);
    text(info.short, x, cy);
    cy += 5.2;
    font('normal', 7.8, PDF_C.ink2);
    wrap(info.desc, colW).forEach(l => { doc.text(l, x, cy); cy += 3.9; });
    maxBottom = Math.max(maxBottom, cy);
  });
  y = maxBottom + 6;

  // eng mos kurs
  if (results[0]) {
    const r = results[0];
    const boxH = 40;
    const by = Math.max(y, H - 24 - boxH);
    doc.setDrawColor(...PDF_C.blue); doc.setLineWidth(0.5);
    doc.roundedRect(M, by, CW, boxH, 3, 3, 'S');
    kicker('Eng mos yo‘nalish', M + 7, by + 9, PDF_C.blue);
    font('semibold', 16, PDF_C.ink);
    text(r.course.name, M + 7, by + 18);
    font('normal', 8.2, PDF_C.ink2);
    wrap(r.course.desc, CW - 60).slice(0, 2).forEach((l, i) => doc.text(l, M + 7, by + 25 + i * 4.2));
    font('normal', 7.2, PDF_C.ink3);
    text(`datatalim.uz${r.course.url}`, M + 7, by + boxH - 5);
    font('bold', 30, PDF_C.blue);
    text(`${r.matchScore}%`, W - M - 7, by + 22, { align: 'right' });
    font('normal', 7.5, PDF_C.ink3);
    text('moslik', W - M - 7, by + 28, { align: 'right' });
  }

  // ═══ 2-SAHIFA: olti o'lchov + kuchli tomonlar ═══
  doc.addPage();
  pageHeader(reportTitle);
  y = 36;
  y = sectionTitle('02', 'Olti o‘lchov', y);
  font('normal', 8.2, PDF_C.ink3);
  text('Har bir tip qiziqishlaringizning qancha qismini tashkil etishi (jami 100%).', M, y);
  y += 8;
  ordered.forEach((t, idx) => {
    const info = RIASEC_INFO[t];
    const col = hexRgb(info.color);
    font('normal', 7.8, PDF_C.ink2);
    const descLines = wrap(info.desc, CW - 11);
    const blockH = 12 + descLines.length * 3.9 + 5;
    if (y + blockH > H - 22) { doc.addPage(); pageHeader(reportTitle); y = 32; }
    doc.setFillColor(...col);
    doc.roundedRect(M, y - 4.6, 7, 7, 1.6, 1.6, 'F');
    font('bold', 8.5, PDF_C.white);
    text(t, M + 3.5, y + 0.4, { align: 'center' });
    font('semibold', 10.5, idx < 3 ? PDF_C.ink : PDF_C.ink2);
    text(info.name, M + 11, y);
    font('semibold', 10.5, PDF_C.ink);
    text(`${percentages[t]}%`, W - M, y, { align: 'right' });
    y += 4;
    doc.setFillColor(...PDF_C.line);
    doc.roundedRect(M + 11, y, CW - 11, 1.6, 0.8, 0.8, 'F');
    doc.setFillColor(...col);
    doc.roundedRect(M + 11, y, Math.max(1.6, (CW - 11) * (percentages[t] / 100)), 1.6, 0.8, 0.8, 'F');
    y += 6.2;
    font('normal', 7.8, PDF_C.ink2);
    descLines.forEach(l => { doc.text(l, M + 11, y); y += 3.9; });
    font('normal', 7.2, PDF_C.ink3);
    text(`Tipik kasblar: ${info.careers}`, M + 11, y + 0.4);
    y += 8.5;
  });

  if (strengths.length > 0) {
    y += 2;
    if (y + 40 > H - 22) { doc.addPage(); pageHeader(reportTitle); y = 36; }
    y = sectionTitle('03', 'Kuchli tomonlaringiz', y);
    y += 1;
    const sw = (CW - 8) / 2;
    strengths.forEach((s, i) => {
      const col = i % 2;
      const x = M + col * (sw + 8);
      if (col === 0 && y + 14 > H - 22) { doc.addPage(); pageHeader(reportTitle); y = 32; }
      doc.setFillColor(...PDF_C.blue);
      doc.circle(x + 1.2, y - 1.2, 0.9, 'F');
      font('semibold', 9, PDF_C.ink);
      text(s.name, x + 4.5, y);
      font('normal', 7.6, PDF_C.ink2);
      wrap(s.desc, sw - 5).slice(0, 2).forEach((l, j) => doc.text(l, x + 4.5, y + 4.4 + j * 3.7));
      if (col === 1 || i === strengths.length - 1) y += 14;
    });
  }

  // ═══ 3-SAHIFA: kurslar, metodologiya, keyingi qadam ═══
  doc.addPage();
  pageHeader(reportTitle);
  y = 36;
  y = sectionTitle('04', 'Tavsiya etilgan kurslar', y);
  font('normal', 8, PDF_C.ink3);
  wrap("Moslik profil shakli o'xshashligi (kosinus) va Holland kodlari mosligi (Iachan indeksi, 1984) asosida hisoblangan, yoshingiz bo'yicha saralangan.", CW)
    .forEach(l => { doc.text(l, M, y); y += 3.9; });
  y += 5;
  results.forEach(r => {
    const top = r.rank === 1;
    font('normal', 7.8, PDF_C.ink2);
    const descLines = wrap(r.course.desc, CW - 60).slice(0, 2);
    const rowH = 22 + (descLines.length - 1) * 3.9;
    doc.setFillColor(...(top ? [236, 243, 255] as RGB : PDF_C.soft));
    doc.roundedRect(M, y, CW, rowH, 3, 3, 'F');
    font('medium', 9, top ? PDF_C.blue : PDF_C.ink3);
    text(String(r.rank).padStart(2, '0'), M + 6, y + 9);
    font('semibold', 11.5, PDF_C.ink);
    text(r.course.name, M + 17, y + 9);
    font('normal', 7.8, PDF_C.ink2);
    descLines.forEach((l, i) => doc.text(l, M + 17, y + 14 + i * 3.9));
    font('bold', 17, top ? PDF_C.blue : PDF_C.ink);
    text(`${r.matchScore}%`, W - M - 6, y + 10, { align: 'right' });
    doc.setFillColor(...PDF_C.line);
    doc.roundedRect(W - M - 32, y + 13.5, 26, 1.4, 0.7, 0.7, 'F');
    doc.setFillColor(...(top ? PDF_C.blue : PDF_C.ink3));
    doc.roundedRect(W - M - 32, y + 13.5, Math.max(1.4, 26 * r.matchScore / 100), 1.4, 0.7, 0.7, 'F');
    y += rowH + 4;
  });
  const ageN = parseAge(age);
  if (results.length < 3 && ageN !== null) {
    font('normal', 7.6, PDF_C.ink3);
    wrap(`${ageN} yosh uchun ayni paytda ${results.length} ta kurs mavjud — qolgan yo'nalishlarimiz 15 yoshdan boshlanadi.`, CW)
      .forEach(l => { doc.text(l, M, y + 1); y += 3.9; });
  }

  y += 6;
  y = sectionTitle('05', 'Metodologiya', y);
  font('normal', 8, PDF_C.ink2);
  [
    "Hisobot Jon Holland (1997) RIASEC kasbiy qiziqishlar nazariyasiga asoslanadi. " +
    `Test ${TOTAL_Q} ta savoldan iborat: ${FORCED_CHOICE.length} ta majburiy tanlov (barcha 15 ta tip juftligi bir martadan taqqoslanadi), ` +
    `${LIKERT.length} ta o'z-o'zini baholash (har bir tip uchun 4 tadan) va ${MULTI_CHOICE.length} ta vaziyatli qaror. ` +
    "Uchala bosqich normallashtirilib, yakuniy ballga teng hissa qo'shadi; variantlar tasodifiy tartibda ko'rsatiladi.",
    "Farqlanish — eng yuqori va eng past tip orasidagi farq: yuqori bo'lsa qiziqishlaringiz aniq ajralgan. " +
    "Izchillik — Holland olti burchagida ustuvor ikki tipingiz qanchalik yaqin joylashgani.",
  ].forEach(p => {
    wrap(p, CW).forEach(l => { doc.text(l, M, y); y += 3.9; });
    y += 2.5;
  });

  // keyingi qadam
  y += 4;
  const ctaH = 40;
  // sahifa oxiriga bog'langan yakuniy blok (oraliq bo'sh qolsa ham imzo pastda turadi)
  if (y + ctaH > H - 22) { doc.addPage(); pageHeader(reportTitle); y = 36; }
  const cy0 = Math.max(y, H - 22 - ctaH);
  doc.setFillColor(...PDF_C.night);
  doc.roundedRect(M, cy0, CW, ctaH, 3, 3, 'F');
  gradBar(M + 7, cy0 + 7, 14, 1);
  font('semibold', 14, PDF_C.white);
  text('Keyingi qadam: bepul maslahat', M + 7, cy0 + 16);
  font('normal', 8, [190, 197, 208]);
  wrap('Mutaxassisimiz natijangizni siz bilan birga koʻrib chiqadi va mos kursni tanlashda yordam beradi.', 78)
    .forEach((l, i) => doc.text(l, M + 7, cy0 + 22 + i * 4));
  font('semibold', 9.5, PDF_C.white);
  const rx = W - M - 7;
  if (contact?.phone) text(contact.phone, rx, cy0 + 16, { align: 'right' });
  font('normal', 7.8, [190, 197, 208]);
  text('datatalim.uz', rx, cy0 + 22, { align: 'right' });
  text('t.me/data_talim_stansiyasi', rx, cy0 + 26.5, { align: 'right' });
  if (contact?.address) {
    font('normal', 7.2, [190, 197, 208]);
    wrap(contact.address, 76).slice(0, 2).forEach((l, i) => doc.text(l, rx, cy0 + 31 + i * 3.6, { align: 'right' }));
  }

  // sahifa raqamlari va pastki qism
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...PDF_C.line); doc.setLineWidth(0.25);
    doc.line(M, H - 14, W - M, H - 14);
    font('normal', 6.8, PDF_C.ink3);
    text('DATA Ta’lim Stansiyasi · Holland RIASEC karyera testi', M, H - 9.5);
    text(`${p} / ${pages}`, W - M, H - 9.5, { align: 'right' });
  }
  doc.setPage(1);
  doc.setProperties({ title: reportTitle, author: 'DATA Ta’lim Stansiyasi', subject: 'Holland RIASEC karyera testi hisoboti' });
  return doc;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerTest() {
  const reduced = useMotionReduced();
  const siteContent = useStore(s => s.siteContent);
  const storeCourses = useStore(s => s.courses);
  const availableIds = useMemo(() => idsOf(storeCourses), [storeCourses]);
  const [saved] = useState(loadProgress);
  const [view, setView] = useState<View>(saved?.view ?? 'intro');
  const [userName, setUserName] = useState(saved?.name ?? '');
  const [userPhone, setUserPhone] = useState(saved?.phone ?? '');
  const [userAge, setUserAge] = useState(saved?.age ?? '');
  const [userGender, setUserGender] = useState<Gender>(saved?.gender ?? '');
  const [stage, setStage] = useState<Stage>(saved?.stage ?? 1);
  const [currentQ, setCurrentQ] = useState(saved?.currentQ ?? 0);
  const [s1Answers, setS1Answers] = useState<S1Answers>(saved?.s1 ?? {});
  const [s2Answers, setS2Answers] = useState<Record<number, number>>(saved?.s2 ?? {});
  const [s3Answers, setS3Answers] = useState<S3Answers>(saved?.s3 ?? {});
  const [s2Page, setS2Page] = useState(saved?.s2Page ?? 0);
  // Variantlar tasodifiy tartibda — pozitsion moyillikning oldini oladi
  const [fcSwap, setFcSwap] = useState<boolean[]>(() => saved?.fcSwap ?? FORCED_CHOICE.map(() => Math.random() < 0.5));
  const [mcOrder, setMcOrder] = useState<number[][]>(() => saved?.mcOrder ?? MULTI_CHOICE.map(() => shuffledIndices(4)));
  // Tiklangan natija javoblardan qayta hisoblanadi (hisob deterministik)
  const [outcome, setOutcome] = useState<Outcome | null>(() =>
    saved?.view === 'result' ? buildOutcome(saved.s1, saved.s2, saved.s3, saved.age, idsOf(useStore.getState().courses)) : null,
  );
  const [enrollCourse, setEnrollCourse] = useState<{ name: string; id: string; type: 'enroll' | 'consult' } | null>(null);
  // Natija CRM'ga yetib borganini foydalanuvchiga ko'rsatish uchun (ishonch va ravshanlik)
  const [delivered, setDelivered] = useState(saved?.submitted ?? false);
  const [calcStep, setCalcStep] = useState(0);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [tried, setTried] = useState(false);
  const [dir, setDir] = useState(1);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const calcTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionLockRef = useRef(false);
  // Har bir test topshirilishida faqat bir marta avtomatik yuborilishi uchun
  const autoSubmittedRef = useRef(saved?.submitted ?? false);
  // Qaysi so'rov muvaffaqiyatli yetib borgani — qayta urinishda faqat yetmaganini yuboramiz
  const sentPartsRef = useRef({ lead: saved?.submitted ?? false, result: saved?.submitted ?? false });
  // Kutilayotgan animatsiya taymerlari. Ular bekor qilinmasa, "Qayta"/"Orqaga"
  // bosilganda eski taymer allaqachon almashgan ekranning holatini o'zgartirib
  // yuboradi va AnimatePresence chiqish animatsiyasida qotib qoladi.
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLButtonElement>(null);

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
  useEffect(() => () => {
    clearPending();
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  // ── Validatsiya ──
  const ageNum = parseAge(userAge);
  const ageValid = ageNum !== null;
  const genderValid = userGender !== '';
  const nameValid = userName.trim().length >= 2;
  const rawPhone = userPhone.replace(/\D/g, '');
  const phoneValid = /^[2-9]\d{8}$/.test(rawPhone); // server bilan bir xil: operator kodi 2–9
  const canStart = ageValid && genderValid && nameValid && phoneValid;
  const errors = {
    name: tried && !nameValid ? 'Ismingizni kiriting (kamida 2 harf).' : '',
    phone: tried && !phoneValid
      ? (rawPhone.length !== 9 ? 'Telefon raqamini toʻliq kiriting: 9 ta raqam.' : 'Raqam notoʻgʻri. Masalan: 90 123 45 67.')
      : '',
    age: tried && !ageValid ? 'Yoshingizni kiriting (10–90).' : '',
    gender: tried && !genderValid ? 'Jinsingizni tanlang.' : '',
  };

  // ── Jarayonni saqlash ──
  useEffect(() => {
    if (view === 'intro') { saveProgress(null); return; }
    saveProgress({
      v: 1, view, stage, currentQ, s2Page,
      s1: s1Answers, s2: s2Answers, s3: s3Answers, fcSwap, mcOrder,
      name: userName, phone: userPhone, age: userAge, gender: userGender,
      // faqat serverga haqiqatan yetib borgach "yuborilgan" deb saqlanadi — so'rov paytida sahifa yangilansa qayta yuboriladi
      // (server ikkala yo'lda ham 10 daqiqalik takror-filtrga ega)
      submitted: delivered,
    });
  }, [view, stage, currentQ, s2Page, s1Answers, s2Answers, s3Answers, fcSwap, mcOrder, userName, userPhone, userAge, userGender, delivered]);

  // Tiklanganda: foydalanuvchiga xabar va (agar yetib bormagan bo'lsa) natijani yuborish
  useEffect(() => {
    if (!saved) return;
    if (saved.view === 'test') toast('Oldingi javoblaringiz tiklandi — davom eting.', v2Toast({ id: 'ct-restored' }));
    if (saved.view === 'result' && outcome && !autoSubmittedRef.current) submitCareerTestAuto(outcome.pcts, outcome.results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('998') && val.length > 9) val = val.slice(3);
    if (val.length > 9) val = val.slice(0, 9);
    let formatted = '';
    if (val.length > 0) formatted += val.substring(0, 2);
    if (val.length > 2) formatted += ' ' + val.substring(2, 5);
    if (val.length > 5) formatted += ' ' + val.substring(5, 7);
    if (val.length > 7) formatted += ' ' + val.substring(7, 9);
    setUserPhone(formatted);
  }

  function startTest(e?: FormEvent) {
    e?.preventDefault();
    if (!canStart) {
      setTried(true);
      if (!nameValid) nameRef.current?.focus();
      else if (!phoneValid) phoneRef.current?.focus();
      else if (!ageValid) ageRef.current?.focus();
      else genderRef.current?.focus();
      return;
    }
    clearPending();
    autoSubmittedRef.current = false;
    sentPartsRef.current = { lead: false, result: false };
    setDelivered(false);
    setTried(false);
    setDir(1);
    setOutcome(null);
    setView('test'); setStage(1); setCurrentQ(0);
    setS1Answers({}); setS2Answers({}); setS3Answers({}); setS2Page(0);
    setFcSwap(FORCED_CHOICE.map(() => Math.random() < 0.5));
    setMcOrder(MULTI_CHOICE.map(() => shuffledIndices(4)));
    window.scrollTo(0, 0);
  }

  function restartTest() {
    clearPending();
    autoSubmittedRef.current = false;
    sentPartsRef.current = { lead: false, result: false };
    setDelivered(false);
    setConfirmRestart(false);
    setOutcome(null);
    setView('intro'); setStage(1); setCurrentQ(0); setS2Page(0);
    setS1Answers({}); setS2Answers({}); setS3Answers({});
    window.scrollTo(0, 0);
  }

  /** Test o'rtasida — tasodifan bosilmasligi uchun ikki bosqichli tasdiq */
  function onRestartClick() {
    if (confirmRestart) { restartTest(); return; }
    setConfirmRestart(true);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => setConfirmRestart(false), 3500);
  }

  const atStart = stage === 1 && currentQ === 0;

  function goBack() {
    // o'tish animatsiyasi (yoki yakuniy hisoblash) paytida orqaga qaytish natijani buzmasin
    if (atStart || transitionLockRef.current) return;
    clearPending();
    setDir(-1);
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
    setDir(1);
    setS1Answers(prev => ({ ...prev, [q.id]: answer }));
    schedule(() => {
      if (idx < FORCED_CHOICE.length - 1) setCurrentQ(idx + 1);
      else { setStage(2); setS2Page(0); setCurrentQ(0); }
    }, 320);
    schedule(() => { transitionLockRef.current = false; }, 620);
  }

  const likertPageQs = LIKERT.slice(s2Page * S2_PER_PAGE, s2Page * S2_PER_PAGE + S2_PER_PAGE);
  const s2PageComplete = likertPageQs.every(q => s2Answers[q.id] !== undefined);
  const s2AnsweredOnPage = likertPageQs.filter(q => s2Answers[q.id] !== undefined).length;

  function handleS2Answer(qid: number, val: number) {
    const next = { ...s2Answers, [qid]: val };
    setS2Answers(prev => ({ ...prev, [qid]: val }));
    // keyingi javobsiz fikrni (yoki "Keyingisi" tugmasini) ko'rinadigan joyga olib keladi
    const i = likertPageQs.findIndex(q => q.id === qid);
    const nextIdx = likertPageQs.findIndex((q, j) => j > i && next[q.id] === undefined);
    const target = nextIdx >= 0 ? rowRefs.current[nextIdx] : likertPageQs.every(q => next[q.id] !== undefined) ? nextBtnRef.current : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 24 || rect.top < 72) {
        target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  }

  function handleS2Next() {
    if (!s2PageComplete) return;
    setDir(1);
    if (s2Page < S2_PAGES - 1) setS2Page(p => p + 1);
    else { setStage(3); setCurrentQ(0); }
  }

  function handleS3(answer: 'A' | 'B' | 'C' | 'D') {
    if (transitionLockRef.current) return;
    const idx = Math.min(currentQ, MULTI_CHOICE.length - 1);
    const q = MULTI_CHOICE[idx];
    if (!q) return;
    transitionLockRef.current = true;
    setDir(1);
    const newS3 = { ...s3Answers, [q.id]: answer };
    setS3Answers(newS3);
    if (idx < MULTI_CHOICE.length - 1) {
      schedule(() => setCurrentQ(idx + 1), 320);
      schedule(() => { transitionLockRef.current = false; }, 620);
      return;
    }
    // Oxirgi savol: natija darhol hisoblanadi va yuboriladi (sahifa yangilansa ham yo'qolmaydi),
    // "hisoblanmoqda" ekrani esa faqat tahlil bosqichlarini ko'rsatadi.
    const o = buildOutcome(s1Answers, s2Answers, newS3, userAge, availableIds);
    setOutcome(o);
    trackSiteEvent('career_test_complete');
    submitCareerTestAuto(o.pcts, o.results);
    schedule(() => {
      setView('calculating');
      setCalcStep(0);
      window.scrollTo(0, 0);
      calcTimerRef.current = setInterval(
        () => setCalcStep(s => Math.min(s + 1, CALC_STEPS.length - 1)),
        CALC_MS / CALC_STEPS.length,
      );
    }, 320);
    schedule(() => {
      if (calcTimerRef.current) { clearInterval(calcTimerRef.current); calcTimerRef.current = null; }
      transitionLockRef.current = false;
      setView('result');
      window.scrollTo(0, 0);
    }, 320 + CALC_MS);
  }

  /**
   * Test tugashi bilan avtomatik ravishda leadni CRM'ga (+ umumiy Google Sheet)
   * va karyera testiga xos maydonlarni (jins, yosh, top-3 kurs) alohida
   * "Karyera Testi" Sheet tabiga yuboradi. Fon jarayoni — natijalar sahifasini
   * bloklamaydi, xatolik bo'lsa ham foydalanuvchi natijasini ko'raveradi.
   */
  function submitCareerTestAuto(pcts: Record<RiasecType, number>, finalResults: CourseResult[], attempt = 0) {
    if (autoSubmittedRef.current) return;
    if (!nameValid || !phoneValid) return; // himoya: intro validatsiyasiz bu yergacha yetib kelmasligi kerak
    autoSubmittedRef.current = true;

    const fullPhone = '+998' + rawPhone;
    const topCourseNames = finalResults.slice(0, 3).map(r => r.course.name);
    const code = getHollandCode(pcts).join('');
    const sent = sentPartsRef.current;
    const jobs: Promise<unknown>[] = [];

    if (!sent.lead) {
      jobs.push(submitLeadToAPI({
        name: userName.trim(),
        phone: fullPhone,
        courseId: topCourseNames.join(', ') || 'Karyera testi',
        sourceRef: 'Karyera_Testi',
      }).then(() => { sent.lead = true; }));
    }
    if (!sent.result) {
      jobs.push(submitCareerTestResult({
        name: userName.trim(),
        phone: fullPhone,
        gender: userGender,
        age: userAge,
        hollandCode: code,
        courses: topCourseNames,
      }).then(() => { sent.result = true; }));
    }

    // Tarmoq xatosida lead yo'qolmasin: 2 marta qayta urinadi, baribir bo'lmasa
    // "yuborilmagan" holati saqlanadi va sahifa qayta ochilganda yana yuboriladi.
    Promise.allSettled(jobs).then(rs => {
      const failed = rs.filter(r => r.status === 'rejected');
      if (failed.length === 0) { setDelivered(true); return; }
      console.error('Karyera testi natijasini yuborib boʻlmadi:', failed);
      autoSubmittedRef.current = false;
      if (attempt < 2) schedule(() => submitCareerTestAuto(pcts, finalResults, attempt + 1), 5000 * (attempt + 1));
    });
  }

  const pcts = outcome?.pcts ?? { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const displayStrengths = topStrengthsOf(s2Answers, pcts);
  // kurslar ro'yxati (API) keyin yuklansa ham tavsiya to'g'ri bo'lishi uchun renderda qayta saralanadi
  const results = useMemo(
    () => (outcome ? matchCourses(outcome.pcts, ageNum, availableIds) : []),
    [outcome, ageNum, availableIds],
  );
  const quality = outcome?.quality ?? { differentiation: 0, consistencyDistance: 1, distinctRatings: 0, confidence: 0 };
  const hollandCode = getHollandCode(pcts);
  const ordered = sortedTypes(pcts);
  // 15 yoshgacha bo'lgan foydalanuvchiga kelajakdagi eng mos kattalar kursi ko'rsatiladi
  const futureCourse = useMemo(
    () => (outcome && ageNum !== null && ageNum < 15 ? matchCourses(outcome.pcts, 16, availableIds)[0] ?? null : null),
    [outcome, ageNum, availableIds],
  );

  async function handleDownloadPdf() {
    if (generatingPdf || !outcome) return;
    setGeneratingPdf(true);
    try {
      const doc = await generateCareerTestPdf({
        name: userName.trim(), age: userAge, gender: userGender,
        percentages: pcts, hollandCode, results, strengths: displayStrengths, quality,
        contact: { phone: siteContent?.contactPhone, address: siteContent?.contactAddress?.uz },
      });
      doc.save(`Karyera-Testi-Natijasi${userName.trim() ? '-' + userName.trim().replace(/\s+/g, '_') : ''}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
      toast.error('PDF tayyorlab boʻlmadi. Internetni tekshirib, qayta urinib koʻring.', v2Toast());
    } finally {
      setGeneratingPdf(false);
    }
  }

  function openConsult() {
    const top = results[0]?.course;
    setEnrollCourse({ name: top ? top.name : 'Karyera testi', id: top?.id ?? 'consult', type: 'consult' });
  }

  async function handleShare() {
    const url = `${window.location.origin}/karyera-testi`;
    const text = `Mening Holland kodim — ${hollandCode.join('')} (${hollandCode.map(t => RIASEC_INFO[t].short).join(', ')}). Siz ham oʻzingizga mos kasbni aniqlang:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Karyera testi — DATA Taʼlim', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Matn va havola nusxalandi', v2Toast());
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') toast.error('Ulashib boʻlmadi', v2Toast());
    }
  }

  // ── Klaviatura: 1/2 (A/B), 1–5, 1–4 (A–D) ──
  const stage1Q = FORCED_CHOICE[Math.min(currentQ, FORCED_CHOICE.length - 1)];
  const stage1Slots: ('a' | 'b')[] = fcSwap[Math.min(currentQ, FORCED_CHOICE.length - 1)] ? ['b', 'a'] : ['a', 'b'];
  const mcIdx = Math.min(currentQ, MULTI_CHOICE.length - 1);
  const mcQ = MULTI_CHOICE[mcIdx];
  const mcOptions = (mcOrder[mcIdx] || [0, 1, 2, 3]).map(i => mcQ.options[i]);

  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyHandlerRef.current = (e: KeyboardEvent) => {
    if (view !== 'test' || enrollCourse || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.target as HTMLElement | null;
    const tag = el?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
    if (e.repeat) return; // tugmani bosib turish bir nechta javobni to'ldirib yubormasin
    const k = e.key.toLowerCase();
    if (stage === 1) {
      const i = k === '1' || k === 'a' ? 0 : k === '2' || k === 'b' ? 1 : -1;
      if (i >= 0) { e.preventDefault(); handleS1(stage1Slots[i]); }
    } else if (stage === 2) {
      if (/^[1-5]$/.test(k)) {
        const q = likertPageQs.find(x => s2Answers[x.id] === undefined);
        if (q) { e.preventDefault(); handleS2Answer(q.id, Number(k)); }
      } else if (k === 'enter' && tag !== 'BUTTON' && tag !== 'A' && s2PageComplete) {
        e.preventDefault(); handleS2Next();
      }
    } else {
      const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
      if (k.length === 1 && i >= 0 && mcOptions[i]) { e.preventDefault(); handleS3(mcOptions[i].label); }
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyHandlerRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Savol almashganda: sahifa tepaga, fokus savol sarlavhasiga (ekran o'quvchilar uchun)
  const qKey = stage === 2 ? `s2-${s2Page}` : `s${stage}-${currentQ}`;
  useEffect(() => {
    if (view !== 'test') return;
    if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey, view]);

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : 56 * d }),
    center: { opacity: 1, x: 0, transition: { duration: reduced ? 0.15 : 0.45, ease: EASE_OUT } },
    exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : -36 * d, transition: { duration: reduced ? 0.1 : 0.2, ease: 'easeIn' as const } }),
  };
  const fade = {
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0.15 : 0.6, ease: EASE_OUT } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const stageFrac = stage === 1 ? currentQ / FORCED_CHOICE.length : stage === 2 ? s2Page / S2_PAGES : currentQ / MULTI_CHOICE.length;
  const counter = stage === 1
    ? String(currentQ + 1).padStart(2, '0')
    : stage === 2
      ? `${FORCED_CHOICE.length + s2Page * S2_PER_PAGE + 1}–${FORCED_CHOICE.length + s2Page * S2_PER_PAGE + likertPageQs.length}`
      : String(FORCED_CHOICE.length + LIKERT.length + currentQ + 1);
  const answeredTotal = Object.keys(s1Answers).length + Object.keys(s2Answers).length + Object.keys(s3Answers).length;

  const fieldCls = 'field';
  const firstName = uz(userName.trim().split(/\s+/)[0] || '');

  return (
    <div className="v2 relative min-h-[100svh] overflow-hidden">
      <SEO
        title="Karyera testi — Holland RIASEC | DATA Taʼlim"
        description="Holland RIASEC ilmiy modeliga asoslangan bepul karyera testi: 45 ta savol, 3 bosqich, PDF hisobot va sizga mos IT, media, dizayn yoki moliya kursi."
      />
      {/* yumshoq brend nuri */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{ background: 'radial-gradient(60% 55% at 70% 0%, rgba(0,97,255,.18), transparent 70%)' }}
      />

      <AnimatePresence mode="wait">

        {/* ═══ INTRO ═══ */}
        {view === 'intro' && (
          <motion.section key="intro" {...fade} className="relative pt-28 pb-20 lg:pt-36 lg:pb-28" aria-labelledby="ct-title">
            <HexBackdrop reduced={reduced} />
            <div className="wrap relative grid gap-12 lg:grid-cols-12 lg:gap-8 items-start">
              <div className="lg:col-span-6">
                <p className="t-kicker">Karyera laboratoriyasi · Holland RIASEC</p>
                <h1 id="ct-title" className="t-display mt-6 max-w-[13ch]" style={{ fontSize: 'clamp(2.1rem, 7vw, 6.25rem)' }}>
                  Kasbingizni <span className="ink-grad">maʼlumot</span> bilan aniqlang.
                </h1>
                <p className="t-lead mt-6 max-w-[34rem]">
                  {TOTAL_Q} ta savol qiziqishlaringizni olti oʻlchovda baholaydi va sizga eng mos yoʻnalishni — dasturlash, media, dizayn yoki moliyani — koʻrsatadi.
                </p>

                <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden max-w-[36rem]" style={{ background: 'var(--line)' }}>
                  {[
                    ['≈12', 'daqiqa'],
                    [String(TOTAL_Q), 'savol'],
                    ['3', 'bosqich'],
                    ['PDF', 'hisobot'],
                  ].map(([n, l]) => (
                    <li key={l} className="p-4" style={{ background: 'var(--bg)' }}>
                      <span className="block mono text-2xl" style={{ fontWeight: 500 }}>{n}</span>
                      <span className="block text-sm ink-3 mt-1">{l}</span>
                    </li>
                  ))}
                </ul>

                <ol className="mt-12 grid gap-0 max-w-[36rem]">
                  {[
                    ['01', STAGE_LABELS[0], `${FORCED_CHOICE.length} juftlik — ikkitadan sizga yaqinini tanlaysiz.`],
                    ['02', STAGE_LABELS[1], `${LIKERT.length} ta fikrga 1 dan 5 gacha baho berasiz.`],
                    ['03', STAGE_LABELS[2], `${MULTI_CHOICE.length} ta real vaziyatda qanday yoʻl tutishingizni tanlaysiz.`],
                  ].map(([n, t, d]) => (
                    <li key={n} className="hairline py-4 grid grid-cols-[3rem_1fr] gap-2">
                      <span className="mono ink-blue text-sm pt-0.5">{n}</span>
                      <span>
                        <span className="block font-semibold">{t}</span>
                        <span className="block text-[0.95rem] ink-2 mt-0.5">{d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm ink-3 max-w-[36rem]">
                  J. Holland (1997) nazariyasi asosida: barcha 15 ta tip juftligi taqqoslanadi, har bosqich teng vaznda, variantlar tasodifiy tartibda.
                </p>
              </div>

              <div className="lg:col-span-5 lg:col-start-8 lg:sticky lg:top-28">
                <form onSubmit={startTest} noValidate className="panel p-6 sm:p-9 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-2) 88%, transparent)' }} aria-labelledby="ct-form-title">
                  <p id="ct-form-title" className="t-h3">Natijani kimga tayyorlaymiz?</p>
                  <p className="t-body mt-2 !text-[0.95rem]">Hisobot shaxsiy boʻladi, mos kurslar yoshingizga qarab saralanadi.</p>

                  <div className="mt-7 grid gap-5">
                    <div>
                      <label htmlFor="ct-name" className="block text-sm font-medium mb-2">Ismingiz</label>
                      <input
                        ref={nameRef} id="ct-name" name="name" autoComplete="given-name" maxLength={60}
                        value={userName} onChange={e => setUserName(e.target.value)}
                        aria-invalid={!!errors.name} aria-describedby={errors.name ? 'ct-name-err' : undefined}
                        className={fieldCls} placeholder="Masalan, Dilnoza"
                      />
                      {errors.name && <p id="ct-name-err" className="field-err">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="ct-phone" className="block text-sm font-medium mb-2">Telefon raqamingiz</label>
                      <div className="field-group" data-invalid={!!errors.phone || undefined}>
                        <span className="flex items-center pl-5 pr-2 mono ink-3 select-none" aria-hidden="true">+998</span>
                        <input
                          ref={phoneRef} id="ct-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                          value={userPhone} onChange={handlePhoneChange} maxLength={14}
                          aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'ct-phone-err' : 'ct-phone-hint'}
                          className="bare-input flex-1 min-w-0 h-14 pr-5 outline-none text-[1.0625rem]"
                          style={{ background: 'transparent', border: 0, color: 'var(--fg)' }}
                          placeholder="90 123 45 67"
                        />
                      </div>
                      {errors.phone
                        ? <p id="ct-phone-err" className="field-err">{errors.phone}</p>
                        : <p id="ct-phone-hint" className="text-xs ink-3 mt-2">Natija va mos kurslar boʻyicha maslahat uchun.</p>}
                    </div>
                    <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-4">
                      <div>
                        <label htmlFor="ct-age" className="block text-sm font-medium mb-2">Yoshingiz</label>
                        <input
                          ref={ageRef} id="ct-age" name="age" inputMode="numeric" maxLength={2}
                          value={userAge} onChange={e => setUserAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          aria-invalid={!!errors.age} aria-describedby={errors.age ? 'ct-age-err' : undefined}
                          className={`${fieldCls} mono`} placeholder="17"
                        />
                      </div>
                      <div>
                        <span id="ct-gender-label" className="block text-sm font-medium mb-2">Jinsingiz</span>
                        <div role="radiogroup" aria-labelledby="ct-gender-label" aria-describedby={errors.gender ? 'ct-gender-err' : undefined} className="grid grid-cols-2 gap-2">
                          {([['male', 'Erkak'], ['female', 'Ayol']] as [Gender, string][]).map(([val, label], i) => (
                            <button
                              key={val} ref={i === 0 ? genderRef : undefined} type="button" role="radio"
                              aria-checked={userGender === val}
                              onClick={() => setUserGender(val)}
                              className="seg"
                              data-invalid={!!errors.gender || undefined}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {(errors.age || errors.gender) && (
                      <div className="-mt-2">
                        {errors.age && <p id="ct-age-err" className="field-err">{errors.age}</p>}
                        {errors.gender && <p id="ct-gender-err" className="field-err">{errors.gender}</p>}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-8">
                    Testni boshlash <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <p className="text-xs ink-3 mt-4 leading-relaxed">
                    Maʼlumotlaringiz faqat test natijasi va tavsiya etilgan kurslar boʻyicha siz bilan bogʻlanish uchun ishlatiladi.
                  </p>
                </form>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ TEST ═══ */}
        {view === 'test' && (
          <motion.section key="test" {...fade} className="relative pt-24 pb-20 sm:pt-28" aria-label="Karyera testi savollari">
            <div className="wrap" style={{ maxWidth: '64rem' }}>
              {/* boshqaruv paneli */}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={goBack} disabled={atStart} className="btn btn-ghost !min-h-[44px] !px-4 !text-[0.9rem]">
                  <ArrowLeft size={16} aria-hidden="true" /> Orqaga
                </button>
                <span className="mono text-sm ink-2" aria-live="polite">
                  <span className="sr-only">Savol </span>{counter} <span className="ink-3">/ {TOTAL_Q}</span>
                </span>
                <button
                  type="button" onClick={onRestartClick}
                  className={`btn !min-h-[44px] !px-4 !text-[0.9rem] ${confirmRestart ? 'btn-primary' : 'btn-ghost'}`}
                  aria-label={confirmRestart ? 'Tasdiqlang: testni qaytadan boshlash' : 'Testni qaytadan boshlash'}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  <span className={confirmRestart ? '' : 'hidden sm:inline'}>{confirmRestart ? 'Tasdiqlash' : 'Qaytadan'}</span>
                </button>
              </div>

              {/* bosqichlar */}
              <div
                className="mt-6 grid grid-cols-3 gap-2"
                role="progressbar" aria-label="Test jarayoni"
                aria-valuemin={0} aria-valuemax={TOTAL_Q} aria-valuenow={answeredTotal}
                aria-valuetext={`${STAGE_LABELS[stage - 1]}, ${answeredTotal} ta javob`}
              >
                {[1, 2, 3].map(s => {
                  const fill = s < stage ? 1 : s === stage ? Math.max(0.04, stageFrac) : 0;
                  return (
                    <div key={s}>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line-2)' }}>
                        <motion.div
                          className="h-full w-full rounded-full"
                          style={{ background: 'var(--grad)', originX: 0 }}
                          initial={false}
                          animate={{ scaleX: fill }}
                          transition={{ duration: reduced ? 0 : 0.5, ease: EASE_OUT }}
                        />
                      </div>
                      <span className={`mt-2 block text-xs ${s === stage ? '' : 'ink-3'}`}>
                        <span className="mono mr-1.5">0{s}</span>
                        <span className={s === stage ? '' : 'hidden sm:inline'}>{STAGE_LABELS[s - 1]}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={qKey}
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="mt-12 sm:mt-16"
                  onAnimationComplete={def => { if (def === 'center') headingRef.current?.focus({ preventScroll: true }); }}
                >
                  {/* Bosqich 1 — majburiy tanlov */}
                  {stage === 1 && (
                    <>
                      <p className="t-kicker">Savol {String(currentQ + 1).padStart(2, '0')} · Qaysi biri sizga yaqinroq?</p>
                      <h2 ref={headingRef} tabIndex={-1} className="t-q mt-4 outline-none">{uz(stage1Q.text)}</h2>
                      <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2" role="group" aria-label="Variantlar">
                        {stage1Slots.map((key, i) => {
                          const opt = key === 'a' ? stage1Q.optionA : stage1Q.optionB;
                          const Icon = opt.icon;
                          return (
                            <button
                              key={key} type="button" className="choice md:min-h-[15rem]"
                              aria-pressed={s1Answers[stage1Q.id] === key}
                              onClick={() => handleS1(key)}
                            >
                              <span className="flex items-center justify-between w-full">
                                <span className="ico"><Icon size={24} aria-hidden="true" /></span>
                                <span className="key" aria-hidden="true">{i + 1}</span>
                              </span>
                              <span className="text-[1.15rem] md:text-[1.3rem] leading-snug font-medium tracking-[-0.015em]">{uz(opt.text)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Bosqich 2 — Likert */}
                  {stage === 2 && (
                    <>
                      <p className="t-kicker">Oʻzini baholash · {s2Page + 1}/{S2_PAGES}</p>
                      <h2 ref={headingRef} tabIndex={-1} className="t-q mt-4 outline-none">Bu fikrlar sizga qanchalik mos?</h2>
                      <ol className="mt-10 grid gap-3">
                        {likertPageQs.map((q, qi) => {
                          const val = s2Answers[q.id];
                          return (
                            <li key={q.id} ref={el => { rowRefs.current[qi] = el; }} className="panel !rounded-[22px] p-5 sm:p-6">
                              <p id={`lk-${q.id}`} className="text-[1.05rem] sm:text-[1.15rem] leading-snug">
                                <span className="mono ink-3 mr-3 text-sm">{FORCED_CHOICE.length + s2Page * S2_PER_PAGE + qi + 1}</span>
                                {uz(q.text)}
                              </p>
                              <div className="mt-5 grid grid-cols-5 gap-2" role="group" aria-labelledby={`lk-${q.id}`}>
                                {[1, 2, 3, 4, 5].map(v => (
                                  <button
                                    key={v} type="button" className="scale-btn"
                                    aria-pressed={val === v}
                                    data-fill={val !== undefined && v < val ? 'on' : undefined}
                                    aria-label={`${v} — ${LIKERT_HINTS[v - 1]}`}
                                    title={LIKERT_HINTS[v - 1]}
                                    onClick={() => handleS2Answer(q.id, v)}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-2 flex justify-between text-xs ink-3" aria-hidden="true">
                                <span>{LIKERT_HINTS[0]}</span>
                                <span>{LIKERT_HINTS[4]}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                      <div className="mt-8 flex items-center justify-between gap-4">
                        <span className="text-sm ink-3" aria-live="polite">{s2AnsweredOnPage}/{likertPageQs.length} javob</span>
                        <button ref={nextBtnRef} type="button" onClick={handleS2Next} disabled={!s2PageComplete} className="btn btn-primary">
                          {s2Page < S2_PAGES - 1 ? 'Keyingisi' : '3-bosqichga oʻtish'} <ArrowRight size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Bosqich 3 — vaziyatli qaror */}
                  {stage === 3 && (
                    <>
                      <p className="t-kicker">Vaziyat {mcIdx + 1} / {MULTI_CHOICE.length} · Siz nima qilasiz?</p>
                      <h2 ref={headingRef} tabIndex={-1} className="t-q mt-4 outline-none">{uz(mcQ.text)}</h2>
                      <div className="mt-10 grid gap-3 md:grid-cols-2" role="group" aria-label="Variantlar">
                        {mcOptions.map((opt, i) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.label} type="button" className="choice !flex-row !items-start !gap-4"
                              aria-pressed={s3Answers[mcQ.id] === opt.label}
                              onClick={() => handleS3(opt.label)}
                            >
                              <span className="ico !w-11 !h-11 shrink-0"><Icon size={20} aria-hidden="true" /></span>
                              <span className="flex-1 text-[1.02rem] leading-relaxed pt-2">{uz(opt.text)}</span>
                              <span className="key shrink-0 mt-2" aria-hidden="true">{'ABCD'[i]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="mt-10 text-sm ink-3 hidden md:block" aria-hidden="true">
                Klaviatura: {stage === 1 ? '1 yoki 2' : stage === 2 ? '1–5 baho, Enter — keyingisi' : 'A–D yoki 1–4'}
              </p>
            </div>
          </motion.section>
        )}

        {/* ═══ HISOBLANMOQDA ═══ */}
        {view === 'calculating' && (
          <motion.section key="calc" {...fade} className="relative min-h-[100svh] flex items-center justify-center pt-20 pb-12" aria-busy="true">
            <div className="wrap max-w-xl text-center">
              <div className="mx-auto w-full max-w-[22rem]">
                <HexChart pcts={pcts} reduced={reduced} size={420} />
              </div>
              <p className="t-kicker mt-6">Tahlil</p>
              <p className="t-h3 mt-3" role="status" aria-live="polite">{CALC_STEPS[calcStep]}…</p>
              <div className="mt-6 h-1 rounded-full overflow-hidden mx-auto max-w-xs" style={{ background: 'var(--line-2)' }}>
                <motion.div
                  className="h-full w-full"
                  style={{ background: 'var(--grad)', originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: CALC_MS / 1000, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ NATIJA ═══ */}
        {view === 'result' && outcome && (
          <motion.div key="result" {...fade} className="relative">
            {/* 1. Holland kodi */}
            <section className="pt-28 pb-16 lg:pt-36" aria-labelledby="ct-result-title">
              <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
                <div className="lg:col-span-6">
                  <p className="t-kicker">Natija{firstName ? ` · ${firstName}` : ''}</p>
                  <h1 id="ct-result-title" className="t-h2 mt-5">Sizning Holland kodingiz</h1>
                  <p className="mono ink-grad mt-4 leading-none tracking-[0.06em] text-[clamp(5rem,15vw,10.5rem)]" style={{ fontWeight: 500 }} aria-label={`Holland kodi: ${hollandCode.join('')}`}>
                    {hollandCode.join('')}
                  </p>
                  <p className="t-lead mt-6 max-w-[34rem]">
                    <span style={{ color: 'var(--fg)' }}>{hollandCode.map(t => RIASEC_INFO[t].short).join(' → ')}</span>. Bu uch tip kasbiy qiziqishlaringizning ustuvor kombinatsiyasi.
                  </p>

                  <dl className="mt-10 grid grid-cols-3 gap-px rounded-2xl overflow-hidden max-w-[34rem]" style={{ background: 'var(--line)' }}>
                    {[
                      ['Ishonchlilik', `${quality.confidence}%`, 'Javoblar izchilligi'],
                      ['Farqlanish', uz(diffLabel(quality.differentiation)), `${quality.differentiation}% farq`],
                      ['Izchillik', uz(consLabel(quality.consistencyDistance)), 'Ustuvor 2 tip yaqinligi'],
                    ].map(([k, v, h]) => (
                      <div key={k} className="p-4" style={{ background: 'var(--bg)' }}>
                        <dt className="text-xs ink-3">{k}</dt>
                        <dd className="text-xl font-semibold tracking-[-0.02em] mt-1">{v}</dd>
                        <dd className="text-xs ink-3 mt-1 leading-snug">{h}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="t-body mt-5 max-w-[34rem] !text-[0.95rem]">
                    {quality.confidence >= 75
                      ? 'Javoblaringiz izchil va profilingiz aniq ajralgan — natija yuqori ishonchli.'
                      : quality.confidence >= 55
                        ? 'Natija ishonchli, ammo baʼzi tiplar bir-biriga yaqin — kurs tanlashda ikkinchi variantni ham koʻrib chiqing.'
                        : 'Profilingiz nisbatan tekis chiqdi. Aniqroq natija uchun testni shoshilmasdan qayta topshirishni tavsiya qilamiz.'}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button type="button" onClick={openConsult} className="btn btn-primary">
                      <MessageCircle size={18} aria-hidden="true" /> Bepul maslahat
                    </button>
                    <button type="button" onClick={handleDownloadPdf} disabled={generatingPdf} aria-busy={generatingPdf} className="btn btn-ghost !px-5">
                      {generatingPdf ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
                      {generatingPdf ? 'Tayyorlanmoqda…' : 'PDF hisobot'}
                    </button>
                    <button type="button" onClick={handleShare} className="btn btn-ghost !px-5">
                      <Share2 size={18} aria-hidden="true" /> Ulashish
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <div className="mx-auto max-w-[32rem]">
                    <HexChart pcts={pcts} reduced={reduced} />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Mos kurslar */}
            <section className="py-16 lg:py-24 hairline" aria-labelledby="ct-courses-title">
              <div className="wrap">
                <div className="grid gap-6 lg:grid-cols-12 items-end">
                  <div className="lg:col-span-7">
                    <p className="t-kicker">01 — Tavsiya</p>
                    <h2 id="ct-courses-title" className="t-h2 mt-5">Sizga mos kurslar</h2>
                  </div>
                  <p className="lg:col-span-5 t-body !text-[0.95rem]">
                    Moslik profil shakli oʻxshashligi (kosinus) va Holland kodlari mosligi (Iachan indeksi) asosida hisoblangan, yoshingiz boʻyicha saralangan.
                  </p>
                </div>
                {results.length < 3 && ageValid && (
                  <p className="mt-8 text-sm ink-2 panel !rounded-2xl px-5 py-4">
                    {ageNum} yosh uchun ayni paytda {results.length} ta kurs mavjud — qolgan yoʻnalishlarimiz 15 yoshdan boshlanadi.
                    {futureCourse && (
                      <> Profilingizga koʻra 15 yoshdan keyin sizga <strong style={{ color: 'var(--fg)' }}>{uz(futureCourse.course.name)}</strong> ({futureCourse.matchScore}% moslik) mos tushadi.</>
                    )}
                  </p>
                )}

                {results[0] && (() => {
                  const r = results[0];
                  const topTypes = [...TYPES].sort((a, b) => r.course.riasec[b] - r.course.riasec[a]).slice(0, 3);
                  // "Nima uchun" — kurs talab qiladigan tiplardan foydalanuvchida eng kuchli ikkitasi
                  const whyTypes = sortedTypes(pcts).filter(t => topTypes.includes(t)).slice(0, 2);
                  return (
                    <motion.article
                      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                      className="mt-12 rounded-[28px] p-7 sm:p-10 grid gap-8 md:grid-cols-[1fr_auto] items-center relative overflow-hidden"
                      style={{ background: 'var(--bg-2)', border: '1px solid rgba(0,97,255,.55)', boxShadow: '0 30px 80px -40px rgba(0,97,255,.7)' }}
                    >
                      <div>
                        <p className="t-kicker !text-[var(--blue-ink)]">01 · Eng mos yoʻnalish</p>
                        <h3 className="t-h2 !text-[clamp(1.9rem,3.6vw,3rem)] mt-4">{uz(r.course.name)}</h3>
                        <p className="t-body mt-3 max-w-[40rem]">{uz(r.course.desc)}</p>
                        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Kurs talab qiladigan tiplar">
                          {topTypes.map(t => (
                            <li key={t} className="text-sm px-3 py-1 rounded-full flex items-center gap-2" style={{ border: '1px solid var(--line-2)' }}>
                              <span className="w-2 h-2 rounded-full" style={{ background: RIASEC_INFO[t].color }} aria-hidden="true" />
                              {RIASEC_INFO[t].short}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-5 text-sm ink-2">
                          Nima uchun: sizda {whyTypes.map(t => `${RIASEC_INFO[t].short.toLowerCase()} (${pcts[t]}%)`).join(' va ')} tiplar kuchli — bu kurs aynan shularga tayanadi.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                          <button type="button" className="btn btn-primary" onClick={() => setEnrollCourse({ name: r.course.name, id: r.course.id, type: 'enroll' })}>
                            Kursga yozilish <ArrowRight size={18} aria-hidden="true" />
                          </button>
                          <Link to={r.course.url} className="btn btn-ghost">Kurs haqida</Link>
                        </div>
                      </div>
                      <div className="md:text-right md:pl-6">
                        <span className="block mono ink-grad leading-none text-[clamp(4rem,9vw,7rem)]" style={{ fontWeight: 500 }}>{r.matchScore}%</span>
                        <span className="block text-sm ink-3 mt-2">moslik</span>
                      </div>
                    </motion.article>
                  );
                })()}

                {results.length > 1 && (
                  <ol className="mt-6">
                    {results.slice(1).map((r, i) => (
                      <motion.li
                        key={r.course.id}
                        initial={reduced ? false : 'off'}
                        whileInView="on"
                        viewport={{ once: true, margin: '-40px' }}
                        variants={{ off: { opacity: 0, y: 16 }, on: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: i * 0.05 } } }}
                        className="hairline py-6 grid gap-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                      >
                        <span className="mono ink-3 text-sm">{String(r.rank).padStart(2, '0')}</span>
                        <div className="min-w-0">
                          <h3 className="text-[1.3rem] font-semibold tracking-[-0.02em]">{uz(r.course.name)}</h3>
                          <p className="text-[0.95rem] ink-2 mt-1">{uz(r.course.desc)}</p>
                          <div className="mt-3 h-1 rounded-full overflow-hidden max-w-sm" style={{ background: 'var(--line-2)' }} aria-hidden="true">
                            <motion.div
                              className="h-full w-full"
                              style={{ background: 'var(--grad)', originX: 0 }}
                              variants={{ off: { scaleX: 0 }, on: { scaleX: r.matchScore / 100, transition: { duration: 1, ease: EASE_OUT, delay: 0.15 } } }}
                              initial={reduced ? { scaleX: r.matchScore / 100 } : undefined}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:justify-end">
                          <span className="mono text-2xl" style={{ fontWeight: 500 }}>{r.matchScore}%</span>
                          <Link to={r.course.url} className="btn btn-ghost !min-h-[44px] !px-4 !text-[0.9rem]" aria-label={`${uz(r.course.name)} — kurs haqida`}>
                            Batafsil
                          </Link>
                          <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 !text-[0.9rem]" onClick={() => setEnrollCourse({ name: r.course.name, id: r.course.id, type: 'enroll' })} aria-label={`${uz(r.course.name)} kursiga yozilish`}>
                            Yozilish
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            {/* 3. To'liq profil */}
            <section className="py-16 lg:py-24 hairline" aria-labelledby="ct-profile-title">
              <div className="wrap grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="t-kicker">02 — Profil</p>
                  <h2 id="ct-profile-title" className="t-h2 mt-5">Olti oʻlchov</h2>
                  <p className="t-body mt-5">Har bir tip qiziqishlaringizning qancha qismini tashkil etishi. Yuqoridagi uchtasi — sizning kodingiz.</p>
                </div>
                <ol className="lg:col-span-8">
                  {ordered.map((t, i) => {
                    const info = RIASEC_INFO[t];
                    const Icon = info.icon;
                    const lead = i < 3;
                    return (
                      <motion.li
                        key={t}
                        className="hairline py-6 grid grid-cols-[2.75rem_1fr] gap-4"
                        initial={reduced ? false : 'off'}
                        whileInView="on"
                        viewport={{ once: true, margin: '-40px' }}
                      >
                        <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${info.color}1f`, color: info.color }}>
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className={`text-[1.15rem] font-semibold tracking-[-0.015em] ${lead ? '' : 'ink-2'}`}>
                              <span className="mono mr-2" style={{ color: info.color }}>{t}</span>{uz(info.name)}
                            </h3>
                            <span className="mono text-lg shrink-0">{pcts[t]}%</span>
                          </div>
                          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line-2)' }} aria-hidden="true">
                            <motion.div
                              className="h-full w-full rounded-full"
                              style={{ background: info.color, originX: 0 }}
                              variants={{ off: { scaleX: 0 }, on: { scaleX: pcts[t] / 100, transition: { duration: 1, ease: EASE_OUT, delay: 0.1 } } }}
                              initial={reduced ? { scaleX: pcts[t] / 100 } : undefined}
                            />
                          </div>
                          {lead && <p className="t-body mt-3 !text-[0.98rem]">{uz(info.desc)}</p>}
                          <p className="text-sm ink-3 mt-2">Tipik kasblar: {uz(info.careers)}</p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </div>
            </section>

            {/* 4. Kuchli tomonlar */}
            {displayStrengths.length > 0 && (
              <section className="py-16 lg:py-24 hairline" aria-labelledby="ct-strengths-title">
                <div className="wrap">
                  <p className="t-kicker">03 — Kuchli tomonlar</p>
                  <h2 id="ct-strengths-title" className="t-h2 mt-5 max-w-[16ch]">Sizda allaqachon bor narsalar</h2>
                  <ul className="mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-3 rounded-[24px] overflow-hidden" style={{ background: 'var(--line)' }}>
                    {displayStrengths.map(s => (
                      <li key={s.name} className="p-6 sm:p-7" style={{ background: 'var(--bg)' }}>
                        <s.icon size={22} className="ink-cyan" aria-hidden="true" />
                        <p className="mt-5 text-[1.1rem] font-semibold tracking-[-0.015em]">{uz(s.name)}</p>
                        <p className="text-[0.95rem] ink-2 mt-1.5 leading-relaxed">{uz(s.desc)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* 5. Yakun */}
            <section className="py-16 lg:py-24 hairline">
              <div className="wrap flex flex-col lg:flex-row gap-8 lg:items-end justify-between">
                <div>
                  <p className="t-kicker">Keyingi qadam</p>
                  <p className="t-h2 mt-5 max-w-[18ch]">Bepul maslahat uchun biz bilan bogʻlaning.</p>
                  <p className="t-body mt-4 max-w-[36rem]">Natijangiz asosida mutaxassisimiz siz bilan bogʻlanib, kurs tanlashda yordam beradi.</p>
                  {delivered && (
                    <p className="mt-4 flex items-start gap-2 text-sm ink-2 max-w-[36rem]" role="status">
                      <CheckCircle size={18} className="shrink-0 mt-px" style={{ color: "var(--green-ink)" }} aria-hidden="true" />
                      <span>Natijangiz +998 {userPhone} raqami bilan qabul qilindi — mutaxassisimiz tez orada qoʻngʻiroq qiladi.</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={openConsult} className="btn btn-primary">
                    <MessageCircle size={18} aria-hidden="true" /> Bepul maslahat olish
                  </button>
                  {siteContent?.contactPhone && (
                    <a href={`tel:${siteContent.contactPhone.replace(/[^\d+]/g, '')}`} className="btn btn-ghost">
                      <Phone size={16} aria-hidden="true" /> {siteContent.contactPhone}
                    </a>
                  )}
                  <Link to="/kurslar" className="btn btn-ghost">Barcha kurslar</Link>
                  <button type="button" onClick={restartTest} className="btn btn-ghost">
                    <RotateCcw size={16} aria-hidden="true" /> Qayta topshirish
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}

      </AnimatePresence>

      {enrollCourse && (
        <EnrollModal
          isOpen={!!enrollCourse}
          onClose={() => setEnrollCourse(null)}
          courseName={enrollCourse.name}
          type={enrollCourse.type}
          extraInfo={`Karyera testi natijasi asosida tavsiya etildi. Holland kodi: ${hollandCode.join('')}`}
          sourceRef="Karyera_Testi"
          initialName={userName.trim()}
          initialPhone={userPhone}
        />
      )}
    </div>
  );
}
