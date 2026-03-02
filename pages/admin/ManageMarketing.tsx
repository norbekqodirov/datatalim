import React, { useState, useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { Plus, Trash2, Copy, BarChart3, Target } from 'lucide-react';
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
    const [isAdding, setIsAdding] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ name: '', targetUrl: '/apply' });

    const fetchLinks = async () => {
        try {
            const res = await fetch('/api/marketing-links');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setLinks(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error('Linklarni yuklashda xatolik');
            setLinks([]);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

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
        } catch (e) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Haqiqatan ham ushbu linkni o'chirasizmi?")) return;
        try {
            const res = await fetch(`/api/marketing-links/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Link o'chirildi");
                fetchLinks();
            }
        } catch (e) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleCopy = (refCode: string) => {
        const fullUrl = `${window.location.origin}/?ref=${refCode}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link nusxalandi!");
    };

    return (
        <div className={`p-8 min-h-screen ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Target className="text-blue-500" size={36} />
                            Marketing & Reklama
                        </h1>
                        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Target, bloggerlar va boshqa manbalar uchun maxsus havolalar yaratish.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Plus size={20} />
                        Yangi Link
                    </button>
                </div>

                {/* Add Modal */}
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className={`rounded-3xl shadow-2xl max-w-md w-full p-8 relative ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            <h3 className="text-2xl font-black mb-6">Yangi Link Yaratish</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Nomi (qisqa, masalan: insta-target)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLinkData.name}
                                        onChange={e => setNewLinkData({ ...newLinkData, name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} outline-none`}
                                        placeholder="insta-target"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Qayerga yo'naltirish (Standart: /apply formasi)</label>
                                    <input
                                        type="text"
                                        value={newLinkData.targetUrl}
                                        onChange={e => setNewLinkData({ ...newLinkData, targetUrl: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} outline-none`}
                                        placeholder="/apply"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 rounded-xl font-bold bg-slate-200 text-slate-700">Bekor qilish</button>
                                    <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-blue-600 text-white">Yaratish</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link) => {
                        const conversion = link.clicks > 0 ? ((link.leads_count / link.clicks) * 100).toFixed(1) : 0;
                        const fullUrl = `${window.location.origin}/?ref=${link.ref_code}`;
                        return (
                            <div key={link.id} className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">{link.name}</h3>
                                    <button onClick={() => handleDelete(link.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="bg-white p-2 rounded-xl border relative group">
                                        <QRCodeSVG value={fullUrl} size={80} level={"L"} />
                                    </div>
                                    <div>
                                        <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Maxfiy kod (Ref):</p>
                                        <code className={`px-2 py-1 rounded-md text-sm font-bold block mb-2 ${isDark ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {link.ref_code}
                                        </code>
                                        <button onClick={() => handleCopy(link.ref_code)} className="text-xs flex items-center gap-1 font-bold text-slate-500 hover:text-slate-900">
                                            <Copy size={14} /> Nusxalash
                                        </button>
                                    </div>
                                </div>

                                <div className={`mt-auto pt-4 border-t grid grid-cols-3 gap-2 text-center items-end ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <div>
                                        <p className="text-2xl font-black text-blue-500">{link.clicks}</p>
                                        <p className="text-xs uppercase font-bold text-slate-500">Kirishlar</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-green-500">{link.leads_count}</p>
                                        <p className="text-xs uppercase font-bold text-slate-500">Arizalar</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-purple-500">{conversion}%</p>
                                        <p className="text-xs uppercase font-bold text-slate-500">Konversiya</p>
                                    </div>
                                </div>
                                <BarChart3 className="absolute -bottom-4 -right-4 size-32 opacity-5 pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
