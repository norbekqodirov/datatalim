import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Target, ExternalLink, RefreshCw, Check, Code, Globe, MousePointerClick, Users, Percent, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader, Field, Overlay, ConfirmDialog, Spinner } from '../../components/admin/ui/kit';

interface MarketingLink {
    id: number;
    name: string;
    ref_code: string;
    target_url: string;
    category: string;
    clicks: number;
    leads_count: number;
    created_at: string;
}

export default function ManageMarketing() {
    const [links, setLinks] = useState<MarketingLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ name: '', targetUrl: '/ariza', category: 'IT' });
    const [nameError, setNameError] = useState('');
    const [copied, setCopied] = useState<{ id: number; what: 'url' | 'ref' } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MarketingLink | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/marketing-links', { headers: authHeaders() });
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

    const closeAdd = () => { setIsAdding(false); setNameError(''); };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLinkData.name.trim()) { setNameError('Link nomini kiriting'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/marketing-links', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(newLinkData),
            });
            if (res.ok) {
                toast.success("Link muvaffaqiyatli yaratildi");
                setIsAdding(false);
                setNewLinkData({ name: '', targetUrl: '/ariza', category: 'IT' });
                fetchLinks();
            } else {
                toast.error('Link yaratib bo\'lmadi');
            }
        } catch {
            toast.error('Xatolik yuz berdi');
        } finally {
            setCreating(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleting(true);
        try {
            const res = await fetch(`/api/marketing-links/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (res.ok) {
                toast.success("Link o'chirildi");
                setLinks(prev => prev.filter(l => l.id !== id));
            } else {
                toast.error('O\'chirib bo\'lmadi');
            }
        } catch {
            toast.error('Xatolik yuz berdi');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const flashCopied = (id: number, what: 'url' | 'ref') => {
        setCopied({ id, what });
        setTimeout(() => setCopied(c => (c && c.id === id && c.what === what ? null : c)), 2000);
    };

    const copyText = async (text: string, id: number, what: 'url' | 'ref', okMsg: string) => {
        try {
            await navigator.clipboard.writeText(text);
            flashCopied(id, what);
            toast.success(okMsg);
        } catch {
            toast.error('Nusxalab bo\'lmadi. Matnni qo\'lda belgilab oling.');
        }
    };

    const getFullUrl = (link: MarketingLink) => {
        const origin = window.location.origin;
        const target = link.target_url.startsWith('http') ? link.target_url : origin + link.target_url;
        const sep = target.includes('?') ? '&' : '?';
        return `${target}${sep}ref=${link.ref_code}`;
    };

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    });

    const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
    const totalLeads = links.reduce((a, l) => a + l.leads_count, 0);
    const stats = [
        { label: 'Jami linklar', value: links.length, icon: <Link2 size={16} /> },
        { label: 'Jami kirishlar', value: totalClicks, icon: <MousePointerClick size={16} /> },
        { label: 'Jami arizalar', value: totalLeads, icon: <Users size={16} /> },
    ];

    return (
        <div>
            <PageHeader
                kicker="Asosiy"
                title="Marketing va reklama"
                sub="Target, bloggerlar va boshqa manbalar uchun maxsus kuzatuv havolalari."
                actions={<>
                    <button type="button" onClick={fetchLinks} className="a-btn a-icon-btn" aria-label="Ro'yxatni yangilash" disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'a-spin' : ''} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setIsAdding(true)} className="a-btn a-btn-primary">
                        <Plus size={18} aria-hidden="true" /> Yangi link
                    </button>
                </>}
            />

            {/* Umumiy ko'rsatkichlar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {stats.map(s => (
                    <div key={s.label} className="a-card a-card-pad flex items-center gap-3.5">
                        <span className="a-section-ico" aria-hidden="true">{s.icon}</span>
                        <div>
                            <div className="a-num text-2xl font-bold leading-none">{s.value.toLocaleString()}</div>
                            <div className="a-sub mt-1" style={{ fontSize: '.78rem' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Yangi link oynasi */}
            <Overlay open={isAdding} onClose={closeAdd} labelledBy="ml-dlg-title" lockClose={creating}>
                <h2 id="ml-dlg-title" className="a-h2 mb-4">Yangi link yaratish</h2>
                <form onSubmit={handleAdd} className="grid gap-4" noValidate>
                    <Field label="Nomi" help="Qisqa nom, masalan: insta-target" error={nameError}>
                        {id => (
                            <input
                                id={id} type="text" required value={newLinkData.name} data-autofocus
                                onChange={e => { setNewLinkData({ ...newLinkData, name: e.target.value }); if (e.target.value.trim()) setNameError(''); }}
                                className="a-input" placeholder="insta-target" aria-invalid={!!nameError}
                            />
                        )}
                    </Field>
                    <div>
                        <span className="a-label" id="ml-cat-l">Kategoriya</span>
                        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="ml-cat-l">
                            {['IT', 'Language'].map(cat => (
                                <button
                                    key={cat} type="button" className="a-chip justify-center" style={{ minHeight: 44, borderRadius: 12 }}
                                    aria-pressed={newLinkData.category === cat}
                                    onClick={() => setNewLinkData({ ...newLinkData, category: cat })}
                                >
                                    {cat === 'IT' ? <Code size={15} aria-hidden="true" /> : <Globe size={15} aria-hidden="true" />}
                                    {cat === 'IT' ? 'IT kurslar' : 'Til kurslari'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Field label="Qayerga yo'naltirish" help="Standart: /ariza (qisqa forma). Bosh sahifa uchun: /">
                        {id => <input id={id} type="text" value={newLinkData.targetUrl} onChange={e => setNewLinkData({ ...newLinkData, targetUrl: e.target.value })} className="a-input a-code" style={{ fontSize: '.85rem' }} placeholder="/ariza" />}
                    </Field>
                    <div className="flex justify-end gap-2 mt-1">
                        <button type="button" className="a-btn" onClick={closeAdd} disabled={creating}>Bekor qilish</button>
                        <button type="submit" className="a-btn a-btn-primary" disabled={creating}>{creating && <Spinner />}Yaratish</button>
                    </div>
                </form>
            </Overlay>

            <ConfirmDialog
                open={!!deleteTarget} title="Linkni o'chirasizmi?" busy={deleting}
                message={deleteTarget ? `"${deleteTarget.name}" linki va uning statistikasi o'chiriladi. Tarqatilgan QR kod va havolalar ishlamay qoladi.` : ''}
                confirmLabel="Ha, o'chirish" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
            />

            {/* Linklar */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Yuklanmoqda">
                    {[0, 1, 2].map(i => <div key={i} className="a-skel" style={{ height: 250, borderRadius: 18 }} />)}
                </div>
            ) : links.length === 0 ? (
                <div className="a-card a-empty">
                    <Target size={34} className="mx-auto mb-3" aria-hidden="true" />
                    <p className="font-semibold" style={{ color: 'var(--a-fg-2)' }}>Hali marketing linklar yo&apos;q</p>
                    <p className="a-sub mt-1">Har bir reklama manbasi uchun alohida link yarating va natijani kuzating.</p>
                    <button type="button" onClick={() => setIsAdding(true)} className="a-btn a-btn-primary mt-4"><Plus size={16} aria-hidden="true" /> Birinchi linkni yarating</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {links.map((link) => {
                        const conversion = link.clicks > 0 ? ((link.leads_count / link.clicks) * 100).toFixed(1) : '0';
                        const fullUrl = getFullUrl(link);
                        const urlCopied = copied?.id === link.id && copied.what === 'url';
                        const refCopied = copied?.id === link.id && copied.what === 'ref';
                        return (
                            <article key={link.id} className="a-card a-card-pad flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="a-h2 leading-tight truncate">{link.name}</h3>
                                            {link.category && <span className={`a-badge ${link.category === 'Language' ? 'is-green' : 'is-blue'}`}>{link.category}</span>}
                                        </div>
                                        <a href={link.target_url.startsWith('http') ? link.target_url : '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs mt-1 hover:underline a-code" style={{ color: 'var(--a-blue-ink)' }}>
                                            <ExternalLink size={11} aria-hidden="true" />
                                            {link.target_url}
                                        </a>
                                    </div>
                                    <button type="button" onClick={() => setDeleteTarget(link)} className="a-btn a-btn-danger a-icon-btn shrink-0" aria-label={`${link.name} linkini o'chirish`}>
                                        <Trash2 size={16} aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="shrink-0 p-2 rounded-xl" style={{ background: '#fff', border: '1px solid var(--a-line)' }}>
                                        <QRCodeSVG value={fullUrl} size={80} level="L" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="a-kicker mb-1">Ref kodi</p>
                                        <button
                                            type="button" onClick={() => copyText(link.ref_code, link.id, 'ref', 'Ref kodi nusxalandi!')}
                                            className="a-code a-btn w-full justify-between" style={{ minHeight: 40, fontSize: '.85rem' }} aria-label={`Ref kodini nusxalash: ${link.ref_code}`}
                                        >
                                            <span className="truncate">{link.ref_code}</span>
                                            {refCopied ? <Check size={15} style={{ color: 'var(--a-green-ink)' }} aria-hidden="true" /> : <Copy size={14} className="a-muted" aria-hidden="true" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button" onClick={() => copyText(fullUrl, link.id, 'url', 'Link nusxalandi!')}
                                    className="a-btn w-full" style={urlCopied ? { color: 'var(--a-green-ink)', borderColor: 'color-mix(in srgb, var(--a-green) 40%, transparent)' } : undefined}
                                    aria-live="polite"
                                >
                                    {urlCopied ? <><Check size={15} aria-hidden="true" /> Nusxalandi!</> : <><Copy size={15} aria-hidden="true" /> To&apos;liq linkni nusxalash</>}
                                </button>

                                <dl className="grid grid-cols-3 gap-2 text-center pt-3" style={{ borderTop: '1px solid var(--a-line)' }}>
                                    <div className="flex flex-col-reverse">
                                        <dt className="a-kicker mt-0.5">Kirish</dt>
                                        <dd className="a-num text-xl font-bold" style={{ color: 'var(--a-blue-ink)' }}>{link.clicks}</dd>
                                    </div>
                                    <div className="flex flex-col-reverse">
                                        <dt className="a-kicker mt-0.5">Ariza</dt>
                                        <dd className="a-num text-xl font-bold" style={{ color: 'var(--a-green-ink)' }}>{link.leads_count}</dd>
                                    </div>
                                    <div className="flex flex-col-reverse">
                                        <dt className="a-kicker mt-0.5">Konv.</dt>
                                        <dd className="a-num text-xl font-bold inline-flex items-baseline justify-center">{conversion}<Percent size={12} aria-hidden="true" /></dd>
                                    </div>
                                </dl>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
