import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../Button';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, FloatingStars, Star1 } from '../BrandElements';

export const About: React.FC = () => {
  const { siteContent } = useStore();
  const { isDark } = useTheme();
  const { tField } = useLanguage();

  return (
    <div id="about" className="py-24 overflow-hidden relative" style={{ background: isDark ? '#000' : '#fff' }}>
      {/* Brand Background Elements */}
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.03 : 0.02} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,178,107,0.3) 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,97,255,0.3) 0%, transparent 70%)' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-50 ${isDark ? 'bg-[#0061ff]' : 'bg-blue-100'}`} />
            <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-50 ${isDark ? 'bg-[#00b26b]' : 'bg-emerald-100'}`} />

            <Star1 size={60} color="#0061ff" opacity={isDark ? 0.2 : 0.1} className="absolute -top-16 right-10 rotate-slow pointer-events-none" />

            <div className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] border-4 ${isDark ? 'border-white/10' : 'border-white/50'}`}>
              <img
                src={siteContent.aboutImage}
                alt="About DATA"
                className="w-full object-cover z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            </div>

            <div
              className={`absolute bottom-8 left-8 right-8 backdrop-blur-xl p-6 rounded-2xl shadow-xl z-20 transition-all duration-300 hover:-translate-y-2 border ${isDark ? 'border-white/10 bg-black/60' : 'border-white/40 bg-white/80'}`}
            >
              <h4 className={`font-black text-xl mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Shahzod Sabirov</h4>
              <p className={`text-sm font-bold text-transparent bg-clip-text shimmer-text`} style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
                DATA Ta'lim Stansiyasi asoschisi
              </p>
            </div>
          </div>

          <div className="relative">
            <Star1 size={100} color="#00b26b" opacity={0.03} className="absolute -top-10 right-0 pointer-events-none rotate-slow" />
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tField(siteContent.aboutTitle).split(' ').map((word: string, i: number) =>
                i === 0 ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#0061ff] to-[#60efff] mr-3">{word}</span> : word + ' '
              )}
            </h2>
            <p className={`text-lg mb-8 leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {tField(siteContent.aboutDescription)}
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Kuchli mutaxassislar jamoasi",
                "Innovatsion o'qitish metodikasi",
                "Real loyihalar ustida ishlash",
                "Xalqaro standartlar asosida ta'lim"
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:translate-x-2 ${isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}>
                  <div className={`p-1.5 rounded-xl shrink-0 ${isDark ? 'bg-[#00b26b]/20 text-[#82f4b1]' : 'bg-emerald-100 text-[#00b26b]'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                </div>
              ))}
            </div>

            <div
              className={`p-6 rounded-2xl border-l-4 mb-10 shadow-sm relative overflow-hidden group ${isDark ? 'border-[#0061ff] bg-blue-950/20' : 'border-[#0061ff] bg-blue-50/50'}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0061ff] blur-2xl opacity-10 rounded-full group-hover:scale-150 transition-transform"></div>
              <p className={`italic font-medium leading-relaxed relative z-10 ${isDark ? 'text-blue-200' : 'text-slate-700'}`}>
                "{tField(siteContent.aboutQuote)}"
              </p>
            </div>

            <Link to="/about">
              <Button className="h-14 px-8 text-lg text-white rounded-2xl shadow-lg shadow-blue-500/20 group font-bold hover:scale-105 active:scale-95 transition-all w-full sm:w-auto" style={{ background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)' }}>
                Batafsil ma'lumot
                <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
