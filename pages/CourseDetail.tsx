import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, CheckCircle2, BookOpen, Users, Code2, Phone } from 'lucide-react';
import { Button } from '../components/Button';
import { EnrollModal } from '../components/EnrollModal';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';
import { PatternBg, FloatingStars, Star1, Star2, BRAND_COLORS } from '../components/BrandElements';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'enroll' | 'consult'>('enroll');
  const { isDark } = useTheme();
  const { tField } = useLanguage();
  const { courses } = useStore();

  const course = courses.find(c => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Kurs topilmadi</h1>
        <Button onClick={() => navigate('/courses')}>Kurslar ro'yxatiga qaytish</Button>
      </div>
    );
  }

  const brandColors = BRAND_COLORS[course.category as keyof typeof BRAND_COLORS] || { primary: '#0061ff', secondary: '#60efff' };

  return (
    <div className="min-h-screen relative overflow-hidden pb-16" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={brandColors.primary} opacity={isDark ? 0.03 : 0.02} />
      <FloatingStars color1={brandColors.primary} color2={brandColors.secondary} className="opacity-40" />

      <div className="absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] opacity-10 rounded-full pointer-events-none" style={{ background: brandColors.primary }}></div>

      {/* Hero Section */}
      <div className={`relative z-10 pt-24 ${isDark ? 'border-b border-white/5 bg-slate-900/50 backdrop-blur-3xl' : 'bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
          <Star2 size={70} color={brandColors.primary} opacity={0.15} className="absolute top-10 right-20 rotate-slow pointer-events-none hidden md:block" />
          <Star1 size={50} color={brandColors.secondary} opacity={0.15} className="absolute bottom-10 left-10 rotate-slow pointer-events-none hidden md:block" />

          <Link to="/courses" className={`inline-flex items-center text-sm font-bold mb-8 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={16} className="mr-2" />
            Barcha kurslarga qaytish
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className={`inline-block px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md border ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200/50'}`} style={{ color: isDark ? brandColors.primary : brandColors.secondary }}>
                {course.category === 'programming' ? 'Dasturlash' : course.category === 'media' ? 'Media & Dizayn' : course.category === 'finance' ? 'Moliya va Ofis' : 'Bolalar uchun'}
              </div>
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 uppercase tracking-tight text-balance ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {tField(course.title)}
              </h1>
              <p className={`text-xl mb-10 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {tField(course.description)}
              </p>

              <div className="flex flex-wrap gap-6 mb-12">
                <div className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border ${isDark ? 'bg-slate-900/80 border-white/5 shadow-2xl shadow-black' : 'bg-white border-slate-100 shadow-xl shadow-[color:var(--brand-shadow)]'}`} style={{ '--brand-shadow': `${brandColors.primary}10` } as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brandColors.primary}15`, color: brandColors.primary }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Davomiyligi</p>
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(course.duration)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] border ${isDark ? 'bg-slate-900/80 border-white/5 shadow-2xl shadow-black' : 'bg-white border-slate-100 shadow-xl shadow-[color:var(--brand-shadow)]'}`} style={{ '--brand-shadow': `${brandColors.primary}10` } as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brandColors.primary}15`, color: brandColors.primary }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oylik to'lov</p>
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(course.monthlyPrice)}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => { setModalType('enroll'); setModalOpen(true); }} className="h-16 px-12 text-xl text-white rounded-2xl w-full sm:w-auto font-black shadow-2xl hover:-translate-y-1 transition-all active:scale-95 border border-white/20" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`, boxShadow: `0 20px 40px -10px ${brandColors.primary}50` }}>
                Kursga yozilish
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 rounded-[3rem] pointer-events-none z-20"></div>
              <div className={`rounded-[3rem] overflow-hidden h-[600px] relative border-[8px] shadow-2xl ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[color:var(--brand-shadow)]'}`} style={{ '--brand-shadow': `${brandColors.primary}30` } as React.CSSProperties}>
                <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay pointer-events-none" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}></div>
                <img src={course.coverImage || `https://picsum.photos/seed/${course.id}/800/1000`} alt={tField(course.title)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20" style={{ background: `linear-gradient(to top, ${isDark ? '#0f172a' : '#000'} 0%, transparent 50%)` }}></div>
                <div className="absolute inset-0 z-30 flex items-end p-12">
                  <div className="text-white w-full">
                    <p className="text-sm font-bold mb-2 opacity-80 uppercase tracking-wider">Jami kurs narxi:</p>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl md:text-5xl font-black">{tField(course.totalPrice)}</p>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md" style={{ background: `${brandColors.primary}50` }}>
                        <Code2 size={32} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">

            {/* Technologies */}
            <section>
              <h2 className={`text-3xl font-black mb-8 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${brandColors.primary}15`, color: brandColors.primary }}>
                  <Code2 size={24} />
                </div>
                Nimalar o'rgatiladi?
              </h2>
              <div className="flex flex-wrap gap-4">
                {course.technologies.map((tech, idx) => (
                  <div key={idx} className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 border shadow-sm transition-transform hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
                    <CheckCircle2 size={18} style={{ color: brandColors.primary }} />
                    {tech}
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className={`text-3xl font-black mb-8 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${brandColors.primary}15`, color: brandColors.primary }}>
                  <BookOpen size={24} />
                </div>
                Dars rejasi
              </h2>
              <div className="space-y-6">
                {course.modules.map((mod, idx) => (
                  <div key={idx} className={`rounded-[2rem] p-8 border hover:shadow-xl transition-all ${isDark ? 'bg-slate-900/80 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                    <h3 className={`text-xl font-black mb-6 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <span className="w-10 h-10 rounded-[10px] flex items-center justify-center text-base shrink-0 text-white font-black" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
                        {idx + 1}
                      </span>
                      {tField(mod.title)}
                    </h3>
                    <ul className="space-y-4 pl-[3.25rem]">
                      {mod.lessons.map((lesson, lIdx) => (
                        <li key={lIdx} className={`flex items-start gap-4 font-medium text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <div className="w-2 h-2 rounded-full mt-2.5 shrink-0" style={{ background: brandColors.primary }} />
                          <span>{tField(lesson)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-10">
              <div>
                <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${brandColors.primary}15`, color: brandColors.primary }}>
                    <Users size={20} />
                  </div>
                  Kurs ustozlari
                </h2>
                <div className="space-y-4">
                  {course.mentors.map((mentor, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border flex items-center gap-5 transition-transform hover:-translate-y-1 ${isDark ? 'bg-slate-900/80 border-white/5 shadow-lg shadow-black' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2`} style={{ borderColor: `${brandColors.primary}30` }}>
                        <img src={mentor.image} alt={tField(mentor.name)} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(mentor.name)}</h4>
                        <p className="text-sm font-bold" style={{ color: brandColors.primary }}>{tField(mentor.role)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`, boxShadow: `0 20px 40px -10px ${brandColors.primary}50` }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-black mb-4">Savollaringiz bormi?</h3>
                  <p className="text-white/80 mb-8 font-medium">
                    Kurs haqida batafsil ma'lumot olish uchun biz bilan bog'laning.
                  </p>
                  <a href="tel:+998622277222" className="block w-full py-4 bg-white/10 hover:bg-white backdrop-blur-md rounded-2xl font-black text-lg transition-all group" style={{ color: 'white' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = brandColors.primary; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'white'; }}>
                    <span className="flex items-center justify-center gap-2">
                      <Phone size={20} className="group-hover:rotate-12 transition-transform" /> +998 62 227-72-22
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        courseName={tField(course.title)}
        type={modalType}
      />

    </div>
  );
}
