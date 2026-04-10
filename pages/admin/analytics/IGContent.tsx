import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line, ComposedChart
} from 'recharts';
import { Image, Video, Layers, TrendingUp, Clock, ExternalLink, RefreshCw, AlertCircle, Instagram, Star, Award, BarChart2, Zap } from 'lucide-react';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'A+': { color: '#10b981', bg: '#10b98118', label: 'Zo\'r' },
  'A':  { color: '#22c55e', bg: '#22c55e18', label: 'A\'lo' },
  'B':  { color: '#3b82f6', bg: '#3b82f618', label: 'Yaxshi' },
  'C':  { color: '#f59e0b', bg: '#f59e0b18', label: "O'rta" },
  'D':  { color: '#f97316', bg: '#f9731618', label: 'Pastroq' },
  'F':  { color: '#ef4444', bg: '#ef444418', label: 'Yomon' },
};
const TYPE_ICONS: Record<string, any> = { IMAGE: Image, VIDEO: Video, CAROUSEL_ALBUM: Layers };
const TYPE_COLORS: Record<string, string> = { IMAGE: '#3b82f6', VIDEO: '#a855f7', CAROUSEL_ALBUM: '#f59e0b' };
const TYPE_LABELS: Record<string, string> = { IMAGE: 'Rasm', VIDEO: 'Video/Reel', CAROUSEL_ALBUM: 'Carousel' };

const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n)?.toString() || '0';

export default function IGContent() {
  const { isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'types' | 'timing' | 'korrelyatsiya'>('posts');
  const [sortBy, setSortBy] = useState<'reach' | 'er' | 'saves' | 'score'>('reach');

  useEffect(() => {
    setLoading(true); setError('');
    fetch('/api/ig/media', { headers: authHeaders() })
      .then(r => r.json())
      .then(json => { if (json.error) throw new Error(json.error); setData(json); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sortedPosts = data?.posts ? [...data.posts].sort((a: any, b: any) => {
    if (sortBy === 'reach') return (b.reach || 0) - (a.reach || 0);
    if (sortBy === 'er') return parseFloat(b.er || 0) - parseFloat(a.er || 0);
    if (sortBy === 'saves') return (b.saved || 0) - (a.saved || 0);
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
    return 0;
  }) : [];

  const pieData = data?.contentTypes?.types?.map((t: any) => ({
    name: TYPE_LABELS[t.type] || t.type, value: t.count, color: TYPE_COLORS[t.type] || '#888'
  })) || [];

  const TABS = [
    { key: 'posts', label: 'Postlar', icon: Image },
    { key: 'types', label: 'Kontent Turi', icon: Award },
    { key: 'timing', label: 'Optimal Vaqt', icon: Clock },
    { key: 'korrelyatsiya', label: 'Korrelyatsiya', icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Instagram size={13} className="text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kontent</span>
          </div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Analitika</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Postlar samaradorligi va kontent turi tahlili</p>
        </div>
        {data && (
          <div className={`px-3 py-1.5 rounded-xl text-xs font-black border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            {data.total} ta post tahlil qilindi
          </div>
        )}
      </div>

      {error && (
        <div className={`rounded-2xl p-5 border flex items-start gap-3 ${isDark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className={`rounded-2xl h-28 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
          <div className={`rounded-2xl h-64 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
        </div>
      )}

      {data && !loading && (
        <>
          {/* Grade Summary */}
          <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Post Baholari Taqsimoti</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reach, ER va Saves asosida hisoblanadi</p>
              </div>
              <div className={`text-right`}>
                <div className={`text-2xl font-black text-[#0061ff]`}>{data.gradeStats?.avgScore}<span className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span></div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>O'rtacha ball</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(data.gradeStats?.distribution || {}).map(([grade, count]: any) => {
                const cfg = GRADE_CONFIG[grade] || { color: '#888', bg: '#88888818', label: grade };
                return (
                  <div key={grade} className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ borderColor: `${cfg.color}30`, background: cfg.bg }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                      <span className="text-xs font-black" style={{ color: cfg.color }}>{grade}</span>
                    </div>
                    <div>
                      <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{count} ta</div>
                      <div className="text-xs" style={{ color: cfg.color }}>{cfg.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`flex gap-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === t.key
                    ? 'bg-[#0061ff] text-white shadow-lg shadow-blue-500/25'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
            {/* Velocity Leaderboard */}
            {data?.posts?.some((p: any) => p.velocity?.velocity != null) && (() => {
              const top5 = [...data.posts]
                .filter((p: any) => p.velocity?.velocity != null)
                .sort((a: any, b: any) => (b.velocity?.velocity || 0) - (a.velocity?.velocity || 0))
                .slice(0, 5);
              return (
                <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Zap size={14} className="text-amber-500" />
                    </div>
                    <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Tezkor O'suvchi Postlar</h3>
                  </div>
                  <div className="space-y-2">
                    {top5.map((post: any, i: number) => {
                      const caption = post.caption?.slice(0, 55) || 'Caption yo\'q';
                      const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#0061ff', '#a855f7'];
                      return (
                        <div key={post.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${rankColors[i] || '#888'}18` }}>
                            <span className="text-xs font-black" style={{ color: rankColors[i] || '#888' }}>{i + 1}</span>
                          </div>
                          <p className={`flex-1 text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{caption}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Zap size={12} className="text-amber-400" />
                            <span className={`text-xs font-black ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{(post.velocity?.velocity || 0).toFixed(1)}/h</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              {/* Sort bar */}
              <div className={`px-5 py-3 border-b flex items-center gap-3 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saralash:</span>
                {[{ key: 'reach', label: 'Reach' }, { key: 'er', label: 'ER%' }, { key: 'saves', label: 'Saves' }, { key: 'score', label: 'Ball' }].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${sortBy === s.key ? 'bg-[#0061ff] text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Post rows */}
              <div className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-50'}`}>
                {sortedPosts.slice(0, 25).map((post: any, i: number) => {
                  const Icon = TYPE_ICONS[post.media_type] || Image;
                  const typeColor = TYPE_COLORS[post.media_type] || '#888';
                  const grade = GRADE_CONFIG[post.grade] || { color: '#888', bg: '#88888815', label: '' };
                  const caption = post.caption?.slice(0, 65) || 'Caption yo\'q';
                  const isTop3 = i < 3;

                  return (
                    <div key={post.id} className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                      {/* Rank */}
                      <div className={`text-xs font-black w-6 text-center ${isTop3 ? 'text-amber-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                        {isTop3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                      </div>

                      {/* Thumbnail */}
                      {post.thumbnail_url || post.media_url ? (
                        <img src={post.thumbnail_url || post.media_url} alt=""
                          className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                          onError={e => { (e.target as any).style.display = 'none'; }} />
                      ) : (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${typeColor}18` }}>
                          <Icon size={18} style={{ color: typeColor }} />
                        </div>
                      )}

                      {/* Caption + meta */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{caption}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(post.timestamp).toLocaleDateString('uz-UZ')}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          <span className={`text-xs font-medium`} style={{ color: typeColor }}>{TYPE_LABELS[post.media_type] || post.media_type}</span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1 justify-end">
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.reach)}</span>
                            {post.anomaly?.type === 'high' && <span title="Anomaliya: Yuqori">🚀</span>}
                            {post.anomaly?.type === 'low' && <span title="Anomaliya: Past">🔴</span>}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>reach</div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1 justify-end">
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.er}%</span>
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>ER</div>
                        </div>
                        <div className="text-right hidden md:block">
                          <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.saved)}</div>
                          <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>saves</div>
                        </div>

                        {/* Grade badge */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: grade.bg, borderColor: `${grade.color}30` }}>
                          <span className="text-sm font-black" style={{ color: grade.color }}>{post.grade}</span>
                        </div>

                        {/* External link */}
                        <a href={post.permalink} target="_blank" rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

          {/* Content Types Tab */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Turi Taqsimoti</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Post soni bo'yicha</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} ta post`, '']}
                      contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
                    <Legend formatter={(v: any) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>O'rtacha Reach</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kontent turi bo'yicha solishtirma</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.contentTypes?.types || []} layout="vertical" margin={{ left: 5, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickFormatter={fmt} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} width={70} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => [fmt(v), 'Avg Reach']}
                      contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
                    <Bar dataKey="avgReach" radius={[0, 8, 8, 0]}>
                      {(data.contentTypes?.types || []).map((t: any, i: number) => <Cell key={i} fill={TYPE_COLORS[t.type] || '#888'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {data.contentTypes?.recommendation && (
                <div className={`lg:col-span-2 rounded-2xl p-4 border flex items-start gap-3 ${isDark ? 'bg-blue-500/8 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <TrendingUp size={17} className="text-[#0061ff] shrink-0 mt-0.5" />
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{data.contentTypes.recommendation}</p>
                </div>
              )}

              {/* Per-type detail cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(data.contentTypes?.types || []).map((t: any) => {
                  const color = TYPE_COLORS[t.type] || '#888';
                  const Icon = TYPE_ICONS[t.type] || Image;
                  return (
                    <div key={t.type} className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.label}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.count} post</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ l: 'Avg Reach', v: fmt(t.avgReach) }, { l: 'Avg ER', v: `${t.avgER}%` }, { l: 'Avg Saves', v: fmt(t.avgSaves) }, { l: 'Avg Likes', v: fmt(t.avgLikes) }].map(s => (
                          <div key={s.l} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.l}</div>
                            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timing Tab */}
          {activeTab === 'timing' && (
            <div className="space-y-5">
              {data.timing?.recommendation && (
                <div className={`rounded-2xl p-4 border flex items-start gap-3 ${isDark ? 'bg-green-500/8 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                  <Clock size={17} className="text-green-500 shrink-0 mt-0.5" />
                  <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>{data.timing.recommendation}</p>
                </div>
              )}

              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Eng Yaxshi Posting Vaqtlari</h3>
                <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ER (Engagement Rate) asosida tartiblangan</p>
                <div className="space-y-3">
                  {(data.timing?.topSlots || []).map((slot: any, i: number) => {
                    const pct = Math.min(100, (slot.avgER / (data.timing.topSlots[0]?.avgER || 1)) * 100);
                    const colors = ['#f59e0b', '#94a3b8', '#cd7f32', '#0061ff', '#a855f7'];
                    return (
                      <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${colors[i] || '#888'}18` }}>
                          <span className="text-xs font-black" style={{ color: colors[i] || '#888' }}>{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{slot.dayName} — {slot.timeLabel}</p>
                          <div className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-[#0061ff] to-[#60efff] transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className={`text-sm font-black shrink-0 ${isDark ? 'text-[#60efff]' : 'text-[#0061ff]'}`}>ER: {slot.avgER}%</span>
                      </div>
                    );
                  })}
                  {!data.timing?.topSlots?.length && (
                    <p className={`text-sm py-8 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Yetarli ma'lumot yo'q — kamida 2 ta post bir xil vaqtda bo'lganda tahlil paydo bo'ladi
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Korrelyatsiya Tab */}
          {activeTab === 'korrelyatsiya' && (
            <div className="space-y-5">
              {/* Caption Length vs Reach */}
              <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-[#0061ff]" />
                  <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Caption uzunligi ↔ Reach</h3>
                </div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  r = <span className="font-bold">{data.correlations?.captionLengthVsReach?.r ?? '—'}</span>
                  {data.correlations?.captionLengthVsReach?.interpretation && (
                    <span className="ml-2">{data.correlations.captionLengthVsReach.interpretation}</span>
                  )}
                </p>
                {data.correlations?.captionBuckets?.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.correlations.captionBuckets} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmt} width={45} />
                      <Tooltip formatter={(v: any) => [fmt(v), 'Avg Reach']}
                        contentStyle={{ background: isDark ? '#0f172a' : '#fff', borderRadius: 12, border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: 12 }} />
                      <Bar dataKey="avgReach" fill="#0061ff" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {!data.correlations?.captionBuckets?.length && (
                  <p className={`text-sm py-6 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Caption bucket ma'lumotlari mavjud emas</p>
                )}
              </div>

              {/* Hour vs ER */}
              <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-purple-500" />
                  <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Soat ↔ ER%</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  r = <span className="font-bold">{data.correlations?.hourVsER?.r ?? '—'}</span>
                  {data.correlations?.hourVsER?.interpretation && (
                    <span className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.correlations.hourVsER.interpretation}</span>
                  )}
                </p>
              </div>

              {/* Hashtag Count vs Reach */}
              <div className={`rounded-2xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-amber-500" />
                  <h3 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Hashtag soni ↔ Reach</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  r = <span className="font-bold">{data.correlations?.hashtagCountVsReach?.r ?? '—'}</span>
                  {data.correlations?.hashtagCountVsReach?.interpretation && (
                    <span className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.correlations.hashtagCountVsReach.interpretation}</span>
                  )}
                </p>
              </div>

              {!data.correlations && (
                <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <BarChart2 size={32} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Korrelyatsiya ma'lumotlari mavjud emas</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
