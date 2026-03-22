import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { RefreshCw, Download, X, Edit2, Users, DollarSign, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Enrollment {
    id: number;
    lead_id: number;
    lead_name: string;
    lead_phone: string;
    course_id: number;
    course_name?: string;
    payment_status: 'paid' | 'partial' | 'unpaid';
    payment_amount: number;
    notes: string;
    enrolled_at: string;
}

type FilterStatus = 'all' | 'paid' | 'partial' | 'unpaid';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + localStorage.getItem('adminToken'),
});

const statusConfig = {
    paid: { label: "To'langan", color: 'bg-green-100 text-green-700 dark-paid' },
    partial: { label: 'Qisman', color: 'bg-amber-100 text-amber-700' },
    unpaid: { label: "To'lanmagan", color: 'bg-red-100 text-red-700' },
};

function StatusPill({ status, isDark }: { status: Enrollment['payment_status']; isDark: boolean }) {
    const cfg = statusConfig[status];
    const colorMap = {
        paid: isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
        partial: isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700',
        unpaid: isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status]}`}>
            {cfg.label}
        </span>
    );
}

export default function ManageEnrollments() {
    const { isDark } = useTheme();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [editingItem, setEditingItem] = useState<Enrollment | null>(null);
    const [editForm, setEditForm] = useState({ payment_status: 'paid' as Enrollment['payment_status'], payment_amount: 0, notes: '' });
    const [saving, setSaving] = useState(false);

    const fetchEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/enrollments' : `/api/enrollments?payment_status=${filter}`;
            const res = await fetch(url, { headers: authHeaders() });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setEnrollments(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Yozilganlarni yuklashda xatolik');
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

    const openEdit = (item: Enrollment) => {
        setEditingItem(item);
        setEditForm({ payment_status: item.payment_status, payment_amount: item.payment_amount, notes: item.notes || '' });
    };

    const handleSave = async () => {
        if (!editingItem) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/enrollments/${editingItem.id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(editForm),
            });
            if (!res.ok) throw new Error('Save failed');
            toast.success("Muvaffaqiyatli saqlandi");
            setEditingItem(null);
            fetchEnrollments();
        } catch {
            toast.error('Saqlashda xatolik');
        } finally {
            setSaving(false);
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Ism', 'Telefon', 'Kurs', "To'lov holati", 'Miqdor', 'Izoh', 'Sana'];
        const rows = enrollments.map(e => [
            e.id,
            e.lead_name,
            e.lead_phone,
            e.course_name || e.course_id,
            e.payment_status,
            e.payment_amount,
            `"${(e.notes || '').replace(/"/g, '""')}"`,
            new Date(e.enrolled_at).toLocaleDateString('uz-UZ'),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `enrollments_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        toast.success('CSV yuklab olindi');
    };

    // Stats
    const total = enrollments.length;
    const totalRevenue = enrollments.reduce((s, e) => s + (e.payment_amount || 0), 0);
    const partialCount = enrollments.filter(e => e.payment_status === 'partial').length;
    const unpaidCount = enrollments.filter(e => e.payment_status === 'unpaid').length;

    const card = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200';
    const text = isDark ? 'text-gray-100' : 'text-gray-900';
    const subtext = isDark ? 'text-gray-400' : 'text-gray-500';
    const tableHead = isDark ? 'bg-gray-750 text-gray-300' : 'bg-gray-50 text-gray-600';
    const tableRow = isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50';
    const inputCls = `w-full rounded-lg px-3 py-2 text-sm border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

    const filterPills: { key: FilterStatus; label: string }[] = [
        { key: 'all', label: 'Barchasi' },
        { key: 'paid', label: "To'langan" },
        { key: 'partial', label: 'Qisman' },
        { key: 'unpaid', label: "To'lanmagan" },
    ];

    return (
        <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${text}`}>Yozilganlar</h1>
                    <p className={`text-sm mt-0.5 ${subtext}`}>Kurs yozilmalarini boshqarish</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                    <Download size={16} />
                    CSV yuklab olish
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Jami yozilganlar', value: total, icon: Users, color: 'text-blue-500', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
                    { label: 'Jami tushum', value: totalRevenue.toLocaleString('uz-UZ') + " so'm", icon: DollarSign, color: 'text-green-500', bg: isDark ? 'bg-green-900/30' : 'bg-green-50' },
                    { label: 'Kutilayotgan', value: partialCount, icon: Clock, color: 'text-amber-500', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' },
                    { label: "To'lanmagan", value: unpaidCount, icon: XCircle, color: 'text-red-500', bg: isDark ? 'bg-red-900/30' : 'bg-red-50' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 ${card} flex items-center gap-4`}>
                        <div className={`p-2.5 rounded-lg ${bg}`}>
                            <Icon size={20} className={color} />
                        </div>
                        <div>
                            <p className={`text-xs ${subtext}`}>{label}</p>
                            <p className={`text-lg font-bold ${text}`}>{value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Row */}
            <div className={`rounded-xl p-4 mb-4 ${card} flex items-center gap-3 flex-wrap`}>
                <div className="flex gap-2 flex-wrap">
                    {filterPills.map(p => (
                        <button
                            key={p.key}
                            onClick={() => setFilter(p.key)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === p.key
                                ? 'bg-blue-600 text-white'
                                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchEnrollments}
                    className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Yangilash
                </button>
            </div>

            {/* Table */}
            <div className={`rounded-xl overflow-hidden ${card}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw size={28} className="animate-spin text-blue-500" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-20 ${subtext}`}>
                        <Users size={40} className="mb-3 opacity-40" />
                        <p className="text-sm">Yozilganlar topilmadi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`text-xs uppercase tracking-wide ${tableHead}`}>
                                    {['Ism', 'Telefon', 'Kurs', "To'lov holati", 'Miqdor', 'Sana', 'Amallar'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {enrollments.map(e => (
                                    <tr key={e.id} className={`${tableRow} transition-colors`}>
                                        <td className={`px-4 py-3 font-medium ${text}`}>{e.lead_name}</td>
                                        <td className={`px-4 py-3 ${subtext}`}>{e.lead_phone}</td>
                                        <td className={`px-4 py-3 ${subtext}`}>{e.course_name || `Kurs #${e.course_id}`}</td>
                                        <td className="px-4 py-3">
                                            <StatusPill status={e.payment_status} isDark={isDark} />
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${text}`}>
                                            {(e.payment_amount || 0).toLocaleString('uz-UZ')} so'm
                                        </td>
                                        <td className={`px-4 py-3 ${subtext}`}>
                                            {new Date(e.enrolled_at).toLocaleDateString('uz-UZ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openEdit(e)}
                                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                title="Tahrirlash"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={e => { if (e.target === e.currentTarget) setEditingItem(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className={`text-lg font-bold ${text}`}>Yozilmani tahrirlash</h2>
                                <button onClick={() => setEditingItem(null)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${subtext}`}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
                                <p className={`text-sm font-medium ${text}`}>{editingItem.lead_name}</p>
                                <p className={`text-xs ${subtext}`}>{editingItem.lead_phone}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>To'lov holati</label>
                                    <select
                                        value={editForm.payment_status}
                                        onChange={e => setEditForm(f => ({ ...f, payment_status: e.target.value as Enrollment['payment_status'] }))}
                                        className={inputCls}
                                    >
                                        <option value="paid">To'langan</option>
                                        <option value="partial">Qisman</option>
                                        <option value="unpaid">To'lanmagan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>To'lov miqdori (so'm)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={editForm.payment_amount}
                                        onChange={e => setEditForm(f => ({ ...f, payment_amount: Number(e.target.value) }))}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${subtext}`}>Izoh</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.notes}
                                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Qo'shimcha izoh..."
                                        className={inputCls + ' resize-none'}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors"
                                >
                                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
