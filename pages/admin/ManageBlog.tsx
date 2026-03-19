import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, FileText, Eye, EyeOff, Bold, Italic, Heading, Code, Link, Image, AlignLeft, Columns } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

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
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0">')
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

type Lang = 'uz' | 'ru' | 'en';

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
  const { isDark } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lang, setLang] = useState<Lang>('uz');
  const [previewMode, setPreviewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [coverUploading, setCoverUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
      const toBase64 = (f: File) => new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f);
      });
      const base64 = await toBase64(file);
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ image: base64, filename: file.name }),
      });
      const d = await resp.json();
      if (d.url) { updateField('cover_image', d.url); toast.success('Rasm yuklandi!'); }
      else toast.error('Yuklash xatoligi');
    } catch { toast.error('Xatolik'); } finally { setCoverUploading(false); }
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
    setLang('uz');
    setModalOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      title_uz: post.title_uz || '', title_ru: post.title_ru || '', title_en: post.title_en || '',
      content_uz: post.content_uz || '', content_ru: post.content_ru || '', content_en: post.content_en || '',
      excerpt_uz: post.excerpt_uz || '', excerpt_ru: post.excerpt_ru || '', excerpt_en: post.excerpt_en || '',
      cover_image: post.cover_image || '',
      category: post.category || '', slug: post.slug || '',
      is_published: post.is_published ?? true,
    });
    setLang('uz');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title_uz) {
      toast.error("O'zbek tili uchun sarlavha kerak");
      return;
    }
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title_uz),
    };
    try {
      if (editingPost) {
        await fetch(`/api/posts/${editingPost.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
        toast.success('Post yangilandi');
      } else {
        await fetch('/api/posts', { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
        toast.success('Post qo\'shildi');
      }
      setModalOpen(false);
      fetchPosts();
    } catch { toast.error('Xatolik yuz berdi'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Rostdan o\'chirmoqchimisiz?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: headers() });
      toast.success('Post o\'chirildi');
      fetchPosts();
    } catch { toast.error('Xatolik'); }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title_uz' && !editingPost) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const langTabs: { code: Lang; label: string }[] = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
    isDark
      ? 'bg-slate-800/80 text-white border border-slate-700 focus:border-blue-500 placeholder-slate-500'
      : 'bg-slate-50 text-slate-900 border border-slate-200 focus:border-blue-400 placeholder-slate-400'
  }`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
            <FileText className={isDark ? 'text-[#60efff]' : 'text-[#0061ff]'} size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Blog boshqaruvi</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{posts.length} ta post</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0061ff] text-white font-bold text-sm hover:bg-blue-600 transition-colors">
          <Plus size={18} /> Yangi post
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0061ff]" />
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div
              key={post.id}
              className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
                isDark ? 'bg-slate-800/60 border border-slate-700/50 hover:border-slate-600' : 'bg-white border border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {post.cover_image && (
                  <img src={post.cover_image} alt="" className="w-16 h-12 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title_uz}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {post.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDark ? 'bg-blue-500/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'}`}>
                        {post.category}
                      </span>
                    )}
                    <span className={`text-xs flex items-center gap-1 ${post.is_published ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {post.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button onClick={() => openEdit(post)} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(post.id)} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hali postlar yo'q</p>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 ${
              isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingPost ? 'Postni tahrirlash' : 'Yangi post'}
              </h2>
              <button onClick={() => setModalOpen(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 mb-6">
              {langTabs.map(tab => (
                <button
                  key={tab.code}
                  onClick={() => setLang(tab.code)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    lang === tab.code
                      ? 'bg-[#0061ff] text-white'
                      : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Title per language */}
              <div>
                <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Sarlavha ({lang.toUpperCase()})
                </label>
                <input
                  className={inputClass}
                  value={(form as any)[`title_${lang}`]}
                  onChange={e => updateField(`title_${lang}`, e.target.value)}
                  placeholder="Sarlavha..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Slug</label>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="post-slug"
                />
              </div>

              {/* Content — Markdown Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Kontent ({lang.toUpperCase()}) — Markdown
                  </label>
                  {/* View mode toggle */}
                  <div className={`flex rounded-xl overflow-hidden border text-xs font-bold ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    {([['edit', <AlignLeft size={12} />, 'Yozish'], ['split', <Columns size={12} />, 'Split'], ['preview', <Eye size={12} />, 'Ko\'rish']] as [typeof previewMode, React.ReactNode, string][]).map(([mode, icon, label]) => (
                      <button key={mode} onClick={() => setPreviewMode(mode)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${previewMode === mode ? 'bg-[#0061ff] text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500'}`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar */}
                {previewMode !== 'preview' && (
                  <div className={`flex items-center gap-1 mb-2 p-1.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {[
                      { icon: <Bold size={14} />, action: () => insertMarkdown('**', '**', 'qalin matn'), title: 'Qalin' },
                      { icon: <Italic size={14} />, action: () => insertMarkdown('*', '*', 'kursiv'), title: 'Kursiv' },
                      { icon: <Heading size={14} />, action: () => insertMarkdown('## ', '', 'Sarlavha'), title: 'H2' },
                      { icon: <Code size={14} />, action: () => insertMarkdown('`', '`', 'kod'), title: 'Kod' },
                      { icon: <Link size={14} />, action: () => insertMarkdown('[', '](https://)', 'link matni'), title: 'Link' },
                      { icon: <Image size={14} />, action: () => insertMarkdown('![', '](https://)', 'rasm'), title: 'Rasm' },
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} title={btn.title}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
                        {btn.icon}
                      </button>
                    ))}
                    <div className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Markdown qo'llab-quvvatlanadi</span>
                  </div>
                )}

                {/* Editor / Preview */}
                <div className={`flex gap-3 ${previewMode === 'split' ? 'flex-row' : 'flex-col'}`}>
                  {previewMode !== 'preview' && (
                    <textarea
                      ref={contentRef}
                      className={`${inputClass} resize-y font-mono text-xs leading-relaxed ${previewMode === 'split' ? 'flex-1 min-h-[300px]' : 'min-h-[250px]'}`}
                      value={(form as any)[`content_${lang}`]}
                      onChange={e => updateField(`content_${lang}`, e.target.value)}
                      placeholder="# Sarlavha&#10;&#10;**Qalin** va *kursiv* matnlar&#10;&#10;- Ro'yxat elementi&#10;- Boshqa element"
                    />
                  )}
                  {previewMode !== 'edit' && (
                    <div
                      className={`rounded-xl border p-4 text-sm leading-relaxed ${previewMode === 'split' ? 'flex-1 min-h-[300px] overflow-y-auto' : 'min-h-[200px]'} ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      dangerouslySetInnerHTML={{ __html: (form as any)[`content_${lang}`] ? renderMarkdown((form as any)[`content_${lang}`]) : `<span style="opacity:0.4">Preview bu yerda ko'rinadi...</span>` }}
                    />
                  )}
                </div>
              </div>

              {/* Excerpt per language */}
              <div>
                <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Qisqa tavsif ({lang.toUpperCase()})
                </label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  value={(form as any)[`excerpt_${lang}`]}
                  onChange={e => updateField(`excerpt_${lang}`, e.target.value)}
                  placeholder="Qisqa tavsif..."
                />
              </div>

              {/* Cover image */}
              <div>
                <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Muqova rasmi</label>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={form.cover_image}
                    onChange={e => updateField('cover_image', e.target.value)}
                    placeholder="https://... yoki fayldan yuklang"
                  />
                  <label className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${coverUploading ? 'opacity-50' : ''} ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <Image size={14} /> {coverUploading ? 'Yuklanmoqda...' : 'Yuklash'}
                    <input type="file" accept="image/*" className="hidden" disabled={coverUploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }} />
                  </label>
                </div>
                {form.cover_image && (
                  <img src={form.cover_image} alt="preview" className="mt-2 h-24 rounded-xl object-cover border border-slate-200" />
                )}
              </div>

              {/* Category */}
              <div>
                <label className={`text-sm font-bold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kategoriya</label>
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={e => updateField('category', e.target.value)}
                  placeholder="Texnologiya, Ta'lim..."
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateField('is_published', !form.is_published)}
                  className={`w-12 h-7 rounded-full relative transition-colors ${form.is_published ? 'bg-[#0061ff]' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${form.is_published ? 'left-6' : 'left-1'}`} />
                </button>
                <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setModalOpen(false)}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0061ff] text-white text-sm font-bold hover:bg-blue-600 transition-colors"
              >
                <Save size={16} /> Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePosts;
