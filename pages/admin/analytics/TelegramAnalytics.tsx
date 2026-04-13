import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Eye, MousePointerClick, BarChart2, Calendar, Layout, 
  TrendingUp, MessageCircle, PieChart as PieIcon, Info, MessageSquare, 
  Share2, ArrowUpRight, Zap, Target, FileText, Link as LinkIcon, Activity, Send, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../../store/ThemeContext';
import { fetchTelegramStats, TelegramStats } from '../../../utils/telegramApi';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';



export default function TelegramAnalytics() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<TelegramStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();

        if (!data.telegramBotToken || !data.telegramChannelId) {
          setErrorMsg('Bot token yoki Kanal username sozlanmagan!');
          setLoading(false);
          return;
        }

        const tgStats = await fetchTelegramStats(data.telegramBotToken, data.telegramChannelId);
        
        if (tgStats.error) {
           setErrorMsg(tgStats.error);
        } else {
           setStats(tgStats);
           
           // Fetch advanced scraped metrics if channel username exists
           if (tgStats.channelInfo?.username) {
              const advRes = await fetch(`/api/telegram/advanced-analytics?username=${tgStats.channelInfo.username}`, { headers: { Authorization: `Bearer ${token}` } });
              if (advRes.ok) {
                 const advData = await advRes.json();
                 setAdvancedStats(advData);
              }
           }
        }
      } catch (err: any) {
        setErrorMsg('Tarmoq xatosi: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardClass = `p-6 rounded-3xl border relative overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;

  if (loading) {
     return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-[#0088cc]" size={32} /></div>;
  }

  if (errorMsg) {
     return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-slate-800 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Xatolik yuz berdi</h2>
                <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{errorMsg}</p>
                <Link to="/paneladmindata/settings" className="px-6 py-3 bg-[#0088cc] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#0077b3] transition-colors">
                    Sozlamalarga o'tish <ArrowRight size={18} />
                </Link>
            </div>
        </div>
     );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0088cc] flex items-center justify-center shadow-lg shadow-[#0088cc]/30 shrink-0">
          <Send className="text-white" size={24} />
        </div>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Telegram Analitika
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Kanal ko'rsatkichlari, obunachilar va postlar tahlili.
          </p>
        </div>
      </div>

      {/* Top Real Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real Follower Count */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Users className="text-blue-500" size={20} />
           </div>
           <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jami Obunachilar</p>
           <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stats?.memberCount?.toLocaleString() || '...'}
           </h3>
           <p className={`text-xs font-bold mt-3 ${isDark ? 'text-green-400' : 'text-green-600'} flex items-center gap-1`}>
              <TrendingUp size={14} /> Obunachi dinamikasi
           </p>
        </motion.div>

        {/* Real Channel Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
           <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center mb-4">
              <Activity className="text-[#0088cc]" size={20} />
           </div>
           <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kanal Nomi</p>
           <h3 className={`text-xl font-black truncate max-w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stats?.channelInfo?.title || 'Noma\'lum'}
           </h3>
           <p className={`text-sm mt-1 truncate max-w-full font-medium text-[#0088cc]`}>
              @{stats?.channelInfo?.username || '—'}
           </p>
        </motion.div>

      {/* Mock ER Metric -> Real Scraped ER Estimate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
           <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <BarChart2 className="text-purple-500" size={20} />
           </div>
           <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Engagement Rate (ER)</p>
           <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {advancedStats?.avgViews && stats?.memberCount ? ((advancedStats.avgViews / stats.memberCount) * 100).toFixed(1) : '–'}%
           </h3>
           <div className={`mt-3 flex items-center gap-2 text-xs font-bold ${advancedStats?.insights?.momentum > 0 ? 'text-green-500' : (advancedStats?.insights?.momentum < 0 ? 'text-red-500' : 'text-slate-500')}`}>
              <Activity size={14} /> Trend: {advancedStats?.insights?.momentum > 0 ? '+' : ''}{advancedStats?.insights?.momentum || 0}%
           </div>
        </motion.div>

        {/* Mock Share Metric -> Real Views Estimate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
           <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Eye className="text-orange-500" size={20} />
           </div>
           <p className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'rtacha Ko'rishlar</p>
           <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {advancedStats?.avgViews?.toLocaleString() || '–'}
           </h3>
           <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              Oxirgi {advancedStats?.scrapedPosts || 0} ta post asosida
           </div>
        </motion.div>
      </div>

      {/* NEW: ADVANCED INSIGHTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'} flex items-start gap-4`}>
              <div className="p-3 bg-pink-500/10 rounded-xl flex-shrink-0"><Zap className="text-pink-500" size={20} /></div>
              <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>Eng Top Post</p>
                  <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'} mt-1`}>{advancedStats?.insights?.topPostViews?.toLocaleString() || '0'} 👁️</p>
                  <p className="text-xs text-slate-500 truncate w-32 mt-1">{advancedStats?.insights?.topPostPreview || 'Kutilyapti...'}</p>
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'} flex items-start gap-4`}>
              <div className="p-3 bg-indigo-500/10 rounded-xl flex-shrink-0"><FileText className="text-indigo-500" size={20} /></div>
              <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>O'rtacha Matn Umr</p>
                  <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'} mt-1`}>{advancedStats?.insights?.avgCharCount || '0'} ta belgi</p>
                  <p className="text-xs text-slate-500 mt-1">Sizning kontent hajmingiz</p>
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'} flex items-start gap-4`}>
              <div className="p-3 bg-teal-500/10 rounded-xl flex-shrink-0"><LinkIcon className="text-teal-500" size={20} /></div>
              <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>Ssilkalar Qo'shilgani</p>
                  <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'} mt-1`}>{advancedStats?.insights?.linkRatio || '0'}%</p>
                  <p className="text-xs text-slate-500 mt-1">Postlarda ssilka uchrashi</p>
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'} flex items-start gap-4`}>
              <div className="p-3 bg-emerald-500/10 rounded-xl flex-shrink-0"><Target className="text-emerald-500" size={20} /></div>
              <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>Samaradorlik trendi</p>
                  <p className={`text-lg font-black mt-1 ${advancedStats?.insights?.momentum >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {advancedStats?.insights?.momentum > 0 ? '+' : ''}{advancedStats?.insights?.momentum || 0}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Oxirgi vs oldingi postlar</p>
              </div>
          </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Historical Views Area Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`lg:col-span-2 ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Eye size={18} className="text-[#0088cc]" />
                <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Post Ko'rishlar Va Ulashishlar</h2>
            </div>
            <div className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                Kunlik statistika
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            {advancedStats?.historicalViews?.length > 0 ? (
                <AreaChart data={advancedStats.historicalViews} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088cc" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0088cc" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 'bold', fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Area type="monotone" name="Ko'rishlar (Views/Kun)" dataKey="views" stroke="#0088cc" strokeWidth={3} fill="url(#viewsGrad)" activeDot={{ r: 6 }} />
                </AreaChart>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="animate-spin" /> Data kutilyapti...
                </div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Content Types Pie */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={cardClass}>
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={18} className="text-[#0088cc]" />
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Turi</h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>So'nggi postlar taqsimoti</p>
          <ResponsiveContainer width="100%" height={240}>
            {advancedStats?.postTypesData ? (
                <PieChart>
                <Pie data={advancedStats.postTypesData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {advancedStats.postTypesData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#0088cc', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                    ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} formatter={(v: any) => [v, 'Zarbi']} />
                <Legend formatter={(v: any) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }}>{v}</span>} />
                </PieChart>
            ) : (
               <div className="flex items-center justify-center h-full text-sm text-slate-400">Loading...</div>
            )}
          </ResponsiveContainer>
        </motion.div>
        
        {/* Active Hours Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`${cardClass} lg:col-span-1`}>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={18} className="text-[#8b5cf6]" />
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Eng Faol Vaqtlar</h2>
          </div>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kanal ER % bo'yicha</p>
          <ResponsiveContainer width="100%" height={200}>
            {advancedStats?.activeHours ? (
                <BarChart data={advancedStats.activeHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v}%`} />
                <RechartsTooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'ER']} />
                <Bar dataKey="er" name="Engagement Intensity" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
            ) : (
               <div className="flex items-center justify-center h-full text-sm text-slate-400">Data...</div>
            )}
          </ResponsiveContainer>
        </motion.div>
        
        {/* Channel Description Fallback */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className={`lg:col-span-2 ${cardClass} flex flex-col justify-center`}>
            <h2 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Kanal tavsifi (Bio)</h2>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {stats?.channelInfo?.description || 'Kanal tavsifi kiritilmagan.'}
                </p>
            </div>
        </motion.div>
      </div>

    </div>
  );
}
