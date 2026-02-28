import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Users, Briefcase, Smile, Coffee, Wifi, Target, Award, CheckCircle2, BookOpen, Zap, Heart, Globe } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { PatternBg, FloatingStars, Star1, Star2 } from '../components/BrandElements';

const stats = [
  { icon: Users, value: "1600+", label: "O'quvchi sig'imi", desc: "Zamonaviy o'quv xonalari" },
  { icon: Briefcase, value: "75%", label: "Ish bilan ta'minlangan", desc: "Bitiruvchilarimiz natijasi" },
  { icon: Smile, value: "98%", label: "Mamnun ota-onalar", desc: "Yuqori sifatli xizmat" },
  { icon: Monitor, value: "250+", label: "Zamonaviy kompyuterlar", desc: "MacOS va Windows" }
];

const facilities = [
  {
    icon: Monitor,
    title: "Zamonaviy texnikalar",
    desc: "O'quv xonalarimiz so'nggi rusumdagi iMac va kuchli Windows kompyuterlari bilan jihozlangan. Bu esa dasturlash va dizayn dasturlarida qotishlarsiz, tezkor ishlash imkonini beradi."
  },
  {
    icon: Coffee,
    title: "Coworking hududi",
    desc: "Darsdan tashqari vaqtlarda o'quvchilarimiz bemalol kelib, o'z ustilarida ishlashlari, jamoaviy loyihalar qilishlari uchun maxsus shinam coworking zonalarimiz mavjud."
  },
  {
    icon: Wifi,
    title: "Yuqori tezlikdagi internet",
    desc: "Markazimizning barcha hududlarida uzluksiz va yuqori tezlikdagi Wi-Fi tarmog'i ishlab turadi. Kerakli ma'lumotlarni yuklab olish va videodarslarni ko'rishda muammo bo'lmaydi."
  },
  {
    icon: Target,
    title: "Amaliyot va Real loyihalar",
    desc: "Bizda faqat quruq nazariya emas, balki real loyihalar ustida ishlash imkoniyati mavjud. O'quvchilar o'qish davomidayoq o'z portfoliolarini yig'ishni boshlaydilar."
  },
  {
    icon: Award,
    title: "Sertifikat va Ishga yo'naltirish",
    desc: "Kursni muvaffaqiyatli tamomlagan o'quvchilarga maxsus sertifikat beriladi va eng yaxshi bitiruvchilarni ishga joylashishlarida amaliy yordam ko'rsatiladi."
  },
  {
    icon: Users,
    title: "Kuchli ustozlar jamoasi",
    desc: "Darslar o'z sohasining yetuk mutaxassislari, katta tajribaga ega bo'lgan amaliyotchi dasturchi va dizaynerlar tomonidan olib boriladi."
  }
];

export default function About() {
  const { isDark } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden pb-16" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#fc466b' : '#3f5efb'} opacity={isDark ? 0.02 : 0.03} />
      <FloatingStars color1="#3f5efb" color2="#fc466b" className="opacity-40" />

      {/* Hero Section */}
      <div className={`relative z-10 pt-24 pb-16 border-b ${isDark ? 'border-white/5 bg-slate-900/50 backdrop-blur-3xl' : 'bg-white/80 backdrop-blur-3xl border-slate-200/50 shadow-sm'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3f5efb] blur-[150px] opacity-10 rounded-full pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 text-center">
          <Star2 size={70} color="#3f5efb" opacity={0.15} className="absolute top-10 right-20 rotate-slow pointer-events-none hidden md:block" />
          <Star1 size={50} color="#fc466b" opacity={0.15} className="absolute bottom-10 left-20 rotate-slow pointer-events-none hidden md:block" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-block px-4 py-2 rounded-xl border border-[#3f5efb]/20 text-[#3f5efb] font-black text-sm mb-6 tracking-wider uppercase shadow-sm bg-[#3f5efb]/5 backdrop-blur-sm">
              Biz haqimizda
            </div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Biz shunchaki o'quv markazi <br className="hidden md:block" /> <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>emasmiz</span>
            </h1>
            <p className={`text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              "DATA UNION" — mustaqil, o‘z rivojlanish strategiyasi, qadriyatlari va maqsadlariga ega kompaniya.
              Biz 2019-yilda tashkil topganmiz va minglab yoshlarga innovatsion texnologiyalar bo‘yicha ta’lim berib kelmoqdamiz.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story & Founder Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#3f5efb] to-[#fc466b] rounded-[3.5rem] transform -rotate-3 z-0 opacity-20 blur-xl"></div>
            <img
              src="https://picsum.photos/seed/shahzod_founder/800/1000"
              alt="Shahzod Sabirov - Asoschi"
              className="relative rounded-[3rem] shadow-2xl w-full object-cover z-10 h-[500px] lg:h-[600px] border-[8px] border-white/10"
            />
            <div className={`absolute bottom-8 left-8 right-8 p-8 rounded-3xl shadow-2xl z-20 border backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/90 border-white/50'}`}>
              <h4 className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Shahzod Sabirov</h4>
              <p className="font-bold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>DATA Ta'lim Stansiyasi asoschisi</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Bizning <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>Maqsadimiz</span></h2>
            <p className={`text-lg mb-10 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Bizning asosiy maqsadimiz — yuqori malakali, ijodiy fikrlaydigan va jamiyatimizga ijobiy ta’sir qiladigan avlodni yetishtirishdir. Biz nafaqat kasb o'rgatamiz, balki o'quvchilarimizning dunyoqarashini kengaytirib, ularni kelajak muammolariga yechim topa oladigan mutaxassislar qilib tayyorlaymiz.
            </p>

            <div className="space-y-6 mb-12">
              {[
                "Zamonaviy va talabgir kasblarni o'rgatish",
                "O'quvchilarda mantiqiy va kreativ fikrlashni rivojlantirish",
                "Xalqaro standartlar asosida sifatli ta'lim berish",
                "Yoshlarni ish bilan ta'minlashga ko'maklashish"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isDark ? 'bg-[#3f5efb]/20 text-[#60efff]' : 'bg-[#3f5efb]/10 text-[#3f5efb]'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <span className={`font-bold text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item}</span>
                </div>
              ))}
            </div>

            <div className={`p-8 rounded-[2rem] border-l-8 mb-10 relative overflow-hidden backdrop-blur-sm ${isDark ? 'bg-slate-900/50 border-[#3f5efb]' : 'bg-gradient-to-r from-[#3f5efb]/5 to-[#fc466b]/5 border-[#3f5efb]'}`}>
              <Zap className="absolute top-4 right-4 text-[#3f5efb] opacity-10" size={100} />
              <p className={`italic text-lg font-bold leading-relaxed relative z-10 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                "Ta'lim — bu kelajakka kiritilgan eng yaxshi sarmoyadir. Biz har bir o'quvchimizning muvaffaqiyati uchun mas'uliyatni his qilamiz."
              </p>
            </div>

            <div className={`p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900/80 border-white/5 shadow-black' : 'bg-white border-slate-100 shadow-[color:rgba(63,94,251,0.05)]'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#3f5efb]/20 to-transparent rounded-bl-full pointer-events-none"></div>
              <h3 className={`text-2xl font-black mb-6 flex items-center gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#3f5efb]/20 text-[#60efff]' : 'bg-[#3f5efb]/10 text-[#3f5efb]'}`}>
                  <Zap size={24} />
                </div>
                Nega aynan "Stansiya"?
              </h3>
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Biz o'zimizni "Stansiya" deb atashimiz bejiz emas. Stansiya — bu to'xtash joyi emas, balki yangi kuch to'plash va yo'nalishni aniqlab olish maskanidir. O'quvchilarimiz bu yerda bilim bilan "to'yinadilar" va katta hayot yo'liga ishonch bilan qadam qo'yadilar. Bu yerda turli taqdirlar kesishadi va yangi muvaffaqiyat hikoyalari boshlanadi.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 relative">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Bizning <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>Qadriyatlarimiz</span></h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              DATA jamoasini birlashtirib turuvchi va bizni olg'a boshlovchi tamoyillar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Innovatsiya", desc: "Har doim yangilikka intilish va eng so'nggi texnologiyalarni ta'limga tatbiq etish." },
              { icon: Heart, title: "Sifat", desc: "Har bir dars va har bir loyihada eng yuqori sifat standartlariga amal qilish." },
              { icon: Target, title: "Natija", desc: "Biz uchun eng muhimi — o'quvchilarimizning real yutuqlari va ish bilan ta'minlanishi." },
              { icon: Globe, title: "Hamjamiyat", desc: "O'zaro yordam va bilim almashishga asoslangan kuchli IT hamjamiyatini yaratish." }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-[2.5rem] border text-center transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/20' : 'bg-white/60 border-slate-100 hover:bg-white hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/10'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl from-[#3f5efb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${isDark ? 'bg-[#3f5efb]/20 text-[#60efff]' : 'bg-[#3f5efb]/10 text-[#3f5efb]'}`}>
                  <value.icon size={36} />
                </div>
                <h3 className={`text-2xl font-black mb-4 relative z-10 ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-[#3f5efb] transition-colors'}`}>{value.title}</h3>
                <p className={`leading-relaxed font-medium relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Section */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-transparent bg-clip-text font-black text-sm uppercase tracking-widest mb-6" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>
                <BookOpen size={20} className="text-[#3f5efb]" />
                <span>DATA Jurnalidan</span>
              </div>
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bizning hikoyamiz va <br /> ta'limga bo'lgan <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>qarashimiz</span>
              </h2>
            </div>
            <p className={`max-w-md text-lg leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Jurnalimiz sahifalaridan olingan ushbu parchalar bizning qadriyatlarimiz va kelajak haqidagi o'ylarimizni ifodalaydi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              {
                date: "2019, Sentyabr",
                title: "Xorazmda IT ekotizimini yaratish sari ilk qadam",
                content: "DATA Ta'lim Stansiyasi tashkil etilganda, bizning oldimizda katta bir savol bor edi: Xorazmda IT sohasini qanday rivojlantirish mumkin? Biz shunchaki o'quv markazi emas, balki yoshlar o'z g'oyalarini amalga oshira oladigan makon yaratishni niyat qildik.",
                author: "Shahzod Sabirov"
              },
              {
                date: "2021, Mart",
                title: "Ta'limda sifat — eng asosiy mezon",
                content: "Biz uchun o'quvchilar soni emas, balki ularning sifati muhim. Har bir bitiruvchi o'z sohasida mustaqil ishlay oladigan darajaga yetishi kerak. Shuning uchun ham biz amaliyotga va real loyihalarga katta e'tibor qaratamiz.",
                author: "DATA Jamoasi"
              },
              {
                date: "2023, Dekabr",
                title: "Kelajak kasblari va bizning mas'uliyatimiz",
                content: "Dunyo shiddat bilan o'zgarmoqda. Bugun o'rganilgan texnologiya ertaga eskirishi mumkin. Biz o'quvchilarimizga nafaqat kod yozishni, balki doimiy o'rganishni va moslashuvchanlikni o'rgatamiz. Bu ularning umrbod muvaffaqiyati garovidir.",
                author: "Metodika bo'limi"
              }
            ].map((article, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-[2.5rem] border flex flex-col h-full transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/20' : 'bg-white/60 border-slate-100 hover:bg-white hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/10'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl from-[#3f5efb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <span className="text-sm font-black text-transparent bg-clip-text uppercase tracking-widest mb-6 inline-block w-max" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>{article.date}</span>
                <h3 className={`text-2xl font-black mb-6 leading-tight transition-colors z-10 relative ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-[#3f5efb]'}`}>
                  "{article.title}"
                </h3>
                <p className={`leading-relaxed mb-8 flex-1 italic font-medium z-10 relative ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {article.content}
                </p>
                <div className={`pt-6 border-t flex items-center justify-between z-10 relative ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <span className={`text-sm font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>— {article.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 relative overflow-hidden my-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3f5efb] to-[#fc466b] opacity-90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[#0f172a] opacity-80"></div>
          <PatternBg color="#fff" opacity={0.05} />
        </div>

        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#60efff] rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ee2a7b] rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight text-white">DATA <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #60efff, #fff)' }}>Raqamlarda</span></h2>
            <p className="text-[#60efff] max-w-2xl mx-auto text-xl font-medium">
              Bizning erishgan natijalarimiz va imkoniyatlarimiz raqamlarda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#60efff] to-[#3f5efb] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300"></div>
                  <div className="relative z-10 w-full h-full bg-gradient-to-br from-[#60efff] to-[#3f5efb] rounded-2xl flex items-center justify-center text-white">
                    <stat.icon size={36} />
                  </div>
                </div>
                <h3 className="text-5xl font-black mb-4 tracking-tighter text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #fff, #60efff)' }}>{stat.value}</h3>
                <p className="font-black text-white text-lg mb-2">{stat.label}</p>
                <p className="text-sm font-medium text-white/60">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 relative">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Nega aynan <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #3f5efb, #fc466b)' }}>DATA?</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              O'quvchilarimiz uchun yaratilgan maxsus sharoitlar va qulayliklar bilan tanishing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {facilities.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-10 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-xl ${isDark ? 'bg-slate-900/60 border-white/5 hover:bg-slate-800/80 hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/20' : 'bg-white/60 border-slate-100 hover:bg-white hover:border-[#3f5efb]/30 hover:shadow-2xl hover:shadow-[#3f5efb]/10'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl from-[#3f5efb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${isDark ? 'bg-[#3f5efb]/20 text-[#60efff]' : 'bg-[#3f5efb]/10 text-[#3f5efb]'}`}>
                  <item.icon size={32} />
                </div>
                <h3 className={`text-2xl font-black mb-4 relative z-10 ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-[#3f5efb] transition-colors'}`}>{item.title}</h3>
                <p className={`leading-relaxed font-medium text-sm relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <img src="https://picsum.photos/seed/data_gallery1/600/600" alt="Gallery 1" className={`w-full h-48 md:h-64 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-500 cursor-pointer border-[6px] shadow-xl ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[#3f5efb]/10'}`} />
            <img src="https://picsum.photos/seed/data_gallery2/600/600" alt="Gallery 2" className={`w-full h-48 md:h-64 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-500 cursor-pointer border-[6px] shadow-xl ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[#fc466b]/10'}`} />
            <img src="https://picsum.photos/seed/data_gallery3/600/600" alt="Gallery 3" className={`w-full h-48 md:h-64 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-500 cursor-pointer border-[6px] shadow-xl ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[#00b26b]/10'}`} />
            <img src="https://picsum.photos/seed/data_gallery4/600/600" alt="Gallery 4" className={`w-full h-48 md:h-64 object-cover rounded-[2rem] hover:scale-105 transition-transform duration-500 cursor-pointer border-[6px] shadow-xl ${isDark ? 'border-slate-800 shadow-black' : 'border-white shadow-[#82f4b1]/10'}`} />
          </div>
        </div>
      </div>

    </div>
  );
}
