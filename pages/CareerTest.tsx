import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, RotateCcw, BookOpen, Award, Zap, Target, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, FloatingStars } from '../components/BrandElements';
import { SEO } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';

// ─── Types ───────────────────────────────────────────────────────────────────
type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
type View = 'intro' | 'test' | 'calculating' | 'result';
type Stage = 1 | 2 | 3;

interface ForcedChoiceQ {
  id: number;
  text: string;
  optionA: { emoji: string; text: string; type: RiasecType };
  optionB: { emoji: string; text: string; type: RiasecType };
}

interface LikertQ {
  id: number;
  text: string;
  types: RiasecType[];
}

interface MultiChoiceQ {
  id: number;
  text: string;
  options: { label: 'A' | 'B' | 'C' | 'D'; text: string; type: RiasecType }[];
}

interface Course {
  id: string;
  name: string;
  url: string;
  riasec: Record<RiasecType, number>;
  desc: string;
}

interface CourseResult {
  course: Course;
  matchScore: number;
  rank: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const FORCED_CHOICE: ForcedChoiceQ[] = [
  { id:1, text:"Qaysi faoliyat sizga ko'proq yoqadi?", optionA:{emoji:"🔧",text:"Texnik qurilmalar yig'ish yoki ta'mirlash",type:"R"}, optionB:{emoji:"🔬",text:"Ilmiy eksperimentlar o'tkazish",type:"I"} },
  { id:2, text:"Qaysi muhitda ishlashni xohlaysiz?", optionA:{emoji:"🎨",text:"Ijodiy studiya yoki dizayn bo'limi",type:"A"}, optionB:{emoji:"🤝",text:"Odamlar bilan bevosita ishlash",type:"S"} },
  { id:3, text:"Qaysi vazifa sizni ko'proq qiziqtiradi?", optionA:{emoji:"🏗️",text:"Inshoot yoki qurilma yaratish",type:"R"}, optionB:{emoji:"📊",text:"Ma'lumotlarni tahlil qilib hisobot yozish",type:"C"} },
  { id:4, text:"Dam olish kunlari nima qilishni yoqtirasiz?", optionA:{emoji:"💡",text:"Yangi texnologiyalarni o'rganish",type:"I"}, optionB:{emoji:"🎭",text:"Ijodiy loyiha yoki san'at bilan shug'ullanish",type:"A"} },
  { id:5, text:"Qaysi rol sizga mos keladi?", optionA:{emoji:"📢",text:"Jamoani boshqarish va ilhomlantirish",type:"E"}, optionB:{emoji:"🧑‍🤝‍🧑",text:"Insonlarga maslahat berish yoki o'qitish",type:"S"} },
  { id:6, text:"Qaysi qobiliyatingizni ko'proq ishlatmoqchisiz?", optionA:{emoji:"📐",text:"Aniq hisob-kitob va tartib",type:"C"}, optionB:{emoji:"🚀",text:"Tadbirkorlik va yangi loyihalar boshlash",type:"E"} },
  { id:7, text:"Idealdagi ish joyingiz qanday?", optionA:{emoji:"🌿",text:"Ochiq havoda yoki laboratoriyada",type:"R"}, optionB:{emoji:"🎵",text:"Musiqa, kino yoki media sohasida",type:"A"} },
  { id:8, text:"Qaysi muammo sizni ko'proq jalb qiladi?", optionA:{emoji:"🧪",text:"Ilmiy gipotezani tekshirish",type:"I"}, optionB:{emoji:"❤️",text:"Insonlarning hayotini yaxshilash",type:"S"} },
  { id:9, text:"Qaysi faoliyatda kuchli ekansiz?", optionA:{emoji:"💰",text:"Savdo yoki biznes negotiation",type:"E"}, optionB:{emoji:"📋",text:"Hujjatlar va jarayonlarni tartibga solish",type:"C"} },
  { id:10, text:"Qaysi ishni tanlar edingiz?", optionA:{emoji:"🛠️",text:"Muhandis yoki texnik mutaxassis",type:"R"}, optionB:{emoji:"🎓",text:"O'qituvchi yoki trener",type:"S"} },
  { id:11, text:"Qaysi loyiha sizni hayajonlantiradi?", optionA:{emoji:"🔭",text:"Yangi kashfiyot yoki tadqiqot",type:"I"}, optionB:{emoji:"🏢",text:"Kompaniya yoki startap ochish",type:"E"} },
  { id:12, text:"Qaysi faoliyatda o'zingizni rahat his qilasiz?", optionA:{emoji:"✍️",text:"Yozish, chizish yoki kompozitsiya",type:"A"}, optionB:{emoji:"📁",text:"Ma'lumot bazasini boshqarish",type:"C"} },
  { id:13, text:"Qaysi so'z sizni ko'proq tavsiflaydi?", optionA:{emoji:"⚙️",text:"Amaliy va texnik",type:"R"}, optionB:{emoji:"🌟",text:"Ijodiy va innovatsion",type:"A"} },
  { id:14, text:"Qaysi muhitda samarali ishlaysiz?", optionA:{emoji:"🧬",text:"Ilm-fan va tadqiqot laboratoriyasi",type:"I"}, optionB:{emoji:"📊",text:"Moliyaviy tahlil va buxgalteriya",type:"C"} },
  { id:15, text:"Qaysi ish turini afzal ko'rasiz?", optionA:{emoji:"🎯",text:"Odamlarga maqsadga erishishda yordam",type:"S"}, optionB:{emoji:"💼",text:"Biznesni rivojlantirish va marketing",type:"E"} },
  { id:16, text:"Erkin vaqtda nima qilishni yaxshi ko'rasiz?", optionA:{emoji:"🔩",text:"Mexanik yoki elektron qurilmalar bilan ishlash",type:"R"}, optionB:{emoji:"📚",text:"Ilmiy kitob o'qish yoki tadqiqot",type:"I"} },
  { id:17, text:"Qaysi soha sizni ko'proq qiziqtiradi?", optionA:{emoji:"🎬",text:"San'at, dizayn yoki ijodiy media",type:"A"}, optionB:{emoji:"🤝",text:"Ijtimoiy xizmat yoki psixologiya",type:"S"} },
  { id:18, text:"Karyerangizda nima muhimroq?", optionA:{emoji:"📈",text:"Yuqori daromad va martaba o'sishi",type:"E"}, optionB:{emoji:"🗂️",text:"Tartib, aniqlik va barqarorlik",type:"C"} },
];

const LIKERT: LikertQ[] = [
  { id:19, text:"Men boshqalarni osongina ishontira olaman va g'oyalarimni tushuntirib bera olaman.", types:['E','S'] },
  { id:20, text:"Murakkab muammolarni bosqichma-bosqich tahlil qilish mening kuchli tomonim.", types:['I','C'] },
  { id:21, text:"Yangi g'oyalar chiqarish va ijodiy yechimlar topish meni hayajonlantiradi.", types:['A','I'] },
  { id:22, text:"Odamlar mening hissiyotlarini tushunishim va empatiyamni ko'pincha ta'kidlashadi.", types:['S'] },
  { id:23, text:"Men loyihalarni boshidan oxirigacha to'liq rejalashtira olaman.", types:['C','E'] },
  { id:24, text:"Yangi muhit yoki vazifaga tezda moslasha olaman.", types:['E','A'] },
  { id:25, text:"Guruh yetakchisi sifatida mas'uliyat olishdan qo'rqmayman.", types:['E'] },
  { id:26, text:"Texnologiya va yangi dasturlarni o'rganish men uchun qiyin emas.", types:['R','I'] },
  { id:27, text:"Nozik tafsilotlarga e'tibor berish va xatolarni topish mening kuchim.", types:['C','I'] },
  { id:28, text:"Muloqot va networking orqali yangi aloqalar o'rnatishni yaxshi ko'raman.", types:['E','S'] },
  { id:29, text:"Qiyin vaziyatlarda sakin qolishim va bosim ostida ishlashim mumkin.", types:['C','R'] },
  { id:30, text:"O'qitish va bilimlarni boshqalarga ulashish meni qoniqtiradi.", types:['S'] },
];

const MULTI_CHOICE: MultiChoiceQ[] = [
  {
    id:31,
    text:"Ikki hamkasbingiz o'rtasida jiddiy nizo kelib chiqdi va ish jarayoni to'xtab qoldi. Siz nima qilasiz?",
    options:[
      {label:'A',text:"Ikkalasini alohida tinglab, keyin uchrashuv tashkil qilaman",type:'S'},
      {label:'B',text:"Muammoning asosiy sababini tahlil qilib, yozma yechim taklif qilaman",type:'I'},
      {label:'C',text:"Menejerga bildiraman — bu uning ishi",type:'C'},
      {label:'D',text:"Tezda o'z yechimim bilan aralashib, jarayonni davom ettiraman",type:'E'},
    ]
  },
  {
    id:32,
    text:"Sizga to'liq yangi, hech qanday ko'rsatmasiz berilgan muhim loyiha topshirildi. Qanday harakat qilasiz?",
    options:[
      {label:'A',text:"Darhol boshlayman — harakat qilib o'rganaman",type:'E'},
      {label:'B',text:"Tajribali odamlar bilan maslahat o'tkazaman",type:'S'},
      {label:'C',text:"Batafsil reja tuzib, keyin bosqichma-bosqich bajaraman",type:'C'},
      {label:'D',text:"Tadqiqot qilaman va eng optimal yondashuvni qidiraman",type:'I'},
    ]
  },
  {
    id:33,
    text:"Karyerangizda eng katta muvaffaqiyat nima deb bilasiz?",
    options:[
      {label:'A',text:"Boshqalarga hayot o'zgartiruvchi ta'sir ko'rsatish",type:'S'},
      {label:'B',text:"Muhim kashfiyot yoki innovatsiya yaratish",type:'I'},
      {label:'C',text:"Katta kompaniya yoki jamoani boshqarish",type:'E'},
      {label:'D',text:"O'z qo'lim bilan real mahsulot yaratish",type:'R'},
    ]
  },
  {
    id:34,
    text:"Muhim loyiha muddati yaqinlashib, kutilmagan muammo chiqdi. Nima qilasiz?",
    options:[
      {label:'A',text:"Muammoni tezda tahlil qilib, eng amaliy yechimni topaman",type:'I'},
      {label:'B',text:"Jamoani yig'ib, birgalikda yechim izlayman",type:'S'},
      {label:'C',text:"Prioritetlarni qayta ko'rib, eng muhimiga fokuslanaman",type:'C'},
      {label:'D',text:"O'zim qo'l bilan tuzataman — amaliy yechim eng yaxshi",type:'R'},
    ]
  },
  {
    id:35,
    text:"Muhim qaror qabul qilishda odatda qanday yondashasiz?",
    options:[
      {label:'A',text:"Ma'lumot va tahlilga asoslanaman, his-tuyg'uga emas",type:'I'},
      {label:'B',text:"Intuitsiya va tajribamga suyanaman",type:'E'},
      {label:'C',text:"Barcha tomonlar bilan kengashib, konsensus qidiraman",type:'S'},
      {label:'D',text:"Qoidalar va standartlarga rioya qilaman",type:'C'},
    ]
  },
  {
    id:36,
    text:"Ish tanlashda qaysi omil siz uchun eng muhim?",
    options:[
      {label:'A',text:"Ijodiy erkinlik va o'z g'oyalarni amalga oshirish",type:'A'},
      {label:'B',text:"Jamiyatga foydali ish va ma'noli hissa",type:'S'},
      {label:'C',text:"Yuqori daromad va karyera imkoniyatlari",type:'E'},
      {label:'D',text:"Barqarorlik, aniq vazifalar va professional o'sish",type:'C'},
    ]
  },
];

const COURSES: Course[] = [
  { id:'foundation',         name:'Foundation',                                   url:'/kurslar/foundation',         riasec:{R:20,I:40,A:5, S:5, E:10,C:20}, desc:"Python, algoritm va dasturlash asoslari. IT ga birinchi qadam." },
  { id:'python-bi',          name:'Web dasturlash: Python BI',                    url:'/kurslar/python-bi',          riasec:{R:15,I:45,A:5, S:5, E:10,C:20}, desc:"Python yordamida web va biznes tahlil (BI) dasturlash." },
  { id:'frontend',           name:'Frontend Web Dasturlash',                      url:'/kurslar/frontend',           riasec:{R:10,I:35,A:25,S:5, E:10,C:15}, desc:"HTML, CSS, JavaScript va React bilan zamonaviy saytlar yaratish." },
  { id:'robototexnika',      name:'Robototexnika',                                 url:'/kurslar/robototexnika',      riasec:{R:35,I:30,A:5, S:5, E:10,C:15}, desc:"Robot qurish, dasturlash va muhandislik asoslari." },
  { id:'grafik-dizayn',      name:'Grafik Dizayn',                                url:'/kurslar/grafik-dizayn',      riasec:{R:5, I:10,A:55,S:5, E:10,C:15}, desc:"Logo, brend va vizual materiallar yaratish. Photoshop, Illustrator." },
  { id:'arxitektura-dizayn', name:'Arxitektura va Dizayn',                        url:'/kurslar/arxitektura-dizayn', riasec:{R:15,I:20,A:45,S:5, E:10,C:5},  desc:"Arxitektura loyihalash va interyer dizayn asoslari." },
  { id:'videografiya',       name:'Videografiya',                                 url:'/kurslar/videografiya',       riasec:{R:10,I:10,A:50,S:10,E:15,C:5},  desc:"Video suratga olish, montaj va professional kontent yaratish." },
  { id:'mobilografiya',      name:'Mobilografiya',                                url:'/kurslar/mobilografiya',      riasec:{R:10,I:10,A:45,S:15,E:10,C:10}, desc:"Telefon orqali professional foto va video olish mahorati." },
  { id:'ai-media',           name:'AI MEDIA',                                     url:'/kurslar/ai-media',           riasec:{R:5, I:20,A:40,S:10,E:15,C:10}, desc:"Sun'iy intellekt vositalari bilan media kontent yaratish." },
  { id:'smm',                name:'SMM',                                          url:'/kurslar/smm',                riasec:{R:5, I:15,A:30,S:25,E:20,C:5},  desc:"Ijtimoiy tarmoqlarni boshqarish, kontent strategiyasi." },
  { id:'buxgalteriya',       name:'Zamonaviy Buxgalteriya (1C)',                  url:'/kurslar/buxgalteriya',       riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Buxgalteriya asoslari va 1C dasturida ishlash." },
  { id:'excel-pro',          name:'Excel Pro',                                    url:'/kurslar/excel-pro',          riasec:{R:5, I:25,A:5, S:10,E:15,C:40}, desc:"Microsoft Excel da professional darajada ishlash." },
  { id:'hr-menejer',         name:'HR Menejerligi',                               url:'/kurslar/hr-menejer',         riasec:{R:5, I:20,A:10,S:30,E:25,C:10}, desc:"Kadrlar boshqaruvi, suhbat o'tkazish va HR strategiyasi." },
  { id:'ofis-dasturlari',    name:'Ofis Dasturlarida Ishlash',                    url:'/kurslar/ofis-dasturlari',    riasec:{R:10,I:20,A:5, S:10,E:15,C:40}, desc:"Word, Excel, PowerPoint va ofis vositalari bilan ishlash." },
  { id:'kids-web',           name:'Web Dasturlash (Kids)',                        url:'/kurslar/kids-web',           riasec:{R:15,I:30,A:25,S:15,E:5, C:10}, desc:"Bolalar uchun qiziqarli dasturlash kursi — o'yin orqali o'rganish." },
];

const RIASEC_INFO: Record<RiasecType, { name: string; short: string; desc: string; color: string }> = {
  R: { name:'Amaliy (Realistic)', short:'Amaliy', desc:"Siz amaliy va texnik fikrlovchi insomsiz. Qo'lingiz bilan ishlash, muammolarni bevosita hal qilish va texnik tizimlar bilan shug'ullanish sizga quvonch beradi.", color:'#f59e0b' },
  I: { name:'Tadqiqotchi (Investigative)', short:'Tadqiqotchi', desc:"Siz tahlilchi va qiziquvchan tabiatga egasiz. Murakkab muammolarni o'rganish, yangi narsalarni kashf etish va mantiqiy xulosalarga kelish sizning kuchingiz.", color:'#8b5cf6' },
  A: { name:'Ijodkor (Artistic)', short:'Ijodkor', desc:"Siz ijodiy va ekspressiv shaxssiz. O'zingizni ifodalash, yangi g'oyalar yaratish va estetik jihatdan chiroyli narsalar ishlab chiqarish sizga zavq beradi.", color:'#ec4899' },
  S: { name:'Ijtimoiy (Social)', short:'Ijtimoiy', desc:"Siz insonsevarsiz va empatiksiz. Boshqalarga yordam berish, o'qitish va kommunikatsiya qilish sizning tabiiy qobiliyatingiz. Odamlar bilan ishlash sizga energiya beradi.", color:'#10b981' },
  E: { name:'Tadbirkor (Enterprising)', short:'Tadbirkor', desc:"Siz yetakchi va motivatorsiz. Boshqalarni ishontirish, loyihalarni boshqarish va natijaga erishish uchun harakat qilish sizning kuchingiz. Raqobat sizni ilhomlantiradi.", color:'#0061ff' },
  C: { name:'Tartibli (Conventional)', short:'Tartibli', desc:"Siz tashkil etuvchi va tartibli insomsiz. Tizimlar yaratish, ma'lumotlar bilan ishlash va aniq ko'rsatmalarga amal qilish sizga mos. Barqarorlik va aniqlik sizga muhim.", color:'#06b6d4' },
};

const STRENGTHS: Record<number, { name: string; emoji: string; desc: string }> = {
  19: { name:'Kommunikatsiya', emoji:'💬', desc:"Fikrlaringizni aniq va ishonchli ifodalay olasiz" },
  20: { name:'Tahliliy fikrlash', emoji:'🧠', desc:"Muammolarni mantiqiy va tizimli hal qilasiz" },
  21: { name:'Kreativlik', emoji:'✨', desc:"Yangi g'oyalar va noodatiy yechimlar topasiz" },
  22: { name:'Empatiya', emoji:'❤️', desc:"Odamlarni tushunib, ular bilan ishonch o'rnatа olasiz" },
  23: { name:'Rejalashtirish', emoji:'📋', desc:"Loyihalarni boshidan oxirigacha boshqara olasiz" },
  24: { name:'Moslashuvchanlik', emoji:'🔄', desc:"Yangi vaziyatlarga tezda ko'nikasiz" },
  25: { name:'Yetakchilik', emoji:'🎯', desc:"Jamoani ilhomlantirish va yo'naltirish sizga mos" },
  26: { name:'Texnik qobiliyat', emoji:'⚙️', desc:"Texnologik vositalarni tez o'rganasiz" },
  27: { name:'Diqqatlilik', emoji:'🔍', desc:"Mayda tafsilotlarga e'tibor berib, sifatni ta'minlaysiz" },
  28: { name:'Networking', emoji:'🤝', desc:"Yangi odamlar bilan munosabat o'rnatish sizga oson" },
  29: { name:'Stressga chidamlilik', emoji:'🧘', desc:"Bosim ostida ham samarali ishlaysiz" },
  30: { name:'Pedagodik qobiliyat', emoji:'📚', desc:"Bilimlarni boshqalarga tushuntira olasiz" },
};

// ─── Scoring ─────────────────────────────────────────────────────────────────
function computeScores(
  s1Answers: Record<number, 'a' | 'b'>,
  s2Answers: Record<number, number>,
  s3Answers: Record<number, 'A' | 'B' | 'C' | 'D'>
): Record<RiasecType, number> {
  const scores: Record<RiasecType, number> = { R:0, I:0, A:0, S:0, E:0, C:0 };
  FORCED_CHOICE.forEach(q => {
    const ans = s1Answers[q.id];
    if (ans === 'a') scores[q.optionA.type] += 1;
    else if (ans === 'b') scores[q.optionB.type] += 1;
  });
  LIKERT.forEach(q => {
    const val = s2Answers[q.id];
    if (val) q.types.forEach(t => { scores[t] += val * 0.4; });
  });
  MULTI_CHOICE.forEach(q => {
    const ans = s3Answers[q.id];
    if (ans) {
      const opt = q.options.find(o => o.label === ans);
      if (opt) scores[opt.type] += 1.5;
    }
  });
  return scores;
}

function computePercentages(scores: Record<RiasecType, number>): Record<RiasecType, number> {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (!total) return { R:0, I:0, A:0, S:0, E:0, C:0 };
  const result = {} as Record<RiasecType, number>;
  (Object.keys(scores) as RiasecType[]).forEach(t => { result[t] = Math.round(scores[t] / total * 100); });
  return result;
}

function matchCourses(pcts: Record<RiasecType, number>): CourseResult[] {
  const types: RiasecType[] = ['R','I','A','S','E','C'];
  return COURSES
    .map(course => {
      // Cosine similarity — aniqroq farqlash
      const courseTotal = Object.values(course.riasec).reduce((a, b) => a + b, 0);
      let dot = 0, magU = 0, magC = 0;
      types.forEach(t => {
        const u = pcts[t] / 100;
        const c = course.riasec[t] / courseTotal;
        dot += u * c;
        magU += u * u;
        magC += c * c;
      });
      const denom = Math.sqrt(magU) * Math.sqrt(magC);
      const cosine = denom > 0 ? dot / denom : 0;
      // Top 2 tip bonus — agar user dominant tipi kursning dominant tipiga mos kelsa +10%
      const userTop2 = [...types].sort((a, b) => pcts[b] - pcts[a]).slice(0, 2);
      const courseTop2 = [...types].sort((a, b) => course.riasec[b] - course.riasec[a]).slice(0, 2);
      const bonus = userTop2.filter(t => courseTop2.includes(t)).length * 0.05;
      const matchScore = Math.min(99, Math.round((cosine + bonus) * 100));
      return { course, matchScore, rank: 0 };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ current, total, stage, isDark }: { current: number; total: number; stage: Stage; isDark: boolean }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bosqich {stage} / 3</span>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Savol {current} / {total}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #0061ff, #60efff)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1 text-right">
        <span className="text-xs font-bold" style={{ color: '#0061ff' }}>{pct}%</span>
      </div>
    </div>
  );
}

function CircularProgress({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerTest() {
  const { isDark } = useTheme();
  const [view, setView] = useState<View>('intro');
  const [stage, setStage] = useState<Stage>(1);
  const [currentQ, setCurrentQ] = useState(0);
  const [s1Answers, setS1Answers] = useState<Record<number, 'a' | 'b'>>({});
  const [s2Answers, setS2Answers] = useState<Record<number, number>>({});
  const [s3Answers, setS3Answers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [s2Page, setS2Page] = useState(0);
  const [results, setResults] = useState<CourseResult[]>([]);
  const [percentages, setPercentages] = useState<Record<RiasecType, number>>({ R:0,I:0,A:0,S:0,E:0,C:0 });
  const [dominantType, setDominantType] = useState<RiasecType>('I');
  const [enrollCourse, setEnrollCourse] = useState<{ name: string; id: string } | null>(null);
  const [calcDots, setCalcDots] = useState(0);
  const calcTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const overallQ = stage === 1 ? currentQ + 1
    : stage === 2 ? 18 + s2Page * 3 + 1
    : 30 + currentQ + 1;

  const bg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const sub = isDark ? 'text-slate-400' : 'text-slate-500';

  function startTest() {
    setView('test'); setStage(1); setCurrentQ(0);
    setS1Answers({}); setS2Answers({}); setS3Answers({}); setS2Page(0);
  }

  function restartTest() { setView('intro'); setResults([]); setPercentages({ R:0,I:0,A:0,S:0,E:0,C:0 }); }

  function goBack() {
    if (stage === 1) { if (currentQ > 0) setCurrentQ(q => q - 1); }
    else if (stage === 2) {
      if (s2Page > 0) setS2Page(p => p - 1);
      else { setStage(1); setCurrentQ(17); }
    } else {
      if (currentQ > 0) setCurrentQ(q => q - 1);
      else { setStage(2); setS2Page(3); }
    }
  }

  function handleS1(answer: 'a' | 'b') {
    const q = FORCED_CHOICE[currentQ];
    setS1Answers(prev => ({ ...prev, [q.id]: answer }));
    setTimeout(() => {
      if (currentQ < FORCED_CHOICE.length - 1) setCurrentQ(q => q + 1);
      else { setStage(2); setS2Page(0); }
    }, 350);
  }

  function handleS2Next() {
    if (s2Page < 3) setS2Page(p => p + 1);
    else { setStage(3); setCurrentQ(0); }
  }

  function handleS3(answer: 'A' | 'B' | 'C' | 'D') {
    const q = MULTI_CHOICE[currentQ];
    const newS3 = { ...s3Answers, [q.id]: answer };
    setS3Answers(newS3);
    setTimeout(() => {
      if (currentQ < MULTI_CHOICE.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        setView('calculating');
        calcTimerRef.current = setInterval(() => setCalcDots(d => (d + 1) % 4), 500);
        setTimeout(() => {
          if (calcTimerRef.current) clearInterval(calcTimerRef.current);
          const scores = computeScores(s1Answers, s2Answers, newS3);
          const pcts = computePercentages(scores);
          const dom = (Object.keys(pcts) as RiasecType[]).reduce((a, b) => pcts[a] > pcts[b] ? a : b);
          setPercentages(pcts);
          setDominantType(dom);
          setResults(matchCourses(pcts));
          setView('result');
        }, 2500);
      }
    }, 350);
  }

  const likertPageQs = LIKERT.slice(s2Page * 3, s2Page * 3 + 3);
  const s2PageComplete = likertPageQs.every(q => s2Answers[q.id] !== undefined);

  const likertBgs = [
    isDark ? '#334155' : '#f3f4f6',
    '#f97316',
    '#eab308',
    '#0061ff',
    'linear-gradient(135deg, #0061ff, #60efff)',
  ];
  const likertTextColors = [isDark ? '#9ca3af' : '#6b7280', '#fff', '#fff', '#fff', '#fff'];

  const topStrengths = Object.entries(s2Answers)
    .filter(([, v]) => v >= 4)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => STRENGTHS[Number(id)])
    .filter(Boolean);
  const displayStrengths = topStrengths.length > 0
    ? topStrengths
    : Object.entries(s2Answers).sort(([, a], [, b]) => b - a).slice(0, 5).map(([id]) => STRENGTHS[Number(id)]).filter(Boolean);

  return (
    <div className={`min-h-screen ${bg} relative overflow-hidden`}>
      <SEO
        title="Karyera Testi | Data Talim"
        description="Holland RIASEC modeliga asoslangan karyera testi. O'zingizga mos IT kursini toping."
      />
      <PatternBg />
      <FloatingStars />

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {view === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }}
            transition={{ duration:0.5 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-16"
          >
            <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.2, duration:0.6, type:'spring' }} className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl" style={{ background: 'linear-gradient(135deg, rgba(0,97,255,0.15), rgba(96,239,255,0.15))', border: '1px solid rgba(96,239,255,0.2)' }}>
                🧭
              </div>
              <div className="absolute -inset-4 bg-[#0061ff] blur-3xl opacity-20 rounded-full -z-10" />
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className={`text-4xl md:text-6xl font-black text-center mb-5 tracking-tight uppercase ${text}`}>
              Kelajak kasbingizni{' '}<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff]">aniqlang</span>
            </motion.h1>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className={`text-lg text-center max-w-2xl mb-4 leading-relaxed ${sub}`}>
              Holland RIASEC ilmiy modeliga asoslangan 36 ta savolga javob bering — sun'iy intellekt sizga eng mos IT yo'nalishni aniqlaydi.
            </motion.p>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} className="flex flex-wrap gap-4 justify-center mb-10">
              {[{icon:'⚡',label:'~10 daqiqa'},{icon:'🎯',label:'36 savol'},{icon:'🏆',label:'3 bosqich'},{icon:'📊',label:'RIASEC model'}].map(item => (
                <div key={item.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-10">
              {[
                { stage:'1', title:'Majburiy Tanlov', desc:'18 ta savol — A yoki B', emoji:'🔀', color:'#0061ff' },
                { stage:'2', title:'Baholash', desc:'12 ta savol — 1 dan 5 gacha', emoji:'⭐', color:'#8b5cf6' },
                { stage:'3', title:"Ko'p Tanlov", desc:'6 ta vaziyat — eng mos javobni tanlang', emoji:'🎯', color:'#10b981' },
              ].map(s => (
                <div key={s.stage} className={`rounded-2xl border p-6 text-center backdrop-blur-xl transition-all hover:-translate-y-1 ${isDark ? 'bg-slate-800/50 border-white/5 hover:border-white/10' : 'bg-white/80 border-slate-200 hover:shadow-lg'}`}>
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <div className="text-xs font-black mb-1 tracking-wider" style={{ color: s.color }}>BOSQICH {s.stage}</div>
                  <div className={`font-bold mb-1 ${text}`}>{s.title}</div>
                  <div className={`text-sm ${sub}`}>{s.desc}</div>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.7 }}>
              <button
                onClick={startTest}
                className="px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}
              >
                Testni Boshlash →
              </button>
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
                <div className={`text-sm font-medium ${sub}`}>
                  {stage === 1 ? 'Majburiy Tanlov' : stage === 2 ? 'Baholash' : "Ko'p Tanlov"}
                </div>
                <button onClick={restartTest} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                  <RotateCcw size={14} /><span className="text-sm">Qayta</span>
                </button>
              </div>

              <ProgressBar current={overallQ} total={36} stage={stage} isDark={isDark} />

              {/* Stage 1: Forced Choice */}
              {stage === 1 && (
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <h2 className={`text-xl md:text-2xl font-bold text-center mb-8 ${text}`}>{FORCED_CHOICE[currentQ].text}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {(['a','b'] as const).map(key => {
                        const opt = key === 'a' ? FORCED_CHOICE[currentQ].optionA : FORCED_CHOICE[currentQ].optionB;
                        const isSelected = s1Answers[FORCED_CHOICE[currentQ].id] === key;
                        return (
                          <motion.button
                            key={key}
                            onClick={() => handleS1(key)}
                            whileHover={{ scale:1.03, y:-4 }}
                            whileTap={{ scale:0.97 }}
                            className={`relative flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-center backdrop-blur-xl ${
                              isSelected ? 'border-[#0061ff] shadow-lg shadow-[#0061ff]/20' : isDark ? 'border-white/10 bg-slate-800/60 hover:border-[#60efff]/40' : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg'
                            }`}
                            style={isSelected ? { background: 'linear-gradient(135deg, rgba(0,97,255,0.1), rgba(96,239,255,0.1))' } : {}}
                          >
                            <div className="text-6xl">{opt.emoji}</div>
                            <p className={`text-base font-medium leading-snug ${text}`}>{opt.text}</p>
                            <div
                              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: isSelected ? '#0061ff' : isDark ? '#334155' : '#f3f4f6', color: isSelected ? '#fff' : isDark ? '#9ca3af' : '#6b7280' }}
                            >
                              {key.toUpperCase()}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Stage 2: Likert */}
              {stage === 2 && (
                <AnimatePresence mode="wait">
                  <motion.div key={s2Page} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <h2 className={`text-lg font-bold text-center mb-2 ${text}`}>Quyidagi iboralarga qanchalik qo'shilasiz?</h2>
                    <p className={`text-sm text-center mb-6 ${sub}`}>1 = Umuman yo'q · 5 = To'liq qo'shilaman</p>
                    <div className="space-y-5">
                      {likertPageQs.map((q, qi) => (
                        <div key={q.id} className={`rounded-2xl border p-5 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200'}`}>
                          <p className={`font-medium mb-4 ${text}`}>
                            <span className="text-blue-500 font-bold mr-2">{qi + 1}.</span>{q.text}
                          </p>
                          <div className="flex gap-2 justify-center flex-wrap">
                            {[1,2,3,4,5].map(val => {
                              const idx = val - 1;
                              const selected = s2Answers[q.id] === val;
                              const bg = likertBgs[idx];
                              const tc = likertTextColors[idx];
                              return (
                                <motion.button
                                  key={val}
                                  whileHover={{ scale:1.12 }}
                                  whileTap={{ scale:0.95 }}
                                  onClick={() => setS2Answers(prev => ({ ...prev, [q.id]: val }))}
                                  className={`w-12 h-12 rounded-xl font-bold text-base flex items-center justify-center transition-all duration-200 ${selected ? 'scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                                  style={{
                                    background: bg,
                                    color: tc,
                                    boxShadow: selected ? `0 4px 16px rgba(0,97,255,0.4)` : undefined,
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
                        whileHover={{ scale: s2PageComplete ? 1.04 : 1 }}
                        whileTap={{ scale: s2PageComplete ? 0.97 : 1 }}
                        onClick={handleS2Next}
                        disabled={!s2PageComplete}
                        className={`px-8 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 transition-all duration-300 ${s2PageComplete ? 'shadow-lg' : 'opacity-40 cursor-not-allowed'}`}
                        style={s2PageComplete ? { background: 'linear-gradient(135deg, #0061ff, #60efff)' } : { background: '#6b7280' }}
                      >
                        {s2Page < 3 ? 'Keyingisi' : 'Yakunlash'}
                        <ChevronRight size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Stage 3: Multiple Choice */}
              {stage === 3 && (
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ} initial={{ opacity:0, x:60 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-60 }} transition={{ duration:0.35, ease:'easeInOut' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-center mb-3" style={{ color:'#10b981' }}>
                      Vaziyat {currentQ + 1} / 6
                    </div>
                    <h2 className={`text-lg md:text-xl font-bold text-center mb-8 ${text}`}>{MULTI_CHOICE[currentQ].text}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MULTI_CHOICE[currentQ].options.map(opt => {
                        const isSelected = s3Answers[MULTI_CHOICE[currentQ].id] === opt.label;
                        const labelColors: Record<string,string> = { A:'#0061ff', B:'#8b5cf6', C:'#10b981', D:'#f59e0b' };
                        return (
                          <motion.button
                            key={opt.label}
                            onClick={() => handleS3(opt.label)}
                            whileHover={{ scale:1.03, y:-3 }}
                            whileTap={{ scale:0.97 }}
                            className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                              isSelected ? 'border-[#0061ff] shadow-lg shadow-[#0061ff]/10' : isDark ? 'border-white/10 bg-slate-800/60 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                            }`}
                            style={isSelected ? { background: 'linear-gradient(135deg, rgba(0,97,255,0.08), rgba(96,239,255,0.08))' } : {}}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 text-white" style={{ backgroundColor: labelColors[opt.label] }}>
                              {opt.label}
                            </div>
                            <p className={`text-sm font-medium leading-relaxed pt-1 ${text}`}>{opt.text}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}

        {/* CALCULATING */}
        {view === 'calculating' && (
          <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
            <motion.div
              animate={{ rotate:360 }}
              transition={{ duration:2, repeat:Infinity, ease:'linear' }}
              className="w-20 h-20 rounded-full mb-8"
              style={{ border:'4px solid #0061ff', borderTopColor:'transparent' }}
            />
            <h2 className={`text-2xl font-bold mb-3 ${text}`}>Natijalar hisoblanmoqda{'.'.repeat(calcDots)}</h2>
            <p className={`text-center ${sub}`}>Javoblaringiz tahlil qilinmoqda va mos kurslar aniqlanmoqda</p>
            <div className="flex gap-2 mt-8">
              {(['R','I','A','S','E','C'] as RiasecType[]).map((t, i) => (
                <motion.div
                  key={t}
                  className="w-3 h-3 rounded-full"
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

              {/* Header */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
                <div className="text-5xl mb-3">🎉</div>
                <h1 className={`text-3xl md:text-4xl font-black mb-3 ${text}`}>Sizning Natijangiz</h1>
                <p className={`text-lg ${sub}`}>Holland RIASEC modeli asosida siz uchun mos kurslar aniqlandi</p>
              </motion.div>

              {/* Holland Profile */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className={`rounded-3xl border p-6 mb-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🧬</div>
                  <h2 className={`text-lg font-bold ${text}`}>Sizning Holland Profilingiz</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {(Object.keys(percentages) as RiasecType[]).sort((a, b) => percentages[b] - percentages[a]).map(t => (
                    <div key={t} className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/60' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${sub}`}>{RIASEC_INFO[t].short}</span>
                        <span className="text-sm font-black" style={{ color:RIASEC_INFO[t].color }}>{percentages[t]}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor:RIASEC_INFO[t].color }}
                          initial={{ width:0 }}
                          animate={{ width:`${percentages[t]}%` }}
                          transition={{ duration:1, delay:0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700/40' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={18} style={{ color:RIASEC_INFO[dominantType].color }} />
                    <span className="font-bold" style={{ color:RIASEC_INFO[dominantType].color }}>
                      Dominant tip: {RIASEC_INFO[dominantType].name}
                    </span>
                  </div>
                  <p className={`text-sm ${sub}`}>{RIASEC_INFO[dominantType].desc}</p>
                </div>
              </motion.div>

              {/* Strengths */}
              {displayStrengths.length > 0 && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className={`rounded-3xl border p-6 mb-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Zap size={20} style={{ color:'#f59e0b' }} />
                    <h2 className={`text-lg font-bold ${text}`}>Sizning Kuchli Tomonlaringiz</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {displayStrengths.map(s => (
                      <div key={s.name} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                        <span>{s.emoji}</span>
                        <span className={`font-medium ${text}`}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Course Results */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <Target size={20} style={{ color:'#0061ff' }} />
                  <h2 className={`text-xl font-bold ${text}`}>Mos Kurslar</h2>
                </div>
                <div className="space-y-5">
                  {results.map((r, idx) => {
                    const rankColors = ['#f59e0b','#9ca3af','#b45309'];
                    const rankEmojis = ['🥇','🥈','🥉'];
                    const topTypes = (Object.keys(r.course.riasec) as RiasecType[]).sort((a,b) => r.course.riasec[b]-r.course.riasec[a]).slice(0,3);
                    return (
                      <motion.div
                        key={r.course.id}
                        initial={{ opacity:0, x:30 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay:0.25+idx*0.1 }}
                        className={`rounded-2xl overflow-hidden ${idx !== 0 ? `border ${card}` : ''}`}
                        style={idx === 0 ? {
                          border: '2px solid transparent',
                          background: isDark
                            ? 'linear-gradient(#1e293b,#1e293b) padding-box, linear-gradient(135deg,#0061ff,#60efff) border-box'
                            : 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#0061ff,#60efff) border-box',
                        } : {}}
                      >
                        <div className={`p-6 ${idx === 0 ? (isDark ? 'bg-slate-800' : 'bg-white') : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{rankEmojis[idx]}</span>
                                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor:rankColors[idx]+'22', color:rankColors[idx] }}>
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
                              <p className={`text-xs ${sub}`}>
                                <Star size={12} className="inline mr-1" style={{ color:'#f59e0b' }} />
                                Nima uchun mos: sizning {topTypes.slice(0,2).map(t => RIASEC_INFO[t].short).join(' va ')} qobiliyatlaringiz bu kurs bilan ajoyib mos keladi
                              </p>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="relative">
                                <CircularProgress pct={r.matchScore} color={idx===0?'#0061ff':rankColors[idx]} size={80} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-lg font-black" style={{ color:idx===0?'#0061ff':rankColors[idx] }}>{r.matchScore}%</span>
                                </div>
                              </div>
                              <span className={`text-xs mt-1 ${sub}`}>Moslik</span>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 flex-wrap">
                            <Link to={r.course.url}>
                              <motion.button
                                whileHover={{ scale:1.04 }}
                                whileTap={{ scale:0.97 }}
                                className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition-all"
                                style={{ background:'linear-gradient(135deg,#0061ff,#60efff)' }}
                              >
                                <BookOpen size={15} />Kursga o'tish
                              </motion.button>
                            </Link>
                            <motion.button
                              whileHover={{ scale:1.04 }}
                              whileTap={{ scale:0.97 }}
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

              {/* Actions */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                  onClick={restartTest}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  <RotateCcw size={16} />Testni qayta boshlash
                </motion.button>
                <Link to="/kurslar">
                  <motion.button
                    whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all"
                    style={{ background:'linear-gradient(135deg,#0061ff,#60efff)' }}
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
          extraInfo={`Karyera testi natijasi asosida tavsiya etildi`}
        />
      )}
    </div>
  );
}
