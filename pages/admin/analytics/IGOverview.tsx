import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ReferenceLine, ComposedChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Users, Eye, Heart, TrendingUp, TrendingDown, Image, BookOpen, RefreshCw, AlertCircle, Instagram, Settings, Minus, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` :
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n)?.toString() || '0';

interface OverviewData {
  followersCount: number; followsCount: number; username: string;
  profilePicture: string; totalReach: number; totalInteractions: number;
  engagementRate: number; mediaCount: number; storiesCount: number;
  reachData: { date: string; reach: number; emaReach?: number }[];
  followerData: { date: string; delta: number }[];
  days: number;
  ema?: number[];
  trend?: { overall?: string };
  gradeStats?: { avgScore?: number; topGrade?: string };
  anomalies?: any[];
}

const KPICard = ({ icon: Icon, label, value, sub, color, trend, isDark }: any) => (
  <div className={`rounded-2xl p-5 border transition-all hover:shadow-lg ${isDark ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={19} style={{ color }} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend > 0 ? isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600' : trend < 0 ? isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className={`text-2xl font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
    {sub && <div className={`text-xs mt-1.5 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl border shadow-xl text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{fmt(p.value)}</strong></p>
      ))}
    </div>
  );
};

export default function IGOverview() {
  const { isDark } = useTheme();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async (d = days) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/ig/overview?days=${d}`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Xatolik');
      setData(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetch('/api/ig/sync', { method: 'POST', headers: authHeaders() });
    setTimeout(() => { setSyncing(false); fetchData(); }, 3000);
  };

  useEffect(() => { fetchData(days); }, [days]);

  // Compute chart avg for reference line
  const avgReach = data?.reachData?.length
    ? Math.round(data.reachData.reduce((s, d) => s + d.reach, 0) / data.reachData.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram size={13} className="text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Instagram Analytics</span>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Umumiy Ko'rinish</h1>
          {data?.username && (
            <p className={`text-sm mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              @{data.username} · {fmt(data.followersCount)} followers
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-4 py-2 text-sm font-bold transition-colors ${days === d ? 'bg-[#0061ff] text-white' : isDark ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                {d} kun
              </button>
            ))}
          </div>
          <button onClick={handleSync} disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Yangilanmoqda...' : 'Yangilash'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-amber-500/8 border-amber-500/25' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={19} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className={`font-black text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Instagram Token Sozlanmagan yoki Muddati Tugagan</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/60' : 'text-amber-600'}`}>{error}</p>
            </div>
          </div>
          <Link to="/paneladmindata/ig/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
            <Settings size={14} />
            Token Sozlash sahifasiga o'tish
          </Link>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className={`rounded-2xl p-5 h-32 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
            ))}
          </div>
          <div className={`rounded-2xl h-64 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
        </>
      )}

      {data && !loading && (
        <>
          {/* Account Profile Strip */}
          {data.username && (
            <div className={`rounded-2xl p-4 border flex items-center gap-4 ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              {data.profilePicture ? (
                <img src={data.profilePicture} alt={data.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Instagram size={20} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>@{data.username}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Instagram Business Akaunt</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(data.followersCount)}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Followers</div>
                </div>
                <div>
                  <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(data.followsCount)}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Following</div>
                </div>
                <div>
                  <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(data.mediaCount)}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Postlar</div>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard icon={Users} label="Followers" value={fmt(data.followersCount)} color="#0061ff" isDark={isDark} />
            <KPICard icon={Eye} label={`Jami Qamrov (${days} kun)`} value={fmt(data.totalReach)} color="#a855f7" isDark={isDark} />
            <KPICard icon={Heart} label="Jami Interaksiyalar" value={fmt(data.totalInteractions)} color="#ec4899" isDark={isDark} />
            <KPICard
              icon={TrendingUp} label="Engagement Rate" value={`${data.engagementRate}%`}
              sub={data.engagementRate > 3 ? '✅ Sanoat me\'yoridan yuqori' : data.engagementRate > 1 ? '⚠️ O\'rtacha' : '🔴 Past — yaxshilash kerak'}
              color={data.engagementRate > 3 ? '#10b981' : data.engagementRate > 1 ? '#f59e0b' : '#ef4444'}
              isDark={isDark}
            />
            <KPICard icon={Image} label="Jami Postlar" value={fmt(data.mediaCount)} color="#f59e0b" isDark={isDark} />
            <KPICard icon={BookOpen} label="Aktiv Stories" value={fmt(data.storiesCount)} color="#06b6d4" isDark={isDark} />
          </div>

          {/* Radar Chart */}
          {(() => {
            const trendOverall = (data as any).trend?.overall;
            const gradeScore = (data as any).gradeStats?.avgScore;
            const radarData = [
              { subject: 'Reach', A: Math.min(100, (avgReach / 2000) * 100) },
              { subject: 'ER', A: Math.min(100, (data.engagementRate / 8) * 100) },
              { subject: "O'sish", A: trendOverall === 'growing' ? 80 : trendOverall === 'declining' ? 20 : 50 },
              { subject: 'Izchillik', A: Math.min(100, (data.mediaCount / 30) * 100) },
              { subject: 'Kontent Sifati', A: gradeScore != null ? Math.min(100, gradeScore) : 50 },
            ];
            return (
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Akaunt Salomatligi Radari</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>5 ta asosiy ko'rsatkich bo'yicha baho</p>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                    <Radar name="Siz" dataKey="A" stroke="#0061ff" fill="#0061ff" fillOpacity={0.18} strokeWidth={2} dot={{ r: 4, fill: '#0061ff' }} />
                    <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} formatter={(v: any) => [`${Math.round(v)}/100`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}

          {/* Health Scorecard */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className={`text-base font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Akaunt Holati Xulosasi</h2>
            <div className="space-y-2">
              {[
                {
                  label: 'Kuzatuvchilar',
                  value: fmt(data.followersCount),
                  sub: 'followers',
                  color: '#0061ff',
                  icon: Users,
                },
                {
                  label: 'ER vs Benchmark',
                  value: `${data.engagementRate}% / 4.5%`,
                  sub: data.engagementRate >= 4.5 ? '✅ Benchmarkdan yuqori' : '🔴 Benchmarkdan past',
                  color: data.engagementRate >= 4.5 ? '#10b981' : '#ef4444',
                  icon: TrendingUp,
                },
                {
                  label: 'Reach Trendi',
                  value: (data as any).trend?.overall === 'growing' ? 'O\'smoqda' : (data as any).trend?.overall === 'declining' ? 'Tushmoqda' : 'Barqaror',
                  sub: null,
                  color: (data as any).trend?.overall === 'growing' ? '#10b981' : (data as any).trend?.overall === 'declining' ? '#ef4444' : '#f59e0b',
                  icon: Activity,
                },
                {
                  label: 'Kontent Sifati',
                  value: (data as any).gradeStats?.topGrade ?? '—',
                  sub: (data as any).gradeStats?.avgScore != null ? `${(data as any).gradeStats.avgScore}/100 ball` : null,
                  color: '#a855f7',
                  icon: Image,
                },
                {
                  label: 'Anomaliyalar',
                  value: `${(data as any).anomalies?.length || 0} ta`,
                  sub: 'aniqlangan',
                  color: (data as any).anomalies?.length ? '#f59e0b' : '#10b981',
                  icon: Activity,
                },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <row.icon size={14} style={{ color: row.color }} />
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: row.color }}>{row.value}</div>
                    {row.sub && <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{row.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reach Chart */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Qamrov (Reach) Dinamikasi</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Oxirgi {days} kun · O'rtacha: {fmt(avgReach)}/kun</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Activity size={12} />
                Jami: {fmt(data.totalReach)}
              </div>
            </div>
            {data.reachData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={data.reachData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0061ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0061ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={45} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <ReferenceLine y={avgReach} stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="4 4" label={{ value: 'Avg', position: 'right', fill: isDark ? '#475569' : '#94a3b8', fontSize: 10 }} />
                  <Area type="monotone" dataKey="reach" name="Reach" stroke="#0061ff" strokeWidth={2.5} fill="url(#reachGrad)" dot={false} activeDot={{ r: 5, fill: '#0061ff', stroke: isDark ? '#0a0f1e' : '#fff', strokeWidth: 2 }} />
                  {data.ema?.length && (
                    <Line type="monotone" dataKey="emaReach" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="EMA" />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-48 flex items-center justify-center text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Ma'lumot mavjud emas
              </div>
            )}
          </div>

          {/* Follower Growth Chart */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Follower O'sish Dinamikasi</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kunlik yangi va yo'qotilgan followers</p>
              </div>
            </div>
            {data.followerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.followerData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <ReferenceLine y={0} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <Bar dataKey="delta" name="Yangi followers" radius={[4, 4, 0, 0]}
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-40 flex items-center justify-center text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Ma'lumot mavjud emas
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Kunlik o\'rtacha reach',
                val: fmt(avgReach),
                desc: `${days} kunlik davr`,
                color: '#0061ff',
                icon: Eye,
              },
              {
                title: 'Eng yuqori reach (bir kunda)',
                val: fmt(Math.max(...(data.reachData.map(d => d.reach)), 0)),
                desc: 'Rekord ko\'rsatkich',
                color: '#a855f7',
                icon: TrendingUp,
              },
              {
                title: 'ER holati',
                val: data.engagementRate > 3 ? 'Yaxshi ✅' : data.engagementRate > 1 ? "O'rta ⚠️" : 'Past 🔴',
                desc: `${data.engagementRate}% engagement rate`,
                color: data.engagementRate > 3 ? '#10b981' : data.engagementRate > 1 ? '#f59e0b' : '#ef4444',
                icon: Activity,
              },
            ].map((item, i) => (
              <div key={i} className={`rounded-2xl p-4 border flex items-start gap-3 ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}18` }}>
                  <item.icon size={17} style={{ color: item.color }} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.title}</p>
                  <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.val}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
