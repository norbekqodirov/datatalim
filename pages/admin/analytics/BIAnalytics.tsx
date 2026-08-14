import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Award, BookOpen,
  PieChart as PieIcon, ArrowUpRight, BarChart3, HelpCircle, UserCheck,
  Calendar, Layers, Percent, GraduationCap, ChevronRight, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function BIAnalytics() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'moliya' | 'students' | 'teachers'>('moliya');
  const [loading, setLoading] = useState(true);

  // States for analytical data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch financial overview
        const revRes = await fetch('/api/analytics/revenue', { headers });
        const revJson = await revRes.json();

        // Fetch student demographics & growth
        const studRes = await fetch('/api/analytics/students', { headers });
        const studJson = await studRes.json();

        // Fetch teacher statistics
        const teachRes = await fetch('/api/analytics/teachers', { headers });
        const teachJson = await teachRes.json();

        if (Array.isArray(revJson)) setRevenueData(revJson);
        if (studJson && typeof studJson === 'object' && !studJson.error) setStudentData(studJson);
        if (Array.isArray(teachJson)) setTeacherData(teachJson);
      } catch (err) {
        console.error('BI Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Design tokens based on theme
  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 hover:border-indigo-500/30'
    : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300';
  
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12 animate-pulse">
        {/* Title Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-1/2">
            <div className={`h-8 rounded-2xl w-2/3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 rounded-xl w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
          <div className={`h-11 w-80 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>

        {/* KPI Top Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Charts & Ratios Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-6 h-[450px]`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5 w-1/3">
                <div className={`h-5 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-3 rounded-lg w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
              <div className="flex gap-4">
                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-4 w-12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
            <div className={`h-[320px] rounded-2xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
          </div>

          <div className="flex flex-col gap-6">
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-4 h-[210px]`}>
              <div className={`h-5 rounded-lg w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-6">
                <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="space-y-2 flex-1">
                  <div className={`h-6 rounded-lg w-2/3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-4 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-4 h-[210px]`}>
              <div className={`h-5 rounded-lg w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1.5 w-1/2">
                      <div className={`h-4 rounded w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    </div>
                    <div className={`h-5 w-16 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals from financial analytics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
  const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Calculate student statistics
  const totalActiveStudents = studentData?.totalActive || 0;
  const groupsCapacity = studentData?.capacityUtilization || [];
  const totalCapacity = groupsCapacity.reduce((sum: number, g: any) => sum + g.capacity, 0);
  const totalEnrolledInGroups = groupsCapacity.reduce((sum: number, g: any) => sum + g.enrolled, 0);
  const averageUtilization = totalCapacity > 0 ? (totalEnrolledInGroups / totalCapacity) * 100 : 0;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${textClass} flex items-center gap-3`}>
            <BarChart3 className="text-indigo-500 w-8 h-8" />
            Biznes Analitika (BI)
          </h1>
          <p className={`text-sm mt-1 ${subtitleClass}`}>
            Markaz moliyaviy salomatligi, talabalar va o'qituvchilar samaradorligi tahlili
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex p-1.5 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          {(['moliya', 'students', 'teachers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                  : `hover:text-indigo-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`
              }`}
            >
              {tab === 'moliya' ? '💰 Moliya Tahlili' : tab === 'students' ? '👥 O\'quvchilar' : '👨‍🏫 O\'qituvchilar'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-6 rounded-3xl border ${cardBg}`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <DollarSign size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full gap-1">
              <TrendingUp size={12} />
              +12.4%
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-sm font-semibold ${subtitleClass}`}>Jami Daromad</h3>
            <p className={`text-2xl font-extrabold mt-1 ${textClass}`}>
              {totalRevenue.toLocaleString()} <span className="text-sm font-normal">so'm</span>
            </p>
            <div className="mt-2 text-xs text-slate-400">Oxirgi 5 oy daromadi</div>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-6 rounded-3xl border ${cardBg}`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingDown size={24} />
            </div>
            <span className="flex items-center text-rose-500 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full gap-1">
              <TrendingDown size={12} />
              +4.8%
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-sm font-semibold ${subtitleClass}`}>Jami Xarajatlar</h3>
            <p className={`text-2xl font-extrabold mt-1 ${textClass}`}>
              {totalExpenses.toLocaleString()} <span className="text-sm font-normal">so'm</span>
            </p>
            <div className="mt-2 text-xs text-slate-400">Bino ijara, oyliklar va marketing</div>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-6 rounded-3xl border ${cardBg}`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full gap-1">
              <TrendingUp size={12} />
              +18.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-sm font-semibold ${subtitleClass}`}>Sof Foyda</h3>
            <p className={`text-2xl font-extrabold mt-1 ${textClass}`}>
              {totalProfit.toLocaleString()} <span className="text-sm font-normal">so'm</span>
            </p>
            <div className="mt-2 text-xs text-slate-400">
              Rentabellik: <strong className="text-emerald-500">{averageProfitMargin.toFixed(1)}%</strong>
            </div>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-6 rounded-3xl border ${cardBg}`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Users size={24} />
            </div>
            <span className="flex items-center text-amber-500 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full gap-1">
              <UserCheck size={12} />
              {averageUtilization.toFixed(0)}% to'la
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-sm font-semibold ${subtitleClass}`}>Aktiv Talabalar</h3>
            <p className={`text-2xl font-extrabold mt-1 ${textClass}`}>
              {totalActiveStudents} <span className="text-sm font-normal">ta</span>
            </p>
            <div className="mt-2 text-xs text-slate-400">
              Guruhlar bandligi: <strong>{totalEnrolledInGroups}/{totalCapacity}</strong>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Interactive Charts & Analysis Sections */}
      <AnimatePresence mode="wait">
        {activeTab === 'moliya' && (
          <motion.div
            key="moliya"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Financial Analytics Chart */}
            <div className={`lg:col-span-2 p-6 rounded-3xl border ${cardBg} flex flex-col justify-between min-h-[450px]`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${textClass}`}>Oylik Daromad, Xarajatlar va Sof Foyda</h3>
                  <p className="text-xs text-slate-400">Markazning oylar bo'yicha to'liq pul oqimi (Cash Flow)</p>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /> Daromad</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Xarajatlar</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Foyda</span>
                </div>
              </div>

              <div className="flex-1 w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickMargin={8} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        borderRadius: 16,
                        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                        fontSize: 12
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} so'm`]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Ratios & Breakdown */}
            <div className="flex flex-col gap-6">
              {/* Card: Profit Margin */}
              <div className={`p-6 rounded-3xl border ${cardBg}`}>
                <h4 className={`text-md font-bold mb-4 ${textClass} flex items-center gap-2`}>
                  <Percent size={18} className="text-indigo-500" />
                  Rentabellik Koeffitsiyenti
                </h4>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * averageProfitMargin) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <span className={`absolute text-lg font-bold ${textClass}`}>{averageProfitMargin.toFixed(0)}%</span>
                  </div>
                  <div>
                    <p className={`text-xs ${subtitleClass}`}>Sof foydaning jami tushumga nisbatan ulushi. Ideal ko'rsatkich 25-40% hisoblanadi.</p>
                    <div className="mt-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg inline-block">Muvaffaqiyatli rentabellik!</div>
                  </div>
                </div>
              </div>

              {/* Card: Expenses Breakdown */}
              <div className={`p-6 rounded-3xl border ${cardBg} flex-1 flex flex-col justify-between`}>
                <div>
                  <h4 className={`text-md font-bold mb-3 ${textClass} flex items-center gap-2`}>
                    <Layers size={18} className="text-rose-500" />
                    Xarajatlar Tarkibi
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">Markaz oylik xarajatlarining taqsimoti</p>
                </div>

                <div className="space-y-4">
                  {revenueData.slice(-1).map((m, idx) => {
                    const totalMExp = m.expenses || 1;
                    const payrollPercent = ((m.payroll / totalMExp) * 100).toFixed(0);
                    const otherPercent = (((m.expenses - m.payroll) / totalMExp) * 100).toFixed(0);

                    return (
                      <div key={idx} className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className={textClass}>👨‍🏫 Xodimlar va O'qituvchilar oyligi</span>
                            <span className="text-indigo-500">{payrollPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${payrollPercent}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className={textClass}>🏢 Bino ijara, utility, marketing</span>
                            <span className="text-rose-500">{otherPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${otherPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs">
                  <span className={subtitleClass}>Joriy oy xarajati:</span>
                  <strong className={`font-bold ${textClass}`}>
                    {(revenueData[revenueData.length - 1]?.expenses || 0).toLocaleString()} so'm
                  </strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Student Growth Trend */}
            <div className={`lg:col-span-2 p-6 rounded-3xl border ${cardBg} min-h-[420px] flex flex-col justify-between`}>
              <div>
                <h3 className={`text-lg font-bold ${textClass}`}>O'quvchilar Ro'yxatga Olinish Dinamikasi</h3>
                <p className="text-xs text-slate-400">Oylar kesimida yangi qo'shilgan o'quvchilar sonining trendi</p>
              </div>

              <div className="flex-1 w-full h-[280px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={studentData?.monthlyEnrollments || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        borderRadius: 16,
                        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                        fontSize: 12
                      }}
                    />
                    <Bar dataKey="count" name="Yangi o'quvchilar" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                    <Line type="monotone" dataKey="count" name="Trend" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead Sources Distribution (Pie Chart) */}
            <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col justify-between`}>
              <div>
                <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                  <PieIcon size={20} className="text-indigo-500" />
                  Marketing Kanallari
                </h3>
                <p className="text-xs text-slate-400">O'quvchilar markaz haqida qayerdan bilgan?</p>
              </div>

              <div className="w-full h-[220px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentData?.sourceDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="source"
                    >
                      {(studentData?.sourceDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        borderRadius: 12,
                        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                        fontSize: 11
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                {(studentData?.sourceDistribution || []).map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{entry.source}: <strong>{entry.count} ta</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Capacity Utilization */}
            <div className={`lg:col-span-3 p-6 rounded-3xl border ${cardBg}`}>
              <h3 className={`text-lg font-bold mb-6 ${textClass}`}>Aktiv Guruhlarning Sig'im Bandligi (Capacity vs Enrolled)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(studentData?.capacityUtilization || []).map((group: any, idx: number) => {
                  const percent = group.capacity > 0 ? (group.enrolled / group.capacity) * 100 : 0;
                  return (
                    <div key={idx} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-extrabold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{group.group_name}</span>
                        <span className="text-xs text-slate-400">{group.enrolled}/{group.capacity} o'quvchi</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={subtitleClass}>Guruh to'lishi:</span>
                          <span className={`font-bold ${percent >= 80 ? 'text-emerald-500' : percent >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{percent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'teachers' && (
          <motion.div
            key="teachers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Teacher Performance Matrix */}
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <div>
                <h3 className={`text-lg font-bold ${textClass}`}>O'qituvchilar Samaradorligi va Yuklama Matritsasi</h3>
                <p className="text-xs text-slate-400">O'qituvchilarning dars guruhlari, o'quvchilar soni va oylik ish turlari</p>
              </div>

              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b border-slate-700/50 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <th className="py-4 px-4">👤 O'qituvchi ismi</th>
                      <th className="py-4 px-4">📚 Mutaxassisligi</th>
                      <th className="py-4 px-4 text-center">🏫 Guruhlar</th>
                      <th className="py-4 px-4 text-center">👥 Aktiv O'quvchilar</th>
                      <th className="py-4 px-4">💸 Ish Haqi Tizimi</th>
                      <th className="py-4 px-4">⚙️ Holati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherData.map((t, idx) => (
                      <tr key={idx} className={`border-b border-slate-700/30 text-sm hover:bg-slate-800/20 transition-all ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <td className="py-4 px-4 font-bold flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold`}>
                            {t.name.split(' ')[0][0]}
                          </div>
                          {t.name}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {t.specialty || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">{t.groups_count} ta</td>
                        <td className="py-4 px-4 text-center font-bold text-emerald-500">{t.total_students} ta</td>
                        <td className="py-4 px-4">
                          {t.salary_type === 'percentage' ? (
                            <span className="text-amber-500 font-semibold">{t.salary_amount}% (Tushumdan)</span>
                          ) : (
                            <span className="text-sky-500 font-semibold">{(t.salary_amount / 1000000).toFixed(1)}M so'm (Fiks)</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            {t.status === 'active' ? 'Faol' : 'Nofaol'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
