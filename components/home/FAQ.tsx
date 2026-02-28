import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { useLanguage } from '../../i18n';
import { PatternBg, Star2 } from '../BrandElements';

const faqs = [
  {
    question: { uz: "O'qishni boshlash uchun qanday bilimlar kerak?", ru: "Какие знания нужны для начала обучения?", en: "What knowledge is required to start studying?" },
    answer: { uz: "Hech qanday dastlabki bilim talab qilinmaydi. Bizning kurslarimiz noldan boshlab o'rgatishga mo'ljallangan. Eng muhimi — o'rganishga bo'lgan xohish va kompyuter savodxonligi.", ru: "Никаких предварительных знаний не требуется. Наши курсы разработаны для обучения с нуля. Главное — ваше желание учиться и базовая компьютерная грамотность.", en: "No prior knowledge is required. Our courses are designed to teach from scratch. The most important thing is your desire to learn and basic computer literacy." }
  },
  {
    question: { uz: "Kurslarni tugatgach ish topishga yordam berasizlarmi?", ru: "Помогаете ли вы с трудоустройством после окончания курсов?", en: "Do you help with job placement after completing the courses?" },
    answer: { uz: "Ha, albatta. Bizning markazimizda maxsus Karyera markazi mavjud bo'lib, u bitiruvchilarga rezyume tayyorlash, intervyulardan o'tish va hamkor kompaniyalarga ishga joylashishda amaliy yordam ko'rsatadi.", ru: "Да, конечно. В нашем центре есть специальный Центр карьеры, который помогает выпускникам составлять резюме, проходить собеседования и трудоустраиваться в компании-партнеры.", en: "Yes, absolutely. Our center has a dedicated Career Center that helps graduates prepare resumes, pass interviews, and secure employment with partner companies." }
  },
  {
    question: { uz: "Darslar qanday formatda olib boriladi?", ru: "В каком формате проходят занятия?", en: "In what format are the classes conducted?" },
    answer: { uz: "Darslar oflayn formatda, zamonaviy jihozlangan xonalarda bo'lib o'tadi. Har bir o'quvchiga individual yondashuv ta'minlanadi. Shuningdek, uy vazifalari va qo'shimcha materiallar maxsus platformamiz orqali berib boriladi.", ru: "Занятия проходят в формате офлайн в современных оборудованных классах. Обеспечивается индивидуальный подход к каждому ученику. Домашние задания и дополнительные материалы также предоставляются через нашу специальную платформу.", en: "Classes are held offline in modern equipped classrooms. An individual approach is provided to each student. Homework and additional materials are also provided through our special platform." }
  },
  {
    question: { uz: "Kompyuterim yo'q, o'qiy olamanmi?", ru: "У меня нет компьютера, могу ли я учиться?", en: "I don't have a computer, can I study?" },
    answer: { uz: "Markazimiz barcha kerakli texnikalar bilan ta'minlangan. Dars vaqtida sizga zamonaviy kompyuterlar ajratiladi. Ammo uy vazifalarini bajarish va mustaqil shug'ullanish uchun shaxsiy kompyuteringiz bo'lishi tavsiya etiladi.", ru: "Наш центр обеспечен всей необходимой техникой. Во время занятий вам предоставляются современные компьютеры. Однако для выполнения домашних заданий и самостоятельной практики рекомендуется иметь личный компьютер.", en: "Our center is equipped with all the necessary technology. Modern computers are provided during class time. However, it is recommended to have a personal computer for homework and independent practice." }
  },
  {
    question: { uz: "Sertifikat beriladimi?", ru: "Выдается ли сертификат?", en: "Is a certificate issued?" },
    answer: { uz: "Ha, kursni muvaffaqiyatli tamomlagan va yakuniy imtihonlardan o'tgan barcha o'quvchilarga DATA Ta'lim Stansiyasining maxsus sertifikati topshiriladi.", ru: "Да, всем студентам, успешно прошедшим курс и сдавшим выпускные экзамены, выдается специальный сертификат DATA Educational Station.", en: "Yes, a special certificate from DATA Educational Station is awarded to all students who successfully complete the course and pass the final exams." }
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isDark } = useTheme();
  const { tField } = useLanguage();

  return (
    <div className="py-24 relative overflow-hidden" style={{ background: isDark ? '#000' : '#f8fafc' }}>
      <PatternBg color={isDark ? '#60efff' : '#0061ff'} opacity={isDark ? 0.02 : 0.03} />

      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#60efff] blur-[150px] opacity-10 rounded-full pointer-events-none z-0"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 relative">
          <Star2 size={60} color="#0061ff" opacity={0.1} className="absolute -top-12 left-0 rotate-slow pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-2 rounded-full border border-[#0061ff]/20 text-[#0061ff] font-bold text-sm mb-6 tracking-wider uppercase bg-[#0061ff]/5">
              {tField({ uz: 'Savollar', ru: 'Вопросы', en: 'Questions' })}
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tField({ uz: "Ko'p beriladigan", ru: "Часто задаваемые", en: "Frequently asked" })} <span className="text-transparent bg-clip-text shimmer-text" style={{ backgroundImage: 'linear-gradient(135deg, #0061ff, #60efff)' }}>{tField({ uz: "savollar", ru: "вопросы", en: "questions" })}</span>
            </h2>
            <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {tField({ uz: "Sizni qiziqtirgan barcha savollarga batafsil javoblar.", ru: "Подробные ответы на все интересующие вас вопросы.", en: "Detailed answers to all your questions." })}
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`border-2 rounded-3xl overflow-hidden transition-all duration-300 relative group ${openIndex === idx ? isDark ? 'border-[#60efff] shadow-[0_10px_40px_rgba(96,239,255,0.1)] bg-slate-900' : 'border-[#0061ff] shadow-[0_10px_40px_rgb(0,97,255,0.12)] bg-white' : isDark ? 'border-white/5 bg-slate-900/50 hover:border-white/20' : 'border-slate-100 bg-white hover:border-blue-200'}`}
            >
              <div className={`absolute top-0 left-0 w-2 h-full opacity-0 transition-opacity ${openIndex === idx ? 'opacity-100' : ''}`} style={{ background: 'linear-gradient(to bottom, #0061ff, #60efff)' }}></div>
              <button
                className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className={`font-bold text-lg pr-8 transition-colors ${openIndex === idx ? isDark ? 'text-[#60efff]' : 'text-[#0061ff]' : isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-[#0061ff]'}`}>
                  {tField(faq.question)}
                </span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${openIndex === idx ? 'text-white rotate-180 shadow-lg shadow-[#0061ff]/30' : 'bg-transparent text-slate-400 border border-slate-200 group-hover:bg-blue-50/10 group-hover:border-blue-200/50 group-hover:text-[#0061ff]'}`} style={openIndex === idx ? { background: 'linear-gradient(135deg, #0061ff, #60efff)' } : {}}>
                  <ChevronDown size={24} />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className={`px-6 pb-6 leading-relaxed text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        {tField(faq.answer)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
