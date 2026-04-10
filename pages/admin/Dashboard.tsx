import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { BookOpen, Users, Eye, Settings, Target, UserPlus, ArrowRight, Activity, Percent, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import { fetchFromAPI } from '../../utils/api';

export default function Dashboard() {
  const { courses, team, visibility } = useStore();
  const { isDark } = useTheme();

  const [leads, setLeads] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchFromAPI('leads'),
      fetchFromAPI('marketing-links')
    ]).then(([leadsRes, linksRes]) => {
      setLeads(leadsRes || []);
      setLinks(linksRes || []);
      setIsLoading(false);
    });
  }, []);

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalLinkLeads = links.reduce((sum, link) => sum + (link.leads_count || 0), 0);
  const conversionRate = totalClicks > 0 ? ((totalLinkLeads / totalClicks) * 100).toFixed(1) : '0';

  const stats = [
    { title: 'Jami Arizalar', value: leads.length, icon: UserPlus, lightColor: 'bg-orange-50 text-orange-600', darkColor: 'bg-orange-500/20 text-orange-400', link: '/paneladmindata/leads' },
    { title: 'Target Kirishlar', value: totalClicks, icon: Target, lightColor: 'bg-indigo-50 text-indigo-600', darkColor: 'bg-indigo-500/20 text-indigo-400', link: '/paneladmindata/marketing' },
    { title: "Konversiya", value: `${conversionRate}%`, icon: Percent, lightColor: 'bg-emerald-50 text-emerald-600', darkColor: 'bg-emerald-500/20 text-[#82f4b1]', link: '/paneladmindata/marketing' },
    { title: 'Jami Kurslar', value: courses.length, icon: BookOpen, lightColor: 'bg-blue-50 text-blue-600', darkColor: 'bg-blue-500/20 text-[#60efff]', link: '/paneladmindata/courses' },
  ];

  return (
    <div className="space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tizimning joriy holati va oxirgi arizalar ro'yxati.</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
            <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500`}></div>
            Yuklanmoqda...
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={stat.link} className={`block p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${isDark ? 'bg-slate-900/50 border-white/5 shadow-black/50 hover:bg-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? stat.darkColor : stat.lightColor}`}>
                  <stat.icon size={28} />
                </div>
                <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
              </div>
              <h3 className={`text-lg font-bold transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'}`}>{stat.title}</h3>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        {/* Recent Leads Table */}
        <div className={`xl:col-span-2 p-8 rounded-[2rem] border shadow-sm ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className={isDark ? "text-[#60efff]" : "text-blue-600"} size={24} />
              So'nggi Arizalar
            </h2>
            <Link to="/paneladmindata/leads" className={`text-sm font-bold flex items-center gap-2 transition-colors ${isDark ? 'text-[#60efff] hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>
              Barchasini ko'rish <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="pb-3 font-bold text-sm">Sana</th>
                  <th className="pb-3 font-bold text-sm">Ism</th>
                  <th className="pb-3 font-bold text-sm">Telefon</th>
                  <th className="pb-3 font-bold text-sm">Manba</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-50'}`}>
                {leads.slice(0, 5).map((lead: any) => (
                  <tr key={lead.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className={`py-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(lead.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className={`py-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{lead.name}</td>
                    <td className={`py-4 font-mono text-sm ${isDark ? 'text-[#60efff]' : 'text-blue-600'}`}>{lead.phone}</td>
                    <td className="py-4">
                      {lead.source_ref ? (
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                          {lead.source_ref}
                        </span>
                      ) : (
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                          Organik
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className={`py-8 text-center text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Hozircha arizalar yo'q.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Settings */}
        <div className={`p-8 rounded-[2rem] border shadow-sm h-fit ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Settings className={isDark ? "text-[#60efff]" : "text-blue-600"} size={24} />
            Tezkor Sozlamalar
          </h2>
          <div className="flex flex-col gap-3">
            <Link to="/paneladmindata/marketing" className={`p-4 rounded-2xl font-bold transition-all border flex items-center justify-between group ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
              Yangi reklama linki yaratish
              <Plus size={18} className={`transition-transform group-hover:scale-110 ${isDark ? 'text-[#60efff]' : 'text-blue-500'}`} />
            </Link>
            <Link to="/paneladmindata/visibility" className={`p-4 rounded-2xl font-bold transition-all border flex items-center justify-between group ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
              Bo'limlarni yoqish/yashirish
              <Eye size={18} className={`transition-transform group-hover:scale-110 ${isDark ? 'text-[#60efff]' : 'text-blue-500'}`} />
            </Link>
            <Link to="/paneladmindata/courses" className={`p-4 rounded-2xl font-bold transition-all border flex items-center justify-between group ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
              Yangi kurs qo'shish
              <BookOpen size={18} className={`transition-transform group-hover:scale-110 ${isDark ? 'text-[#60efff]' : 'text-blue-500'}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
