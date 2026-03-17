import React, { useState, useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { Users, Phone, Calendar, Target, Trash2, Download, Filter, RefreshCw, CheckCircle, MessageSquare, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Lead {
    id: number;
    name: string;
    phone: string;
    course_id: string;
    source_ref: string;
    status: 'new' | 'contacted' | 'enrolled' | 'rejected';
    created_at: string;
}

const STATUS_CONFIG = {
    new: { label: "Yangi", icon: Clock, cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    contacted: { label: "Bog'landi", icon: MessageSquare, cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    enrolled: { label: "Yozildi", icon: CheckCircle, cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
    rejected: { label: "Rad etildi", icon: XCircle, cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
};

export default function ManageLeads() {
    const { isDark } = useTheme();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const fetchLeads = async (status = filterStatus) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status !== 'all') params.set('status', status);
            const res = await fetch('/api/leads?' + params.toString());
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('Arizalarni yuklashda xatolik');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleStatusChange = async (id: number, status: Lead['status']) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
            toast.success('Status yangilandi!');
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.filter(l => l.id !== id));
            toast.success("Ariza o'chirildi");
        } catch {
            toast.error('Xatolik yuz berdi');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleFilterChange = (status: string) => {
        setFilterStatus(status);
        fetchLeads(status);
    };

    const exportCSV = () => {
        const headers = ['ID', 'Ism', 'Telefon', 'Kurs', 'Manba', 'Status', 'Sana'];
        const rows = leads.map(l => [
            l.id,
            `"${l.name}"`,
            l.phone,
            `"${l.course_id || 'Umumiy'}"`,
            l.source_ref || 'Organik',
            STATUS_CONFIG[l.status]?.label || l.status,
            new Date(l.created_at).toLocaleString('uz-UZ')
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV yuklab olindi!');
    };

    const statusCounts = leads.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className={`text-4xl font-black mb-1 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Users className="text-[#00b26b]" size={34} />
                        Arizalar (CRM)
                    </h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Barcha kelib tushgan arizalar boshqaruvi.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchLeads()} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={exportCSV} disabled={leads.length === 0} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                        <Download size={16} /> CSV
                    </button>
                    <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        Jami: <span className="text-lg text-[#00b26b]">{leads.length}</span>
                    </div>
                </div>
            </div>

            {/* Status summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(STATUS_CONFIG) as [Lead['status'], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(filterStatus === key ? 'all' : key)}
                        className={`p-4 rounded-2xl border text-left transition-all ${filterStatus === key ? (isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50') : isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                    >
                        <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{statusCounts[key] || 0}</div>
                        <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cfg.label}</div>
                    </button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                {['all', 'new', 'contacted', 'enrolled', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => handleFilterChange(s)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${filterStatus === s
                            ? 'bg-[#0061ff] text-white border-[#0061ff]'
                            : isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        {s === 'all' ? 'Barchasi' : STATUS_CONFIG[s as Lead['status']]?.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} border-b text-xs font-bold tracking-wide text-slate-500 uppercase whitespace-nowrap`}>
                                <th className="px-5 py-4">F.I.O</th>
                                <th className="px-5 py-4">Raqam</th>
                                <th className="px-5 py-4">Kurs</th>
                                <th className="px-5 py-4">Manba</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Sana</th>
                                <th className="px-5 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className={`h-5 rounded-lg animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} style={{ width: j === 0 ? '120px' : j === 6 ? '60px' : '80px' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <Users size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
                                        <p className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {filterStatus !== 'all' ? "Bu statusda arizalar yo'q" : "Hozircha arizalar yo'q"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => {
                                    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                                    const StatusIcon = statusCfg.icon;
                                    return (
                                        <tr key={lead.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'}`}>
                                            <td className="px-5 py-4 font-bold whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{lead.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-blue-500 hover:underline font-medium text-sm">
                                                    <Phone size={14} /> {lead.phone}
                                                </a>
                                            </td>
                                            <td className={`px-5 py-4 font-medium text-sm whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {lead.course_id || 'Umumiy'}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {lead.source_ref ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800`}>
                                                        <Target size={11} /> {lead.source_ref}
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Organik</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <select
                                                    value={lead.status || 'new'}
                                                    onChange={e => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                                        <option key={val} value={val}>{cfg.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={`px-5 py-4 text-xs whitespace-nowrap flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <Calendar size={12} />
                                                {new Date(lead.created_at).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {deleteConfirmId === lead.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleDelete(lead.id)} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20">Ha</button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>Yo'q</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(lead.id)}
                                                        className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-slate-700' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
