import React, { useState, useEffect } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { Users, Phone, Calendar, Target, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '../../utils/api';

interface Lead {
    id: number;
    name: string;
    phone: string;
    course_id: string;
    source_ref: string;
    created_at: string;
}

export default function ManageLeads() {
    const { isDark } = useTheme();
    const [leads, setLeads] = useState<Lead[]>([]);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads', { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error('Arizalarni yuklashda xatolik');
            setLeads([]);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Haqiqatan ham bu arizani o\'chirmoqchimisiz?')) return;

        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('API Error');

            setLeads(leads.filter(lead => lead.id !== id));
            toast.success('Ariza muvaffaqiyatli o\'chirildi');
        } catch (e) {
            console.error(e);
            toast.error('Arizani o\'chirishda xatolik yuz berdi');
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    return (
        <div className={`p-8 min-h-screen ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Users className="text-[#00b26b]" size={36} />
                            Barcha Arizalar (CRM)
                        </h1>
                        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Saytdan kelib tushgan barcha arizalar (leads) tarixi.
                        </p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 font-bold ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        Jami: <span className="text-2xl text-[#00b26b]">{leads.length} ta</span>
                    </div>
                </div>

                <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} border-b font-bold text-sm tracking-wide text-slate-500 uppercase`}>
                                    <th className="px-6 py-4">F.I.O</th>
                                    <th className="px-6 py-4">Raqam</th>
                                    <th className="px-6 py-4">Kurs</th>
                                    <th className="px-6 py-4">Manba (Ref)</th>
                                    <th className="px-6 py-4">Sana</th>
                                    <th className="px-6 py-4 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                        <td className="px-6 py-4 font-bold flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            {lead.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
                                                <Phone size={14} /> {lead.phone}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                            {(() => {
                                                const courseStr = lead.course_id || 'Umumiy';
                                                const parts = courseStr.split(' | ');
                                                if (parts.length > 1) {
                                                    return (
                                                        <div className="flex flex-col gap-1.5">
                                                            <span>{parts[0]}</span>
                                                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800/50 block whitespace-pre-wrap">
                                                                {parts[1]}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return courseStr;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.source_ref ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                    <Target size={12} /> {lead.source_ref}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">Organik</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                                            <Calendar size={14} /> {new Date(lead.created_at).toLocaleString('uz-UZ')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                className={`p-2 rounded-xl transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                                                title="Arizani o'chirish"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Hozircha arizalar yo'q.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
