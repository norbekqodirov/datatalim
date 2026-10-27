import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Search, Phone, Copy, Download, StickyNote, ChevronDown, Inbox, RefreshCw, X, AlertTriangle, Loader2,
} from 'lucide-react';
import { fetchLeads, updateLead, Lead, LeadStatus } from '../../utils/api';

const PAGE = 50;

const STATUS: Record<LeadStatus, { label: string; tone: string }> = {
    new: { label: 'Yangi', tone: 'is-blue' },
    called: { label: 'Qoʻngʻiroq qilindi', tone: 'is-amber' },
    enrolled: { label: 'Yozildi', tone: 'is-green' },
    rejected: { label: 'Rad etildi', tone: 'is-red' },
};
const STATUS_KEYS = Object.keys(STATUS) as LeadStatus[];

type Range = 'today' | '7' | '30' | 'all';
const RANGES: { key: Range; label: string }[] = [
    { key: 'today', label: 'Bugun' },
    { key: '7', label: '7 kun' },
    { key: '30', label: '30 kun' },
    { key: 'all', label: 'Hammasi' },
];

const isoDay = (offsetDays = 0) => new Date(Date.now() - offsetDays * 864e5).toISOString().slice(0, 10);
const rangeParams = (r: Range): { from?: string; to?: string } =>
    r === 'today' ? { from: isoDay(), to: isoDay() } : r === '7' ? { from: isoDay(6) } : r === '30' ? { from: isoDay(29) } : {};

const pretty = (s: string | null) => (s ? s.replace(/_/g, ' ') : '—');
const parseDate = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
const fmtDate = (s: string) => {
    const d = parseDate(s);
    if (isNaN(d.getTime())) return s;
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

const csvCell = (v: unknown, isPhone = false) => {
    let s = String(v ?? '');
    if (!(isPhone && /^\+?[\d\s()-]+$/.test(s)) && /^[=+\-@\t\r]/.test(s)) s = "'" + s; // formula injection
    return `"${s.replace(/"/g, '""')}"`;
};

const StatusPill: React.FC<{ lead: Lead; onChange: (s: LeadStatus) => void }> = ({ lead, onChange }) => (
    <span className={`a-badge ${STATUS[lead.status].tone} relative`} style={{ paddingRight: '.45rem', minHeight: 32 }}>
        {STATUS[lead.status].label}
        <ChevronDown size={13} aria-hidden="true" />
        <select
            value={lead.status}
            onChange={e => onChange(e.target.value as LeadStatus)}
            aria-label={`${lead.name} holati`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ fontSize: 16 }}
        >
            {STATUS_KEYS.map(k => <option key={k} value={k}>{STATUS[k].label}</option>)}
        </select>
    </span>
);

const NotesModal: React.FC<{ lead: Lead; onClose: () => void; onSave: (notes: string) => void }> = ({ lead, onClose, onSave }) => {
    const [text, setText] = useState(lead.notes || '');
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        ref.current?.focus();
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [onClose]);
    return (
        <motion.div
            className="adm fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                role="dialog" aria-modal="true" aria-label={`${lead.name} uchun izoh`}
                className="a-card a-card-pad w-full sm:max-w-lg rounded-b-none sm:rounded-b-[18px]"
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                        <h2 className="a-h2">Izoh</h2>
                        <p className="a-sub truncate">{lead.name} · <span className="a-num">{lead.phone}</span></p>
                    </div>
                    <button type="button" className="a-btn a-btn-ghost a-icon-btn" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
                </div>
                <label className="a-label" htmlFor="lead-notes">Qoʻngʻiroq natijasi, kelishuvlar…</label>
                <textarea
                    id="lead-notes" ref={ref} className="a-textarea" rows={6} maxLength={1000}
                    value={text} onChange={e => setText(e.target.value)}
                    placeholder="Masalan: ertaga 15:00 da qayta qoʻngʻiroq qilish"
                />
                <div className="a-help a-num text-right">{text.length} / 1000</div>
                <div className="flex gap-2 justify-end mt-4">
                    <button type="button" className="a-btn" onClick={onClose}>Bekor qilish</button>
                    <button type="button" className="a-btn a-btn-primary" onClick={() => onSave(text.trim())}>Saqlash</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function ManageLeads() {
    const [items, setItems] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [counts, setCounts] = useState<Record<LeadStatus, number>>({ new: 0, called: 0, enrolled: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [qInput, setQInput] = useState('');
    const [q, setQ] = useState('');
    const [source, setSource] = useState('');
    const [status, setStatus] = useState<'' | LeadStatus>('');
    const [range, setRange] = useState<Range>('all');
    const [sources, setSources] = useState<string[]>([]);
    const [noteFor, setNoteFor] = useState<Lead | null>(null);
    const reqId = useRef(0);

    // qidiruv debounce
    useEffect(() => {
        const t = setTimeout(() => setQ(qInput.trim()), 300);
        return () => clearTimeout(t);
    }, [qInput]);

    // manbalar ro'yxati (dashboard statistikasidan, GET)
    useEffect(() => {
        fetch('/api/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
            .then(r => (r.ok ? r.json() : null))
            .then(d => {
                const list: string[] = (d?.sourceAttribution ?? []).map((s: { source_ref: string }) => s.source_ref).filter(Boolean);
                if (list.length) setSources(prev => Array.from(new Set([...prev, ...list])));
            })
            .catch(() => { /* ixtiyoriy */ });
    }, []);

    const query = useMemo(() => ({ q, source, status, ...rangeParams(range) }), [q, source, status, range]);

    const load = useCallback(async (offset = 0) => {
        const id = ++reqId.current;
        if (offset === 0) setLoading(true); else setLoadingMore(true);
        try {
            const res = await fetchLeads({ ...query, limit: PAGE, offset });
            if (id !== reqId.current) return;
            setItems(prev => (offset === 0 ? res.items : [...prev, ...res.items.filter(n => !prev.some(p => p.id === n.id))]));
            setTotal(res.total);
            setCounts(res.counts);
            setError(false);
            const seen = res.items.map(i => i.source_ref).filter((s): s is string => !!s);
            if (seen.length) setSources(prev => Array.from(new Set([...prev, ...seen])));
        } catch {
            if (id !== reqId.current) return;
            setError(true);
            if (offset === 0) setItems([]);
        } finally {
            if (id === reqId.current) { setLoading(false); setLoadingMore(false); }
        }
    }, [query]);

    useEffect(() => { load(0); }, [load]);

    const bump = (from: LeadStatus, to: LeadStatus) =>
        setCounts(c => ({ ...c, [from]: Math.max(0, c[from] - 1), [to]: c[to] + 1 }));

    const changeStatus = async (lead: Lead, next: LeadStatus) => {
        if (next === lead.status) return;
        const prev = lead.status;
        setItems(list => list.map(l => (l.id === lead.id ? { ...l, status: next } : l)));
        bump(prev, next);
        try {
            await updateLead(lead.id, { status: next });
            toast.success(`${lead.name}: ${STATUS[next].label}`);
        } catch {
            setItems(list => list.map(l => (l.id === lead.id ? { ...l, status: prev } : l)));
            bump(next, prev);
            toast.error('Holatni saqlab boʻlmadi');
        }
    };

    const saveNotes = async (lead: Lead, notes: string) => {
        const prev = lead.notes;
        setNoteFor(null);
        setItems(list => list.map(l => (l.id === lead.id ? { ...l, notes } : l)));
        try {
            const row = await updateLead(lead.id, { notes });
            setItems(list => list.map(l => (l.id === lead.id ? { ...l, notes: row.notes ?? notes } : l)));
            toast.success('Izoh saqlandi');
        } catch {
            setItems(list => list.map(l => (l.id === lead.id ? { ...l, notes: prev } : l)));
            toast.error('Izohni saqlab boʻlmadi');
        }
    };

    const copyPhone = async (phone: string) => {
        try {
            await navigator.clipboard.writeText(phone);
            toast.success('Raqam nusxalandi');
        } catch {
            toast.error('Nusxalab boʻlmadi');
        }
    };

    const exportCsv = async () => {
        setExporting(true);
        try {
            const all: Lead[] = [];
            for (let off = 0, guard = 0; guard < 50; guard++) {
                const res = await fetchLeads({ ...query, limit: 200, offset: off });
                all.push(...res.items);
                off += res.items.length;
                if (!res.items.length || off >= res.total) break;
            }
            const head = ['ID', 'Ism', 'Telefon', 'Kurs', 'Manba', 'Holat', 'Izoh', 'Sana'];
            const rows = all.map(l => [
                csvCell(l.id), csvCell(l.name), csvCell(l.phone, true), csvCell(l.course_id), csvCell(l.source_ref),
                csvCell(STATUS[l.status]?.label), csvCell(l.notes), csvCell(fmtDate(l.created_at)),
            ].join(','));
            const csv = '﻿' + [head.map(h => csvCell(h)).join(','), ...rows].join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `arizalar-${isoDay()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
            toast.success(`${all.length} ta ariza yuklandi`);
        } catch {
            toast.error('Eksport amalga oshmadi');
        } finally {
            setExporting(false);
        }
    };

    const hasFilters = !!(q || source || status || range !== 'all');
    const clearFilters = () => { setQInput(''); setQ(''); setSource(''); setStatus(''); setRange('all'); };
    const allCount = counts.new + counts.called + counts.enrolled + counts.rejected;

    return (
        <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="a-kicker mb-2">Mini-CRM</p>
                    <h1 className="a-h1">Arizalar</h1>
                    <p className="a-sub mt-1.5">Saytdan kelgan murojaatlar, holat va izohlar</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="a-btn" onClick={() => load(0)} aria-label="Yangilash">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Yangilash</span>
                    </button>
                    <button type="button" className="a-btn a-btn-primary" onClick={exportCsv} disabled={exporting || total === 0}>
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        CSV yuklab olish
                    </button>
                </div>
            </div>

            {/* Holat hisoblagichlari (filtr sifatida ham ishlaydi) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[{ key: '' as const, label: 'Barchasi', value: allCount, tone: '' }, ...STATUS_KEYS.map(k => ({ key: k, label: STATUS[k].label, value: counts[k], tone: STATUS[k].tone }))].map(c => {
                    const active = status === c.key;
                    return (
                        <button
                            key={c.key || 'all'} type="button" onClick={() => setStatus(c.key)} aria-pressed={active}
                            className={`a-card text-left px-4 py-3 min-h-[64px] transition-colors ${c.key === "" ? "col-span-2 lg:col-span-1" : ""}`}
                            style={active ? { borderColor: 'var(--a-blue)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--a-blue) 18%, transparent)' } : undefined}
                        >
                            <div className="text-xs font-medium truncate" style={{ color: 'var(--a-fg-2)' }}>{c.label}</div>
                            <div className="a-num font-semibold text-2xl mt-0.5">{c.value}</div>
                        </button>
                    );
                })}
            </div>

            {/* Filtrlar */}
            <div className="a-card a-card-pad space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--a-fg-3)' }} aria-hidden="true" />
                        <input
                            type="search" className="a-input" style={{ paddingLeft: '2.4rem' }} value={qInput}
                            onChange={e => setQInput(e.target.value)} placeholder="Ism, telefon yoki kurs boʻyicha qidirish"
                            aria-label="Qidirish"
                        />
                    </div>
                    <select className="a-select" value={source} onChange={e => setSource(e.target.value)} aria-label="Manba">
                        <option value="">Barcha manbalar</option>
                        {sources.map(s => <option key={s} value={s}>{pretty(s)}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="a-tabs max-w-full overflow-x-auto" role="tablist" aria-label="Sana">
                        {RANGES.map(r => (
                            <button key={r.key} type="button" role="tab" aria-selected={range === r.key} className="a-tab whitespace-nowrap" onClick={() => setRange(r.key)}>{r.label}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--a-fg-2)' }}>
                        <span className="a-num">{total} ta natija</span>
                        {hasFilters && <button type="button" className="a-btn a-btn-ghost" style={{ minHeight: 36 }} onClick={clearFilters}>Tozalash</button>}
                    </div>
                </div>
            </div>

            {/* Natija */}
            {error && !loading ? (
                <div className="a-card a-empty" role="alert">
                    <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: 'var(--a-amber-ink)' }} />
                    <p className="a-h2" style={{ color: 'var(--a-fg)' }}>Arizalarni yuklab boʻlmadi</p>
                    <p className="a-sub mt-1 mb-5">Server javob bermadi. Qayta urinib koʻring.</p>
                    <button type="button" className="a-btn a-btn-primary" onClick={() => load(0)}><RefreshCw size={15} /> Qayta urinish</button>
                </div>
            ) : loading ? (
                <div className="a-card a-card-pad space-y-3" aria-busy="true" aria-label="Yuklanmoqda">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="a-skel h-14 w-full" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="a-card a-empty">
                    <Inbox size={30} className="mx-auto mb-3" />
                    <p className="a-h2" style={{ color: 'var(--a-fg)' }}>{hasFilters ? 'Mos ariza topilmadi' : 'Hozircha arizalar yoʻq'}</p>
                    <p className="a-sub mt-1 mb-4">{hasFilters ? 'Filtrlarni oʻzgartirib koʻring.' : 'Saytdan yangi ariza kelganda shu yerda paydo boʻladi.'}</p>
                    {hasFilters && <button type="button" className="a-btn" onClick={clearFilters}>Filtrlarni tozalash</button>}
                </div>
            ) : (
                <>
                    {/* Desktop jadval */}
                    <div className="a-card hidden md:block overflow-x-auto">
                        <table className="a-table">
                            <thead>
                                <tr>
                                    <th>Ariza</th><th>Telefon</th><th>Kurs</th><th>Manba</th><th>Holat</th><th>Izoh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(l => (
                                    <tr key={l.id}>
                                        <td>
                                            <div className="font-medium">{l.name}</div>
                                            <div className="a-muted text-xs a-num mt-0.5">{fmtDate(l.created_at)}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <a href={telHref(l.phone)} className="a-num font-medium hover:underline" style={{ color: 'var(--a-blue-ink)' }}>{l.phone}</a>
                                                <button type="button" className="a-btn a-btn-ghost a-icon-btn" style={{ width: 32, height: 32, minHeight: 32 }} onClick={() => copyPhone(l.phone)} aria-label={`${l.phone} nusxalash`}>
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="max-w-[180px]"><span className="block truncate" title={l.course_id ?? ''}>{l.course_id || '—'}</span></td>
                                        <td>{l.source_ref ? <span className="a-badge">{pretty(l.source_ref)}</span> : <span className="a-muted">—</span>}</td>
                                        <td><StatusPill lead={l} onChange={s => changeStatus(l, s)} /></td>
                                        <td className="max-w-[220px]">
                                            <button type="button" className="a-btn a-btn-ghost w-full justify-start" style={{ minHeight: 36, padding: '0 .5rem', fontWeight: 500 }} onClick={() => setNoteFor(l)} aria-label={`${l.name} izohini tahrirlash`}>
                                                <StickyNote size={15} className="shrink-0" style={{ color: l.notes ? 'var(--a-blue-ink)' : 'var(--a-fg-3)' }} />
                                                <span className="truncate" style={{ color: l.notes ? 'var(--a-fg)' : 'var(--a-fg-3)' }}>{l.notes || 'Izoh qoʻshish'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobil kartalar */}
                    <div className="md:hidden space-y-3">
                        {items.map(l => (
                            <div key={l.id} className="a-card a-card-pad space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{l.name}</div>
                                        <div className="a-muted text-xs a-num mt-0.5">{fmtDate(l.created_at)}</div>
                                    </div>
                                    <StatusPill lead={l} onChange={s => changeStatus(l, s)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={telHref(l.phone)} className="a-btn a-btn-primary flex-1 a-num"><Phone size={16} /> {l.phone}</a>
                                    <button type="button" className="a-btn a-icon-btn" style={{ width: 44, height: 44 }} onClick={() => copyPhone(l.phone)} aria-label="Raqamni nusxalash"><Copy size={16} /></button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 text-xs">
                                    {l.course_id && <span className="a-badge is-blue">{l.course_id}</span>}
                                    {l.source_ref && <span className="a-badge">{pretty(l.source_ref)}</span>}
                                </div>
                                <button type="button" className="a-btn w-full justify-start" onClick={() => setNoteFor(l)} style={{ minHeight: 44, fontWeight: 500 }}>
                                    <StickyNote size={15} className="shrink-0" style={{ color: l.notes ? 'var(--a-blue-ink)' : 'var(--a-fg-3)' }} />
                                    <span className="truncate" style={{ color: l.notes ? 'var(--a-fg)' : 'var(--a-fg-3)' }}>{l.notes || 'Izoh qoʻshish'}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-1">
                        <span className="a-sub a-num">{items.length} / {total}</span>
                        {items.length < total && (
                            <button type="button" className="a-btn" onClick={() => load(items.length)} disabled={loadingMore}>
                                {loadingMore && <Loader2 size={15} className="animate-spin" />}
                                Yana yuklash
                            </button>
                        )}
                    </div>
                </>
            )}

            <AnimatePresence>
                {noteFor && <NotesModal key={noteFor.id} lead={noteFor} onClose={() => setNoteFor(null)} onSave={n => saveNotes(noteFor, n)} />}
            </AnimatePresence>
        </div>
    );
}
