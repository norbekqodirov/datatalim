import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Star, Briefcase, GraduationCap, ChevronRight } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, FloatingStars, Star1, Star2 } from '../components/BrandElements';

import { useStore } from '../store/useStore';
import { useLanguage } from '../i18n';

const values = [
  {
    icon: Star,
    title: "Tajriba va Malaka",
    desc: "Jamoamiz a'zolari o'z sohasining yetuk mutaxassislari hisoblanadi."
  },
  {
    icon: Users,
    title: "Do'stona Muhit",
    desc: "Bizda ustoz va shogird o'rtasida erkin va do'stona munosabat o'rnatilgan."
  },
  {
    icon: Award,
    title: "Doimiy Rivojlanish",
    desc: "Ustozlarimiz ham doimiy ravishda o'z ustilarida ishlab, yangi bilimlarni o'zlashtiradilar."
  }
];

export default function Team() {
  const { isDark } = useTheme();
  const { team } = useStore();
  const { tField } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />
      <FloatingStars color1="#0061ff" color2="#60efff" className="opacity-40" />

      {/* Hero Section */}
      <div className={`relative z-10 pt-24 pb-16 border-b ${isDark ? 'border-white/5 bg-slate-900/50 backdrop-blur-3xl' : 'bg-white/80 backdrop-blur-3xl border-slate-200/50 shadow-sm'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0061ff] blur-[150px] opacity-10 rounded-full pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 text-center">
          <Star2 size={60} color="#0061ff" opacity={0.15} className="absolute top-10 right-1/4 rotate-slow pointer-events-none hidden md:block" />
          <Star1 size={40} color="#60efff" opacity={0.15} className="absolute bottom-10 left-1/4 rotate-slow pointer-events-none hidden md:block" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-block px-4 py-2 rounded-xl border border-[#0061ff]/20 text-[#0061ff] font-black text-sm mb-6 tracking-wider uppercase shadow-sm bg-[#0061ff]/5 backdrop-blur-sm">
              Bizning Jamoa
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Muvaffaqiyatimiz <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>siri</span>
            </h1>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              DATA Ta'lim Stansiyasining eng katta boyligi — bu uning jamoasi. Biz o'z ishining ustalari, yoshlarga bilim berishdan zavq oladigan professionallarni bir joyga jamlaganmiz.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-[2.5rem] border text-center transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-white/10 hover:shadow-2xl hover:shadow-[#0061ff]/20' : 'bg-white/60 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-[#0061ff]/10'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl from-[#0061ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 ${isDark ? 'bg-[#0061ff]/20 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'}`}>
                  <item.icon size={36} />
                </div>
                <h3 className={`text-2xl font-black mb-4 relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`leading-relaxed font-medium relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Rahbariyat va <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>Ustozlar</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Sizning kelajagingiz uchun qayg'uradigan va doim yordamga tayyor insonlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group rounded-[2.5rem] border overflow-hidden transition-all duration-300 hover:-translate-y-2 relative ${isDark ? 'bg-slate-900/80 border-white/5 hover:border-[#60efff]/30 hover:shadow-2xl hover:shadow-black' : 'bg-white border-slate-100 hover:border-[#0061ff]/30 hover:shadow-2xl hover:shadow-blue-900/10'}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}></div>
                <div className="h-80 overflow-hidden relative">
                  <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}></div>
                  <div className={`absolute inset-0 z-20 ${isDark ? 'bg-gradient-to-t from-slate-900 to-transparent' : 'bg-gradient-to-t from-white to-transparent'}`}></div>
                  <img
                    src={member.image}
                    alt={tField(member.name)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-0"
                  />
                  <div className="absolute bottom-6 left-8 right-8 z-30">
                    <h3 className={`text-3xl font-black mb-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-[#0061ff] transition-colors'}`}>{tField(member.name)}</h3>
                    <p className="font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>{tField(member.role)}</p>
                  </div>
                </div>
                <div className="p-8 relative z-30 -mt-4">
                  <p className={`mb-8 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {tField(member.bio)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, sIdx) => (
                      <span key={sIdx} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 border border-slate-700 text-slate-300 group-hover:bg-[#0061ff]/20 group-hover:text-[#60efff] group-hover:border-[#0061ff]/30' : 'bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100'}`}>
                        {tField(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Team CTA */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0061ff] rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#60efff] rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-[2rem] flex items-center justify-center mb-10 backdrop-blur-md border border-white/20 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0061ff] to-[#60efff] opacity-20 rounded-[2rem] blur-xl pulse-glow"></div>
            <Briefcase size={40} className={isDark ? 'text-[#60efff]' : 'text-[#0061ff]'} />
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bizning jamoaga <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>qo'shiling</span>
          </h2>
          <p className={`text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            O'z sohangizning yetuk mutaxassisi bo'lsangiz va yoshlarga bilim berishni xohlasangiz, biz sizni kutamiz!
          </p>
          <button className="h-16 px-12 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto group border border-white/20" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)', boxShadow: '0 20px 40px -10px rgba(0,97,255,0.4)' }}>
            Vakansiyalarni ko'rish
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}
