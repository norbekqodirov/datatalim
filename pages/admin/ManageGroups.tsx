import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit3, Trash2, X, Save, Loader2,
  Clock, BookOpen, UserPlus, UserMinus, ChevronDown,
  Calendar, GraduationCap, RefreshCw, CheckCircle, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface Group {
  id: number;
  name: string;
  course_id: string;
  teacher: string;
  room: string;
  days: string;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  capacity: number;
  price_per_month: number;
  status: 'active' | 'completed' | 'upcoming' | 'paused';
  notes: string;
  created_at: string;
  student_count?: number;
}

interface Student { id: number; name: string; phone: string; status: string; }

const STATUS_CFG = {
  active:    { label: 'Faol',       color: 'text-green-500', bg: 'bg-green-500/10',  dot: 'bg-green-500'  },
  completed: { label: 'Tugatildi',  color: 'text-blue-500',  bg: 'bg-blue-500/10',   dot: 'bg-blue-500'   },
  upcoming:  { label: 'Kelgusi',    color: 'text-violet-500',bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
  paused:    { label: "To'xtatildi",color: 'text-amber-500', bg: 'bg-amber-500/10',  dot: 'bg-amber-500'  },
};

const DAYS_OPTIONS = [
  { label: 'Dush-Chor-Juma', value: 'Dush,Chor,Juma' },
  { label: 'Sesh-Pay-Shan', value: 'Sesh,Pay,Shan' },
  { label: 'Har kuni', value: 'Dush,Sesh,Chor,Pay,Juma' },
  { label: 'Shanba-Yakshanba', value: 'Shanba,Yakshanba' },
  { label: 'Faqat Shanba', value: 'Shanba' },
];

const EMPTY_GROUP = { name:'', course_id:'', teacher:'', room:'', days:'Dush,Chor,Juma', start_time:'09:00', end_time:'11:00', start_date:'', end_date:'', capacity:15, price_per_month:0, status:'active' as const, notes:'' };

export default function ManageGroups() {
  const { isDark } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Group>>(EMPTY_GROUP);
  const [saving, setSaving] = useState(false);

  // Detail view
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allDiscounts, setAllDiscounts] = useState<any[]>([]);
  const [addStudentId, setAddStudentId] = useState('');
  const [addDiscount, setAddDiscount] = useState(0);

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/groups', { headers: authH() });
      setGroups(await r.json());
    } catch { toast.error('Yuklab olmadi'); }
    finally { setLoading(false); }
  };

  const fetchAllStudents = async () => {
    const r = await fetch('/api/students', { headers: authH() });
    const data = await r.json();
    setAllStudents(Array.isArray(data) ? data.filter((s: Student) => s.status === 'active') : []);
  };

  const fetchAllDiscounts = async () => {
    try {
      const r = await fetch('/api/discounts', { headers: authH() });
      const data = await r.json();
      setAllDiscounts(Array.isArray(data) ? data.filter((d: any) => d.status === 'active') : []);
    } catch {}
  };

  useEffect(() => {
    fetchGroups();
    fetchAllStudents();
    fetchAllDiscounts();
  }, []);

  const openDetail = async (id: number) => {
    setDetailId(id);
    const r = await fetch(`/api/groups/${id}`, { headers: authH() });
    setDetailData(await r.json());
  };

  const openAdd = () => { setForm(EMPTY_GROUP); setEditId(null); setShowForm(true); };
  const openEdit = (g: Group) => { setForm({ ...g }); setEditId(g.id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.course_id?.trim()) return toast.error('Nomi va kurs majburiy');
    setSaving(true);
    try {
      const url = editId ? `/api/groups/${editId}` : '/api/groups';
      const method = editId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: jsonH(), body: JSON.stringify(form) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success(editId ? 'Yangilandi' : "Qo'shildi");
      setShowForm(false);
      fetchGroups();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu guruhni o'chirasizmi?")) return;
    await fetch(`/api/groups/${id}`, { method: 'DELETE', headers: authH() });
    setGroups(prev => prev.filter(g => g.id !== id));
    toast.success("O'chirildi");
  };

  const handleAddStudent = async () => {
    if (!addStudentId) return toast.error("O'quvchi tanlang");
    const r = await fetch(`/api/groups/${detailId}/students`, {
      method: 'POST', headers: jsonH(),
      body: JSON.stringify({ student_id: parseInt(addStudentId), discount: addDiscount })
    });
    if (r.ok) { toast.success("Qo'shildi"); setAddStudentId(''); setAddDiscount(0); openDetail(detailId!); fetchGroups(); }
    else toast.error((await r.json()).error);
  };

  const handleRemoveStudent = async (sid: number) => {
    if (!confirm("Bu o'quvchini guruhdan chiqarasizmi?")) return;
    await fetch(`/api/groups/${detailId}/students/${sid}`, { method: 'DELETE', headers: authH() });
    toast.success('Chiqarildi');
    openDetail(detailId!);
    fetchGroups();
  };

  const filtered = groups.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    if (search.trim()) return g.name.toLowerCase().includes(search.toLowerCase()) || g.course_id.toLowerCase().includes(search.toLowerCase()) || g.teacher.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const card = `rounded-2xl border ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'}`;
  const lbl = `block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <GraduationCap className="text-blue-500" size={26} /> Guruhlar
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dars guruhlari va jadvallari boshqaruvi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchGroups} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-colors">
            <Plus size={16} /> Yangi guruh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(STATUS_CFG) as any[]).map(([key, cfg]) => {
          const count = groups.filter(g => g.status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`p-4 rounded-2xl border text-left transition-all ${filterStatus === key ? (isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50') : (isDark ? 'bg-slate-800/60 border-white/10 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50')}`}>
              <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{count}</div>
              <div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${cfg.dot}`} /><span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cfg.label}</span></div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className={`flex gap-3 p-3 rounded-2xl ${card}`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Guruh nomi, kurs yoki o'qituvchi..." className={inp + ' pl-9'} />
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><GraduationCap size={40} className="mx-auto mb-3 opacity-30" /><p>Guruh topilmadi</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(g => {
            const cfg = STATUS_CFG[g.status] || STATUS_CFG.active;
            const fillPct = g.capacity > 0 ? Math.min(100, Math.round(((g.student_count || 0) / g.capacity) * 100)) : 0;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all hover:shadow-lg cursor-pointer ${isDark ? 'bg-slate-800/60 border-white/10 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-50'}`}
                onClick={() => openDetail(g.id)}>
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{g.name}</h3>
                    <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{g.course_id}{g.teacher ? ` · ${g.teacher}` : ''}</p>
                  </div>
                  <span className={`shrink-0 ml-2 text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>

                {/* Schedule */}
                <div className="space-y-1.5 mb-4">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Calendar size={12} /> {g.days}
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={12} /> {g.start_time} – {g.end_time}
                    {g.room && <><span className="opacity-40">·</span> {g.room}</>}
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>O'quvchilar</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{g.student_count || 0}/{g.capacity}</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div className={`h-2 rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${fillPct}%` }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{g.price_per_month.toLocaleString()} so'm/oy</span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(g)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-5 border-b sticky top-0 z-10 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{editId ? 'Guruhni tahrirlash' : 'Yangi guruh'}</h2>
                <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className={lbl}>Guruh nomi *</label><input value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="Python Boshlang'ich A1" /></div>
                  <div><label className={lbl}>Kurs *</label><input value={form.course_id||''} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} className={inp} placeholder="Python, English, Math..." /></div>
                  <div><label className={lbl}>O'qituvchi</label><input value={form.teacher||''} onChange={e=>setForm(f=>({...f,teacher:e.target.value}))} className={inp} placeholder="Abdullayev Jasur" /></div>
                  <div>
                    <label className={lbl}>Dars kunlari</label>
                    <select value={form.days||''} onChange={e=>setForm(f=>({...f,days:e.target.value}))} className={inp}>
                      {DAYS_OPTIONS.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Xona</label><input value={form.room||''} onChange={e=>setForm(f=>({...f,room:e.target.value}))} className={inp} placeholder="Xona 1" /></div>
                  <div><label className={lbl}>Boshlanish vaqti</label><input type="time" value={form.start_time||'09:00'} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Tugash vaqti</label><input type="time" value={form.end_time||'11:00'} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Boshlanish sanasi</label><input type="date" value={form.start_date||''} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Tugash sanasi</label><input type="date" value={form.end_date||''} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} className={inp} /></div>
                  <div><label className={lbl}>Sig'im (o'quvchilar soni)</label><input type="number" min={1} max={50} value={form.capacity||15} onChange={e=>setForm(f=>({...f,capacity:parseInt(e.target.value)||15}))} className={inp} /></div>
                  <div><label className={lbl}>Oylik to'lov (so'm)</label><input type="number" min={0} value={form.price_per_month||0} onChange={e=>setForm(f=>({...f,price_per_month:parseInt(e.target.value)||0}))} className={inp} /></div>
                  <div>
                    <label className={lbl}>Holat</label>
                    <select value={form.status||'active'} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))} className={inp}>
                      {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2"><label className={lbl}>Izoh</label><input value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className={inp} placeholder="Qo'shimcha ma'lumot..." /></div>
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Bekor</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Detail / Students Modal */}
      <AnimatePresence>
        {detailId && detailData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setDetailId(null); setDetailData(null); }}>
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-xl rounded-3xl shadow-2xl max-h-[88vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-5 border-b sticky top-0 z-10 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div>
                  <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{detailData.name}</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{detailData.days} · {detailData.start_time}–{detailData.end_time}</p>
                </div>
                <button onClick={() => { setDetailId(null); setDetailData(null); }}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-5">
                {/* Add student */}
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>O'quvchi qo'shish</p>
                  <div className="flex flex-col gap-2.5">
                    <select value={addStudentId} onChange={e => setAddStudentId(e.target.value)} className={inp + ' w-full'}>
                      <option value="">O'quvchi tanlang...</option>
                      {allStudents.filter(s => !detailData.students?.some((ds: any) => ds.id === s.id && ds.enroll_status === 'active')).map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (!val) {
                            setAddDiscount(0);
                            return;
                          }
                          const disc = allDiscounts.find(d => d.id === Number(val));
                          if (disc) {
                            if (disc.type === 'percentage') {
                              setAddDiscount(disc.value);
                            } else {
                              const groupPrice = detailData.price_per_month || 1;
                              const pct = Math.round((disc.value / groupPrice) * 100);
                              setAddDiscount(pct);
                            }
                          }
                        }}
                        className={inp + ' flex-1'}
                      >
                        <option value="">Chegirma turi (ixtiyoriy)...</option>
                        {allDiscounts.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.type === 'percentage' ? `${d.value}%` : `${d.value.toLocaleString()} UZS`})
                          </option>
                        ))}
                      </select>
                      <input type="number" min={0} max={100} placeholder="% chegirma" value={addDiscount||''} onChange={e => setAddDiscount(parseInt(e.target.value)||0)}
                        className={inp + ' w-24'} />
                      <button onClick={handleAddStudent} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shrink-0">
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Students list */}
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    O'quvchilar ({detailData.students?.filter((s: any) => s.enroll_status === 'active').length || 0}/{detailData.capacity})
                  </p>
                  {!detailData.students?.length ? (
                    <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hali o'quvchi yo'q</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.students.filter((s: any) => s.enroll_status === 'active').map((s: any) => (
                        <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.phone}{s.discount > 0 ? ` · ${s.discount}% chegirma` : ''}</p>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveStudent(s.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><UserMinus size={15} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
