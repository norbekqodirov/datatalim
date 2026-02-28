import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle2, RefreshCcw, BarChart2, ShieldCheck, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { QUESTIONS, COURSE_NAMES, COURSE_RESULTS } from '../constants';
import { LikertScale } from '../components/LikertScale';
import { Button } from '../components/Button';
import { calculateResults } from '../utils/scoring';
import { AdminView } from '../components/AdminView';
import { EnrollModal } from '../components/EnrollModal';
import { generateTestPdf } from '../utils/generatePdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CourseResult } from '../types';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, SymbolMark, Star1, Star2, FloatingStars, getCourseGradient, getCourseColors } from '../components/BrandElements';

// Constants
const QUESTIONS_PER_TEST = 36;

// Helper components defined here for simplicity in file structure
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = Math.min(100, (current / total) * 100);
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-3 rounded-full overflow-hidden mb-6 relative ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
      {/* Brand animated progress bar gradient */}
      <div
        className="h-full absolute left-0 top-0 transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0061ff 0%, #60efff 50%, #82f4b1 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite'
        }}
      />
    </div>
  );
};

const ResultCard: React.FC<{ result: CourseResult; rank: number; onEnroll: (courseName: string) => void; onConsult: (courseName: string) => void }> = ({ result, rank, onEnroll, onConsult }) => {
  const content = COURSE_RESULTS[result.course];
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();

  // Customise colors based on the course direction
  // Depending on course, we pick the brand colors
  let directionColor = 'finance'; // default
  if (result.course === 'foundation_programming') directionColor = 'programming';
  else if (['graphic_design', 'videography', 'mobileography', 'smm', 'architecture'].includes(result.course)) directionColor = 'media';

  const colors = getCourseColors(directionColor);
  const gradient = getCourseGradient(directionColor);

  return (
    <div className={`rounded-3xl p-8 mb-6 transition-all border-2 relative overflow-hidden group ${rank === 1
        ? isDark ? 'bg-slate-900 border-white/20 shadow-2xl' : `bg-white border-[${colors.primary}] shadow-xl`
        : isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'
      }`}>
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none transition-transform group-hover:scale-110" style={{ background: gradient }}></div>
      {rank === 1 && <Star1 size={60} color={colors.primary} opacity={isDark ? 0.1 : 0.05} className="absolute -bottom-5 -left-5 rotate-slow pointer-events-none" />}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wider uppercase font-sans ${rank === 1
              ? isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-white'
              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}
            style={rank === 1 && !isDark ? { background: gradient } : {}}
          >
            {rank === 1 ? 'ENG YAXSHI NATIJA' : '2-O\'RIN'}
          </span>
          <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{COURSE_NAMES[result.course]}</h3>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>{result.percentage}%</span>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Moslik</p>
        </div>
      </div>

      <p className={`mb-8 leading-relaxed text-lg relative z-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {content.description[rank === 1 ? 0 : 1]}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Button onClick={() => onEnroll(COURSE_NAMES[result.course])} className={`w-full sm:w-auto flex-1 h-14 rounded-xl text-white text-lg font-bold shadow-lg hover:brightness-110 transition-all ${rank === 1 ? 'animate-pulse' : ''}`} style={{ background: gradient }}>Kursga yozilish</Button>
        <Button onClick={() => onConsult(COURSE_NAMES[result.course])} variant="outline" className={`w-full sm:w-auto flex-1 h-14 rounded-xl border-2 text-lg font-bold ${isDark ? 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-slate-800' : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 bg-white'}`}>Bepul konsultatsiya</Button>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-8 w-full flex items-center justify-center gap-2 text-sm font-bold transition-colors py-4 border-t relative z-10 ${isDark ? 'text-slate-400 hover:text-white border-slate-700/50' : 'text-slate-500 hover:text-slate-900 border-slate-100'}`}
      >
        {isOpen ? 'Qisqartirish' : "Batafsil ma'lumot"}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className={`mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 relative z-10 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <h4 className={`font-bold mb-4 text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Nega aynan shu kasb?</h4>
          <ul className="space-y-3">
            {content.description.map((desc, idx) => (
              <li key={idx} className={`flex gap-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <CheckCircle2 className="shrink-0 mt-0.5" size={20} style={{ color: colors.primary }} />
                <span className="leading-relaxed">{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

export default function CareerTest() {
  const [view, setView] = useState<'intro' | 'test' | 'calculating' | 'result' | 'admin'>('intro');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [results, setResults] = useState<CourseResult[]>([]);
  const { isDark } = useTheme();

  // EnrollModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'enroll' | 'consult'>('enroll');
  const [modalCourse, setModalCourse] = useState('');

  const location = useLocation();

  useEffect(() => {
    if (location.state?.startNow) {
      setView('test');
    }
  }, [location.state]);

  // Admin simple protection
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Load standard 36 questions (taking first 36 from constants for this demo)
  const activeQuestions = useMemo(() => QUESTIONS.slice(0, QUESTIONS_PER_TEST), []);

  useEffect(() => {
    // Autosave check
    const saved = localStorage.getItem('career_test_answers');
    if (saved && view === 'intro') {
      // Optional: restore logic
    }
  }, [view]);

  // Ensure scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, currentQIndex]);

  const handleStart = () => {
    setView('test');
  };

  const handleAnswer = (value: number) => {
    const question = activeQuestions[currentQIndex];
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    localStorage.setItem('career_test_answers', JSON.stringify(newAnswers));

    // Wait a bit for animation
    setTimeout(() => {
      if (currentQIndex < activeQuestions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        finishTest(newAnswers);
      }
    }, 250); // slight delay for user to see selection
  };

  const finishTest = (finalAnswers: Record<string, number>) => {
    setView('calculating');
    setTimeout(() => {
      const calculated = calculateResults(finalAnswers);
      setResults(calculated);
      setView('result');
    }, 2500); // 2.5s to show rotating star
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setResults([]);
    localStorage.removeItem('career_test_answers');
    setView('intro');
  };

  // Admin secret trigger
  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setView('admin');
        return 0;
      }
      return newCount;
    });
  };

  // --- Views ---

  if (view === 'admin') {
    return <AdminView onLogout={() => setView('intro')} />;
  }

  if (view === 'intro') {
    return (
      <div className={`flex flex-col min-h-[70vh] relative overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <PatternBg color={isDark ? '#ffffff' : '#0061ff'} opacity={isDark ? 0.03 : 0.04} />
        <FloatingStars color1={isDark ? '#60efff' : '#0061ff'} color2={isDark ? '#82f4b1' : '#ee2a7b'} />

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto py-20 relative z-10">
          <div className="mb-8 p-6 rounded-full shadow-lg border cursor-pointer relative group"
            style={{ background: isDark ? 'rgba(0,97,255,0.1)' : 'white', borderColor: isDark ? 'rgba(96,239,255,0.2)' : '#e2e8f0' }}
            onClick={handleLogoClick}>
            <SymbolMark width={70} color={isDark ? '#60efff' : '#0061ff'} className="group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-[#0061ff] rounded-full blur-xl opacity-20 pulse-glow mix-blend-screen"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight uppercase font-sans">
            Kelajak kasbingizni <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] shimmer-text">aniqlang</span>
          </h1>
          <p className={`text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            DATA Ta'lim Stansiyasi tomonidan ishlab chiqilgan maxsus algoritm yordamida,
            36 ta savolga javob berib, o'z qobiliyatingizga mos IT yo'nalishni toping.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12 text-left max-w-3xl mx-auto">
            {[
              { icon: BarChart2, text: "Aniq tahlil", iconColor: "text-[#0061ff]", bg: isDark ? "bg-[#0061ff]/20" : "bg-blue-50" },
              { icon: ShieldCheck, text: "Ilmiy yondashuv", iconColor: "text-[#00b26b]", bg: isDark ? "bg-[#00b26b]/20" : "bg-emerald-50" },
              { icon: CheckCircle2, text: "Tezkor natija", iconColor: "text-[#6228d7]", bg: isDark ? "bg-[#6228d7]/20" : "bg-purple-50" }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm border hover:-translate-y-1 transition-all ${isDark ? 'bg-slate-900 border-white/5 shadow-black/50' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.iconColor}`}>
                  <item.icon size={20} />
                </div>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.text}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleStart} className="w-full sm:w-auto text-lg px-12 py-5 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all transform group border border-white/20" style={{ background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)' }}>
            Testni boshlash <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Button>
        </main>
      </div>
    );
  }

  if (view === 'calculating') {
    return (
      <div className={`flex flex-col min-h-[70vh] relative overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={0.05} />
        <div className={`flex-1 flex flex-col items-center justify-center relative z-10 ${isDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm'}`}>
          <div className="relative mb-12">
            <Star1 size={80} color="#0061ff" className="animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#60efff] blur-2xl opacity-20 rounded-full mix-blend-screen pulse-glow"></div>
          </div>
          <h2 className={`text-3xl font-black font-sans uppercase tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] shimmer-text`}>Natijalar tahlil qilinmoqda</h2>
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sun'iy intellekt javoblaringizni o'rganmoqda</p>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    const top1 = results[0];
    const top2 = results[1];

    // Determine primary brand color from top result
    let primaryDirection = 'finance';
    if (top1.course === 'foundation_programming') primaryDirection = 'programming';
    else if (['graphic_design', 'videography', 'mobileography', 'smm', 'architecture'].includes(top1.course)) primaryDirection = 'media';
    else if (top1.course === 'kids_web') primaryDirection = 'kids';

    const primaryGlow = getCourseColors(primaryDirection).primary;

    const chartData = results.slice(0, 5).map(r => ({
      name: COURSE_NAMES[r.course].split(' ')[0],
      score: r.percentage
    }));

    return (
      <div className={`flex flex-col relative overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <PatternBg color={primaryGlow} opacity={isDark ? 0.05 : 0.03} />
        <FloatingStars color1={getCourseColors(primaryDirection).primary} color2={getCourseColors(primaryDirection).secondary} />

        <main className="flex-1 max-w-4xl mx-auto p-4 md:p-6 py-16 w-full relative z-10">
          <div className="text-center mb-12 fade-in relative">
            <Star2 size={40} color={primaryGlow} className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-20 rotate-slow" />
            <h2 className="text-4xl md:text-5xl font-black font-sans uppercase mb-4 text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: getCourseGradient(primaryDirection) }}>Sizning natijalaringiz</h2>
            <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Javoblaringiz asosida sizga quyidagi yo'nalishlar mos keldi:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 fade-in">
            <ResultCard result={top1} rank={1} onEnroll={(name) => { setModalCourse(name); setModalType('enroll'); setModalOpen(true); }} onConsult={(name) => { setModalCourse(name); setModalType('consult'); setModalOpen(true); }} />
            <ResultCard result={top2} rank={2} onEnroll={(name) => { setModalCourse(name); setModalType('enroll'); setModalOpen(true); }} onConsult={(name) => { setModalCourse(name); setModalType('consult'); setModalOpen(true); }} />
          </div>

          {/* Chart Section */}
          <div className={`p-8 rounded-[2.5rem] mb-12 fade-in relative overflow-hidden border ${isDark ? 'bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-white/10' : 'bg-white shadow-xl border-slate-100'}`}>
            <h3 className={`text-2xl font-black mb-8 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${primaryGlow}20, ${primaryGlow}10)` }}>
                <BarChart2 size={24} style={{ color: primaryGlow }} />
              </div>
              Umumiy moslik darajasi
            </h3>
            <div className="h-80 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 13, fontWeight: 700, fill: isDark ? '#94a3b8' : '#475569' }} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="score" radius={[0, 12, 12, 0]} barSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? primaryGlow : index === 1 ? getCourseColors(primaryDirection).secondary : isDark ? '#334155' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Decor */}
            <Star1 size={150} color={primaryGlow} opacity={0.03} className="absolute -bottom-10 -right-10 pointer-events-none" />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-20">
            <Button onClick={() => generateTestPdf(results)} className={`flex items-center justify-center gap-2 font-bold px-8 py-5 rounded-2xl shadow-lg border hover:-translate-y-1 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'}`}>
              <Download size={22} /> Natijani yuklab (PDF)
            </Button>
            <Button variant="outline" onClick={handleRestart} className={`flex items-center justify-center gap-2 font-bold px-8 py-5 rounded-2xl border-2 hover:-translate-y-1 transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 bg-slate-800' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 bg-white'}`}>
              <RefreshCcw size={22} /> Testni qayta ishlash
            </Button>
          </div>

          {/* Enroll Modal */}
          <EnrollModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            courseName={modalCourse}
            type={modalType}
            extraInfo={`Top 1: ${COURSE_NAMES[top1.course]} (${top1.percentage}%), Top 2: ${COURSE_NAMES[top2.course]} (${top2.percentage}%)`}
          />
        </main>
      </div>
    );
  }

  // Test View
  const currentQ = activeQuestions[currentQIndex];

  return (
    <div className={`flex flex-col min-h-[90vh] relative overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col py-12 relative z-10">
        <div className={`mb-6 flex justify-between items-end text-sm font-bold uppercase tracking-wider font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>Savol {currentQIndex + 1} / {activeQuestions.length}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff]">{Math.round(((currentQIndex + 1) / activeQuestions.length) * 100)}%</span>
        </div>
        <ProgressBar current={currentQIndex + 1} total={activeQuestions.length} />

        <div className={`rounded-[3rem] shadow-xl border p-8 md:p-16 flex-1 flex flex-col items-center justify-center text-center fade-in key-{currentQIndex} my-8 relative overflow-hidden ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          {/* Card subtle glow and stars */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#0061ff] blur-[100px] opacity-10 rounded-full"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#60efff] blur-[100px] opacity-10 rounded-full"></div>

          <span className={`inline-block px-5 py-2 rounded-full text-xs font-bold mb-10 uppercase tracking-widest border relative z-10 ${isDark ? 'bg-[#0061ff]/10 text-[#60efff] border-[#0061ff]/20' : 'bg-blue-50 text-[#0061ff] border-blue-100'}`}>
            {currentQ.section}
          </span>

          <h2 className={`text-3xl md:text-5xl font-black mb-16 leading-tight max-w-2xl font-sans relative z-10 ${isDark ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
            {currentQ.text}
          </h2>

          <div className="w-full relative z-10">
            <LikertScale
              selectedValue={answers[currentQ.id] ?? null}
              onChange={handleAnswer}
            />
          </div>
        </div>

        <div className={`text-center mt-4 text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          O'ylanmasdan, birinchi kelgan fikrni belgilang.
        </div>
      </div>
    </div>
  );
}
