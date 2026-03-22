import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { GitMerge, TrendingUp, DollarSign, Flame, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface FunnelStep {
    status: string;
    count: number;
}

interface SourceStat {
    source_ref: string;
    leads: number;
    enrolled: number;
}

interface WeeklyStat {
    week: string;
    total: number;
    contacted: number;
}

interface PipelineStats {
    funnel: FunnelStep[];
    bySource: SourceStat[];
    pipelineValue: number;
    hotLeads: number;
    weeklyStats: WeeklyStat[];
}

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('adminToken'),
});

const FUNNEL_STEPS = [
    { key: 'new', label: 'Yangi', color: '#3b82f6' },
    { key: 'contacted', label: 'Bog\'landi', color: '#8b5cf6' },
    { key: 'enrolled', label: 'Yozildi', color: '#10b981' },
    { key: 'rejected', label: 'Rad etildi', color: '#ef4444' },
];

const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function StatCard({ label, value, icon: Icon, color, bg, isDark }: {
    label: string; value: string | number; icon: React.ElementType; color: string; bg: string; isDark: boolean;
}) {
    const card = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
    const text = isDark ? 'text-gray-100' : 'text-gray-900';
    const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-5 ${card} flex items-center gap-4`}>
            <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
            </div>
            <div>
                <p className={`text-xs font-medium ${subtext}`}>{label}</p>
                <p className={`text-xl font-bold mt-0.5 ${text}`}>{value}</p>
            </div>
        </motion.div>
    );
}

export default function ManagePipeline() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState<PipelineStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pipeline/stats', { headers: authHeaders() });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setStats(data);
        } catch {
            toast.error('Pipeline statistikasini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const card = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
    const text = isDark ? 'text-gray-100' : 'text-gray-900';
    const subtext = isDark ? 'text-gray-400' : 'text-gray-500';
    const tableHead = isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600';
    const tableRow = isDark ? 'border-gray-700 hover:bg-gray-700/40' : 'border-gray-100 hover:bg-gray-50';

    // Funnel data
    const funnelData = FUNNEL_STEPS.map(step => {
        const found = stats?.funnel?.find(f => f.status === step.key);
        return { ...step, count: found?.count ?? 0 };
    });
    const maxFunnelCount = Math.max(...funnelData.map(f => f.count), 1);

    // Stats for header cards
    const hotLeads = stats?.hotLeads ?? 0;
    const pipelineValue = stats?.pipelineValue ?? 0;
    const enrolledCount = stats?.funnel?.find(f => f.status === 'enrolled')?.count ?? 0;

    // Source bar chart data
    const bySource = (stats?.bySource ?? []).map(s => ({
        name: s.source_ref || 'Noma\'lum',
        enrolled: s.enrolled,
        leads: s.leads,
    }));

    // Conversion % for source table
    const sourceTableData = (stats?.bySource ?? []).map(s => ({
        ...s,
        conversion: s.leads > 0 ? ((s.enrolled / s.leads) * 100).toFixed(1) : '0.0',
    }));

    const tooltipStyle = {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '8px',
        color: isDark ? '#f3f4f6' : '#111827',
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw size={32} className="animate-spin text-blue-500" />
                    <p className={`text-sm ${subtext}`}>Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <GitMerge size={22} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-bold ${text}`}>Pipeline Tahlili</h1>
                        <p className={`text-sm mt-0.5 ${subtext}`}>Lidlar va konversiya ko'rsatkichlari</p>
                    </div>
                </div>
                <button
                    onClick={fetchStats}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <RefreshCw size={14} />
                    Yangilash
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Hot Leads"
                    value={hotLeads}
                    icon={Flame}
                    color="text-orange-500"
                    bg={isDark ? 'bg-orange-900/30' : 'bg-orange-50'}
                    isDark={isDark}
                />
                <StatCard
                    label="Pipeline qiymati"
                    value={pipelineValue.toLocaleString('uz-UZ') + " so'm"}
                    icon={DollarSign}
                    color="text-green-500"
                    bg={isDark ? 'bg-green-900/30' : 'bg-green-50'}
                    isDark={isDark}
                />
                <StatCard
                    label="Jami yozilganlar"
                    value={enrolledCount}
                    icon={Users}
                    color="text-blue-500"
                    bg={isDark ? 'bg-blue-900/30' : 'bg-blue-50'}
                    isDark={isDark}
                />
            </div>

            {/* Section 1: Conversion Funnel */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-2xl p-6 mb-6 ${card}`}
            >
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp size={18} className="text-blue-500" />
                    <h2 className={`text-base font-bold ${text}`}>Konversiya Funnel</h2>
                </div>
                <div className="space-y-3">
                    {funnelData.map((step, idx) => {
                        const pct = maxFunnelCount > 0 ? (step.count / maxFunnelCount) * 100 : 0;
                        const prevCount = idx > 0 ? funnelData[idx - 1].count : null;
                        const dropPct = prevCount && prevCount > 0
                            ? (((prevCount - step.count) / prevCount) * 100).toFixed(1)
                            : null;

                        return (
                            <div key={step.key}>
                                {idx > 0 && dropPct !== null && (
                                    <div className={`flex items-center gap-1.5 text-xs ${subtext} mb-2 ml-1`}>
                                        <ArrowRight size={12} />
                                        <span>{dropPct}% o'tish</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="w-24 text-right">
                                        <span className={`text-xs font-medium ${subtext}`}>{step.label}</span>
                                    </div>
                                    <div className={`flex-1 rounded-full h-8 overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(pct, 2)}%` }}
                                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                                            className="h-full rounded-full flex items-center px-3"
                                            style={{ backgroundColor: step.color }}
                                        >
                                            <span className="text-white text-xs font-bold whitespace-nowrap">
                                                {step.count}
                                            </span>
                                        </motion.div>
                                    </div>
                                    <div className="w-12 text-right">
                                        <span className={`text-xs font-semibold ${text}`}>
                                            {pct.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Section 2: Source Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
            >
                {/* Bar Chart */}
                <div className={`rounded-2xl p-6 ${card}`}>
                    <h2 className={`text-base font-bold mb-5 ${text}`}>Manba bo'yicha yozilganlar</h2>
                    {bySource.length === 0 ? (
                        <div className={`flex items-center justify-center h-40 text-sm ${subtext}`}>Ma'lumot yo'q</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={bySource} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="enrolled" name="Yozildi" radius={[0, 4, 4, 0]}>
                                    {bySource.map((_, i) => (
                                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Source Table */}
                <div className={`rounded-2xl overflow-hidden ${card}`}>
                    <div className="p-5 pb-0">
                        <h2 className={`text-base font-bold mb-4 ${text}`}>Manba Tahlili</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`text-xs uppercase ${tableHead}`}>
                                    <th className="px-5 py-3 text-left font-semibold">Manba</th>
                                    <th className="px-4 py-3 text-right font-semibold">Lidlar</th>
                                    <th className="px-4 py-3 text-right font-semibold">Yozildi</th>
                                    <th className="px-4 py-3 text-right font-semibold">Konv.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sourceTableData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className={`px-5 py-8 text-center text-sm ${subtext}`}>Ma'lumot yo'q</td>
                                    </tr>
                                ) : sourceTableData.map((s, i) => (
                                    <tr key={i} className={`${tableRow} transition-colors`}>
                                        <td className={`px-5 py-3 font-medium ${text}`}>{s.source_ref || "Noma'lum"}</td>
                                        <td className={`px-4 py-3 text-right ${subtext}`}>{s.leads}</td>
                                        <td className={`px-4 py-3 text-right ${subtext}`}>{s.enrolled}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                Number(s.conversion) >= 30
                                                    ? isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                                                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {s.conversion}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* Section 3: Weekly Cohort */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-2xl overflow-hidden mb-6 ${card}`}
            >
                <div className="p-5 pb-0">
                    <h2 className={`text-base font-bold mb-4 ${text}`}>Haftalik Kohort</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-xs uppercase ${tableHead}`}>
                                <th className="px-5 py-3 text-left font-semibold">Hafta</th>
                                <th className="px-4 py-3 text-right font-semibold">Jami lidlar</th>
                                <th className="px-4 py-3 text-right font-semibold">Bog'landi %</th>
                                <th className="px-4 py-3 text-left font-semibold">Faollik</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(!stats?.weeklyStats || stats.weeklyStats.length === 0) ? (
                                <tr>
                                    <td colSpan={4} className={`px-5 py-8 text-center text-sm ${subtext}`}>Ma'lumot yo'q</td>
                                </tr>
                            ) : stats.weeklyStats.map((w, i) => {
                                const contactedPct = w.total > 0 ? ((w.contacted / w.total) * 100) : 0;
                                return (
                                    <tr key={i} className={`${tableRow} transition-colors`}>
                                        <td className={`px-5 py-3 font-medium ${text}`}>{w.week}</td>
                                        <td className={`px-4 py-3 text-right ${subtext}`}>{w.total}</td>
                                        <td className={`px-4 py-3 text-right font-medium ${text}`}>{contactedPct.toFixed(1)}%</td>
                                        <td className="px-5 py-3">
                                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-32`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${contactedPct}%` }}
                                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                                    className="h-full rounded-full bg-blue-500"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Section 4: Revenue Note */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-2xl p-6 ${card} flex items-center gap-4`}
            >
                <div className={`p-3 rounded-xl ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <DollarSign size={24} className="text-green-500" />
                </div>
                <div>
                    <p className={`text-sm font-medium ${subtext}`}>Yozilganlardan jami tushum (pipeline qiymati)</p>
                    <p className={`text-2xl font-bold mt-0.5 ${text}`}>
                        {pipelineValue.toLocaleString('uz-UZ')} <span className="text-base font-medium">so'm</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
