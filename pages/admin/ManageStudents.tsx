import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Phone, Mail, MapPin, Edit3, Trash2,
  X, Save, Loader2, ChevronDown, Filter, UserCheck, UserX,
  GraduationCap, BookOpen, Calendar, Star, RefreshCw,
  Download, Eye, User, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface Student {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  birth_date: string;
  gender: string;
  photo: string;
  parent_name: string;
  parent_phone: string;
  status: 'active' | 'graduated' | 'paused' | 'expelled';
  source: string;
  notes: string;
  created_at: string;
  active_groups?: number;
  total_paid?: number;
}

const STATUS_CFG = {
  active:    { label: "Faol",      color: "text-green-500",  bg: "bg-green-500/10",  dot: "bg-green-500"  },
  graduated: { label: "Bitirgan",  color: "text-blue-500",   bg: "bg-blue-500/10",   dot: "bg-blue-500"   },
  paused:    { label: "To'xtatdi", color: "text-amber-500",  bg: "bg-amber-500/10",  dot: "bg-amber-500"  },
  expelled:  { label: "Chiqarildi",color: "text-red-500",    bg: "bg-red-500/10",    dot: "bg-red-500"    },
};

const EMPTY: Partial<Student> = {
  name:'', phone:'', email:'', address:'', birth_date:'', gender:'',
  photo:'', parent_name:'', parent_phone:'', status:'active', source:'', notes:''
};

export default function ManageStudents() {
  const { isDark } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Student>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const token = () => localStorage.getItem('adminToken');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/students', { headers: { Authorization: `Bearer ${token()}` } });
      setStudents(await r.json());
    } catch { toast.error("Yuklab bo'lmadi"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const filtered = useMemo(() => {
    let r = students;
    if (filterStatus !== 'all') r = r.filter(s => s.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.email.toLowerCase().includes(q));
    }
    return r;
  }, [students, filterStatus, search]);

  const statusCounts = useMemo(() =>
    students.reduce((a, s) => ({ ...a, [s.status]: (a[s.status] || 0) + 1 }), {} as Record<string,number>)
  , [students]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (s: Student) => { setForm({ ...s }); setEditId(s.id); setShowForm(true); };

  const openView = async (id: number) => {
    setViewId(id);
    const r = await fetch(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
    setViewData(await r.json());
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.phone?.trim()) return toast.error('Ism va telefon majburiy');
    setSaving(true);
    try {
      const url = editId ? `/api/students/${editId}` : '/api/students';
      const method = editId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? "Yangilandi" : "Qo'shildi");
      setShowForm(false);
      fetch_();
    } catch (e: any) { toast.error(e.message || 'Xatolik'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu o'quvchini o'chirasizmi?")) return;
    await fetch(`/api/students/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token()}` } });
    setStudents(prev => prev.filter(s => s.id !== id));
    toast.success("O'chirildi");
  };

  const exportCSV = () => {
    const h = ['ID','Ism','Telefon','Email','Manzil','Tug\'ilgan kun','Jinsi','Ota-ona','Ota-ona tel','Status','Manba','Guruhlar','To\'lov','Sana'];
    const rows = filtered.map(s => [s.id,`"${s.name}"`,s.phone,s.email,`"${s.address}"`,s.birth_date,s.gender,`"${s.parent_name}"`,s.parent_phone,STATUS_CFG[s.status]?.label,s.source,s.active_groups||0,s.total_paid||0,new Date(s.created_at).toLocaleDateString('uz-UZ')]);
    const csv = [h,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));
    a.download = `students-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    toast.success('CSV yuklab olindi');
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
            <Users className="text-violet-500" size={26} /> O'quvchilar
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Barcha o'quvchilar ro'yxati va boshqaruvi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Download size={15} /> CSV
          </button>
          <button onClick={fetch_} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/25">
            <Plus size={16} /> Yangi o'quvchi
          </button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(STATUS_CFG) as any[]).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
            className={`p-4 rounded-2xl border text-left transition-all ${filterStatus === key ? (isDark ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500 bg-violet-50') : (isDark ? 'bg-slate-800/60 border-white/10 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50')}`}>
            <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{statusCounts[key] || 0}</div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cfg.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className={`flex gap-3 p-3 rounded-2xl ${card}`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki email..." className={inp + ' pl-9'} />
        </div>
        <div className="relative">
          <Filter size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={inp + ' pl-9 pr-8 appearance-none w-40'}>
            <option value="all">Barchasi ({students.length})</option>
            {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label} ({statusCounts[k]||0})</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-violet-500" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">O'quvchi topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Ism</th>
                  <th className="px-4 py-3 text-left">Telefon</th>
                  <th className="px-4 py-3 text-left">Guruhlar</th>
                  <th className="px-4 py-3 text-left">Jami to'lov</th>
                  <th className="px-4 py-3 text-left">Holat</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s, i) => {
                  const cfg = STATUS_CFG[s.status];
                  return (
                    <tr key={s.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                            {s.email && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          <BookOpen size={11} /> {s.active_groups || 0} ta
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {(s.total_paid || 0).toLocaleString()} so'm
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(s.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(s.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`} title="Ko'rish"><Eye size={15} /></button>
                          <button onClick={() => openEdit(s)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`} title="Tahrirlash"><Edit3 size={15} /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="O'chirish"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editId ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Basic info */}
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Asosiy ma'lumotlar</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Ism familiya *</label><input value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="Abdullayev Jasur" /></div>
                    <div><label className={lbl}>Telefon *</label><input value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className={inp} placeholder="+998 90 123 45 67" /></div>
                    <div><label className={lbl}>Email</label><input type="email" value={form.email||''} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp} placeholder="email@mail.com" /></div>
                    <div><label className={lbl}>Tug'ilgan sana</label><input type="date" value={form.birth_date||''} onChange={e=>setForm(f=>({...f,birth_date:e.target.value}))} className={inp} /></div>
                    <div>
                      <label className={lbl}>Jinsi</label>
                      <select value={form.gender||''} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} className={inp}>
                        <option value="">Tanlang</option><option value="male">Erkak</option><option value="female">Ayol</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Holat</label>
                      <select value={form.status||'active'} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))} className={inp}>
                        {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2"><label className={lbl}>Manzil</label><input value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className={inp} placeholder="Toshkent, Yunusobod tumani" /></div>
                  </div>
                </div>

                {/* Parent info */}
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ota-ona ma'lumotlari</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={lbl}>Ota-ona ismi</label><input value={form.parent_name||''} onChange={e=>setForm(f=>({...f,parent_name:e.target.value}))} className={inp} placeholder="Abdullayev Karim" /></div>
                    <div><label className={lbl}>Ota-ona telefoni</label><input value={form.parent_phone||''} onChange={e=>setForm(f=>({...f,parent_phone:e.target.value}))} className={inp} placeholder="+998 91 234 56 78" /></div>
                  </div>
                </div>

                {/* Extra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={lbl}>Manba (qayerdan keldi)</label><input value={form.source||''} onChange={e=>setForm(f=>({...f,source:e.target.value}))} className={inp} placeholder="Instagram, do'st, reklama..." /></div>
                  <div><label className={lbl}>Izoh</label><input value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className={inp} placeholder="Qo'shimcha ma'lumot..." /></div>
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

      {/* View Modal */}
      <AnimatePresence>
        {viewId && viewData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setViewId(null); setViewData(null); }}>
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-xl rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{viewData.name}</h2>
                <button onClick={() => { setViewId(null); setViewData(null); }}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Info rows */}
                {[
                  { icon: Phone, label: 'Telefon', val: viewData.phone },
                  { icon: Mail, label: 'Email', val: viewData.email || '—' },
                  { icon: MapPin, label: 'Manzil', val: viewData.address || '—' },
                  { icon: Calendar, label: "Tug'ilgan", val: viewData.birth_date || '—' },
                  { icon: User, label: 'Ota-ona', val: viewData.parent_name ? `${viewData.parent_name} — ${viewData.parent_phone}` : '—' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon size={15} className={`mt-0.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{val}</p>
                    </div>
                  </div>
                ))}
                {/* Groups */}
                {viewData.groups?.length > 0 && (
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Guruhlar</p>
                    <div className="space-y-2">
                      {viewData.groups.map((g: any) => (
                        <div key={g.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{g.name}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{g.days} · {g.start_time}–{g.end_time}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${g.enroll_status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>{g.enroll_status === 'active' ? 'Faol' : g.enroll_status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Payments */}
                {viewData.payments?.length > 0 && (
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>So'nggi to'lovlar</p>
                    <div className="space-y-1.5">
                      {viewData.payments.slice(0, 5).map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(p.paid_at).toLocaleDateString('uz-UZ')} · {p.purpose}</span>
                          <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{p.amount.toLocaleString()} so'm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
