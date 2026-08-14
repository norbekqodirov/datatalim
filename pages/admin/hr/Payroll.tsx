import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Plus, Search, Trash2, X, Save, Loader2, RefreshCw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../store/ThemeContext';

interface PayrollRecord {
  id: number;
  employee_type: 'staff' | 'teacher';
  employee_id: number;
  employee_name: string;
  employee_phone: string;
  amount: number;
  month_for: string;
  paid_at: string;
  notes: string;
}

interface EmployeeOption {
  id: number;
  name: string;
  type: 'staff' | 'teacher';
  roleOrSpecialty: string;
}

const EMPTY_PAYROLL = {
  employee_type: 'teacher' as 'staff' | 'teacher',
  employee_id: 0,
  amount: '',
  month_for: new Date().toISOString().slice(0, 7),
  notes: ''
};

export default function Payroll() {
  const { isDark } = useTheme();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_PAYROLL & { amount: string | number }>(EMPTY_PAYROLL);
  const [saving, setSaving] = useState(false);
  
  const token = () => localStorage.getItem('adminToken');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch payroll history
      const rPay = await fetch('/api/payroll', { headers: { Authorization: `Bearer ${token()}` } });
      const payData = await rPay.json();
      setRecords(payData);

      // Fetch teachers & staff for selection dropdown
      const rTeachers = await fetch('/api/teachers', { headers: { Authorization: `Bearer ${token()}` } });
      const teachersData = await rTeachers.json();
      const rStaff = await fetch('/api/staff', { headers: { Authorization: `Bearer ${token()}` } });
      const staffData = await rStaff.json();

      const options: EmployeeOption[] = [
        ...teachersData.map((t: any) => ({ id: t.id, name: t.name, type: 'teacher' as const, roleOrSpecialty: t.specialty || "O'qituvchi" })),
        ...staffData.map((s: any) => ({ id: s.id, name: s.name, type: 'staff' as const, roleOrSpecialty: s.role || 'Kadr' }))
      ];
      setEmployees(options);
    } catch {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r => 
      r.employee_name?.toLowerCase().includes(q) || 
      r.employee_phone?.includes(q) || 
      r.month_for.includes(q)
    );
  }, [records, search]);

  const openAdd = () => {
    setForm({ ...EMPTY_PAYROLL, employee_id: employees[0]?.id || 0, employee_type: employees[0]?.type || 'teacher' });
    setShowForm(true);
  };

  const handleSave = async () => {
    const amt = Number(form.amount);
    if (!form.employee_id || isNaN(amt) || amt <= 0) {
      return toast.error("Xodimni tanlang va to'g'ri oylik summasini kiriting");
    }
    setSaving(true);
    try {
      const r = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, amount: amt })
      });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success("Ish haqi to'lovi saqlandi ✓");
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu to'lov yozuvini o'chirasizmi?")) return;
    await fetch(`/api/payroll/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setRecords(prev => prev.filter(r => r.id !== id));
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
            <Banknote className="text-emerald-500" size={26} /> Ish Haqini Boshqarish
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'qituvchilar va xodimlar uchun ish haqi hisob-kitoblari</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openAdd} disabled={employees.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/25">
            <Plus size={16} /> Yangi oylik to'lov
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={`flex gap-3 p-3 rounded-2xl ${card}`}>
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Xodim ismi, telefoni yoki oy bo'yicha qidirish..." className={inp + ' pl-9'} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Banknote size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Oylik to'lovi yozuvlari topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
                <tr>
                  <th className="px-4 py-3 text-left">Xodim</th>
                  <th className="px-4 py-3 text-left">Turi</th>
                  <th className="px-4 py-3 text-left">Qaysi oy uchun</th>
                  <th className="px-4 py-3 text-left">To'langan sana</th>
                  <th className="px-4 py-3 text-left">To'lov miqdori</th>
                  <th className="px-4 py-3 text-left">Izoh</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{r.employee_name || 'Noma\'lum xodim'}</p>
                        <p className="text-xs text-slate-500">{r.employee_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${r.employee_type === 'teacher' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {r.employee_type === 'teacher' ? 'O\'qituvchi' : 'Kadr'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1"><Calendar size={13} /> {r.month_for}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {new Date(r.paid_at).toLocaleString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {r.amount.toLocaleString()} so'm
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={r.notes}>{r.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} onClick={e => e.stopPropagation()} className={`w-full max-w-md rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi oylik to'lovi</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={lbl}>Xodim tanlang *</label>
                  <select 
                    value={`${form.employee_type}-${form.employee_id}`} 
                    onChange={e => {
                      const [type, id] = e.target.value.split('-');
                      setForm(f => ({ ...f, employee_type: type as any, employee_id: Number(id) }));
                    }} 
                    className={inp}
                  >
                    {employees.map(emp => (
                      <option key={`${emp.type}-${emp.id}`} value={`${emp.type}-${emp.id}`}>
                        [{emp.type === 'teacher' ? 'O\'qituvchi' : 'Kadr'}] {emp.name} ({emp.roleOrSpecialty})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>To'lov summasi (so'm) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inp} placeholder="3000000" autoFocus />
                </div>
                <div>
                  <label className={lbl}>Qaysi oy uchun *</label>
                  <input type="month" value={form.month_for} onChange={e => setForm(f => ({ ...f, month_for: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Izoh (Qo'shimcha)</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={inp + ' resize-none'} placeholder="Masalan: Avans yoki premium..." />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setShowForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Bekor</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
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
