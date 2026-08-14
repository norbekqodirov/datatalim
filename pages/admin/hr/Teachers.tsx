import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Edit3, Trash2, X, Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../store/ThemeContext';

interface Teacher {
  id: number;
  name: string;
  phone: string;
  specialty: string;
  salary_type: 'fixed' | 'percentage';
  salary_amount: number;
  status: 'active' | 'inactive';
  joined_at: string;
}

const EMPTY: Partial<Teacher> = {
  name: '', phone: '', specialty: '', salary_type: 'percentage', salary_amount: 40, status: 'active'
};

export default function Teachers() {
  const { isDark } = useTheme();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Teacher>>(EMPTY);
  const [saving, setSaving] = useState(false);
  
  const token = () => localStorage.getItem('adminToken');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/teachers', { headers: { Authorization: `Bearer ${token()}` } });
      const data = await r.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch { 
      toast.error("Yuklab bo'lmadi"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(t => t.name.toLowerCase().includes(q) || t.phone.includes(q) || t.specialty.toLowerCase().includes(q));
  }, [teachers, search]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (t: Teacher) => { setForm({ ...t }); setEditId(t.id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.phone?.trim()) return toast.error('Ism va telefon majburiy');
    setSaving(true);
    try {
      const url = editId ? `/api/teachers/${editId}` : '/api/teachers';
      const method = editId ? 'PUT' : 'POST';
      const r = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, 
        body: JSON.stringify(form) 
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? "Yangilandi" : "Qo'shildi");
      setShowForm(false);
      fetchTeachers();
    } catch (e: any) { 
      toast.error(e.message || 'Xatolik'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu o'qituvchini o'chirasizmi?")) return;
    await fetch(`/api/teachers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setTeachers(prev => prev.filter(t => t.id !== id));
    toast.success("O'chirildi");
  };

  const card = `rounded-2xl border ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'}`;
  const lbl = `block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className="text-violet-500" size={26} /> Ustozlar
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Markaz o'qituvchilarini boshqarish</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTeachers} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/25">
            <Plus size={16} /> Yangi ustoz
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={`flex gap-3 p-3 rounded-2xl ${card}`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism, telefon yoki mutaxassislik..." className={inp + ' pl-9'} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-violet-500" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">O'qituvchi topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
                <tr>
                  <th className="px-4 py-3 text-left">Ism</th>
                  <th className="px-4 py-3 text-left">Telefon</th>
                  <th className="px-4 py-3 text-left">Mutaxassislik</th>
                  <th className="px-4 py-3 text-left">Oylik turi</th>
                  <th className="px-4 py-3 text-left">Miqdori</th>
                  <th className="px-4 py-3 text-left">Holat</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t) => (
                  <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{t.phone}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{t.specialty}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {t.salary_type === 'fixed' ? 'Fiks (Kadr)' : 'Foizlik ulush'}
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                      {t.salary_type === 'fixed' ? `${t.salary_amount.toLocaleString()} so'm` : `${t.salary_amount}%`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${t.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-slate-800"><Edit3 size={15} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} onClick={e => e.stopPropagation()} className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{editId ? "Ustozni tahrirlash" : "Yangi ustoz qo'shish"}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className={lbl}>Ism familiya *</label><input value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="Aliyev Vali" /></div>
                <div><label className={lbl}>Telefon *</label><input value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp} placeholder="+998 90 123 45 67" /></div>
                <div><label className={lbl}>Mutaxassislik (Yo'nalish)</label><input value={form.specialty||''} onChange={e=>setForm(f=>({...f,specialty:e.target.value}))} className={inp} placeholder="Ingliz tili, Matematika..." /></div>
                
                <div>
                  <label className={lbl}>Oylik turi</label>
                  <select value={form.salary_type||'percentage'} onChange={e=>setForm(f=>({...f,salary_type:e.target.value as any}))} className={inp}>
                    <option value="percentage">Foiz (%) - Dars soatiga qarab</option>
                    <option value="fixed">Fiks (Bir xil oylik)</option>
                  </select>
                </div>
                <div><label className={lbl}>Oylik ulushi (% yoki Summa)</label><input type="number" value={form.salary_amount||0} onChange={e=>setForm(f=>({...f,salary_amount:Number(e.target.value)}))} className={inp} /></div>
                
                <div className="sm:col-span-2">
                  <label className={lbl}>Holat</label>
                  <select value={form.status||'active'} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))} className={inp}>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Bekor</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
