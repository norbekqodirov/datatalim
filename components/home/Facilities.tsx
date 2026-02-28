import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Users, Coffee, Wifi, Target, Award } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, Star2 } from '../BrandElements';

const facilities = [
  {
    icon: Monitor,
    title: { uz: "Zamonaviy texnikalar", ru: "Современное оборудование", en: "Modern Equipment" },
    desc: { uz: "O'quv xonalarimiz so'nggi rusumdagi iMac va kuchli Windows kompyuterlari bilan jihozlangan. Bu esa dasturlash va dizayn dasturlarida qotishlarsiz, tezkor ishlash imkonini beradi.", ru: "Наши классы оснащены новейшими компьютерами iMac и мощными ПК с Windows. Это позволяет быстро работать в программах для программирования и дизайна без лагов.", en: "Our classrooms are equipped with the latest iMacs and powerful Windows computers. This allows fast work in programming and design software without lags." }
  },
  {
    icon: Coffee,
    title: { uz: "Coworking hududi", ru: "Коворкинг-пространство", en: "Coworking Space" },
    desc: { uz: "Darsdan tashqari vaqtlarda o'quvchilarimiz bemalol kelib, o'z ustilarida ishlashlari, jamoaviy loyihalar qilishlari uchun maxsus shinam coworking zonalarimiz mavjud.", ru: "У нас есть специальные уютные зоны коворкинга, где студенты могут работать над собой и заниматься командными проектами в свободное от занятий время.", en: "We have special cozy coworking zones where students can work on themselves and do team projects in their free time from class." }
  },
  {
    icon: Wifi,
    title: { uz: "Yuqori tezlikdagi internet", ru: "Высокоскоростной интернет", en: "High-speed Internet" },
    desc: { uz: "Markazimizning barcha hududlarida uzluksiz va yuqori tezlikdagi Wi-Fi tarmog'i ishlab turadi. Kerakli ma'lumotlarni yuklab olish va videodarslarni ko'rishda muammo bo'lmaydi.", ru: "Во всех зонах нашего центра работает бесперебойная и высокоскоростная сеть Wi-Fi. Проблем с загрузкой нужной информации и просмотром видеоуроков не возникнет.", en: "Uninterrupted and high-speed Wi-Fi network operates in all areas of our center. There will be no problems with downloading the necessary information and watching video lessons." }
  },
  {
    icon: Target,
    title: { uz: "Amaliyot va Real loyihalar", ru: "Практика и реальные проекты", en: "Practice and Real Projects" },
    desc: { uz: "Bizda faqat quruq nazariya emas, balki real loyihalar ustida ishlash imkoniyati mavjud. O'quvchilar o'qish davomidayoq o'z portfoliolarini yig'ishni boshlaydilar.", ru: "У нас есть возможность работать над реальными проектами, а не просто сухой теорией. Студенты начинают собирать свое портфолио прямо во время учебы.", en: "We have the opportunity to work on real projects, not just dry theory. Students begin to build their portfolios right during their studies." }
  },
  {
    icon: Award,
    title: { uz: "Sertifikat va Ishga yo'naltirish", ru: "Сертификат и трудоустройство", en: "Certificate and Job Placement" },
    desc: { uz: "Kursni muvaffaqiyatli tamomlagan o'quvchilarga maxsus sertifikat beriladi va eng yaxshi bitiruvchilarni ishga joylashishlarida amaliy yordam ko'rsatiladi.", ru: "Студентам, успешно прошедшим курс, выдается специальный сертификат, а лучшим выпускникам оказывается практическая помощь в трудоустройстве.", en: "Students who successfully complete the course are issued a special certificate, and the best graduates are given practical assistance in finding a job." }
  },
  {
    icon: Users,
    title: { uz: "Kuchli ustozlar jamoasi", ru: "Сильная команда преподавателей", en: "Strong team of mentors" },
    desc: { uz: "Darslar o'z sohasining yetuk mutaxassislari, katta tajribaga ega bo'lgan amaliyotchi dasturchi va dizaynerlar tomonidan olib boriladi.", ru: "Занятия проводят ведущие специалисты в своей области, практикующие программисты и дизайнеры с большим опытом работы.", en: "Classes are conducted by leading specialists in their field, practicing programmers and designers with extensive experience." }
  }
];

export const Facilities: React.FC = () => {
  const { isDark } = useTheme();
  const { tField } = useLanguage();
  return (
    <div className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />

      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#0061ff] blur-[100px] opacity-10 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-[#60efff] blur-[100px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 relative">
          <Star2 size={60} color="#0061ff" opacity={0.1} className="absolute -top-10 left-1/2 -translate-x-1/2 rotate-slow pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tField({ uz: "Nega aynan", ru: "Почему именно", en: "Why specifically" })} <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>DATA?</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {tField({ uz: "O'quvchilarimiz uchun yaratilgan maxsus sharoitlar va qulayliklar bilan tanishing", ru: "Ознакомьтесь со специальными условиями и удобствами, созданными для наших студентов", en: "Get acquainted with the special conditions and amenities created for our students" })}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-[2rem] p-8 border transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-blue-900/20' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-blue-900/5'}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}></div>
              <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 ${isDark ? 'bg-blue-500/10 text-[#60efff] group-hover:bg-[#0061ff] group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-[#0061ff] group-hover:text-white'}`}>
                <item.icon size={28} />
              </div>
              <h3 className={`text-xl font-bold mb-4 relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(item.title)}</h3>
              <p className={`leading-relaxed text-sm relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {tField(item.desc)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
