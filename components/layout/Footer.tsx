import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Instagram, Send, Facebook, Youtube, ArrowUpRight, Sparkles, Users, GraduationCap, Award } from 'lucide-react';
import { Logo, PatternBg, FloatingStars } from '../BrandElements';
import { useTheme } from '../../store/ThemeContext';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative overflow-hidden text-white" style={{ background: isDark ? 'linear-gradient(135deg, #090e17 0%, #0a1426 100%)' : 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 40%, #0a1f2e 70%, #0f172a 100%)' }}>

      {/* Top gradient divider */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0061ff 0%, #60efff 35%, #00b26b 65%, #82f4b1 100%)' }} />

      {/* Social Proof Banner */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: '2000+', label: "O'quvchilar", color: '#60efff' },
              { icon: GraduationCap, value: '500+', label: 'Bitiruvchilar', color: '#82f4b1' },
              { icon: Award, value: '15+', label: 'Kurslar', color: '#f59e0b' },
              { icon: Sparkles, value: '98%', label: 'Mamnuniyat', color: '#ec4899' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}20` }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand decorative backgrounds */}
      <PatternBg color="#ffffff" opacity={0.03} />

      {/* Background glow effects and stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[400px] h-[300px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(0,97,255,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-[10%] w-[350px] h-[250px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-[40%] w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(96,239,255,0.2) 0%, transparent 70%)' }} />
        <FloatingStars color1="#0061ff" color2="#60efff" className="opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info + Newsletter */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Logo width={160} style={{ color: '#ffffff' }} />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 mt-4">
              Biz bilimga to'ldiramiz. Zamonaviy kasblarni o'rgatuvchi innovatsion ta'lim markazi.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Yangiliklar</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold py-3">
                  <Sparkles size={16} />
                  Obuna bo'ldingiz! Rahmat!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email kiriting"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-[#0061ff]/50 transition-colors"
                    required
                  />
                  <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shrink-0" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
                    Obuna
                  </button>
                </form>
              )}
            </div>

            <div className="flex gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/data_talim_stansiyasi', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500' },
                { icon: Send, href: 'https://t.me/data_talim_stansiyasi', color: 'hover:bg-[#0088cc]' },
                { icon: Facebook, href: '#', color: 'hover:bg-[#1877f2]' },
                { icon: Youtube, href: '#', color: 'hover:bg-[#ff0000]' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 ${s.color}`}
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
                { name: 'Kurslar', to: '/kurslar' },
                { name: 'Biz haqimizda', to: '/biz-haqimizda' },
                { name: 'Jamoa', to: '/jamoa' },
                { name: 'Karyera Testi', to: '/karyera-testi' },
                { name: 'Blog', to: '/blog' },
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
              {['Dasturlash', 'Grafik Dizayn', 'SMM & Marketing', 'Robototexnika', 'Buxgalteriya', 'Til Kurslari'].map(name => (
                <li key={name}>
                  <Link to="/kurslar" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1 group">
                    {name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
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

            {/* Working hours */}
            <div className="mt-4 px-4 py-3 rounded-xl text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-bold mb-1 text-slate-400">⏰ Ish vaqti</p>
              <p>Dushanba - Shanba: 09:00 - 18:00</p>
              <p>Yakshanba: Dam olish kuni</p>
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
