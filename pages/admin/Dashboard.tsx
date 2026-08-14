import React, { useState, useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Target, MousePointerClick, BarChart3, 
  Activity, BookOpen, GraduationCap, DollarSign, Wallet,
  Calendar, Star, CreditCard, ChevronRight, Bell, ShieldAlert,
  ClipboardList, CheckSquare, Award, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { getRoleFromToken, getUsernameFromToken } from '../../utils/api';


// MOCK DATA FOR VISUAL DEMO
const MOCK_REVENUE = [
  { name: 'Yan', val: 12 }, { name: 'Fev', val: 18 }, { name: 'Mar', val: 15 },
  { name: 'Apr', val: 25 }, { name: 'May', val: 22 }, { name: 'Iyun', val: 30 },
  { name: 'Iyul', val: 28 }, { name: 'Avg', val: 35 }, { name: 'Sen', val: 40 },
  { name: 'Okt', val: 38 }, { name: 'Noy', val: 45 }, { name: 'Dek', val: 50 },
];

const MOCK_CONVERSION = [
  { name: 'Dush', val: 40 }, { name: 'Sesh', val: 60 }, { name: 'Chor', val: 45 },
  { name: 'Pay', val: 80 }, { name: 'Juma', val: 55 }, { name: 'Shan', val: 90 }, { name: 'Yak', val: 75 }
];

export default function Dashboard() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'education' | 'marketing' | 'finance'>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const role = getRoleFromToken();
  const username = getUsernameFromToken();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };
    fetchStats();
  }, []);

  // Yordamchi dizayn klasslari
  const cardBg = isDark 
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' 
    : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow';

  const chartTooltipStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#fff' : '#000',
    backdropFilter: 'blur(8px)',
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-pulse">
        {/* Header Skeleton */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
          <div className="space-y-2.5 w-full md:w-1/3">
            <div className={`h-8 rounded-2xl w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 rounded-xl w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className={`h-11 w-11 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-11 w-64 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-4`}>
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`w-14 h-6 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
              <div className="space-y-2">
                <div className={`h-8 rounded-lg w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-4 rounded-lg w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-6 h-[380px]`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="space-y-1.5 w-1/4">
                <div className={`h-5 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-3 rounded-lg w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
            <div className={`h-[240px] rounded-2xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-6 h-[380px]`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="space-y-1.5 w-1/2">
                <div className={`h-5 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-3 rounded-lg w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
            <div className={`h-[240px] rounded-2xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
          </div>
        </div>

        {/* Quick Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-4`}>
            <div className={`h-6 rounded-lg w-1/3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-100'} flex items-center gap-4`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 rounded-lg w-3/4 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    <div className={`h-3 rounded-lg w-1/4 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-4`}>
            <div className={`h-6 rounded-lg w-1/3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-100'} space-y-3`}>
                  <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  <div className={`h-4 rounded-lg w-3/4 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 1. TEACHER PORTAL DASHBOARD ──────────────────────────────────────────
  if (role === 'teacher' || (stats && stats.isTeacher)) {
    const myGroups = stats?.groups || [];
    
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* Welcome Card */}
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-50%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Assalomu alaykum, {username} Ustoz 👋
            </h1>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bugungi darslaringizni boshqaring, davomat oling va baholarni kiriting.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <Link to="/paneladmindata/schedule" className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all">
              <Calendar size={16} /> Dars Jadvalini Ko'rish
            </Link>
          </div>
        </div>

        {/* Teacher Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: "Mening Guruhlarim", val: stats?.totalGroups || 0, label: "Ta'lim berayotgan faol guruhlar", icon: Users, color: 'blue' },
            { title: "Jami O'quvchilarim", val: stats?.totalStudents || 0, label: "Guruhlardagi o'quvchilar soni", icon: GraduationCap, color: 'emerald' },
            { title: "O'rtacha Davomat", val: `${stats?.averageAttendance ?? 100}%`, label: "Oxirgi 30 kunlik davomat", icon: CheckSquare, color: 'purple' },
            { title: "Baholangan Darslar", val: stats?.journalEntriesCount || 0, label: "Jurnalga kiritilgan baholar", icon: ClipboardList, color: 'amber' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                  stat.color === 'emerald' ? 'from-emerald-500 to-teal-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-pink-600' :
                  'from-amber-500 to-orange-600'
                } text-white`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.val}</h3>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{stat.title}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* My Groups Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${cardBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <BookOpen className="text-blue-500" /> Mening Guruhlarim
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {myGroups.length} ta faol guruh
              </span>
            </div>

            {myGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-slate-500 mb-3 opacity-45" />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sizga hozircha faol guruhlar biriktirilmagan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                      <th className="py-3 px-4">Guruh nomi</th>
                      <th className="py-3 px-4">Dars kunlari</th>
                      <th className="py-3 px-4">Vaqti</th>
                      <th className="py-3 px-4">Xona</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myGroups.map((group: any) => (
                      <tr key={group.id} className={`border-b text-sm transition-colors ${isDark ? 'border-slate-800/60 hover:bg-slate-800/30 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                        <td className="py-3.5 px-4 font-bold">{group.name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                            {group.days}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{group.start_time} - {group.end_time}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold">{group.room || 'Belgilanmagan'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              to="/paneladmindata/attendance" 
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 transition-all"
                            >
                              <CheckSquare size={13} /> Davomat
                            </Link>
                            <Link 
                              to="/paneladmindata/journal" 
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 flex items-center gap-1 transition-all"
                            >
                              <ClipboardList size={13} /> Jurnal
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Notifications / Shortcuts */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Star className="text-amber-500 animate-spin-slow" /> Muhim eslatmalar
              </h3>
              <div className="space-y-3">
                <div className={`p-3.5 rounded-2xl flex gap-3 ${isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 animate-ping" />
                  <div>
                    <p className="text-xs font-bold">Davomatni unutmang</p>
                    <p className="text-[11px] mt-0.5 opacity-70">O'tgan darslar davomatini to'liq yakunlang va qayd eting.</p>
                  </div>
                </div>
                <div className={`p-3.5 rounded-2xl flex gap-3 ${isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Baholash tizimi</p>
                    <p className="text-[11px] mt-0.5 opacity-70">O'quvchilar uy vazifalari va oraliq imtihon baholarini vaqtida kiritish o'rtacha ko'rsatkichlarni aniqlaydi.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Activity className="text-emerald-500" /> Boshqaruv Qismlari
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Dars Jadvali", path: "/paneladmindata/schedule", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { name: "Elektron Jurnal", path: "/paneladmindata/journal", icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { name: "Davomat Tizimi", path: "/paneladmindata/attendance", icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { name: "Mening Guruhlarim", path: "/paneladmindata/groups", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((link, i) => (
                  <Link 
                    key={i} 
                    to={link.path}
                    className={`flex flex-col gap-2 p-3.5 rounded-2xl border transition-all hover:bg-slate-800/30 ${isDark ? 'bg-slate-800/20 border-white/5' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.bg}`}>
                      <link.icon size={16} className={link.color} />
                    </div>
                    <span className="text-xs font-bold text-slate-300 truncate">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. GENERAL ADMIN / MANAGER DASHBOARD ─────────────────────────────────
  const MOCK_REVENUE_COMBINED = MOCK_REVENUE.map((entry, index) => {
    if (stats?.leadsPerDay && stats.leadsPerDay[index]) {
      return { name: entry.name, val: stats.leadsPerDay[index].count + entry.val };
    }
    return entry;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-50%] left-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Xush kelibsiz, {username || 'Admin'} 👋
            </h1>
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tizimning barcha ko'rsatkichlari bir joyda. O'zgarishlar va hisobotlarni kuzating.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button className={`relative p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className={`flex items-center p-1 rounded-2xl border ${isDark ? 'bg-slate-950/50 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            {[
              { id: 'all', label: 'Umumiy' },
              { id: 'education', label: "Ta'lim" },
              { id: 'marketing', label: 'Marketing' },
              { id: 'finance', label: 'Moliya' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#0061ff] text-white shadow-lg shadow-blue-500/30' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── QUICK STATS (TOP METRICS) ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: "Jami Arizalar (Lidlar)", val: stats?.totalLeads || '1,248', inc: '+12%', icon: Users, color: 'blue' },
          { title: 'Yangi Arizalar', val: stats?.newLeads || '342', inc: '+5%', icon: Target, color: 'emerald' },
          { title: 'Jami Kliklar', val: stats?.totalClicks || '4,520', inc: '+18%', icon: Wallet, color: 'purple' },
          { title: "Mavjud Kurslar Soni", val: stats?.totalCourses || '14', inc: '+10%', icon: TrendingUp, color: 'amber' },
        ].map((stat, i) => {
          const isUp = stat.inc.startsWith('+');
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} 
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-${stat.color}-500 text-white`}>
                  <stat.icon size={22} />
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                  isUp 
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' 
                    : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.inc}
                </div>
              </div>
              <div className="relative z-10">
                <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.val}</h3>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── CHARTS AREA ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart (Revenue/Growth) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }} transition={{ delay: 0.3 }}
          className={`lg:col-span-2 p-6 rounded-3xl border ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#0061ff]/20' : 'bg-blue-100'}`}>
                <Activity size={20} className="text-[#0061ff]" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>O'sish Dinamikasi</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oylik arizalar o'sishi va o'quvchilar hajmi</p>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_COMBINED}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0061ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0061ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(0,97,255,0.2)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="val" stroke="#0061ff" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Chart (Weekly Conversion) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }} transition={{ delay: 0.4 }}
          className={`p-6 rounded-3xl border flex flex-col ${cardBg}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <BarChart3 size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Haftalik Trafik</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kunlik keluvchilar oqimi</p>
            </div>
          </div>

          <div className="flex-1 min-h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CONVERSION}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="val" radius={[6, 6, 6, 6]}>
                  {MOCK_CONVERSION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#a855f7' : (isDark ? '#334155' : '#e2e8f0')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ─── QUICK NAVIGATION & LISTS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Urgent Actions / Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} transition={{ delay: 0.5 }}
          className={`p-6 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Star className="text-amber-500" /> Muhim Vazifalar
            </h2>
            <Link to="/paneladmindata/leads" className={`text-sm font-bold text-[#0061ff] hover:underline`}>Barchasi</Link>
          </div>
          
          <div className="space-y-3">
            {[
              { title: `Bugungi sinov darsiga ${stats?.newLeads || 12} ta yangi ariza tushdi`, time: "Hozirgina", type: "urgent" },
              { title: role === 'admin' ? "O'qituvchilar maoshini hisoblash vaqti keldi" : "Dars jadvallarini tahrirlash", time: "2 soat oldin", type: "warning" },
              { title: "Target va SMM kampaniyasi yangi havolalari tayyor", time: "Bugun", type: "info" },
            ].map((task, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-pointer ${isDark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.type === 'urgent' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                  task.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{task.time}</p>
                </div>
                <ChevronRight size={16} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shortcuts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} transition={{ delay: 0.6 }}
          className={`p-6 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center mb-6">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MousePointerClick className="text-[#0061ff]" /> Tezkor O'tish
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "O'quvchilar", path: "/paneladmindata/students", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
              { name: "Dars Jadvali", path: "/paneladmindata/schedule", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { name: "Arizalar (Leads)", path: "/paneladmindata/leads", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
              { name: "To'lovlar", path: "/paneladmindata/finance", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((link, i) => (
              <Link 
                key={i} 
                to={link.path}
                className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.bg}`}>
                  <link.icon size={20} className={link.color} />
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{link.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

