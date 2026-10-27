import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, FileText, Eye, Bold, Italic, Heading, Code, Link, Image, AlignLeft, Columns, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { uploadImageToAPI } from '../../utils/api';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { PageHeader, Field, Overlay, ConfirmDialog, CloseBtn, Switch, Spinner, useBeforeUnload } from '../../components/admin/ui/kit';


// URL xavfsizligi: faqat http(s), mailto, nisbiy yo'l va #anchor; javascript:/data: bloklanadi.
// Kirish matni allaqachon & < > dan escape qilingan, bu yerda qo'shtirnoqlar ham escape qilinadi.
function safeUrl(raw: string): string {
  const url = raw.trim().replace(/&amp;/g, '&');
  // Boshqaruv belgilari va bo'shliqlar orqali "java\nscript:" kabi aylanib o'tishni oldini olish
  const compact = url.replace(/[\u0000- \u007f-\u009f]/g, '');
  if (/^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(compact) || !/^[a-z][a-z0-9+.-]*:/i.test(compact)) {
    return url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  return '#';
}
const escAttr = (v: string): string => v.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Simple markdown renderer (no external dep)
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1em;font-weight:800;margin:12px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.25em;font-weight:800;margin:16px 0 6px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.5em;font-weight:900;margin:20px 0 8px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
    // Rasm avval (![alt](url)), keyin havola; qiymatlar escape qilinadi va xavfli URL bloklanadi
    .replace(/!\[(.*?)\]\((.+?)\)/g, (_m, alt, src) => `<img src="${safeUrl(src)}" alt="${escAttr(alt)}" style="max-width:100%;border-radius:8px;margin:8px 0">`)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_m, text, href) => `<a href="${safeUrl(href)}" rel="noopener noreferrer" target="_blank" style="color:#3b82f6;text-decoration:underline">${text}</a>`)
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul style="margin:8px 0;padding-left:20px">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:8px 0">')
    .replace(/^(?!<[h1-6ul]|<\/[h1-6ul])(.+)$/gm, (m) => m.startsWith('<') ? m : m)
    .trim();
}

interface Post {
  id: number;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  cover_image: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

const emptyForm = {
  title_uz: '', title_ru: '', title_en: '',
  content_uz: '', content_ru: '', content_en: '',
  excerpt_uz: '', excerpt_ru: '', excerpt_en: '',
  cover_image: '', category: '', slug: '',
  is_published: true,
};

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const ManagePosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [baseline, setBaseline] = useState(JSON.stringify(emptyForm));
  const [lang, setLang] = useState<Lang>('uz');
  const [previewMode, setPreviewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'pub' | 'draft'>('all');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const dirty = modalOpen && JSON.stringify(form) !== baseline;
  useBeforeUnload(dirty);

  const insertMarkdown = (before: string, after = '', placeholder = 'matn') => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end) || placeholder;
    const newVal = ta.value.slice(0, start) + before + selected + after + ta.value.slice(end);
    updateField(`content_${lang}`, newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
  };

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const url = await uploadImageToAPI(file);
      updateField('cover_image', url);
      toast.success('Rasm yuklandi!');
    } catch { toast.error('Yuklash xatoligi'); } finally { setCoverUploading(false); }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', { headers: headers() });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch { toast.error('Blog postlarni yuklashda xatolik'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openAdd = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setBaseline(JSON.stringify(emptyForm));
    setTitleError('');
    setLang('uz');
    setModalOpen(true);
  };

  const openEdit = (post: Post) => {
    const next = {
      title_uz: post.title_uz || '', title_ru: post.title_ru || '', title_en: post.title_en || '',
      content_uz: post.content_uz || '', content_ru: post.content_ru || '', content_en: post.content_en || '',
      excerpt_uz: post.excerpt_uz || '', excerpt_ru: post.excerpt_ru || '', excerpt_en: post.excerpt_en || '',
      cover_image: post.cover_image || '',
      category: post.category || '', slug: post.slug || '',
      is_published: post.is_published ?? true,
    };
    setEditingPost(post);
    setForm(next);
    setBaseline(JSON.stringify(next));
    setTitleError('');
    setLang('uz');
    setModalOpen(true);
  };

  const requestClose = () => { if (dirty) setDiscardOpen(true); else setModalOpen(false); };

  const handleSave = async () => {
    if (!form.title_uz) {
      setTitleError('Oʻzbek tili uchun sarlavha kerak');
      setLang('uz');
      toast.error("O'zbek tili uchun sarlavha kerak");
      return;
    }
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title_uz),
    };
    setSaving(true);
    try {
      const res = editingPost
        ? await fetch(`/api/posts/${editingPost.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) })
        : await fetch('/api/posts', { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(res.status === 409 ? 'Bu slug allaqachon mavjud' : data.error || 'Saqlab bo\'lmadi');
        return;
      }
      toast.success(editingPost ? 'Post yangilandi' : 'Post qo\'shildi');
      setModalOpen(false);
      fetchPosts();
    } catch { toast.error('Xatolik yuz berdi'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteTarget.id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) { toast.error('O\'chirib bo\'lmadi'); return; }
      toast.success('Post o\'chirildi');
      setDeleteTarget(null);
      fetchPosts();
    } catch { toast.error('Xatolik'); }
    finally { setDeleting(false); }
  };

  const updateField = (field: string, value: string | boolean) => {
    if (field === 'title_uz' && value) setTitleError('');
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title_uz' && !editingPost) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(p => {
      if (status === 'pub' && !p.is_published) return false;
      if (status === 'draft' && p.is_published) return false;
      if (!q) return true;
      return [p.title_uz, p.title_ru, p.title_en, p.category, p.slug].join(' ').toLowerCase().includes(q);
    });
  }, [posts, query, status]);

  const pubCount = posts.filter(p => p.is_published).length;
  const L = lang.toUpperCase();
  const content = (form as any)[`content_${lang}`] as string;

  return (
    <div>
      <PageHeader
        kicker="Kontent"
        title="Blog"
        sub={`${posts.length} ta post, ${pubCount} tasi nashr qilingan.`}
        actions={<button type="button" onClick={openAdd} className="a-btn a-btn-primary"><Plus size={18} aria-hidden="true" /> Yangi post</button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="a-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" className="a-input" placeholder="Sarlavha, kategoriya yoki slug" aria-label="Postlarni qidirish" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="a-scrollx" role="group" aria-label="Holat filtri">
          {([['all', 'Hammasi', posts.length], ['pub', 'Nashr qilingan', pubCount], ['draft', 'Qoralama', posts.length - pubCount]] as const).map(([k, label, n]) => (
            <button key={k} type="button" className="a-chip" aria-pressed={status === k} onClick={() => setStatus(k)}>
              {label}<span className="a-chip-n">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3" aria-busy="true" aria-label="Yuklanmoqda">
          {[0, 1, 2].map(i => <div key={i} className="a-skel" style={{ height: 84 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="a-card a-empty">
          <FileText size={34} className="mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold" style={{ color: 'var(--a-fg-2)' }}>{posts.length === 0 ? 'Hali postlar yo\'q' : 'Hech narsa topilmadi'}</p>
          <p className="a-sub mt-1">{posts.length === 0 ? 'Birinchi maqolani yozing.' : 'Qidiruv yoki filtrni o\'zgartirib ko\'ring.'}</p>
          {posts.length === 0
            ? <button type="button" className="a-btn a-btn-primary mt-4" onClick={openAdd}><Plus size={16} aria-hidden="true" /> Yangi post</button>
            : <button type="button" className="a-btn mt-4" onClick={() => { setQuery(''); setStatus('all'); }}>Filtrni tozalash</button>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(post => (
            <article key={post.id} className="a-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="a-thumb" style={{ width: 84, height: 60, borderRadius: 12 }}>
                {post.cover_image ? <img src={post.cover_image} alt="" loading="lazy" decoding="async" /> : <FileText size={20} aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{post.title_uz}</h3>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
                  <span className={`a-badge ${post.is_published ? 'is-green' : 'is-amber'}`}>{post.is_published ? 'Nashr qilingan' : 'Qoralama'}</span>
                  {post.category && <span className="a-badge is-blue">{post.category}</span>}
                  <span className="a-muted a-num text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => openEdit(post)} className="a-btn a-icon-btn" aria-label={`${post.title_uz} postini tahrirlash`}><Pencil size={16} aria-hidden="true" /></button>
                <button type="button" onClick={() => setDeleteTarget(post)} className="a-btn a-btn-danger a-icon-btn" aria-label={`${post.title_uz} postini o'chirish`}><Trash2 size={16} aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tahrirlash oynasi */}
      <Overlay open={modalOpen} onClose={requestClose} labelledBy="post-dlg-title" wide lockClose={saving}>
        <div className="a-dialog-head">
          <div className="min-w-0">
            <h2 id="post-dlg-title" className="a-h2">{editingPost ? 'Postni tahrirlash' : 'Yangi post'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <AdminLangTabs activeTab={lang} onTabChange={setLang} />
            <CloseBtn onClick={requestClose} />
          </div>
        </div>

        <div className="a-dialog-body grid gap-5">
          <Field label={`Sarlavha (${L})`} error={lang === 'uz' ? titleError : ''}>
            {id => <input id={id} className="a-input" value={(form as any)[`title_${lang}`]} onChange={e => updateField(`title_${lang}`, e.target.value)} placeholder="Sarlavha..." aria-invalid={!!titleError && lang === 'uz'} />}
          </Field>

          <Field label="Slug" help="Havola manzili: /blog/slug. Bo'sh qoldirsangiz sarlavhadan avtomatik yaratiladi.">
            {id => <input id={id} className="a-input a-code" style={{ fontSize: '.85rem' }} value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="post-slug" />}
          </Field>

          {/* Kontent — Markdown */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="a-label" style={{ margin: 0 }} htmlFor="post-content">Kontent ({L}) — Markdown</label>
              <div className="a-tabs" role="group" aria-label="Ko'rinish rejimi">
                {([['edit', <AlignLeft size={13} />, 'Yozish'], ['split', <Columns size={13} />, 'Ikkiga'], ['preview', <Eye size={13} />, 'Ko\'rish']] as [typeof previewMode, React.ReactNode, string][]).map(([mode, icon, label]) => (
                  <button key={mode} type="button" aria-pressed={previewMode === mode} aria-selected={previewMode === mode} onClick={() => setPreviewMode(mode)} className="a-tab inline-flex items-center gap-1.5" style={{ minHeight: 32 }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {previewMode !== 'preview' && (
              <div className="a-toolbar mb-2" role="toolbar" aria-label="Matn formati">
                {[
                  { icon: <Bold size={15} />, action: () => insertMarkdown('**', '**', 'qalin matn'), title: 'Qalin' },
                  { icon: <Italic size={15} />, action: () => insertMarkdown('*', '*', 'kursiv'), title: 'Kursiv' },
                  { icon: <Heading size={15} />, action: () => insertMarkdown('## ', '', 'Sarlavha'), title: 'Sarlavha (H2)' },
                  { icon: <Code size={15} />, action: () => insertMarkdown('`', '`', 'kod'), title: 'Kod' },
                  { icon: <Link size={15} />, action: () => insertMarkdown('[', '](https://)', 'link matni'), title: 'Havola' },
                  { icon: <Image size={15} />, action: () => insertMarkdown('![', '](https://)', 'rasm'), title: 'Rasm' },
                ].map((btn, i) => (
                  <button key={i} type="button" onClick={btn.action} title={btn.title} aria-label={btn.title}>{btn.icon}</button>
                ))}
                <span className="a-muted text-xs ml-2 hidden sm:inline">Markdown qo&apos;llab-quvvatlanadi</span>
              </div>
            )}

            <div className={`grid gap-3 ${previewMode === 'split' ? 'md:grid-cols-2' : ''}`}>
              {previewMode !== 'preview' && (
                <textarea
                  id="post-content" ref={contentRef}
                  className="a-textarea a-code" style={{ fontSize: '.8rem', minHeight: previewMode === 'split' ? 320 : 260 }}
                  value={content}
                  onChange={e => updateField(`content_${lang}`, e.target.value)}
                  placeholder={"# Sarlavha\n\n**Qalin** va *kursiv* matnlar\n\n- Ro'yxat elementi\n- Boshqa element"}
                />
              )}
              {previewMode !== 'edit' && (
                <div
                  className="a-prose rounded-xl p-4 overflow-y-auto"
                  style={{ border: '1px solid var(--a-line)', background: 'var(--a-surface-2)', minHeight: previewMode === 'split' ? 320 : 200, maxHeight: 420 }}
                  dangerouslySetInnerHTML={{ __html: content ? DOMPurify.sanitize(renderMarkdown(content)) : `<span style="opacity:0.5">Ko'rinish shu yerda chiqadi...</span>` }}
                />
              )}
            </div>
          </div>

          <Field label={`Qisqa tavsif (${L})`}>
            {id => <textarea id={id} className="a-textarea" style={{ minHeight: 80 }} value={(form as any)[`excerpt_${lang}`]} onChange={e => updateField(`excerpt_${lang}`, e.target.value)} placeholder="Qisqa tavsif..." />}
          </Field>

          <div>
            <Field label="Muqova rasmi (havola)">
              {id => <input id={id} className="a-input" value={form.cover_image} onChange={e => updateField('cover_image', e.target.value)} placeholder="https://... yoki fayldan yuklang" />}
            </Field>
            <div className="a-dropzone mt-2.5">
              <div className="a-thumb" style={{ width: 96, height: 64, borderRadius: 12 }}>
                {form.cover_image ? <img src={form.cover_image} alt="Muqova ko'rinishi" /> : <Image size={22} aria-hidden="true" />}
              </div>
              <label className="a-btn" style={{ cursor: coverUploading ? 'wait' : 'pointer', opacity: coverUploading ? 0.6 : 1 }}>
                {coverUploading ? <Spinner /> : <Image size={16} aria-hidden="true" />}
                {coverUploading ? 'Yuklanmoqda...' : 'Fayldan yuklash'}
                <input type="file" accept="image/*" className="sr-only" disabled={coverUploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }} />
              </label>
            </div>
          </div>

          <div className="a-grid2">
            <Field label="Kategoriya">
              {id => <input id={id} className="a-input" value={form.category} onChange={e => updateField('category', e.target.value)} placeholder="Texnologiya, Ta'lim..." />}
            </Field>
            <div>
              <span className="a-label">Holat</span>
              <div className="flex items-center gap-3 a-item" style={{ padding: '.3rem .85rem' }}>
                <Switch checked={form.is_published} onChange={() => updateField('is_published', !form.is_published)} label="Nashr qilish" />
                <span className="text-sm font-semibold">{form.is_published ? 'Nashr qilingan' : 'Qoralama'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="a-dialog-foot">
          {dirty && <span className="mr-auto inline-flex items-center gap-2 text-sm font-semibold"><span className="a-dot" aria-hidden="true" />Saqlanmagan</span>}
          <button type="button" className="a-btn" onClick={requestClose} disabled={saving}>Bekor qilish</button>
          <button type="button" className="a-btn a-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : <Save size={16} aria-hidden="true" />}{saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </Overlay>

      <ConfirmDialog
        open={!!deleteTarget} title="Postni o'chirasizmi?" busy={deleting}
        message={deleteTarget ? `"${deleteTarget.title_uz}" posti butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.` : ''}
        confirmLabel="Ha, o'chirish" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={discardOpen} title="O'zgarishlar saqlanmasin?" danger={false}
        message="Saqlanmagan o'zgarishlar bor. Chiqsangiz, ular yo'qoladi."
        confirmLabel="Chiqish" cancelLabel="Tahrirlashda qolish"
        onConfirm={() => { setDiscardOpen(false); setModalOpen(false); }} onCancel={() => setDiscardOpen(false)}
      />
    </div>
  );
};

export default ManagePosts;
