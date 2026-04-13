import React, { useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { Users, Globe, MapPin, Activity, PieChart as PieIcon, RefreshCw, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const GENDER_COLORS = { Erkaklar: '#0061ff', Ayollar: '#ec4899' };
const AGE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

// Mock Audience Data (In an ideal CRM, this comes from GET {ig-user-id}/insights?metric=audience_city,audience_gender_age)
const mockCityData = [
  { name: 'Toshkent', value: 45 },
  { name: 'Samarqand', value: 15 },
  { name: 'Farg\'ona', value: 10 },
  { name: 'Buxoro', value: 8 },
  { name: 'Andijon', value: 7 },
  { name: 'Namangan', value: 5 },
  { name: 'Boshqa', value: 10 },
];

const mockAgeGenderData = [
  { age: '13-17', Erkaklar: 5, Ayollar: 4 },
  { age: '18-24', Erkaklar: 35, Ayollar: 25 },
  { age: '25-34', Erkaklar: 20, Ayollar: 18 },
  { age: '35-44', Erkaklar: 10, Ayollar: 8 },
  { age: '45-54', Erkaklar: 4, Ayollar: 3 },
  { age: '55+', Erkaklar: 2, Ayollar: 1 },
];

const mockActiveHours = [
  { time: '00:00', active: 10 }, { time: '03:00', active: 5 },
  { time: '06:00', active: 15 }, { time: '09:00', active: 40 },
  { time: '12:00', active: 65 }, { time: '15:00', active: 60 },
  { time: '18:00', active: 85 }, { time: '21:00', active: 95 },
];

export default function IGAudience() {
  const { isDark } = useTheme();
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const cardClass = `p-6 rounded-3xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Users size={13} className="text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Auditoriya Demografiyasi</span>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Followers Tahlili</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kuzatvchilarning yoshi, jinsi va joylashuvi tahlili</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}>
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Yangilanmoqda...' : 'Ma\'lumotlarni Yangilash'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gender Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-pink-500" />
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Jins Taqsimoti</h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Erkaklar va Ayollar ulushi (%)</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[{name: 'Erkaklar', value: 76}, {name: 'Ayollar', value: 24}]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                <Cell fill={GENDER_COLORS.Erkaklar} />
                <Cell fill={GENDER_COLORS.Ayollar} />
              </Pie>
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Ulush']} />
              <Legend formatter={(v: any) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Age/Gender Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`lg:col-span-2 ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <PieIcon size={18} className="text-blue-500" />
                <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yosh va Jins</h2>
            </div>
            <div className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                Asosiy: 18-24 yosh
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockAgeGenderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v}%`} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 'bold', fill: isDark ? '#94a3b8' : '#64748b' }} />
              <Bar dataKey="Erkaklar" fill={GENDER_COLORS.Erkaklar} radius={[4, 4, 0, 0]} barSize={25} />
              <Bar dataKey="Ayollar" fill={GENDER_COLORS.Ayollar} radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Location (Cities) Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${cardClass} md:col-span-3 lg:col-span-1`}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-emerald-500" />
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Hududlar</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={mockCityData.slice(0, 5)} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }} />
              <Radar name="Auditoriya %" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} formatter={(v: any) => [`${v}%`, '']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active Hours Area Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`lg:col-span-2 ${cardClass}`}>
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-[#a855f7]" />
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Kun Davomidagi Faollik</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockActiveHours} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="active" stroke="#a855f7" strokeWidth={3} fill="url(#activeGrad)" activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}
