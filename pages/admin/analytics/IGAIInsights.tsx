import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, ComposedChart, Line, Cell } from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  Lightbulb, Target, Clock, BarChart2, Activity, RefreshCw, Sparkles, Instagram, Zap, Calendar
} from 'lucide-react';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const PRIORITY: Record<string, { color: string; bg: string; border: string; label: string; icon: any }> = {
  critical: { color: '#ef4444', bg: '#ef444410', border: '#ef444430', label: 'Kritik', icon: AlertTriangle },
  high:     { color: '#f97316', bg: '#f9731610', border: '#f9731630', label: 'Yuqori', icon: Target },
  medium:   { color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b30', label: "O'rta", icon: Lightbulb },
  low:      { color: '#10b981', bg: '#10b98110', border: '#10b98130', label: 'Past', icon: CheckCircle },
};

const CAT_ICONS: Record<string, any> = { content: Brain, engagement: Activity, timing: Clock, audience: BarChart2 };

const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n)?.toString() || '0';

const healthColor = (s: number) => s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444';
const healthLabel = (s: number) => s >= 70 ? 'Yaxshi' : s >= 45 ? "O'rta" : 'Yomon';
const healthEmoji = (s: number) => s >= 70 ? '✅' : s >= 45 ? '⚠️' : '🔴';

export default function IGAIInsights() {
  const { isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'insights' | 'trend' | 'prediction' | 'mavsumiy' | 'benchmark'>('insights');

  const fetchData = () => {
    setLoading(true); setError('');
    fetch('/api/ig/ai-insights', { headers: authHeaders() })
      .then(r => r.json())
      .then(json => { if (json.error) throw new Error(json.error); setData(json); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const TABS = [
    { key: 'insights', label: 'Tavsiyalar', icon: Lightbulb },
    { key: 'trend', label: 'Trend Tahlili', icon: TrendingUp },
    { key: 'prediction', label: 'Prognoz', icon: Sparkles },
    { key: 'mavsumiy', label: 'Mavsumiy', icon: Calendar },
    { key: 'benchmark', label: 'Benchmark', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain size={13} className="text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI Tahlil</span>
          </div>
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Tavsiyalar va Tahlil</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Matematik algoritmlar asosidagi chuqur tahlil</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Yangilash
        </button>
      </div>

      {error && (
        <div className={`rounded-2xl p-5 border flex items-start gap-3 ${isDark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-2xl h-28 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Health Score */}
            <div className={`rounded-2xl p-6 border flex flex-col items-center text-center ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="relative w-28 h-28 mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="9" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke={healthColor(data.healthScore)} strokeWidth="9"
                    strokeDasharray={`${2 * Math.PI * 38 * data.healthScore / 100} ${2 * Math.PI * 38}`}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold" style={{ color: healthColor(data.healthScore) }}>{data.healthScore}</span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>/100</span>
                </div>
              </div>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Akaunt Salomatligi</span>
              <span className="text-xs font-bold mt-1" style={{ color: healthColor(data.healthScore) }}>
                {healthEmoji(data.healthScore)} {healthLabel(data.healthScore)}
              </span>
            </div>

            {/* Trend */}
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-3">
                {data.trend?.overall === 'growing'
                  ? <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center"><TrendingUp size={16} className="text-green-500" /></div>
                  : data.trend?.overall === 'declining'
                    ? <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center"><TrendingDown size={16} className="text-red-500" /></div>
                    : <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center"><Minus size={16} className="text-amber-500" /></div>}
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Trend Holati</span>
              </div>
              <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{data.trend?.summary}</p>
              <div className="space-y-2">
                {(data.trend?.metrics || []).map((m: any) => (
                  <div key={m.name} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{m.name}</span>
                    <span className={`text-xs font-bold ${m.change > 0 ? 'text-green-500' : m.change < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {m.change > 0 ? '↑' : m.change < 0 ? '↓' : '→'} {Math.abs(m.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key KPIs */}
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Asosiy Ko'rsatkichlar</h3>
              <div className="space-y-3">
                {[
                  { label: "O'rtacha Engagement Rate", val: `${data.avgER}%`, color: '#0061ff', icon: Activity },
                  { label: 'Tahlil qilingan postlar', val: data.postCount?.toString(), color: '#a855f7', icon: BarChart2 },
                ].map((item, i) => (
                  <div key={i} className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon size={13} style={{ color: item.color }} />
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
                    </div>
                    <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.val}</div>
                  </div>
                ))}
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-purple-500/8 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={12} className="text-purple-500" />
                    <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>AI ishlash rejimi</span>
                  </div>
                  <p className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Matematik algoritm · Real vaqt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === t.key
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* Reach drop alert */}
              {data.drop?.detected && (
                <div className={`rounded-2xl p-5 border ${isDark ? 'bg-red-500/8 border-red-500/25' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={16} className="text-red-500" />
                    </div>
                    <span className={`font-bold text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Reach Tushishi Aniqlandi: −{data.drop.dropPercent?.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`text-sm mb-4 ${isDark ? 'text-red-300/70' : 'text-red-600'}`}>Asosiy sabab: {data.drop.mainCause}</p>
                  <div className="space-y-2">
                    {(data.drop.causes || []).slice(0, 3).map((cause: any, i: number) => (
                      <div key={i} className={`p-3.5 rounded-xl border ${isDark ? 'bg-red-500/5 border-red-500/15' : 'bg-red-100/50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                           <span className={`text-xs font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>{cause.reason}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cause.impact === 'yuqori' ? 'bg-red-500/20 text-red-400' : cause.impact === "o'rta" ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {cause.impact}
                          </span>
                        </div>
                        <p className={`text-xs mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cause.detail}</p>
                        <p className={`text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>✅ {cause.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!data.drop?.detected && (
                <div className={`rounded-2xl p-4 border flex items-center gap-3 ${isDark ? 'bg-green-500/8 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                  <CheckCircle size={17} className="text-green-500 shrink-0" />
                  <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    {data.drop?.msg || '✅ Reach holati yaxshi — sezilarli tushish aniqlanmadi'}
                  </span>
                </div>
              )}

              {/* Insight cards */}
              {(data.insights || []).map((rec: any) => {
                const cfg = PRIORITY[rec.priority] || PRIORITY.low;
                const Icon = CAT_ICONS[rec.category] || Lightbulb;
                return (
                  <div key={rec.id} className={`rounded-2xl p-5 border transition-all hover:shadow-lg ${isDark ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                        <Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rec.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{rec.detail}</p>
                        <div className={`flex items-start gap-2 text-xs p-3 rounded-xl font-medium border ${isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                          <Target size={12} className="shrink-0 mt-0.5 text-[#0061ff]" />
                          {rec.action}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!data.insights?.length && !data.drop?.detected && (
                <div className={`rounded-2xl p-10 border text-center ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
                  <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Hozircha hamma narsa yaxshi!</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tavsiyalar uchun yetarli ma'lumot to'planmaguncha kuting.</p>
                </div>
              )}
            </div>
          )}

          {/* TREND TAB */}
          {activeTab === 'trend' && (
            <div className="space-y-5">
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>30 kun vs oldingi 30 kun</h3>
                <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.trend?.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  {(data.trend?.metrics || []).map((m: any) => (
                    <div key={m.name} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`text-xs mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.name}</div>
                      <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(m.current)}</div>
                      <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${m.change > 0 ? 'text-green-500' : m.change < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {m.change > 0 ? <TrendingUp size={10} /> : m.change < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {Math.abs(m.change)}% oldingi davrga nisbatan
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content type comparison */}
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Turi Taqqoslash</h3>
                {data.contentTypes?.recommendation && (
                  <p className={`text-sm mb-4 px-3 py-2 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>{data.contentTypes.recommendation}</p>
                )}
                <div className="space-y-3">
                  {(data.contentTypes?.types || []).map((t: any) => (
                    <div key={t.type} className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.label}
                          <span className={`ml-2 text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({t.count} post)</span>
                        </span>
                        {t.reachMultiplier > 1 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-[#0061ff]/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'}`}>{t.reachMultiplier}x reach</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[{ l: 'Avg Reach', v: fmt(t.avgReach) }, { l: 'Avg ER', v: `${t.avgER}%` }, { l: 'Avg Saves', v: fmt(t.avgSaves) }, { l: 'Avg Likes', v: fmt(t.avgLikes) }].map(s => (
                          <div key={s.l} className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white'}`}>
                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.l}</div>
                            <div className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PREDICTION TAB */}
          {activeTab === 'prediction' && data.followerPrediction && (
            <div className="space-y-5">
              {/* Prediction KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '30 kundan so\'ng', val: data.followerPrediction.predicted30, icon: '📈' },
                  { label: '60 kundan so\'ng', val: data.followerPrediction.predicted60, icon: '🚀' },
                  { label: '90 kundan so\'ng', val: data.followerPrediction.predicted90, icon: '🎯' },
                ].map(p => (
                  <div key={p.label} className={`rounded-2xl p-5 border text-center ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(p.val)}</div>
                    <div className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>followers</div>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Follower O'sish Bashorati</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {data.followerPrediction.degree === 2
                        ? 'Polynomial regression (daraja 2)'
                        : 'Chiziqli regressiya'} · Ishonchlilik:{' '}
                      <span className={`font-bold ${isDark ? 'text-[#60efff]' : 'text-[#0061ff]'}`}>{data.followerPrediction.confidence}</span>
                      {data.followerPrediction.r2 != null && (
                        <span className="ml-2">· R² = <span className="font-bold">{data.followerPrediction.r2.toFixed(3)}</span></span>
                      )}
                    </p>
                  </div>
                  <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#0061ff] rounded inline-block" />Haqiqiy</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-purple-500 rounded inline-block border-dashed" />Bashorat</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={data.followerPrediction.chartData.filter((_: any, i: number) => i % 3 === 0)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="actualGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0061ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0061ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={50} />
                    <Tooltip
                      contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: 12, fontSize: 12 }}
                      formatter={(v: any, name: string) => [v ? fmt(v) : null, name === 'actual' ? 'Haqiqiy' : name === 'predicted' ? 'Bashorat' : name === 'predictedUpper' ? 'CI yuqori' : 'CI quyi']} />
                    <Area type="monotone" dataKey="actual" stroke="#0061ff" strokeWidth={2.5} fill="url(#actualGrad2)" dot={false} connectNulls={false} />
                    <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 4" fill="url(#predGrad2)" dot={false} />
                    {data.followerPrediction.chartData.some((d: any) => d.predictedUpper != null) && (
                      <>
                        <Area type="monotone" dataKey="predictedUpper" stroke="none" fill="#818cf8" fillOpacity={0.15} dot={false} legendType="none" />
                        <Area type="monotone" dataKey="predictedLower" stroke="none" fill={isDark ? '#0f172a' : '#ffffff'} fillOpacity={1} dot={false} legendType="none" />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className={`rounded-2xl p-4 border flex items-start gap-3 ${isDark ? 'bg-amber-500/8 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className={`text-xs leading-relaxed ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  <strong>Eslatma:</strong> Bashorat {data.followerPrediction.degree === 2 ? 'polynomial (daraja 2)' : 'chiziqli'} regressiya asosida hisoblanadi. Algoritmlar real Instagram faoliyati, posting chastotasi va ER dinamikasini hisobga oladi. Natija taxminiy.
                </p>
              </div>
            </div>
          )}
          {/* MAVSUMIY TAB */}
          {activeTab === 'mavsumiy' && (
            <div className="space-y-5">
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={15} className="text-[#0061ff]" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Haftalik Faollik Indeksi</h3>
                </div>
                <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  1.0 = o'rtacha · Eng yaxshi kun:{' '}
                  <span className="font-bold text-[#0061ff]">
                    {data.seasonal?.bestDay ?? '—'}
                  </span>
                </p>
                {data.seasonal?.dayIndex?.length === 7 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day, i) => ({
                        day,
                        value: data.seasonal.dayIndex[i],
                        isBest: day === data.seasonal.bestDay,
                      }))}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} domain={[0, 'auto']} width={40} />
                      <Tooltip
                        contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }}
                        formatter={(v: any) => [Number(v).toFixed(2) + 'x', 'Indeks']} />
                      <ReferenceLine y={1.0} stroke={isDark ? '#475569' : '#94a3b8'} strokeDasharray="4 4" label={{ value: '1.0', position: 'right', fill: isDark ? '#475569' : '#94a3b8', fontSize: 10 }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}
                        fill="#0061ff"
                        label={false}>
                        {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day, i) => (
                          <Cell key={day} fill={day === data.seasonal?.bestDay ? '#10b981' : '#0061ff'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`h-40 flex items-center justify-center text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mavsumiy ma'lumotlar mavjud emas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BENCHMARK TAB */}
          {activeTab === 'benchmark' && (
            <div className="space-y-5">
              {/* Comparison table */}
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Target size={15} className="text-[#0061ff]" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ta'lim nishi bilan solishtirma</h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Engagement Rate',
                      yours: `${data.avgER}%`,
                      benchmark: `${data.benchmarks?.er ?? 4.5}%`,
                      above: parseFloat(data.avgER) >= (data.benchmarks?.er ?? 4.5),
                    },
                    {
                      label: 'O\'rtacha Reach',
                      yours: data.reachAvg != null ? fmt(data.reachAvg) : '—',
                      benchmark: fmt(data.benchmarks?.avgReach ?? 1200),
                      above: data.reachAvg != null ? data.reachAvg >= (data.benchmarks?.avgReach ?? 1200) : null,
                    },
                  ].map(row => (
                    <div key={row.label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                      <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Siz</div>
                          <div className={`text-sm font-bold ${row.above === true ? 'text-green-500' : row.above === false ? 'text-red-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.yours}</div>
                        </div>
                        <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        <div className="text-right">
                          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Nish o'rtachasi</div>
                          <div className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.benchmark}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${row.above === true ? 'bg-green-500/20 text-green-500' : row.above === false ? 'bg-red-500/20 text-red-500' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-400'}`}>
                          {row.above === true ? '↑' : row.above === false ? '↓' : '—'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Matrix */}
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ustuvorlik Matrisi</h3>
                <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kontent strategiyangizni rejalashtirish uchun</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'Tez Natija', desc: 'Yuqori ER, past reach. Aylantirish va savdo uchun ideal. Faqat mavjud auditoriyaga qaratilgan kontent.', color: '#10b981', bg: '#10b98115', border: '#10b98130' },
                    { title: 'Katta Loyiha', desc: 'Yuqori ER va yuqori reach. Viral bo\'lish salohiyati bor. Resurs talab qiladi, lekin maksimal ta\'sir beradi.', color: '#0061ff', bg: '#0061ff15', border: '#0061ff30' },
                    { title: "To'ldiruvchi", desc: 'Past ER, past reach. Jadval bo\'shliqlarini to\'ldirish uchun ishlatiladi. Ko\'p vaqt sarflamang.', color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30' },
                    { title: 'Behuda', desc: 'Past ER, yuqori reach. Ko\'p ko\'rish lekin kam ta\'sir. Qayta ko\'rib chiqish yoki chiqarib tashlash kerak.', color: '#ef4444', bg: '#ef444415', border: '#ef444430' },
                  ].map(q => (
                    <div key={q.title} className="rounded-xl p-4 border" style={{ background: q.bg, borderColor: q.border }}>
                      <p className="text-sm font-bold mb-1" style={{ color: q.color }}>{q.title}</p>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{q.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>← Past Reach</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Yuqori Reach →</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
