import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { BookOpen, Users, Eye, Settings, UserPlus, Target, MousePointerClick, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';

interface Stats {
    leads: number;
    marketing: number;
    totalClicks: number;
    todayLeads: number;
}

export default function Dashboard() {
    const { courses, team, visibility } = useStore();
    const { isDark } = useTheme();
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchStats = () => {
        setStatsLoading(true);
        fetch('/api/stats')
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(() => setStats(null))
            .finally(() => setStatsLoading(false));
    };

    useEffect(() => { fetchStats(); }, []);

    const topStats = [
        { title: 'Jami Kurslar', value: courses.length, icon: BookOpen, color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', link: '/paneladmindata/courses' },
        { title: "Jamoa A'zolari", value: team.length, icon: Users, color: 'text-purple-500', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50', link: '/paneladmindata/team' },
        { title: "Faol Bo'limlar", value: Object.values(visibility).filter(Boolean).length, icon: Eye, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', link: '/paneladmindata/visibility' },
    ];

    const crmStats = stats ? [
        { title: 'Jami Arizalar', value: stats.leads, icon: UserPlus, color: 'text-green-500', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', link: '/paneladmindata/leads' },
        { title: "Bugungi Arizalar", value: stats.todayLeads, icon: TrendingUp, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50', link: '/paneladmindata/leads' },
        { title: 'Marketing Linklar', value: stats.marketing, icon: Target, color: 'text-pink-500', bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50', link: '/paneladmindata/marketing' },
        { title: 'Jami Kirishlar', value: stats.totalClicks, icon: MousePointerClick, color: 'text-cyan-500', bg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50', link: '/paneladmindata/marketing' },
    ] : [];

    const cardCls = `block p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${isDark ? 'bg-slate-900/50 border-white/5 shadow-black/50 hover:bg-slate-800' : 'bg-white border-slate-100'}`;

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
                <div>
                    <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
                    <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xush kelibsiz! Sayt ma'lumotlarini shu yerdan boshqaring.</p>
                </div>
                <button onClick={fetchStats} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                    <RefreshCw size={16} className={statsLoading ? 'animate-spin' : ''} />
                    Yangilash
                </button>
            </motion.div>

            {/* Site stats */}
            <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sayt Ma'lumotlari</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {topStats.map((stat, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.07 }}>
                            <Link to={stat.link} className={cardCls}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                                        <stat.icon size={24} className={stat.color} />
                                    </div>
                                    <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                                </div>
                                <h3 className={`text-base font-bold transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'}`}>{stat.title}</h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CRM stats */}
            <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CRM & Marketing</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {statsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`p-6 rounded-[2rem] border animate-pulse ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
                                <div className={`w-12 h-12 rounded-2xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                <div className={`h-8 w-16 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                <div className={`h-4 w-24 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                            </div>
                        ))
                    ) : (
                        crmStats.map((stat, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.07 }}>
                                <Link to={stat.link} className={cardCls}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg}`}>
                                        <stat.icon size={22} className={stat.color} />
                                    </div>
                                    <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                                    <h3 className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.title}</h3>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className={`p-8 rounded-[2rem] border shadow-sm ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
                <h2 className={`text-xl font-bold mb-5 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Settings size={20} className={isDark ? 'text-[#60efff]' : 'text-blue-600'} />
                    Tezkor Amallar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { to: '/paneladmindata/courses', label: "Yangi kurs qo'shish" },
                        { to: '/paneladmindata/team', label: "Xodim qo'shish" },
                        { to: '/paneladmindata/media', label: "Asosiy matnlarni tahrirlash" },
                        { to: '/paneladmindata/visibility', label: "Bo'limlarni yoqish/o'chirish" },
                        { to: '/paneladmindata/marketing', label: "Marketing link yaratish" },
                        { to: '/paneladmindata/leads', label: "Arizalarni ko'rish" },
                    ].map((item) => (
                        <Link key={item.to} to={item.to} className={`p-4 rounded-2xl font-bold transition-colors border text-sm ${isDark ? 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
