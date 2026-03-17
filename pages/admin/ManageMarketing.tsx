import React, { useState, useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { Plus, Trash2, Copy, BarChart3, Target, ExternalLink, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

interface MarketingLink {
    id: number;
    name: string;
    ref_code: string;
    target_url: string;
    clicks: number;
    leads_count: number;
    created_at: string;
}

export default function ManageMarketing() {
    const { isDark } = useTheme();
    const [links, setLinks] = useState<MarketingLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ name: '', targetUrl: '/apply' });
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/marketing-links');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setLinks(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Linklarni yuklashda xatolik');
            setLinks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLinks(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLinkData.name.trim()) return;
        try {
            const res = await fetch('/api/marketing-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLinkData),
            });
            if (res.ok) {
                toast.success("Link muvaffaqiyatli yaratildi");
                setIsAdding(false);
                setNewLinkData({ name: '', targetUrl: '/apply' });
                fetchLinks();
            }
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id: number) => {
        if (deleteConfirmId !== id) {
            setDeleteConfirmId(id);
            setTimeout(() => setDeleteConfirmId(null), 4000);
            return;
        }
        try {
            const res = await fetch(`/api/marketing-links/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Link o'chirildi");
                setLinks(prev => prev.filter(l => l.id !== id));
            }
        } catch {
            toast.error('Xatolik yuz berdi');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleCopy = (link: MarketingLink) => {
        const origin = window.location.origin;
        const target = link.target_url.startsWith('http') ? link.target_url : origin + link.target_url;
        const separator = target.includes('?') ? '&' : '?';
        const fullUrl = `${target}${separator}ref=${link.ref_code}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success("Link nusxalandi!");
    };

    const getFullUrl = (link: MarketingLink) => {
        const origin = window.location.origin;
        const target = link.target_url.startsWith('http') ? link.target_url : origin + link.target_url;
        const sep = target.includes('?') ? '&' : '?';
        return `${target}${sep}ref=${link.ref_code}`;
    };

    const inputCls = `w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className={`text-4xl font-black mb-1 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Target className="text-blue-500" size={34} />
                        Marketing & Reklama
                    </h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Target, bloggerlar va boshqa manbalar uchun maxsus kuzatuv havolalari.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchLinks} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus size={18} />
                        Yangi Link
                    </button>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Jami Linklar", value: links.length, color: "text-blue-500" },
                    { label: "Jami Kirishlar", value: links.reduce((a, l) => a + l.clicks, 0), color: "text-purple-500" },
                    { label: "Jami Arizalar", value: links.reduce((a, l) => a + l.leads_count, 0), color: "text-green-500" },
                ].map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 relative ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                        <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi Link Yaratish</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nomi (qisqa, masalan: insta-target)</label>
                                <input
                                    type="text"
                                    required
                                    value={newLinkData.name}
                                    onChange={e => setNewLinkData({ ...newLinkData, name: e.target.value })}
                                    className={inputCls}
                                    placeholder="insta-target"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Qayerga yo'naltirish</label>
                                <input
                                    type="text"
                                    value={newLinkData.targetUrl}
                                    onChange={e => setNewLinkData({ ...newLinkData, targetUrl: e.target.value })}
                                    className={inputCls}
                                    placeholder="/apply"
                                />
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Standart: <code>/apply</code> — qisqa forma. Yoki <code>/</code> — bosh sahifa.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className={`px-5 py-2.5 rounded-xl font-bold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Bekor qilish</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white">Yaratish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Links Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`p-6 rounded-3xl border animate-pulse ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100'}`}>
                            <div className={`h-6 w-32 rounded-lg mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                            <div className={`h-20 w-20 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                            <div className={`h-4 w-full rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                        </div>
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className={`p-12 rounded-3xl border text-center ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
                    <Target size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
                    <p className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hali marketing linklar yo'q.</p>
                    <button onClick={() => setIsAdding(true)} className="mt-4 text-sm font-bold text-blue-500 hover:text-blue-400">+ Birinchi linkni yarating</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {links.map((link) => {
                        const conversion = link.clicks > 0 ? ((link.leads_count / link.clicks) * 100).toFixed(1) : '0';
                        const fullUrl = getFullUrl(link);
                        return (
                            <div key={link.id} className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col gap-4 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100'}`}>
                                {/* Title + delete */}
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{link.name}</h3>
                                        <a href={link.target_url.startsWith('http') ? link.target_url : '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5 font-medium">
                                            <ExternalLink size={11} />
                                            {link.target_url}
                                        </a>
                                    </div>
                                    {deleteConfirmId === link.id ? (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleDelete(link.id)} className="text-xs font-bold text-white bg-red-500 px-2.5 py-1.5 rounded-lg">Ha</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Yo'q</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleDelete(link.id)} className={`p-2 rounded-xl transition-colors shrink-0 ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-slate-700' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* QR + ref code */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-xl border border-slate-100 shrink-0">
                                        <QRCodeSVG value={fullUrl} size={72} level="L" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ref kodi:</p>
                                        <code className={`text-sm font-bold block truncate px-2 py-1 rounded-lg mb-2 ${isDark ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {link.ref_code}
                                        </code>
                                        <button onClick={() => handleCopy(link)} className={`text-xs flex items-center gap-1.5 font-bold transition-colors ${copiedId === link.id ? 'text-green-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                                            {copiedId === link.id ? <><Check size={13} /> Nusxalandi!</> : <><Copy size={13} /> Linkni nusxalash</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className={`pt-3 border-t grid grid-cols-3 gap-2 text-center ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <div>
                                        <p className="text-xl font-black text-blue-500">{link.clicks}</p>
                                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Kirish</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-green-500">{link.leads_count}</p>
                                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ariza</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-purple-500">{conversion}%</p>
                                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Konv.</p>
                                    </div>
                                </div>
                                <BarChart3 className="absolute -bottom-4 -right-4 size-28 opacity-5 pointer-events-none" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
