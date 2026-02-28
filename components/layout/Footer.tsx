import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Instagram, Send, Facebook, Youtube, ArrowUpRight } from 'lucide-react';
import { Logo, PatternBg, FloatingStars } from '../BrandElements';
import { useTheme } from '../../store/ThemeContext';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer className="relative overflow-hidden pt-16 pb-8 text-white" style={{ background: isDark ? 'linear-gradient(135deg, #090e17 0%, #0a1426 100%)' : 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 40%, #0a1f2e 70%, #0f172a 100%)' }}>
      {/* Brand decorative backgrounds */}
      <PatternBg color="#ffffff" opacity={0.03} />

      {/* Background glow effects and stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[300px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(0,97,255,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-[40%] w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(96,239,255,0.2) 0%, transparent 70%)' }} />
        <FloatingStars color1="#0061ff" color2="#60efff" className="opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <div className="mb-6">
              <Logo width={160} style={{ color: '#ffffff' }} />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 mt-4">
              Biz bilimga to'ldiramiz. Zamonaviy kasblarni o'rgatuvchi innovatsion ta'lim markazi.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/data_talim_stansiyasi', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500' },
                { icon: Send, href: 'https://t.me/data_talim_stansiyasi', color: 'hover:bg-[#0088cc]' },
                { icon: Facebook, href: '#', color: 'hover:bg-[#1877f2]' },
                { icon: Youtube, href: '#', color: 'hover:bg-[#ff0000]' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 ${s.color}`}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-slate-300">Tezkor havolalar</h3>
            <ul className="space-y-3">
              {[
                { name: 'Bosh sahifa', to: '/' },
                { name: 'Kurslar', to: '/courses' },
                { name: 'Biz haqimizda', to: '/about' },
                { name: 'Jamoa', to: '/team' },
                { name: 'Karyera Testi', to: '/career-test' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-slate-300">Kurslar</h3>
            <ul className="space-y-3">
              {['Dasturlash', 'Grafik Dizayn', 'SMM & Marketing', 'Robototexnika', 'Buxgalteriya'].map(name => (
                <li key={name}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — Glass card */}
          <div>
            <h3 className="text-sm font-bold mb-6 uppercase tracking-widest text-slate-300">Bog'lanish</h3>
            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,97,255,0.15)' }}>
                  <MapPin className="text-[#60efff]" size={16} />
                </div>
                <span className="text-slate-400 text-sm">Xorazm viloyati, Urganch sh., V.Fayozov ko'chasi, 9-uy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Phone className="text-emerald-400" size={16} />
                </div>
                <a href="tel:+998622277222" className="text-slate-400 hover:text-white transition-colors text-sm">+998 62 227-72-22</a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,97,255,0.15)' }}>
                  <Mail className="text-blue-400" size={16} />
                </div>
                <a href="mailto:dataunionuz@gmail.com" className="text-slate-400 hover:text-white transition-colors text-sm">dataunionuz@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} DATA Ta'lim Stansiyasi. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="hover:text-white transition-colors">Foydalanish shartlari</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
