import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    UserPlus, MousePointerClick, RefreshCw, Eye, Compass, ArrowUpRight, ArrowDownRight, Minus,
    AlertTriangle, Inbox, ArrowRight, Link2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';
import {
    ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

interface StatsData {
    totalLeads: number;
    todayLeads: number;
    yesterdayLeads?: number;
    totalLinks: number;
    leadsPerDay: { date: string; count: number }[];
    leadsByCourse: { course_id: string; count: number }[];
    topLinks: { name: string; ref_code: string; clicks: number; leads_count: number }[];
    sourceAttribution?: { source_ref: string; count: number }[];
    siteVisits: number;
    todaySiteVisits: number;
    yesterdaySiteVisits: number;
    arizaViews: number;
    careerTestCompletions: number;
    siteVisitsPerDay: { date: string; count: number }[];
}

type Period = 7 | 14 | 30;
const PERIODS: Period[] = [7, 14, 30];

const nf = (n: number) => new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ');
const pretty = (s: string) => (s || 'Umumiy').replace(/_/g, ' ');
const pct = (a: number, b: number) => (b > 0 ? Math.min((a / b) * 100, 999) : 0);
const fmtPct = (v: number) => `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}%`;

/** Oxirgi N kun (UTC, serverdagi date('now') kabi) bo'yicha uzluksiz qator; yo'q kunlar 0. */
function buildSeries(n: number, a: { date: string; count: number }[] = [], b: { date: string; count: number }[] = []) {
    const ma = new Map(a.map(r => [r.date, r.count]));
    const mb = new Map(b.map(r => [r.date, r.count]));
    return Array.from({ length: n }, (_, i) => {
        const date = new Date(Date.now() - (n - 1 - i) * 864e5).toISOString().slice(0, 10);
        return { date, leads: ma.get(date) ?? 0, visits: mb.get(date) ?? 0 };
    });
}

const Delta: React.FC<{ today: number; yesterday: number; label: string }> = ({ today, yesterday, label }) => {
    const diff = today - yesterday;
    const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
    const color = diff > 0 ? 'var(--a-green-ink)' : diff < 0 ? 'var(--a-red-ink)' : 'var(--a-fg-3)';
    const rel = yesterday > 0 ? ` (${diff > 0 ? '+' : ''}${Math.round((diff / yesterday) * 100)}%)` : '';
    return (
        <div className="flex items-center gap-1.5 text-xs mt-3 flex-wrap">
            <span className="inline-flex items-center gap-0.5 font-semibold a-num" style={{ color }}>
                <Icon size={14} aria-hidden="true" />
                {diff > 0 ? '+' : ''}{diff}{rel}
            </span>
            <span className="a-muted">{label}</span>
        </div>
    );
};

const Skeleton: React.FC = () => (
    <div className="space-y-6" aria-busy="true" aria-label="Yuklanmoqda">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="a-card a-card-pad">
                    <div className="a-skel h-4 w-24 mb-5" />
                    <div className="a-skel h-9 w-20 mb-4" />
                    <div className="a-skel h-3 w-28" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="a-card a-card-pad lg:col-span-2"><div className="a-skel h-[300px] w-full" /></div>
            <div className="a-card a-card-pad"><div className="a-skel h-[300px] w-full" /></div>
        </div>
    </div>
);

const BarList: React.FC<{ rows: { label: string; value: number }[]; color: string; total?: number }> = ({ rows, color, total }) => {
    const max = Math.max(...rows.map(r => r.value), 1);
    const sum = total ?? rows.reduce((s, r) => s + r.value, 0);
    return (
        <ul className="space-y-3.5">
            {rows.map((r, i) => (
                <li key={r.label + i}>
                    <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
                        <span className="truncate font-medium" title={pretty(r.label)}>{pretty(r.label)}</span>
                        <span className="shrink-0 a-num text-[13px]">
                            <b className="font-semibold">{nf(r.value)}</b>
                            <span className="a-muted ml-2">{fmtPct(pct(r.value, sum))}</span>
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--a-surface-2)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(r.value / max) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
};

const CardHead: React.FC<{ title: string; hint?: string; right?: React.ReactNode }> = ({ title, hint, right }) => (
    <div className="flex items-start justify-between gap-3 mb-5">
        <div>
            <h2 className="a-h2">{title}</h2>
            {hint && <p className="a-sub mt-0.5" style={{ fontSize: '.8rem' }}>{hint}</p>}
        </div>
        {right}
    </div>
);

export default function Dashboard() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [period, setPeriod] = useState<Period>(14);
    const [showVisits, setShowVisits] = useState(true);

    const fetchStats = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        const token = localStorage.getItem('adminToken');
        fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
            .then((data: StatsData) => {
                if (!data || !Array.isArray(data.leadsPerDay)) throw new Error('bad');
                setStats({
                    ...data,
                    siteVisitsPerDay: data.siteVisitsPerDay ?? [],
                    leadsByCourse: data.leadsByCourse ?? [],
                    topLinks: data.topLinks ?? [],
                });
                setFailed(false);
                setLastUpdated(new Date());
            })
            .catch(() => { if (!silent) setStats(null); setFailed(true); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(true), 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const series = useMemo(
        () => buildSeries(period, stats?.leadsPerDay, stats?.siteVisitsPerDay),
        [period, stats],
    );
    const periodLeads = series.reduce((s, r) => s + r.leads, 0);
    const periodVisits = series.reduce((s, r) => s + r.visits, 0);

    // Chart ranglari (SVG ichida CSS o'zgaruvchisiz ham ishonchli bo'lsin)
    const blue = isDark ? '#4d8dff' : '#0061ff';
    const cyan = isDark ? '#60efff' : '#00a3b8';
    const axis = isDark ? '#8590a2' : '#6b7587';
    const grid = isDark ? 'rgba(255,255,255,.07)' : '#e3e8f0';
    const tooltipStyle: React.CSSProperties = {
        background: isDark ? '#13161d' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,.14)' : '#cfd7e3'}`,
        borderRadius: 12,
        color: isDark ? '#f3f5f9' : '#0b1220',
        boxShadow: '0 12px 30px -12px rgba(0,0,0,.5)',
        fontSize: 13,
        padding: '8px 12px',
    };

    const kpis = stats ? [
        {
            title: 'Sayt tashriflari', value: stats.siteVisits, icon: Eye, tone: 'var(--a-blue-ink)',
            foot: <Delta today={stats.todaySiteVisits} yesterday={stats.yesterdaySiteVisits} label={`bugun, kecha ${nf(stats.yesterdaySiteVisits)}`} />,
            sub: `${period} kunda: ${nf(periodVisits)}`,
        },
        {
            title: 'Karyera testi', value: stats.careerTestCompletions, icon: Compass, tone: 'var(--a-cyan-ink)',
            foot: null, sub: 'Testni tugatganlar',
        },
        {
            title: 'Ariza sahifasi', value: stats.arizaViews, icon: MousePointerClick, tone: 'var(--a-fg-2)',
            foot: null, sub: 'Sahifaga kirganlar',
        },
        {
            title: 'Arizalar', value: stats.totalLeads, icon: UserPlus, tone: 'var(--a-green-ink)',
            foot: <Delta today={stats.todayLeads} yesterday={stats.yesterdayLeads ?? 0} label={`bugun, kecha ${nf(stats.yesterdayLeads ?? 0)}`} />,
            sub: `${period} kunda: ${nf(periodLeads)}`,
        },
    ] : [];

    const funnel = stats ? [
        { label: 'Sayt tashriflari', value: stats.siteVisits, color: 'var(--a-blue)' },
        { label: 'Ariza sahifasi', value: stats.arizaViews, color: '#2f9bff' },
        { label: 'Yuborilgan arizalar', value: stats.totalLeads, color: 'var(--a-green)' },
    ] : [];
    const funnelMax = Math.max(...funnel.map(f => f.value), 1);

    const sources = (stats?.sourceAttribution ?? []).map(s => ({ label: s.source_ref, value: s.count }));
    const courses = (stats?.leadsByCourse ?? []).slice(0, 6).map(c => ({ label: c.course_id, value: c.count }));

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="a-kicker mb-2">Umumiy koʻrinish</p>
                    <h1 className="a-h1">Dashboard</h1>
                    <p className="a-sub mt-1.5">
                        Tashriflar, arizalar va manbalar
                        {lastUpdated && <span className="a-muted"> · {lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} da yangilandi</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="a-tabs" role="tablist" aria-label="Davr">
                        {PERIODS.map(p => (
                            <button key={p} type="button" role="tab" aria-selected={period === p} className="a-tab a-num" onClick={() => setPeriod(p)}>
                                {p} kun
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => fetchStats()} className="a-btn" aria-label="Yangilash">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Yangilash</span>
                    </button>
                </div>
            </motion.div>

            {loading && !stats && <Skeleton />}

            {!loading && !stats && failed && (
                <div className="a-card a-empty" role="alert">
                    <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: 'var(--a-amber-ink)' }} />
                    <p className="a-h2" style={{ color: 'var(--a-fg)' }}>Statistikani yuklab boʻlmadi</p>
                    <p className="a-sub mt-1 mb-5">Server javob bermadi yoki sessiya tugagan. Qayta urinib koʻring.</p>
                    <button type="button" onClick={() => fetchStats()} className="a-btn a-btn-primary">
                        <RefreshCw size={15} /> Qayta urinish
                    </button>
                </div>
            )}

            {stats && (
                <>
                    {failed && (
                        <div className="a-badge is-amber" role="status">Yangilash muvaffaqiyatsiz — eski maʼlumot koʻrsatilmoqda</div>
                    )}

                    {/* KPI */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                        {kpis.map((k, i) => (
                            <motion.div key={k.title} className="a-card a-card-pad" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <span className="text-[13px] font-medium" style={{ color: 'var(--a-fg-2)' }}>{k.title}</span>
                                    <k.icon size={17} style={{ color: k.tone }} aria-hidden="true" />
                                </div>
                                <div className="a-num font-semibold text-[1.75rem] sm:text-[2.1rem] leading-none">{nf(k.value)}</div>
                                <div className="a-muted text-xs mt-2 a-num">{k.sub}</div>
                                {k.foot}
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart + funnel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <motion.section className="a-card a-card-pad lg:col-span-2 min-w-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <CardHead
                                title="Kunlik arizalar"
                                hint={`Oxirgi ${period} kun · jami ${nf(periodLeads)} ta ariza`}
                                right={
                                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer min-h-[36px]" style={{ color: 'var(--a-fg-2)' }}>
                                        <input type="checkbox" checked={showVisits} onChange={e => setShowVisits(e.target.checked)} className="w-4 h-4" style={{ accentColor: 'var(--a-blue)' }} />
                                        Tashriflar
                                    </label>
                                }
                            />
                            <div className="h-[280px] sm:h-[320px] -ml-2" role="img" aria-label={`Oxirgi ${period} kunlik arizalar va tashriflar grafigi`}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={series} margin={{ top: 8, right: showVisits ? 4 : 12, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={blue} stopOpacity={0.32} />
                                                <stop offset="100%" stopColor={blue} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke={grid} strokeDasharray="3 4" vertical={false} />
                                        <XAxis
                                            dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={18}
                                            tick={{ fill: axis, fontSize: 11 }}
                                            tickFormatter={(v: string) => `${v.slice(8, 10)}.${v.slice(5, 7)}`}
                                        />
                                        <YAxis yAxisId="l" width={34} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} />
                                        {showVisits && (
                                            <YAxis yAxisId="r" orientation="right" width={40} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: axis, fontSize: 11 }} />
                                        )}
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            cursor={{ stroke: axis, strokeDasharray: '3 4' }}
                                            labelFormatter={(v: string) => `${v.slice(8, 10)}.${v.slice(5, 7)}.${v.slice(0, 4)}`}
                                        />
                                        <Legend verticalAlign="top" align="left" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: axis, paddingLeft: 8 }} />
                                        <Area isAnimationActive={false} yAxisId="l" type="monotone" dataKey="leads" name="Arizalar" stroke={blue} strokeWidth={2.4} fill="url(#leadFill)" dot={period <= 14 ? { r: 3, fill: blue, strokeWidth: 0 } : false} activeDot={{ r: 5 }} />
                                        {showVisits && (
                                            <Line isAnimationActive={false} yAxisId="r" type="monotone" dataKey="visits" name="Tashriflar" stroke={cyan} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                        )}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.section>

                        <motion.section className="a-card a-card-pad min-w-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <CardHead title="Konversiya voronkasi" hint="Barcha vaqt boʻyicha" />
                            <div className="space-y-1">
                                {funnel.map((f, i) => {
                                    const prev = i > 0 ? funnel[i - 1].value : null;
                                    return (
                                        <React.Fragment key={f.label}>
                                            {prev !== null && (
                                                <div className="flex items-center gap-2 py-1.5 pl-1 text-xs a-num" style={{ color: 'var(--a-fg-3)' }}>
                                                    <ArrowRight size={13} className="rotate-90" aria-hidden="true" />
                                                    <span className="font-semibold" style={{ color: 'var(--a-fg-2)' }}>{fmtPct(pct(f.value, prev))}</span>
                                                    <span>oʻtdi</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-baseline justify-between text-sm mb-1.5">
                                                    <span className="font-medium">{f.label}</span>
                                                    <b className="a-num font-semibold">{nf(f.value)}</b>
                                                </div>
                                                <div className="h-9 rounded-[10px] overflow-hidden" style={{ background: 'var(--a-surface-2)' }}>
                                                    <motion.div
                                                        className="h-full rounded-[10px]"
                                                        style={{ background: f.color, minWidth: 6 }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(f.value / funnelMax) * 100}%` }}
                                                        transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                                    />
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                            <div className="a-divider my-5" />
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="a-kicker">Umumiy konversiya</div>
                                    <div className="a-num font-semibold text-2xl mt-1">{fmtPct(pct(stats.totalLeads, stats.siteVisits))}</div>
                                </div>
                                <div className="text-right">
                                    <div className="a-kicker">Ariza formasi</div>
                                    <div className="a-num font-semibold text-2xl mt-1" style={{ color: 'var(--a-green-ink)' }}>{fmtPct(pct(stats.totalLeads, stats.arizaViews))}</div>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Sources + courses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <section className="a-card a-card-pad min-w-0">
                            <CardHead title="Manbalar" hint="Arizalar qayerdan kelgan" />
                            {sources.length ? <BarList rows={sources} color="var(--a-blue)" /> : <div className="a-empty">Manba maʼlumoti yoʻq</div>}
                        </section>
                        <section className="a-card a-card-pad min-w-0">
                            <CardHead title="Top kurslar" hint="Arizalar soni boʻyicha" />
                            {courses.length ? <BarList rows={courses} color="var(--a-green)" /> : <div className="a-empty">Kurs boʻyicha ariza yoʻq</div>}
                        </section>
                    </div>

                    {/* Top links */}
                    <section className="a-card min-w-0">
                        <div className="a-card-pad pb-2 flex items-start justify-between gap-3">
                            <CardHead title="Top marketing havolalar" hint="Kirishlar boʻyicha, 5 tagacha" />
                            <Link to="/paneladmindata/marketing" className="a-btn a-btn-ghost shrink-0" style={{ minHeight: 36 }}>
                                <Link2 size={15} /> <span className="hidden sm:inline">Boshqarish</span>
                            </Link>
                        </div>
                        {stats.topLinks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="a-table" style={{ minWidth: 520 }}>
                                    <thead>
                                        <tr>
                                            <th>Nomi</th><th>Kod</th>
                                            <th style={{ textAlign: 'right' }}>Kirishlar</th>
                                            <th style={{ textAlign: 'right' }}>Arizalar</th>
                                            <th style={{ textAlign: 'right' }}>Konversiya</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topLinks.map((l, i) => {
                                            const r = pct(l.leads_count, l.clicks);
                                            return (
                                                <tr key={l.ref_code + i}>
                                                    <td className="font-medium">{l.name}</td>
                                                    <td><code className="a-num text-xs px-2 py-1 rounded-md" style={{ background: 'var(--a-surface-2)' }}>{l.ref_code}</code></td>
                                                    <td className="a-num" style={{ textAlign: 'right' }}>{nf(l.clicks)}</td>
                                                    <td className="a-num" style={{ textAlign: 'right' }}>{nf(l.leads_count)}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <span className={`a-badge ${r >= 10 ? 'is-green' : r >= 5 ? 'is-amber' : ''} a-num`}>{fmtPct(r)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="a-empty">Marketing havolalar yoʻq</div>
                        )}
                    </section>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2">
                        <Link to="/paneladmindata/leads" className="a-btn a-btn-primary"><Inbox size={16} /> Arizalarni koʻrish</Link>
                        <Link to="/paneladmindata/courses" className="a-btn">Yangi kurs</Link>
                        <Link to="/paneladmindata/marketing" className="a-btn">Marketing havola yaratish</Link>
                        <Link to="/paneladmindata/media" className="a-btn">Matnlarni tahrirlash</Link>
                    </div>
                </>
            )}
        </div>
    );
}
