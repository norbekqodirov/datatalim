import React, { useState } from 'react';
import { MapPin, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';
import { useStore } from '../../store/useStore';
import { sendToTelegram } from '../../utils/telegram';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, Star1, Star2 } from '../BrandElements';

export const Contact: React.FC = () => {
  const { siteContent } = useStore();
  const { tField } = useLanguage();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { isDark } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Ism va telefon raqamini kiriting!');
      return;
    }
    setLoading(true);

    const text = `📩 <b>Yangi xabar — DATA Ta'lim Stansiyasi</b>\n\n👤 <b>Ism:</b> ${formData.name}\n📞 <b>Telefon:</b> ${formData.phone}\n💬 <b>Xabar:</b> ${formData.message || '—'}\n\n🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;

    const result = await sendToTelegram(text);
    setLoading(false);

    if (result.success) {
      toast.success('Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.');
      setSent(true);
      setFormData({ name: '', phone: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } else {
      toast.error(result.error || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  return (
    <div id="contact" className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#fff' }}>
      <PatternBg color={isDark ? '#fc466b' : '#3f5efb'} opacity={isDark ? 0.02 : 0.03} />

      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#3f5efb] blur-[100px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
          <Star2 size={60} color="#3f5efb" opacity={0.1} className="absolute -top-10 left-10 rotate-slow pointer-events-none hidden lg:block" />

          <div>
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Biz bilan <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #fc466b, #3f5efb)' }}>bog'laning</span>
            </h2>
            <p className={`text-lg mb-10 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Savollaringiz bormi? Bizga murojaat qiling yoki o'quv markazimizga tashrif buyuring.
            </p>

            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Manzil", subtitle: tField(siteContent.contactAddress), extra: tField(siteContent.contactLandmark) },
                { icon: Phone, title: "Telefon", subtitle: siteContent.contactPhone, extra: tField(siteContent.contactSchedule) },
                { icon: Mail, title: "Email", subtitle: siteContent.contactEmail }
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-5 p-6 rounded-3xl border transition-all hover:translate-x-2 group ${isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-[#3f5efb]/20' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-[#3f5efb]/10'}`}>
                  <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 ${isDark ? 'bg-[#3f5efb]/20 text-[#60efff]' : 'bg-blue-100 text-[#3f5efb]'}`}>
                    <item.icon size={26} />
                  </div>
                  <div>
                    <h4 className={`font-black text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                    <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.subtitle}</p>
                    {item.extra && <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.extra}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <Star1 size={80} color="#fc466b" opacity={0.05} className="absolute -top-10 right-0 rotate-slow pointer-events-none" />
            <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-white/10 shadow-black/50' : 'bg-white/80 border-slate-100 shadow-blue-900/5'}`}>
              {/* Subtle gradient border effect */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20" style={{ background: 'linear-gradient(135deg, #fc466b, transparent)' }}></div>

              {sent ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 slide-up fade-in relative z-10">
                  <div className="w-20 h-20 bg-[#00b26b]/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-[#00b26b] rounded-full blur-xl opacity-20 pulse-glow"></div>
                    <CheckCircle2 className="text-[#00b26b] relative z-10" size={40} />
                  </div>
                  <h3 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Xabar yuborildi!</h3>
                  <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tez orada siz bilan bog'lanamiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ismingiz</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 focus:border-[#3f5efb] text-white placeholder-slate-500 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:border-[#3f5efb] focus:ring-4 focus:ring-[#3f5efb]/10 text-slate-900 focus:bg-white'}`}
                      placeholder="Ismingizni kiriting"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Telefon raqamingiz</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 focus:border-[#3f5efb] text-white placeholder-slate-500 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:border-[#3f5efb] focus:ring-4 focus:ring-[#3f5efb]/10 text-slate-900 focus:bg-white'}`}
                      placeholder="+998 90 123 45 67"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Xabaringiz</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all h-36 resize-none font-medium text-base ${isDark ? 'bg-slate-800 border-slate-700 focus:border-[#3f5efb] text-white placeholder-slate-500 focus:bg-slate-900' : 'bg-slate-50 border-slate-200 focus:border-[#3f5efb] focus:ring-4 focus:ring-[#3f5efb]/10 text-slate-900 focus:bg-white'}`}
                      placeholder="Savolingizni yozing..."
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-white rounded-2xl shadow-xl hover:-translate-y-1 transition-all group font-bold text-lg border border-white/10"
                    style={{ background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Yuborilmoqda...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">Xabarni yuborish <Mail className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-10" size={20} /></span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
