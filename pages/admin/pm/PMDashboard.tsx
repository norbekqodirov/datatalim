import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion } from 'framer-motion';
import {
  ListTodo, CheckCircle2, Clock, AlertCircle, CalendarRange,
  Layers, Film, BookOpen, TrendingUp, Send, Activity,
  Users, BarChart3, ChevronRight, UserCheck, Flame, BellRing, ClipboardCheck
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';

interface Metrics {
  total_plans: number;
  total_content_items: number;
  published_content_items: number;
  total_tasks: number;
  done_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  overdue_tasks: number;
}

interface PlatformStat {
  platform: string;
  count: number;
}

interface PillarStat {
  pillar: string;
  count: number;
}

interface ActivityItem {
  id: number;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: number;
  detail: string;
  created_at: string;
}

interface TeamWorkloadItem {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
  max_daily_tasks: number;
  total_tasks: number;
  done_tasks: number;
  active_tasks: number;
}

export const PMDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [platforms, setPlatforms] = useState<PlatformStat[]>([]);
  const [pillars, setPillars] = useState<PillarStat[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [workloads, setWorkloads] = useState<TeamWorkloadItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Overview
        const overviewRes = await fetch('/api/pm/analytics/overview', { headers });
        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setMetrics(data.metrics);
          setPlatforms(data.platforms);
          setPillars(data.pillars);
          setActivity(data.recent_activity);
        }

        // Fetch Jamoa yuklamasi
        const workloadRes = await fetch('/api/pm/analytics/team-workload', { headers });
        if (workloadRes.ok) {
          const teamData = await workloadRes.json();
          setWorkloads(teamData);
        }
      } catch (err) {
        console.error('PM Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300';

  const chartTooltipStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#fff' : '#000',
    backdropFilter: 'blur(8px)',
  };

  // Platform charts color mapping
  const PLATFORM_COLORS: { [key: string]: string } = {
    instagram: '#EC4899',
    telegram: '#3B82F6',
    youtube: '#EF4444',
    tiktok: '#10B981',
  };

  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform.toLowerCase()] || '#8B5CF6';
  };

  // Actions styling for activity log
  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'updated':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'status_changed':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'commented':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-pulse">
        {/* Stats Row Skeleton */}
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

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-6 h-[380px]`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="space-y-1.5 w-1/4">
                <div className={`h-5 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
            <div className={`h-[240px] rounded-2xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
          </div>

          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'} space-y-6 h-[380px]`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="space-y-1.5 w-1/2">
                <div className={`h-5 rounded-lg w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            </div>
            <div className={`h-[240px] rounded-2xl w-full ${isDark ? 'bg-slate-800/40' : 'bg-slate-100'}`} />
          </div>
        </div>
      </div>
    );
  }

  // Calculate task completion percentage
  const taskCompletionRate = metrics && metrics.total_tasks > 0
    ? Math.round((metrics.done_tasks / metrics.total_tasks) * 100)
    : 0;

  // Platform distribution chart data formatting
  const pieData = platforms.map(item => ({
    name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
    value: item.count
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Plans */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20">
              <CalendarRange size={22} />
            </div>
            {metrics && metrics.overdue_tasks > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 animate-pulse">
                <AlertCircle size={12} /> {metrics.overdue_tasks} kechikkan
              </div>
            )}
          </div>
          <div>
            <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics?.total_plans || 0}
            </h3>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Jami Rejalar</p>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Marketing va SMM strategiyalari
            </p>
          </div>
        </motion.div>

        {/* KPI 2: Total Content Items */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Film size={22} />
            </div>
            <div className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {metrics?.published_content_items || 0} nashr etildi
            </div>
          </div>
          <div>
            <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics?.total_content_items || 0}
            </h3>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kontent Elementlari</p>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Post, reels, stories, video va maqolalar
            </p>
          </div>
        </motion.div>

        {/* KPI 3: Task Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <ClipboardCheck size={22} />
            </div>
            <div className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {taskCompletionRate}% Bajarildi
            </div>
          </div>
          <div>
            <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics?.done_tasks || 0} <span className="text-sm font-bold text-slate-500">/ {metrics?.total_tasks || 0}</span>
            </h3>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Bajarilgan Vazifalar</p>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              SMM checklist va operatsion vazifalar
            </p>
          </div>
        </motion.div>

        {/* KPI 4: Pending / In Progress Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`p-6 rounded-3xl border relative overflow-hidden group ${cardBg}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Clock size={22} />
            </div>
            <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {metrics?.review_tasks || 0} tekshiruvda
            </div>
          </div>
          <div>
            <h3 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {(metrics?.in_progress_tasks || 0) + (metrics?.todo_tasks || 0)}
            </h3>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Kutilayotgan Ishlar</p>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Navbatdagi va hozirda bajarilayotganlar
            </p>
          </div>
        </motion.div>
      </div>

      {/* Overdue Task Alert Banner if any */}
      {metrics && metrics.overdue_tasks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Flame className="text-red-500 shrink-0" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">Kechiktirilgan SMM vazifalari bor!</h4>
            <p className="text-xs opacity-80 mt-0.5">
              Jami {metrics.overdue_tasks} ta vazifaning belgilangan muddati o'tib ketgan. Jamoa faolligini saqlash uchun ularni zudlik bilan ko'rib chiqing.
            </p>
          </div>
          <Link
            to="/paneladmindata/pm/board"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black shadow-md shadow-red-500/20 transition-all shrink-0"
          >
            Vazifalarga O'tish
          </Link>
        </motion.div>
      )}

      {/* Analytics Charts & Jamoa yuklamasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Platform charts (Donut Chart) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`p-6 rounded-3xl border flex flex-col ${cardBg}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
              <Send size={18} className="text-pink-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Platforma Taqsimoti</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ijtimoiy tarmoqlar kesimidagi kontentlar</p>
            </div>
          </div>

          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 size={32} className="mx-auto text-slate-500 opacity-40 mb-2" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ma'lumot topilmadi</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPlatformColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Pillars breakdown charts (Bar Chart) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col ${cardBg}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
              <Layers size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Yo'nalishlari (Pillars)</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Strategik yo'nalishlar bo'yicha kontentlar soni</p>
            </div>
          </div>

          <div className="flex-1 min-h-[250px]">
            {pillars.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 size={32} className="mx-auto text-slate-500 opacity-40 mb-2" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yo'nalishlar bo'yicha ma'lumotlar topilmadi</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pillars} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="pillar" tickLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} />
                  <YAxis tickLine={false} tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pillars.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#F43F5E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Jamoa Yuklamalari & Activity Log Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Team Workload Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`xl:col-span-2 p-6 rounded-3xl border flex flex-col ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <UserCheck size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Jamoa Yuklamasi</h3>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Marketing jamoasining faol vazifalari hajmi</p>
              </div>
            </div>
            <Link to="/paneladmindata/pm/team" className="text-xs font-black text-pink-500 hover:underline">
              Jamoaga O'tish
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {workloads.map((member) => {
              const workloadPercent = Math.min(Math.round((member.active_tasks / member.max_daily_tasks) * 100), 100);
              const isOverloaded = member.active_tasks > member.max_daily_tasks;

              return (
                <div key={member.id} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-950/10`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{member.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider font-semibold mt-0.5`}>
                        {member.role === 'lead' ? 'Team Lead' : member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isOverloaded ? 'text-rose-500' : (isDark ? 'text-slate-400' : 'text-slate-600')}>
                        {member.active_tasks} ta faol / max {member.max_daily_tasks}
                      </span>
                      <span className={isOverloaded ? 'text-rose-500' : (isDark ? 'text-slate-300' : 'text-slate-700')}>
                        {workloadPercent}% Yuklama
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded 
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse' 
                            : workloadPercent > 80 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                              : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                        }`}
                        style={{ width: `${workloadPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Jami bitirgan</p>
                      <p className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{member.done_tasks} ta vazifa</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Log Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={`p-6 rounded-3xl border flex flex-col h-[480px] ${cardBg}`}
        >
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
              <Activity size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Amallar Tarixi</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Jamoa tomonidan qilingan o'zgarishlar</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
            {activity.length === 0 ? (
              <div className="text-center py-12">
                <Users size={32} className="mx-auto text-slate-500 opacity-40 mb-2" />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tarix topilmadi</p>
              </div>
            ) : (
              activity.map((log) => (
                <div key={log.id} className="flex gap-3 relative before:absolute before:left-2 before:top-6 before:bottom-[-20px] before:w-[1px] before:bg-slate-800 last:before:hidden">
                  <div className={`w-4 h-4 rounded-full border border-slate-700 mt-1 shrink-0 bg-slate-900 flex items-center justify-center`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {log.actor}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase shrink-0 ${getActivityBadge(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{log.detail}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {new Date(log.created_at).toLocaleString('uz-UZ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default PMDashboard;
