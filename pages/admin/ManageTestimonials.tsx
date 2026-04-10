import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Star, Video, MessageCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface Testimonial {
  id: number;
  name_uz: string; name_ru: string; name_en: string;
  role_uz: string; role_ru: string; role_en: string;
  text_uz: string; text_ru: string; text_en: string;
  image: string;
  rating: number;
  video_id: string;
  type: 'text' | 'video';
  is_active: boolean;
}

type Lang = 'uz' | 'ru' | 'en';

const emptyForm = {
  name_uz: '', name_ru: '', name_en: '',
  role_uz: '', role_ru: '', role_en: '',
  text_uz: '', text_ru: '', text_en: '',
  image: '', rating: 5, video_id: '', type: 'text' as const, is_active: true,
};

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <Star size={22} className={n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'} />
      </button>
    ))}
  </div>
);

const ManageTestimonials: React.FC = () => {
  const { isDark } = useTheme();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lang, setLang] = useState<Lang>('uz');

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/testimonials/all', { headers: headers() });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('Sharhlarni yuklashda xatolik'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setLang('uz'); setModalOpen(true); };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name_uz: t.name_uz, name_ru: t.name_ru, name_en: t.name_en,
      role_uz: t.role_uz, role_ru: t.role_ru, role_en: t.role_en,
      text_uz: t.text_uz, text_ru: t.text_ru, text_en: t.text_en,
      image: t.image || '', rating: t.rating, video_id: t.video_id || '',
      type: t.type, is_active: t.is_active,
    });
    setLang('uz');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_uz) { toast.error('Ism kiritilishi shart (UZ)'); return; }
    try {
      if (editing) {
        await fetch(`/api/testimonials/${editing.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(form) });
        toast.success('Sharh yangilandi');
      } else {
        await fetch('/api/testimonials', { method: 'POST', headers: headers(), body: JSON.stringify(form) });
        toast.success('Sharh qo\'shildi');
      }
      setModalOpen(false);
      fetchItems();
    } catch { toast.error('Saqlashda xatolik'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: headers() });
      toast.success('Sharh o\'chirildi');
      fetchItems();
    } catch { toast.error('Xatolik'); }
  };

  const toggleActive = async (t: Testimonial) => {
    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ ...t, is_active: !t.is_active }),
      });
      fetchItems();
    } catch { toast.error('Xatolik'); }
  };

  const cardCls = `rounded-2xl border ${isDark ? 'bg-slate-800/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'}`;
  const inputCls = `w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isDark ? 'bg-slate-700/50 border-white/10 text-white placeholder-slate-500 focus:border-[#0061ff]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0061ff]'}`;

  const langTabs = (['uz', 'ru', 'en'] as Lang[]).map(l => (
    <button key={l} onClick={() => setLang(l)}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${lang === l ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
      style={lang === l ? { background: 'linear-gradient(135deg, #0061ff, #60efff)' } : {}}
    >{l.toUpperCase()}</button>
  ));

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0061ff]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="text-[#0061ff]" size={28} />
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Sharhlar</h1>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
          <Plus size={18} /> Yangi sharh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map(t => (
          <div key={t.id} className={`${cardCls} p-5 space-y-3 ${!t.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {t.image ? <img src={t.image} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#0061ff]/20 flex items-center justify-center text-[#0061ff] font-bold">{t.name_uz?.[0]}</div>}
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name_uz}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.role_uz}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {t.type === 'video' && <Video size={14} className="text-[#0061ff] mr-1" />}
                {[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} className={n <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />)}
              </div>
            </div>
            <p className={`text-sm line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.text_uz}</p>
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => toggleActive(t)} className={`flex items-center gap-1.5 text-xs font-bold ${t.is_active ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {t.is_active ? 'Faol' : 'Nofaol'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha sharhlar mavjud emas</p>}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${cardCls} w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{editing ? 'Tahrirlash' : 'Yangi sharh'}</h2>
              <button onClick={() => setModalOpen(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100'}`}><X size={20} /></button>
            </div>

            <div className="flex gap-2">{langTabs}</div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ism ({lang.toUpperCase()})</label>
                <input className={inputCls} value={(form as any)[`name_${lang}`]} onChange={e => set(`name_${lang}`, e.target.value)} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lavozim ({lang.toUpperCase()})</label>
                <input className={inputCls} value={(form as any)[`role_${lang}`]} onChange={e => set(`role_${lang}`, e.target.value)} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Matn ({lang.toUpperCase()})</label>
                <textarea className={`${inputCls} min-h-[100px]`} value={(form as any)[`text_${lang}`]} onChange={e => set(`text_${lang}`, e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Rasm URL</label>
                  <input className={inputCls} value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>YouTube Video ID</label>
                  <input className={inputCls} value={form.video_id} onChange={e => set('video_id', e.target.value)} placeholder="dQw4w9WgXcQ" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Reyting</label>
                  <StarRating value={form.rating} onChange={v => set('rating', v)} />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Turi</label>
                  <div className="flex gap-2">
                    {(['text', 'video'] as const).map(tp => (
                      <button key={tp} onClick={() => set('type', tp)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${form.type === tp ? 'text-white' : isDark ? 'text-slate-400 border border-white/10' : 'text-slate-500 border border-slate-200'}`}
                        style={form.type === tp ? { background: 'linear-gradient(135deg, #0061ff, #60efff)' } : {}}>
                        {tp === 'video' ? <Video size={14} /> : <MessageCircle size={14} />} {tp === 'text' ? 'Matn' : 'Video'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => set('is_active', !form.is_active)} className={`flex items-center gap-2 text-sm font-bold ${form.is_active ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {form.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {form.is_active ? 'Faol' : 'Nofaol'}
                </button>
              </div>
            </div>

            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
              <Save size={18} /> Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTestimonials;
