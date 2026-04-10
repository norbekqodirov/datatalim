import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Save, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface FAQ {
  id: number;
  question_uz: string;
  question_ru: string;
  question_en: string;
  answer_uz: string;
  answer_ru: string;
  answer_en: string;
  order_index: number;
}

type Lang = 'uz' | 'ru' | 'en';

const emptyFAQ = {
  question_uz: '', question_ru: '', question_en: '',
  answer_uz: '', answer_ru: '', answer_en: '',
};

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const ManageFAQ: React.FC = () => {
  const { isDark } = useTheme();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyFAQ);
  const [lang, setLang] = useState<Lang>('uz');

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch { toast.error('FAQ yuklashda xatolik'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const openAdd = () => {
    setEditingFaq(null);
    setForm(emptyFAQ);
    setLang('uz');
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({
      question_uz: faq.question_uz, question_ru: faq.question_ru, question_en: faq.question_en,
      answer_uz: faq.answer_uz, answer_ru: faq.answer_ru, answer_en: faq.answer_en,
    });
    setLang('uz');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question_uz || !form.answer_uz) {
      toast.error("O'zbek tili uchun savol va javob kerak");
      return;
    }
    try {
      if (editingFaq) {
        await fetch(`/api/faqs/${editingFaq.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(form) });
        toast.success('FAQ yangilandi');
      } else {
        await fetch('/api/faqs', { method: 'POST', headers: headers(), body: JSON.stringify(form) });
        toast.success('FAQ qo\'shildi');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch { toast.error('Saqlashda xatolik'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Haqiqatan o\'chirmoqchimisiz?')) return;
    try {
      await fetch(`/api/faqs/${id}`, { method: 'DELETE', headers: headers() });
      toast.success('FAQ o\'chirildi');
      fetchFaqs();
    } catch { toast.error('O\'chirishda xatolik'); }
  };

  const handleMove = async (id: number, direction: 'up' | 'down') => {
    const idx = faqs.findIndex(f => f.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === faqs.length - 1)) return;
    const newFaqs = [...faqs];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newFaqs[idx], newFaqs[swapIdx]] = [newFaqs[swapIdx], newFaqs[idx]];
    setFaqs(newFaqs);
    try {
      const updates = newFaqs.map((f, i) => fetch(`/api/faqs/${f.id}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ ...f, order_index: i }),
      }));
      await Promise.all(updates);
    } catch { toast.error('Tartibni saqlashda xatolik'); }
  };

  const cardCls = `rounded-2xl border ${isDark ? 'bg-slate-800/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'}`;
  const inputCls = `w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isDark ? 'bg-slate-700/50 border-white/10 text-white placeholder-slate-500 focus:border-[#0061ff]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0061ff]'}`;

  const langTabs = (['uz', 'ru', 'en'] as Lang[]).map(l => (
    <button key={l} onClick={() => setLang(l)}
      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${lang === l ? 'text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
      style={lang === l ? { background: 'linear-gradient(135deg, #0061ff, #60efff)' } : {}}
    >{l.toUpperCase()}</button>
  ));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0061ff]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-[#0061ff]" size={28} />
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>FAQ boshqaruvi</h1>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
          <Plus size={18} /> Yangi FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className={`${cardCls} p-5 flex items-start gap-4`}>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleMove(faq.id, 'up')} disabled={idx === 0} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 disabled:opacity-30' : 'hover:bg-slate-100 disabled:opacity-30'}`}><ChevronUp size={16} /></button>
              <button onClick={() => handleMove(faq.id, 'down')} disabled={idx === faqs.length - 1} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 disabled:opacity-30' : 'hover:bg-slate-100 disabled:opacity-30'}`}><ChevronDown size={16} /></button>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{faq.question_uz}</h3>
              <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{faq.answer_uz}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(faq)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(faq.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hozircha FAQ mavjud emas</p>}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${cardCls} w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingFaq ? 'FAQ tahrirlash' : 'Yangi FAQ'}</h2>
              <button onClick={() => setModalOpen(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20} /></button>
            </div>
            <div className="flex gap-2">{langTabs}</div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Savol ({lang.toUpperCase()})</label>
                <input className={inputCls} value={(form as any)[`question_${lang}`]} onChange={e => setForm({ ...form, [`question_${lang}`]: e.target.value })} placeholder="Savolni kiriting..." />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Javob ({lang.toUpperCase()})</label>
                <textarea className={`${inputCls} min-h-[120px]`} value={(form as any)[`answer_${lang}`]} onChange={e => setForm({ ...form, [`answer_${lang}`]: e.target.value })} placeholder="Javobni kiriting..." />
              </div>
            </div>
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
              <Save size={18} /> Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFAQ;
