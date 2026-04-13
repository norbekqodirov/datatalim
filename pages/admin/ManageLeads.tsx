import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../../store/ThemeContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    Users, Phone, Calendar, Target, Trash2, Download, Filter, RefreshCw,
    CheckCircle, MessageSquare, XCircle, Clock, Search, ChevronDown,
    CheckSquare, Square, Edit3, Save, X, ChevronLeft, ChevronRight,
    LayoutList, Columns, Send, Activity, PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAuthHeaders } from '../../utils/api';

interface Lead {
    id: number;
    name: string;
    phone: string;
    course_id: string;
    source_ref: string;
    status: 'new' | 'contacted' | 'enrolled' | 'rejected';
    notes?: string;
    created_at: string;
    score?: number;
    grade?: string;
}

interface LeadActivity {
    id: number;
    lead_id: number;
    action: string;
    detail: string;
    old_value: string;
    new_value: string;
    created_at: string;
}

type LeadStatus = Lead['status'];

const STATUS_CONFIG: Record<LeadStatus, { label: string; icon: React.ElementType; color: string; bg: string; darkBg: string }> = {
    new: { label: "Yangi", icon: Clock, color: "blue", bg: "bg-blue-100 text-blue-700 border-blue-200", darkBg: "bg-blue-900/30 text-blue-400 border-blue-800" },
    contacted: { label: "Bog'landi", icon: MessageSquare, color: "amber", bg: "bg-amber-100 text-amber-700 border-amber-200", darkBg: "bg-amber-900/30 text-amber-400 border-amber-800" },
    enrolled: { label: "Yozildi", icon: CheckCircle, color: "green", bg: "bg-green-100 text-green-700 border-green-200", darkBg: "bg-green-900/30 text-green-400 border-green-800" },
    rejected: { label: "Rad etildi", icon: XCircle, color: "red", bg: "bg-red-100 text-red-700 border-red-200", darkBg: "bg-red-900/30 text-red-400 border-red-800" },
};

const ALL_STATUSES: LeadStatus[] = ['new', 'contacted', 'enrolled', 'rejected'];

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

function ScoreBadge({ score, grade }: { score?: number; grade?: string }) {
    if (!grade || grade === 'Unqualified') return null;
    const config: Record<string, { emoji: string; cls: string }> = {
        Hot: { emoji: '🔥', cls: 'bg-red-100 text-red-700 border-red-200' },
        Warm: { emoji: '🌡', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        Cold: { emoji: '❄', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    const c = config[grade];
    if (!c) return null;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold border ${c.cls}`}>
            {c.emoji} {grade} {score}
        </span>
    );
}

export default function ManageLeads() {
    const { isDark } = useTheme();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [noteText, setNoteText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [activityLeadId, setActivityLeadId] = useState<number | null>(null);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads', { headers: authHeaders() });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Arizalarni yuklashda xatolik');
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    const filteredLeads = useMemo(() => {
        let result = leads;

        if (filterStatus !== 'all') {
            result = result.filter(l => l.status === filterStatus);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(l =>
                l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.course_id && l.course_id.toLowerCase().includes(q))
            );
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            result = result.filter(l => new Date(l.created_at) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(l => new Date(l.created_at) <= to);
        }

        return result;
    }, [leads, filterStatus, searchQuery, dateFrom, dateTo]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filteredLeads.length / perPage));
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredLeads.slice(start, start + perPage);
    }, [filteredLeads, currentPage, perPage]);

    const statusCounts = useMemo(() => {
        return leads.reduce((acc, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [leads]);

    const handleStatusChange = async (id: number, status: LeadStatus) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
            toast.success('Status yangilandi!');
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleNoteSave = async (id: number) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ notes: noteText }),
            });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: noteText } : l));
            setEditingNoteId(null);
            toast.success('Izoh saqlandi!');
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const openActivityPanel = async (leadId: number) => {
        setActivityLeadId(leadId);
        setActivitiesLoading(true);
        try {
            const res = await fetch(`/api/leads/${leadId}/activities`, { headers: authHeaders() });
            const data = await res.json();
            setActivities(Array.isArray(data) ? data : []);
        } catch {
            setActivities([]);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const logActivity = async (leadId: number, action: string, detail: string) => {
        try {
            await fetch(`/api/leads/${leadId}/activities`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ action, detail }),
            });
            if (activityLeadId === leadId) {
                await openActivityPanel(leadId);
            }
            toast.success(action === 'called' ? "Qo'ng'iroq qayd etildi" : 'Xabar qayd etildi');
        } catch {
            toast.error('Xatolik');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.filter(l => l.id !== id));
            setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
            toast.success("Ariza o'chirildi");
        } catch {
            toast.error('Xatolik yuz berdi');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleBulkStatusChange = async (status: LeadStatus) => {
        setBulkStatusOpen(false);
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        try {
            await Promise.all(ids.map(id =>
                fetch(`/api/leads/${id}`, {
                    method: 'PATCH',
                    headers: authHeaders(),
                    body: JSON.stringify({ status }),
                })
            ));
            setLeads(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, status } : l));
            setSelectedIds(new Set());
            toast.success(`${ids.length} ta ariza yangilandi!`);
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        if (!window.confirm(`${ids.length} ta arizani o'chirishni tasdiqlaysizmi?`)) return;
        try {
            await Promise.all(ids.map(id =>
                fetch(`/api/leads/${id}`, { method: 'DELETE', headers: authHeaders() })
            ));
            setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
            setSelectedIds(new Set());
            toast.success(`${ids.length} ta ariza o'chirildi`);
        } catch {
            toast.error('Xatolik yuz berdi');
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id); else s.add(id);
            return s;
        });
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        
        const leadId = parseInt(draggableId);
        const newStatus = destination.droppableId as LeadStatus;
        handleStatusChange(leadId, newStatus);
    };

    const toggleSelectAll = () => {
        const pageIds = paginatedLeads.map(l => l.id);
        const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
        if (allSelected) {
            setSelectedIds(prev => {
                const s = new Set(prev);
                pageIds.forEach(id => s.delete(id));
                return s;
            });
        } else {
            setSelectedIds(prev => new Set([...prev, ...pageIds]));
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Ism', 'Telefon', 'Kurs', 'Manba', 'Status', 'Izoh', 'Sana'];
        const rows = filteredLeads.map(l => [
            l.id,
            `"${l.name}"`,
            l.phone,
            `"${l.course_id || 'Umumiy'}"`,
            l.source_ref || 'Organik',
            STATUS_CONFIG[l.status]?.label || l.status,
            `"${(l.notes || '').replace(/"/g, '""')}"`,
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

    const cardClass = isDark
        ? 'bg-slate-800/60 backdrop-blur-xl border border-white/10'
        : 'bg-white border border-slate-200';

    const inputClass = isDark
        ? 'bg-slate-900/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={`text-3xl sm:text-4xl font-black mb-1 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Users className="text-[#00b26b]" size={34} />
                        Arizalar (CRM)
                    </h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Barcha kelib tushgan arizalar boshqaruvi.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* View toggle */}
                    <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors ${viewMode === 'table'
                                ? 'bg-[#0061ff] text-white'
                                : isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-white'}`}
                        >
                            <LayoutList size={16} /> Jadval
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors ${viewMode === 'kanban'
                                ? 'bg-[#0061ff] text-white'
                                : isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-white'}`}
                        >
                            <Columns size={16} /> Kanban
                        </button>
                    </div>
                    <button onClick={fetchLeads} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={exportCSV} disabled={filteredLeads.length === 0} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                        <Download size={16} /> CSV
                    </button>
                    <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-sm ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200'}`}>
                        Jami: <span className="text-lg text-[#00b26b]">{filteredLeads.length}</span>
                    </div>
                </div>
            </div>

            {/* Status summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(STATUS_CONFIG) as [LeadStatus, typeof STATUS_CONFIG[LeadStatus]][]).map(([key, cfg]) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                        className={`p-4 rounded-2xl border text-left transition-all ${filterStatus === key
                            ? (isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50')
                            : isDark ? 'bg-slate-800/60 backdrop-blur-xl border-white/10 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{statusCounts[key] || 0}</div>
                        <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cfg.label}</div>
                    </button>
                ))}
            </div>

            {/* Search, Filter & Date Range Bar */}
            <div className={`rounded-2xl p-4 ${cardClass}`}>
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Ism, telefon yoki kurs bo'yicha qidiring..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputClass}`}
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <Filter size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className={`pl-10 pr-8 py-2.5 rounded-xl border text-sm font-medium outline-none cursor-pointer appearance-none transition-colors ${inputClass}`}
                        >
                            <option value="all">Barchasi</option>
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className={`pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputClass}`}
                            />
                        </div>
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>—</span>
                        <div className="relative">
                            <Calendar size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className={`pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputClass}`}
                            />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div className={`rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isDark ? 'bg-blue-900/20 border border-blue-500/30 backdrop-blur-xl' : 'bg-blue-50 border border-blue-200'}`}>
                    <span className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        {selectedIds.size} ta ariza tanlangan
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <button
                                onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-slate-800 text-white border border-white/10 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                Statusni o'zgartirish <ChevronDown size={14} />
                            </button>
                            {bulkStatusOpen && (
                                <div className={`absolute top-full mt-1 left-0 z-50 rounded-xl border shadow-xl overflow-hidden min-w-[180px] ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                                    {ALL_STATUSES.map(s => {
                                        const cfg = STATUS_CONFIG[s];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => handleBulkStatusChange(s)}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-left transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                            >
                                                <Icon size={14} /> {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                        >
                            <Trash2 size={14} /> O'chirish
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Bekor qilish
                        </button>
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            {viewMode === 'kanban' && (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {ALL_STATUSES.map(status => {
                            const cfg = STATUS_CONFIG[status];
                            const Icon = cfg.icon;
                            const colLeads = filteredLeads.filter(l => l.status === status);
                            const colColors: Record<LeadStatus, string> = {
                                new: 'border-blue-500',
                                contacted: 'border-amber-500',
                                enrolled: 'border-emerald-500',
                                rejected: 'border-red-500',
                            };
                            return (
                                <Droppable key={status} droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.droppableProps}
                                            className={`rounded-2xl border-t-4 ${colColors[status]} ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'} flex flex-col min-h-[400px] transition-colors ${snapshot.isDraggingOver ? (isDark ? 'bg-slate-800/90 ring-2 ring-white/10' : 'bg-slate-100 ring-2 ring-blue-500/10') : ''}`}
                                        >
                                {/* Column header */}
                                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <Icon size={15} className={
                                            status === 'new' ? 'text-blue-500'
                                            : status === 'contacted' ? 'text-amber-500'
                                            : status === 'enrolled' ? 'text-emerald-500'
                                            : 'text-red-500'
                                        } />
                                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{cfg.label}</span>
                                    </div>
                                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                                        {colLeads.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[600px]">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className={`rounded-xl p-3 animate-pulse h-24 ${isDark ? 'bg-slate-700' : 'bg-white'}`} />
                                        ))
                                    ) : colLeads.length === 0 ? (
                                        <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            Bo'sh
                                        </div>
                                    ) : colLeads.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`rounded-xl p-3 border transition-shadow ${snapshot.isDragging ? 'shadow-xl shadow-blue-500/10 ring-2 ring-blue-500 z-50' : 'hover:shadow-md'} ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
                                                >
                                                    {/* Name + avatar */}
                                                    <div className="flex items-center gap-2 mb-2 cursor-grab active:cursor-grabbing">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                                            {lead.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className={`font-bold text-sm truncate flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{lead.name}</span>
                                                        <ScoreBadge score={lead.score} grade={lead.grade} />
                                                    </div>

                                                    {/* Phone */}
                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline mb-1">
                                                        <Phone size={11} /> {lead.phone}
                                                    </a>

                                                    {/* Course */}
                                                    {lead.course_id && (
                                                        <p className={`text-xs truncate mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            📚 {lead.course_id}
                                                        </p>
                                                    )}

                                                    {/* Note snippet */}
                                                    {lead.notes && (
                                                        <p className={`text-xs italic truncate mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            💬 {lead.notes}
                                                        </p>
                                                    )}

                                                    {/* Date */}
                                                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        {new Date(lead.created_at).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </p>

                                                    {/* Quick actions */}
                                                    <div className="flex items-center gap-1.5">
                                                        <a href={`tel:${lead.phone}`}
                                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                                                            <Phone size={11} /> Qo'ng'iroq
                                                        </a>
                                                        <a href={`https://t.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-sky-900/30 text-sky-400 hover:bg-sky-900/50' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}>
                                                            <Send size={11} /> Telegram
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        )}

            {/* Table */}
            {viewMode === 'table' && <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-800/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDark ? 'bg-slate-800/80 border-white/10' : 'bg-slate-50 border-slate-100'} border-b text-xs font-bold tracking-wide text-slate-500 uppercase whitespace-nowrap`}>
                                <th className="px-4 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="flex items-center">
                                        {paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.has(l.id))
                                            ? <CheckSquare size={18} className="text-blue-500" />
                                            : <Square size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                                        }
                                    </button>
                                </th>
                                <th className="px-4 py-4">F.I.O</th>
                                <th className="px-4 py-4">Raqam</th>
                                <th className="px-4 py-4 hidden lg:table-cell">Kurs</th>
                                <th className="px-4 py-4 hidden md:table-cell">Manba</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 hidden xl:table-cell">Izoh</th>
                                <th className="px-4 py-4 hidden sm:table-cell">Sana</th>
                                <th className="px-4 py-4 w-14"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className={`h-5 rounded-lg animate-pulse ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} style={{ width: j === 0 ? '20px' : j === 1 ? '120px' : '80px' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-16 text-center">
                                        <Users size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
                                        <p className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {searchQuery || filterStatus !== 'all' || dateFrom || dateTo
                                                ? "Filtrlarga mos arizalar topilmadi"
                                                : "Hozircha arizalar yo'q"
                                            }
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => {
                                    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                                    const isSelected = selectedIds.has(lead.id);
                                    return (
                                        <tr key={lead.id} className={`transition-colors ${isSelected ? (isDark ? 'bg-blue-900/10' : 'bg-blue-50/50') : ''} ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'}`}>
                                            <td className="px-4 py-4">
                                                <button onClick={() => toggleSelect(lead.id)} className="flex items-center">
                                                    {isSelected
                                                        ? <CheckSquare size={18} className="text-blue-500" />
                                                        : <Square size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 font-bold whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{lead.name}</span>
                                                        <div className="mt-0.5"><ScoreBadge score={lead.score} grade={lead.grade} /></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-blue-500 hover:underline font-medium text-sm">
                                                    <Phone size={14} /> {lead.phone}
                                                </a>
                                            </td>
                                            <td className={`px-4 py-4 font-medium text-sm whitespace-nowrap hidden lg:table-cell ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {lead.course_id || 'Umumiy'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                {lead.source_ref ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                        <Target size={11} /> {lead.source_ref}
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Organik</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <select
                                                    value={lead.status || 'new'}
                                                    onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${isDark ? statusCfg.darkBg : statusCfg.bg}`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                                        <option key={val} value={val}>{cfg.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 hidden xl:table-cell max-w-[200px]">
                                                {editingNoteId === lead.id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={noteText}
                                                            onChange={e => setNoteText(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter') handleNoteSave(lead.id); if (e.key === 'Escape') setEditingNoteId(null); }}
                                                            autoFocus
                                                            className={`flex-1 px-2 py-1 rounded-lg border text-xs outline-none min-w-0 ${inputClass}`}
                                                            placeholder="Izoh yozing..."
                                                        />
                                                        <button onClick={() => handleNoteSave(lead.id)} className="text-green-500 hover:text-green-400 p-1">
                                                            <Save size={14} />
                                                        </button>
                                                        <button onClick={() => setEditingNoteId(null)} className={`p-1 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setEditingNoteId(lead.id); setNoteText(lead.notes || ''); }}
                                                        className={`flex items-center gap-1.5 text-xs truncate max-w-full group ${lead.notes ? (isDark ? 'text-slate-300' : 'text-slate-600') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}
                                                        title={lead.notes || 'Izoh qo\'shish'}
                                                    >
                                                        <Edit3 size={12} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                                        <span className="truncate">{lead.notes || 'Izoh qo\'shish...'}</span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className={`px-4 py-4 text-xs whitespace-nowrap hidden sm:table-cell ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    {new Date(lead.created_at).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {deleteConfirmId === lead.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleDelete(lead.id)} className={`text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>Ha</button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className={`text-xs font-bold px-2 py-1 rounded-lg ${isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'}`}>Yo'q</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => openActivityPanel(lead.id)}
                                                            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-600 hover:text-purple-400 hover:bg-slate-700' : 'text-slate-300 hover:text-purple-500 hover:bg-purple-50'}`}
                                                            title="Faoliyat tarixi"
                                                        >
                                                            <Activity size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(lead.id)}
                                                            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-slate-700' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>}

            {/* Pagination — table mode only */}
            {viewMode === 'table' && filteredLeads.length > perPage && (
                <div className={`rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${cardClass}`}>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredLeads.length)} / {filteredLeads.length}
                        </span>
                        <div className="relative">
                            <select
                                value={perPage}
                                onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className={`pl-3 pr-7 py-1.5 rounded-lg border text-sm font-medium outline-none cursor-pointer appearance-none transition-colors ${inputClass}`}
                            >
                                {[10, 20, 50, 100].map(n => (
                                    <option key={n} value={n}>{n} ta</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | string)[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                typeof p === 'string' ? (
                                    <span key={`dots-${i}`} className={`px-2 text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-colors ${
                                            currentPage === p
                                                ? 'bg-[#00b26b] text-white'
                                                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-xl transition-colors disabled:opacity-30 ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Activity Slide-out Panel */}
            {activityLeadId !== null && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActivityLeadId(null)} />
                    <div className={`relative w-full max-w-md h-full shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 border-l border-white/10' : 'bg-white border-l border-slate-200'}`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <div>
                                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Faoliyat Tarixi</h3>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {leads.find(l => l.id === activityLeadId)?.name}
                                </p>
                            </div>
                            <button onClick={() => setActivityLeadId(null)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className={`flex gap-2 p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                            <button
                                onClick={() => logActivity(activityLeadId, 'called', "Qo'ng'iroq qilindi")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                <PhoneCall size={15} /> Chaqirdim
                            </button>
                            <button
                                onClick={() => logActivity(activityLeadId, 'messaged', 'Telegram xabar yuborildi')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-sky-900/30 text-sky-400 hover:bg-sky-900/50' : 'bg-sky-50 text-sky-600 hover:bg-sky-100'}`}
                            >
                                <Send size={15} /> Yozildim
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activitiesLoading ? (
                                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Yuklanmoqda...</div>
                            ) : activities.length === 0 ? (
                                <div className={`text-center py-12 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    <Activity size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Hali faoliyat yo'q</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((act) => {
                                        const actionLabels: Record<string, { label: string; color: string }> = {
                                            created: { label: "Ariza yaratildi", color: "bg-green-500" },
                                            status_changed: { label: "Status o'zgardi", color: "bg-amber-500" },
                                            note_added: { label: "Izoh qo'shildi", color: "bg-purple-500" },
                                            called: { label: "Qo'ng'iroq qilindi", color: "bg-blue-500" },
                                            messaged: { label: "Xabar yuborildi", color: "bg-sky-500" },
                                            enrolled: { label: "Kursga yozildi", color: "bg-emerald-500" },
                                        };
                                        const cfg = actionLabels[act.action] || { label: act.action, color: "bg-slate-500" };
                                        return (
                                            <div key={act.id} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${cfg.color}`} />
                                                    <div className={`w-0.5 flex-1 mt-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                                                </div>
                                                <div className={`flex-1 pb-3 rounded-xl p-3 text-sm ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                                                    <p className={`font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{cfg.label}</p>
                                                    {act.detail && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{act.detail}</p>}
                                                    {act.old_value && act.new_value && (
                                                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {act.old_value} → {act.new_value}
                                                        </p>
                                                    )}
                                                    <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        {new Date(act.created_at).toLocaleString('uz-UZ')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
