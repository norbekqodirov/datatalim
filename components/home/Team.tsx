import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../Button';
import { useTheme } from '../../store/ThemeContext';
import { useStore } from '../../store/useStore';
import { useLanguage } from '../../i18n';
import { PatternBg, Star2 } from '../BrandElements';

export const Team: React.FC = () => {
  const { isDark } = useTheme();
  const { team } = useStore();
  const { tField } = useLanguage();
  const displayTeam = team.slice(0, 4);
  return (
    <div id="team" className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />

      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#0061ff] blur-[100px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 relative">
          <Star2 size={50} color="#0061ff" opacity={0.1} className="absolute -top-8 right-1/4 rotate-slow pointer-events-none" />
          <h2 className={`text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Bizning <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>Jamoa</span>
          </h2>
          <p className={`text-lg font-medium max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Sizga ta'lim beradigan va qo'llab-quvvatlaydigan professionallar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {displayTeam.map((member, idx) => (
            <div key={idx} className={`p-6 rounded-[2rem] shadow-sm border text-center transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-[#0061ff]/10' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-[#0061ff]/5'}`}>
              <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, #0061ff, #60efff)' }}></div>
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 relative z-10 p-1 group-hover:scale-105 transition-transform" style={{ borderColor: isDark ? 'rgba(96,239,255,0.2)' : 'rgba(0,97,255,0.1)' }}>
                <img src={member.image} alt={tField(member.name)} className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className={`text-lg font-bold mb-1 relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(member.name)}</h3>
              <p className="text-sm font-bold text-transparent bg-clip-text relative z-10" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>{tField(member.role)}</p>
            </div>
          ))}
        </div>

        <div className="text-center relative z-10">
          <Link to="/team">
            <Button variant="outline" className={`h-14 px-8 text-lg border-2 rounded-2xl group font-bold hover:scale-105 active:scale-95 transition-all ${isDark ? 'border-slate-800 text-slate-300 hover:border-[#60efff]' : 'border-slate-200 text-slate-700 hover:border-[#0061ff] bg-white'}`}>
              Barcha jamoa a'zolari bilan tanishish
              <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
