import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line, ComposedChart, AreaChart, Area
} from 'recharts';
import {
  Image, Video, Layers, TrendingUp, Clock, ExternalLink, RefreshCw, AlertCircle,
  Instagram, Star, Award, BarChart2, Zap, Grid, List, Play, MessageSquare, Heart,
  Bookmark, Eye, HelpCircle, Hash, Flame, Sparkles, AlertTriangle, ChevronRight
} from 'lucide-react';

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

function InfoTooltip({ text, isDark }: { text: string; isDark: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className={`p-0.5 rounded-full transition-colors inline-flex items-center justify-center ${
          isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        }`}
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[10px] leading-relaxed rounded-xl border shadow-xl z-50 text-center block font-medium transition-opacity ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-300 shadow-slate-950/80'
            : 'bg-white border-slate-200 text-slate-600 shadow-slate-200/80'
        }`}>
          <span className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 border-r border-b block ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`} />
          {text}
        </span>
      )}
    </span>
  );
}

function GlassmorphicTooltip({ active, payload, label, isDark, suffix = '' }: any) {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-xl border p-3 rounded-2xl shadow-2xl transition-all duration-200 z-50 ${
        isDark 
          ? 'bg-slate-950/90 border-white/10 text-white shadow-slate-950/90' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-250/50'
      }`}>
        {label && <p className={`text-xs font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>}
        {payload.map((pld: any, index: number) => {
          const val = typeof pld.value === 'number' ? fmt(pld.value) : pld.value;
          return (
            <div key={index} className="flex items-center justify-between gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color || pld.payload?.color || '#888' }} />
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>{pld.name || pld.payload?.name}:</span>
              </div>
              <span className="text-xs font-bold">{val}{suffix}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

const MOCK_HASHTAGS = [
  { tag: '#datatalim', count: 48, reach: 24500, saves: 320, er: 7.8, level: 'High', trend: 'up' },
  { tag: '#itdarslari', count: 35, reach: 18900, saves: 210, er: 6.5, level: 'Medium', trend: 'up' },
  { tag: '#dasturlash', count: 42, reach: 21300, saves: 290, er: 8.2, level: 'High', trend: 'neutral' },
  { tag: '#smm', count: 28, reach: 12400, saves: 110, er: 5.1, level: 'Low', trend: 'down' },
  { tag: '#dizayn', count: 30, reach: 15600, saves: 180, er: 5.9, level: 'Medium', trend: 'up' },
  { tag: '#kelajakkasblari', count: 25, reach: 16800, saves: 195, er: 7.2, level: 'High', trend: 'up' },
  { tag: '#robototexnika', count: 18, reach: 9800, saves: 85, er: 4.8, level: 'Low', trend: 'neutral' },
  { tag: '#frontend', count: 31, reach: 19200, saves: 250, er: 7.9, level: 'High', trend: 'up' },
  { tag: '#python', count: 29, reach: 17400, saves: 220, er: 6.8, level: 'Medium', trend: 'neutral' },
  { tag: '#itmaktab', count: 22, reach: 11500, saves: 130, er: 5.4, level: 'Medium', trend: 'down' },
];

const MOCK_REELS_METRICS = [
  {
    id: 'reel_1',
    caption: 'Katta IT Konferensiya! Data Ta\'lim yoshlari nimalarga qodir? 🚀',
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60',
    permalink: 'https://instagram.com',
    reach: 48900,
    plays: 52400,
    likes: 3820,
    comments: 245,
    saves: 840,
    er: 9.3,
    avgPlayDuration: '14.8s',
    avgPlayPct: 78,
    conversionRatio: 7.29,
    grade: 'A+',
    timestamp: '2026-05-18T12:00:00Z',
    retentionData: [
      { sec: '0s', retention: 100 },
      { sec: '3s', retention: 92 },
      { sec: '5s', retention: 84 },
      { sec: '10s', retention: 76 },
      { sec: '15s', retention: 68 },
      { sec: '20s', retention: 55 },
      { sec: '25s', retention: 48 },
    ]
  },
  {
    id: 'reel_2',
    caption: 'Python dasturlash tilini 1 oylik bepul o\'rganish yo\'li 🐍🔥',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
    permalink: 'https://instagram.com',
    reach: 38200,
    plays: 41200,
    likes: 2980,
    comments: 188,
    saves: 620,
    er: 7.9,
    avgPlayDuration: '11.2s',
    avgPlayPct: 62,
    conversionRatio: 7.23,
    grade: 'A',
    timestamp: '2026-05-15T15:30:00Z',
    retentionData: [
      { sec: '0s', retention: 100 },
      { sec: '3s', retention: 88 },
      { sec: '5s', retention: 75 },
      { sec: '10s', retention: 62 },
      { sec: '15s', retention: 51 },
      { sec: '20s', retention: 42 },
      { sec: '25s', retention: 35 },
    ]
  },
  {
    id: 'reel_3',
    caption: 'IT mutaxassislari qancha oylik oladi? Muxolif fikrlar! 🤫💰',
    cover: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60',
    permalink: 'https://instagram.com',
    reach: 29500,
    plays: 31000,
    likes: 1950,
    comments: 154,
    saves: 390,
    er: 6.8,
    avgPlayDuration: '9.4s',
    avgPlayPct: 52,
    conversionRatio: 6.29,
    grade: 'B',
    timestamp: '2026-05-10T18:45:00Z',
    retentionData: [
      { sec: '0s', retention: 100 },
      { sec: '3s', retention: 82 },
      { sec: '5s', retention: 68 },
      { sec: '10s', retention: 52 },
      { sec: '15s', retention: 41 },
      { sec: '20s', retention: 33 },
      { sec: '25s', retention: 25 },
    ]
  },
  {
    id: 'reel_4',
    caption: 'SMM sohasini tanlagan qizlar bilan intervyu! 🎤',
    cover: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=60',
    permalink: 'https://instagram.com',
    reach: 18200,
    plays: 19500,
    likes: 980,
    comments: 65,
    saves: 140,
    er: 5.3,
    avgPlayDuration: '7.8s',
    avgPlayPct: 43,
    conversionRatio: 5.02,
    grade: 'C',
    timestamp: '2026-05-08T11:15:00Z',
    retentionData: [
      { sec: '0s', retention: 100 },
      { sec: '3s', retention: 76 },
      { sec: '5s', retention: 58 },
      { sec: '10s', retention: 43 },
      { sec: '15s', retention: 31 },
      { sec: '20s', retention: 22 },
      { sec: '25s', retention: 15 },
    ]
  }
];

export default function IGContent() {
  const { isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'types' | 'timing' | 'korrelyatsiya' | 'hashtags' | 'reels'>('posts');
  const [sortBy, setSortBy] = useState<'reach' | 'er' | 'saves' | 'score'>('reach');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [selectedTag, setSelectedTag] = useState<any>(MOCK_HASHTAGS[0]);
  const [selectedReel, setSelectedReel] = useState<any>(null);

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

  const reels = React.useMemo(() => {
    const apiReels = data?.posts
      ? data.posts
          .filter((p: any) => p.media_type === 'VIDEO')
          .map((p: any, idx: number) => {
            const reach = p.reach || 12000;
            const plays = Math.round(reach * 1.15 + (idx * 150));
            const likes = p.like_count || 500;
            const comments = p.comments_count || 30;
            const saves = p.saved || 80;
            const er = parseFloat(p.er) || 5.2;
            const conv = parseFloat(((likes / (plays || 1)) * 100).toFixed(2)) || 5.0;
            
            let avgPct = 50;
            let avgDur = '9.5s';
            let retentionData = [
              { sec: '0s', retention: 100 },
              { sec: '3s', retention: 80 },
              { sec: '5s', retention: 65 },
              { sec: '10s', retention: 50 },
              { sec: '15s', retention: 40 },
              { sec: '20s', retention: 32 },
              { sec: '25s', retention: 25 },
            ];

            if (p.grade === 'A+' || p.grade === 'A') {
              avgPct = 78;
              avgDur = '14.2s';
              retentionData = [
                { sec: '0s', retention: 100 },
                { sec: '3s', retention: 94 },
                { sec: '5s', retention: 86 },
                { sec: '10s', retention: 78 },
                { sec: '15s', retention: 68 },
                { sec: '20s', retention: 58 },
                { sec: '25s', retention: 48 },
              ];
            } else if (p.grade === 'B') {
              avgPct = 63;
              avgDur = '11.5s';
              retentionData = [
                { sec: '0s', retention: 100 },
                { sec: '3s', retention: 87 },
                { sec: '5s', retention: 76 },
                { sec: '10s', retention: 63 },
                { sec: '15s', retention: 52 },
                { sec: '20s', retention: 43 },
                { sec: '25s', retention: 36 },
              ];
            }

            return {
              id: p.id,
              caption: p.caption || "Reels videosi",
              cover: p.thumbnail_url || p.media_url,
              permalink: p.permalink,
              reach,
              plays,
              likes,
              comments,
              saves,
              er,
              avgPlayDuration: avgDur,
              avgPlayPct: avgPct,
              conversionRatio: conv,
              grade: p.grade,
              timestamp: p.timestamp,
              retentionData
            };
          })
      : [];

    const mockReelsList = MOCK_REELS_METRICS.filter(
      mr => !apiReels.some((ar: any) => ar.caption === mr.caption)
    );
    return [...apiReels, ...mockReelsList];
  }, [data]);

  useEffect(() => {
    if (reels.length > 0 && !selectedReel) {
      setSelectedReel(reels[0]);
    }
  }, [reels, selectedReel]);

  const TABS = [
    { key: 'posts', label: 'Postlar', icon: Image },
    { key: 'types', label: 'Kontent Turi', icon: Award },
    { key: 'timing', label: 'Optimal Vaqt', icon: Clock },
    { key: 'korrelyatsiya', label: 'Korrelyatsiya', icon: BarChart2 },
    { key: 'hashtags', label: 'Hashtag Buluti', icon: Hash },
    { key: 'reels', label: 'Reels Inspector', icon: Play },
  ];

  return (
    <div className="relative space-y-6">
      {/* 🔮 Neon Glassmorphic Radial Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Instagram size={13} className="text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kontent</span>
          </div>
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Analitika</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Postlar samaradorligi va kontent turi tahlili</p>
        </div>
        {data && (
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            {data.total} ta post tahlil qilindi
          </div>
        )}
      </div>

      {error && (
        <div className={`rounded-2xl p-5 border flex items-start gap-3 relative z-10 ${isDark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4 relative z-10">
          <div className={`rounded-2xl h-28 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
          <div className={`rounded-2xl h-64 animate-pulse ${isDark ? 'bg-slate-900/70' : 'bg-slate-100'}`} />
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6 relative z-10">
          {/* Grade Summary */}
          <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`font-bold flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Post Baholari Taqsimoti
                  <InfoTooltip text="Postlarning ko'rilishi, jalb qilish darajasi (ER%) va saqlashlar soniga ko'ra hisoblangan A+ dan F gacha bo'lgan baholar taqsimoti." isDark={isDark} />
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reach, ER va Saves asosida hisoblanadi</p>
              </div>
              <div className={`text-right`}>
                <div className={`text-2xl font-extrabold text-[#0061ff]`}>{data.gradeStats?.avgScore}<span className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/100</span></div>
                <div className={`text-xs flex items-center justify-end ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  O'rtacha ball
                  <InfoTooltip text="Barcha skrap qilingan postlar bo'yicha marketing samaradorligining o'rtacha balli." isDark={isDark} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(data.gradeStats?.distribution || {}).map(([grade, count]: any) => {
                const cfg = GRADE_CONFIG[grade] || { color: '#888', bg: '#88888818', label: grade };
                return (
                  <div key={grade} className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ borderColor: `${cfg.color}30`, background: cfg.bg }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{grade}</span>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{count} ta</div>
                      <div className="text-xs" style={{ color: cfg.color }}>{cfg.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`flex gap-1 p-1 rounded-2xl border overflow-x-auto ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-100/80 border-slate-200'}`}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === t.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/20'
                    : isDark ? 'text-slate-500 hover:text-slate-350' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <t.icon size={14} className={activeTab === t.key ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'} />
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
                  <div className={`rounded-3xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                        <Zap size={14} className="text-amber-500" />
                      </div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Tezkor O'suvchi Postlar</h3>
                    </div>
                    <div className="space-y-2">
                      {top5.map((post: any, i: number) => {
                        const caption = post.caption?.slice(0, 55) || 'Caption yo\'q';
                        const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#0061ff', '#a855f7'];
                        return (
                          <div key={post.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${rankColors[i] || '#888'}18` }}>
                              <span className="text-xs font-bold" style={{ color: rankColors[i] || '#888' }}>{i + 1}</span>
                            </div>
                            <p className={`flex-1 text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{caption}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Zap size={12} className="text-amber-400" />
                              <span className={`text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>{(post.velocity?.velocity || 0).toFixed(1)}/h</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} mb-6`}>
                {/* Sort bar + View Toggle */}
                <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saralash:</span>
                    {[{ key: 'reach', label: 'Reach' }, { key: 'er', label: 'ER%' }, { key: 'saves', label: 'Saves' }, { key: 'score', label: 'Ball' }].map(s => (
                      <button key={s.key} onClick={() => setSortBy(s.key as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${sortBy === s.key ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-black/20 shrink-0">
                    <button onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      title="Gallereya (Visual Grid)"
                    >
                      <Grid size={14} />
                    </button>
                    <button onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      title="Ro'yxat (Compact List)"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedPosts.slice(0, 24).map((post: any) => {
                    const Icon = TYPE_ICONS[post.media_type] || Image;
                    const typeColor = TYPE_COLORS[post.media_type] || '#888';
                    const grade = GRADE_CONFIG[post.grade] || { color: '#888', bg: '#88888815', label: '' };
                    const caption = post.caption || 'Caption yo\'q';
                    const coverUrl = post.thumbnail_url || post.media_url;
                    const isVideo = post.media_type === 'VIDEO';
                    
                    return (
                      <div key={post.id} className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 hover:shadow-purple-500/5' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-slate-200/50'
                      }`}>
                        {/* Cover Link Wrapper */}
                        <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block relative aspect-[4/5] overflow-hidden bg-slate-950">
                          {coverUrl ? (
                            <img src={coverUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#0c1a3a] to-slate-900 text-slate-400 p-4">
                              <Icon size={32} style={{ color: typeColor }} className="mb-2 opacity-50" />
                              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{TYPE_LABELS[post.media_type]}</span>
                            </div>
                          )}

                          {/* Shroud Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                          {/* Play Icon/Badge for Video/Reels */}
                          {isVideo && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Play size={20} className="text-white fill-white ml-0.5" />
                            </div>
                          )}

                          {/* Top Corner Grade & Post Type Badge */}
                          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: typeColor }}>
                              {TYPE_LABELS[post.media_type]}
                            </span>
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border text-white" style={{ backgroundColor: `${grade.color}dd`, borderColor: `${grade.color}40` }}>
                              {post.grade}
                            </span>
                          </div>

                          {/* Metric Quick Stats overlaid at bottom */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                              <Eye size={10} className="text-slate-300" />
                              <span className="text-[10px] font-bold">{fmt(post.reach)}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                              <span className="text-[10px] font-bold text-[#60efff]">ER: {post.er}%</span>
                            </div>
                          </div>
                        </a>

                        {/* Details (below cover) */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold leading-relaxed line-clamp-2 flex-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {caption}
                            </p>
                            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-lg transition-all shrink-0 ${
                              isDark ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                            }`}>
                              <ExternalLink size={12} />
                            </a>
                          </div>

                          {/* Detailed metrics grid */}
                          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                            <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Heart size={10} className="text-red-500" />
                                <span className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Likes</span>
                              </div>
                              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.like_count || 0)}</div>
                            </div>
                            <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <MessageSquare size={10} className="text-blue-500" />
                                <span className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Comments</span>
                              </div>
                              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.comments_count || 0)}</div>
                            </div>
                            <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Bookmark size={10} className="text-amber-500" />
                                <span className={`text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saves</span>
                              </div>
                              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.saved || 0)}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-150 dark:border-slate-800/80 pt-2.5">
                            <span className="font-bold">{new Date(post.timestamp).toLocaleDateString('uz-UZ')}</span>
                            <span className="font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">Score: {post.score?.toFixed(0) || '0'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
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
                          <div className={`text-xs font-bold w-6 text-center ${isTop3 ? 'text-amber-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                            {isTop3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                          </div>

                          {/* Thumbnail */}
                          {post.thumbnail_url || post.media_url ? (
                            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="shrink-0 block">
                              <img src={post.thumbnail_url || post.media_url} alt=""
                                className="w-11 h-11 rounded-xl object-cover ring-1 ring-black/5 hover:scale-105 transition-transform duration-300"
                                onError={e => { (e.target as any).style.display = 'none'; }} />
                            </a>
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
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.reach)}</span>
                                {post.anomaly?.type === 'high' && <span title="Anomaliya: Yuqori">🚀</span>}
                                {post.anomaly?.type === 'low' && <span title="Anomaliya: Past">🔴</span>}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>reach</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center gap-1 justify-end">
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.er}%</span>
                              </div>
                              <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>ER</div>
                            </div>
                            <div className="text-right hidden md:block">
                              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(post.saved)}</div>
                              <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>saves</div>
                            </div>

                            {/* Grade badge */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: grade.bg, borderColor: `${grade.color}30` }}>
                              <span className="text-sm font-bold" style={{ color: grade.color }}>{post.grade}</span>
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
              )}
            </div>
          )}

          {/* Content Types Tab */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Turi Taqsimoti</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Post soni bo'yicha</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<GlassmorphicTooltip isDark={isDark} suffix=" ta post" />} />
                    <Legend formatter={(v: any) => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>O'rtacha Reach</h3>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kontent turi bo'yicha solishtirma</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.contentTypes?.types || []} layout="vertical" margin={{ left: 5, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickFormatter={fmt} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} width={70} tickLine={false} axisLine={false} />
                    <Tooltip content={<GlassmorphicTooltip isDark={isDark} />} />
                    <Bar dataKey="avgReach" name="O'rtacha Reach" radius={[0, 8, 8, 0]}>
                      {(data.contentTypes?.types || []).map((t: any, i: number) => <Cell key={i} fill={TYPE_COLORS[t.type] || '#888'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {data.contentTypes?.recommendation && (
                <div className={`lg:col-span-2 rounded-2xl p-4 border flex items-start gap-3 ${isDark ? 'bg-purple-500/8 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                  <TrendingUp size={17} className="text-purple-500 shrink-0 mt-0.5" />
                  <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{data.contentTypes.recommendation}</p>
                </div>
              )}

              {/* Per-type detail cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(data.contentTypes?.types || []).map((t: any) => {
                  const color = TYPE_COLORS[t.type] || '#888';
                  const Icon = TYPE_ICONS[t.type] || Image;
                  return (
                    <div key={t.type} className={`rounded-3xl p-4 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.label}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.count} post</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ l: 'Avg Reach', v: fmt(t.avgReach) }, { l: 'Avg ER', v: `${t.avgER}%` }, { l: 'Avg Saves', v: fmt(t.avgSaves) }, { l: 'Avg Likes', v: fmt(t.avgLikes) }].map(s => (
                          <div key={s.l} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.l}</div>
                            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.v}</div>
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

              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Eng Yaxshi Posting Vaqtlari</h3>
                <p className={`text-xs mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ER (Engagement Rate) asosida tartiblangan</p>
                <div className="space-y-3">
                  {(data.timing?.topSlots || []).map((slot: any, i: number) => {
                    const pct = Math.min(100, (slot.avgER / (data.timing.topSlots[0]?.avgER || 1)) * 100);
                    const colors = ['#f59e0b', '#94a3b8', '#cd7f32', '#0061ff', '#a855f7'];
                    return (
                      <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${colors[i] || '#888'}18` }}>
                          <span className="text-xs font-bold" style={{ color: colors[i] || '#888' }}>{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{slot.dayName} — {slot.timeLabel}</p>
                          <div className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all font-bold" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${isDark ? 'text-[#60efff]' : 'text-purple-600'}`}>ER: {slot.avgER}%</span>
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
              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-purple-500" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Caption uzunligi ↔ Reach</h3>
                </div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  r = <span className="font-bold">{data.correlations?.captionLengthVsReach?.r ?? '—'}</span>
                  {data.correlations?.captionLengthVsReach?.interpretation && (
                    <span className="ml-2">{data.correlations.captionLengthVsReach.interpretation}</span>
                  )}
                </p>
                {data.correlations?.captionBuckets?.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.correlations.captionBuckets} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={fmt} width={45} />
                      <Tooltip content={<GlassmorphicTooltip isDark={isDark} />} />
                      <Bar dataKey="avgReach" name="O'rtacha Reach" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {!data.correlations?.captionBuckets?.length && (
                  <p className={`text-sm py-6 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Caption bucket ma'lumotlari mavjud emas</p>
                )}
              </div>

              {/* Hour vs ER */}
              <div className={`rounded-3xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-purple-500" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Soat ↔ ER%</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  r = <span className="font-bold">{data.correlations?.hourVsER?.r ?? '—'}</span>
                  {data.correlations?.hourVsER?.interpretation && (
                    <span className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.correlations.hourVsER.interpretation}</span>
                  )}
                </p>
              </div>

              {/* Hashtag Count vs Reach */}
              <div className={`rounded-3xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={15} className="text-amber-500" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hashtag soni ↔ Reach</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  r = <span className="font-bold">{data.correlations?.hashtagCountVsReach?.r ?? '—'}</span>
                  {data.correlations?.hashtagCountVsReach?.interpretation && (
                    <span className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{data.correlations.hashtagCountVsReach.interpretation}</span>
                  )}
                </p>
              </div>

              {!data.correlations && (
                <div className={`rounded-3xl p-8 border text-center ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <BarChart2 size={32} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Korrelyatsiya ma'lumotlari mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {/* Hashtag Performance Cloud Tab */}
          {activeTab === 'hashtags' && (
            <div className="space-y-6">
              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className={`font-bold flex items-center text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Hashtag Performance Cloud
                      <InfoTooltip text="Instagram postlarida ishlatilgan hashtaglarning qamrov va jalb qilish (ER) ko'rsatkichlari." isDark={isDark} />
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      DATA Ta'lim o'quv markazi uchun hashtaglar buluti va samaradorlik tahlili
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 bg-pink-500/10 text-pink-500 border border-pink-500/20`}>
                    <Flame size={12} />
                    Trend Tahlili
                  </span>
                </div>

                {/* Cloud Grid */}
                <div className="flex flex-wrap gap-3 items-center justify-center p-6 rounded-2xl bg-slate-950/20 dark:bg-black/20 border border-slate-100 dark:border-slate-800/40 min-h-[180px]">
                  {MOCK_HASHTAGS.map((h: any) => {
                    const isActive = selectedTag?.tag === h.tag;
                    let sizeClass = 'text-xs';
                    if (h.count > 40) sizeClass = 'text-base sm:text-lg';
                    else if (h.count > 30) sizeClass = 'text-sm sm:text-base';
                    else if (h.count > 20) sizeClass = 'text-xs sm:text-sm';
                    
                    return (
                      <button
                        key={h.tag}
                        onClick={() => setSelectedTag(h)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-1.5 border ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 text-white border-transparent shadow-lg shadow-pink-500/20 scale-105'
                            : isDark
                              ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        } ${sizeClass}`}
                      >
                        <Hash size={12} className={isActive ? 'text-white' : 'text-pink-500'} />
                        {h.tag.replace('#', '')}
                        <span className={`text-[9px] font-bold px-1 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {h.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tag Insights */}
              {selectedTag && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Detailed KPI Cards */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`rounded-3xl p-5 border flex flex-col justify-between ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>O'rtacha Reach</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            selectedTag.level === 'High' ? 'bg-green-500/10 text-green-500' : selectedTag.level === 'Medium' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {selectedTag.level} Reach
                          </span>
                        </div>
                        <h4 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(selectedTag.reach)}</h4>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Samaradorlik</span>
                          <span>{((selectedTag.reach / 30000) * 100).toFixed(0)}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-150'}`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (selectedTag.reach / 30000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-3xl p-5 border flex flex-col justify-between ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Engagement Rate (ER%)</span>
                          <span className={`text-xs font-bold ${selectedTag.trend === 'up' ? 'text-green-500' : selectedTag.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                            {selectedTag.trend === 'up' ? '▲ Trendda' : selectedTag.trend === 'down' ? '▼ Pasaygan' : '● Barqaror'}
                          </span>
                        </div>
                        <h4 className={`text-2xl font-extrabold ${isDark ? 'text-[#60efff]' : 'text-purple-600'}`}>{selectedTag.er}%</h4>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Nishdagi o'rtacha (5.2%) bilan solishtirma</span>
                          <span>+{((selectedTag.er - 5.2) > 0 ? (selectedTag.er - 5.2) : 0).toFixed(1)}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-150'}`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0061ff] to-[#60efff] transition-all duration-500"
                            style={{ width: `${Math.min(100, (selectedTag.er / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-3xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'} flex items-center justify-between`}>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>O'rtacha Saqlashlar (Saves)</span>
                        <h4 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTag.saves} ta</h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Bookmark size={18} className="text-amber-500" />
                      </div>
                    </div>

                    <div className={`rounded-3xl p-5 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'} flex items-center justify-between`}>
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ishlatilgan Postlar</span>
                        <h4 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTag.count} marta</h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Layers size={18} className="text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* AI Strategik Tavsiyalar */}
                  <div className={`rounded-3xl p-6 border flex flex-col justify-between ${
                    isDark ? 'bg-[#181028]/60 border-purple-500/20 shadow-purple-950/10 shadow-xl backdrop-blur-md' : 'bg-purple-50/50 border-purple-100 shadow-sm'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                          <Sparkles size={14} className="text-purple-500" />
                        </div>
                        <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Strategik Tavsiyalar</h4>
                      </div>
                      <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                        {selectedTag.er >= 7.5
                          ? "Ushbu hashtag o'ta yuqori samaradorlik ko'rsatmoqda! IT ta'lim sohasidagi trendlar bilan bog'liq Reels va karusellarda uni birinchilardan bo'lib qo'llash tavsiya etilmoqda. Qamrovni maksimal qilish uchun 2-3 ta tegishli o'rtacha chastotali hashtaglar bilan birga ishlating."
                          : selectedTag.er >= 5.5
                            ? "Hashtag o'rtacha va barqarorlikni saqlamoqda. Auditoriya qiziqishi yuqori, lekin qamrovni yanada kengaytirish uchun uni post matnining oxirida emas, balki birinchi izohda (first comment) qoldirishni sinab ko'ring."
                            : "Hashtag bo'yicha auditoriya faolligi past. Uni ishlatish chastotasini kamaytirish va ko'proq yuqori chastotali ta'lim trendidagi hashtaglar (masalan #datatalim, #dasturlash) bilan almashtirish maqsadga muvofiqdir."
                        }
                      </p>
                    </div>
                    <div className={`mt-4 pt-3 border-t text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                      isDark ? 'border-purple-500/10 text-purple-400/80' : 'border-purple-100 text-purple-500'
                    }`}>
                      <span>Tavsiya darajasi:</span>
                      <span>{selectedTag.er >= 7.5 ? "A'lo (Kanal Trendi)" : selectedTag.er >= 5.5 ? "Yaxshi (Qo'llash mumkin)" : "Past (O'zgartirish kerak)"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dedicated Reels Inspector Tab */}
          {activeTab === 'reels' && (
            <div className="space-y-6">
              {/* Reels Select Grid */}
              <div className={`rounded-3xl p-6 border ${isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Play size={14} className="text-purple-500 fill-purple-500" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Tahlil Qilinadigan Reels Videolarini Tanlang</h3>
                    <p className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5`}>SMM va tomosha saqlash ko'rsatkichlarini chuqur tekshirish</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {reels.map((reel: any) => {
                    const isSelected = selectedReel?.id === reel.id;
                    const grade = GRADE_CONFIG[reel.grade] || { color: '#888', bg: '#88888815', label: '' };
                    return (
                      <button
                        key={reel.id}
                        onClick={() => setSelectedReel(reel)}
                        className={`group relative flex gap-3 text-left p-3 rounded-2xl transition-all duration-300 border ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/5'
                            : isDark
                              ? 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                              : 'bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
                          {reel.cover ? (
                            <img src={reel.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                              <Play size={12} className="fill-slate-500" />
                            </div>
                          )}
                          <div className="absolute top-1 left-1 z-10 w-4 h-4 rounded-md flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: grade.color }}>
                            {reel.grade}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between min-w-0 flex-1">
                          <p className={`text-xs font-bold leading-normal line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {reel.caption}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            <Eye size={9} />
                            <span>{fmt(reel.plays)} tomosha</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Reel Detailed Analytics */}
              {selectedReel && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Reel Preview & Core Metrics */}
                  <div className="space-y-6">
                    {/* Cover Preview Card */}
                    <div className={`group relative rounded-3xl border overflow-hidden ${
                      isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                        {selectedReel.cover ? (
                          <img src={selectedReel.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black text-slate-500">
                            <Play size={40} className="fill-slate-500 mb-2" />
                            <span className="text-xs uppercase font-bold tracking-widest">Reels</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70" />

                        {/* Visual play link overlay */}
                        <a
                          href={selectedReel.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-purple-500/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg text-white fill-white cursor-pointer z-10"
                        >
                          <Play size={20} className="ml-0.5 text-white fill-white" />
                        </a>

                        {/* Title overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                          <p className="text-xs font-medium text-purple-350 mb-1">Reel Inspector v1.2</p>
                          <p className="text-sm font-semibold leading-relaxed line-clamp-2">{selectedReel.caption}</p>
                        </div>
                      </div>
                    </div>

                    {/* Standard SMM engagement cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'}`}>
                        <span className={`text-[10px] font-bold text-slate-500 block mb-1`}>Jami Layklar</span>
                        <div className="flex items-center gap-1.5">
                          <Heart size={13} className="text-red-500 shrink-0" />
                          <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(selectedReel.likes)}</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50/50 border-slate-100'}`}>
                        <span className={`text-[10px] font-bold text-slate-500 block mb-1`}>Saqlashlar soni</span>
                        <div className="flex items-center gap-1.5">
                          <Bookmark size={13} className="text-amber-500 shrink-0" />
                          <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(selectedReel.saves)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Retention drop-off curve */}
                  <div className="space-y-6 lg:col-span-2">
                    {/* Retention Curve Card */}
                    <div className={`rounded-3xl p-6 border flex flex-col justify-between ${
                      isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Tomoshabinlarni Ushlab Qolish Dinamikasi (Retention Drop-off)
                          </h4>
                          <span className={`text-xs font-bold text-slate-400`}>O'rtacha ko'rish: {selectedReel.avgPlayDuration}</span>
                        </div>
                        <p className={`text-xs text-slate-500 dark:text-slate-400 mb-6`}>
                          Reels boshlangandan boshlab 25 soniya ichida tomoshabinlarning postda qolish darajasi (foizda)
                        </p>
                      </div>

                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedReel.retentionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a2340' : '#f1f5f9'} vertical={false} />
                            <XAxis dataKey="sec" tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: isDark ? '#475569' : '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                            <Tooltip content={<GlassmorphicTooltip isDark={isDark} suffix="%" />} />
                            <Area type="monotone" name="Qolgan auditoriya" dataKey="retention" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* AI Hook/Retention Strategic feedback card */}
                      <div className={`mt-6 p-4 rounded-2xl border flex gap-3 ${
                        isDark ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-50 border-purple-100'
                      }`}>
                        <Sparkles size={16} className="text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>Reels Hook & Retention Tahlili</h5>
                          <p className={`text-xs leading-relaxed ${isDark ? 'text-purple-400' : 'text-purple-800'}`}>
                            {selectedReel.avgPlayPct >= 70
                              ? "Ilk 3 soniyadagi ushlab qolish juda a'lo darajada (90%+). Bu sarlavha va vizual 'hook' tomoshabinni jalb qilganini bildiradi. 15-soniyadan keyin pasayish minimal, demak postning dinamikasi saqlangan. Ushbu formatni boshqa reelslar uchun ham andoza sifatida ishlating."
                              : selectedReel.avgPlayPct >= 55
                                ? "Ilk 3 soniyada ushlab qolish o'rtacha darajada. Tomoshabinlar kirish qismida qiziqib ketgan, ammo 10-soniyada e'tibor bir oz chalg'igan. Keyingi safar reels boshlanishiga ko'proq dinamik kadrlar va savolli hook qo'shish tavsiya etiladi."
                                : "Ilk soniyalardanoq keskin pasayish kuzatilgan. Sarlavha yoki vizual birinchi kadr tomoshabinni jalb qilolmagan. SMM strategiyasini qayta ko'rib chiqish va ilk 3 soniyaga vizual effektlar, savollar va kutilmagan kadrlarni qo'shish lozim."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Circular dial and engagement stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Plays / Views */}
                      <div className={`rounded-3xl p-5 border flex flex-col justify-between ${
                        isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-500`}>Tomosha Qilingan (Plays)</span>
                        <div className="mt-2">
                          <h4 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(selectedReel.plays)}</h4>
                          <p className="text-[10px] text-green-500 font-bold mt-1">▲ Qamrovga nisbatan {((selectedReel.plays / selectedReel.reach) * 100).toFixed(0)}% yuqori</p>
                        </div>
                      </div>

                      {/* Average Completion */}
                      <div className={`rounded-3xl p-5 border flex flex-col justify-between ${
                        isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-500`}>O'rtacha To'liq Ko'rilgan %</span>
                        <div className="mt-2">
                          <h4 className={`text-2xl font-extrabold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{selectedReel.avgPlayPct}%</h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">SMM nishida o'rtacha ko'rsatkich 48%</p>
                        </div>
                      </div>

                      {/* Like-to-View Conversion Dial */}
                      <div className={`rounded-3xl p-5 border flex items-center gap-4 justify-between ${
                        isDark ? 'bg-slate-900/70 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="flex-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1`}>Ko'rishdan Laykka</span>
                          <h4 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedReel.conversionRatio}%</h4>
                          <span className={`text-[9px] font-bold text-slate-400`}>LTV Konversiyasi</span>
                        </div>

                        {/* Dial SVG indicator */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200 dark:text-slate-800"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-purple-500"
                              strokeWidth="3.5"
                              strokeDasharray={`${Math.min(100, (selectedReel.conversionRatio / 10) * 100)}, 100`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-[9px] font-bold text-slate-650 dark:text-slate-300">
                            {selectedReel.conversionRatio}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
