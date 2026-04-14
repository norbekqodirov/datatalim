import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Search, Trash2, X, Save, Loader2,
  TrendingUp, TrendingDown, CreditCard, Banknote, Smartphone,
  RefreshCw, Download, Filter, ChevronDown, AlertTriangle,
  BarChart2, Users, CheckCircle, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface Payment { id: number; student_id: number; student_name: string; student_phone: string; group_id?: number; group_name?: string; amount: number; payment_type: string; purpose: string; month_for: string; paid_at: string; notes: string; }
interface Student { id: number; name: string; phone: string; }
interface Group { id: number; name: string; price_per_month: number; }
interface Debtor { id: number; name: string; phone: string; group_id: number; group_name: string; price_per_month: number; discount: number; expected: number; paid: number; debt: number; last_payment_at: string | null; }

const PURPOSES = [
  { key: 'tuition',      label: "O'quv to'lovi",      color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  { key: 'registration', label: "Ro'yxatdan o'tish",  color: 'text-violet-500',  bg: 'bg-violet-500/10' },
  { key: 'material',     label: 'Darslik/Materyal',    color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  { key: 'exam',         label: "Imtihon to'lovi",     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'other',        label: 'Boshqa',              color: 'text-slate-500',   bg: 'bg-slate-500/10' },
];
const PAY_TYPES = [
  { key: 'cash',     label: 'Naqd',     icon: Banknote },
  { key: 'card',     label: 'Karta',    icon: CreditCard },
  { key: 'transfer', label: "O'tkazma", icon: Smartphone },
];
const EXPENSE_CATS = [
  { key: 'salary',   label: 'Ish haqi' },
  { key: 'rent',     label: 'Ijara' },
  { key: 'utility',  label: 'Kommunal' },
  { key: 'supplies', label: 'Jihozlar' },
  { key: 'marketing',label: 'Marketing' },
  { key: 'other',    label: 'Boshqa' },
];

const EMPTY_PAY = { student_id: '', group_id: '', amount: '', payment_type: 'cash', purpose: 'tuition', month_for: new Date().toISOString().slice(0,7), notes: '' };
const EMPTY_EXP = { title: '', amount: '', category: 'salary', date: new Date().toISOString().slice(0,10), notes: '' };

export default function ManageFinance() {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<'summary' | 'payments' | 'expenses' | 'debtors'>('summary');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [debtMonth, setDebtMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [loading, setLoading] = useState(false);
  const [debtLoading, setDebtLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0,7));
  const [showPayForm, setShowPayForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [payForm, setPayForm] = useState(EMPTY_PAY);
  const [expForm, setExpForm] = useState(EMPTY_EXP);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pR, eR, sR, stR, gR] = await Promise.all([
        fetch(`/api/payments?${filterMonth ? `month=${filterMonth}` : ''}`, { headers: authH() }),
        fetch('/api/expenses', { headers: authH() }),
        fetch('/api/finance/summary', { headers: authH() }),
        fetch('/api/students', { headers: authH() }),
        fetch('/api/groups', { headers: authH() }),
      ]);
      const [p, e, s, st, g] = await Promise.all([pR.json(), eR.json(), sR.json(), stR.json(), gR.json()]);
      setPayments(Array.isArray(p) ? p : []);
      setExpenses(Array.isArray(e) ? e : []);
      setSummary(s);
      setStudents(Array.isArray(st) ? st.filter((x: any) => x.status === 'active') : []);
      setGroups(Array.isArray(g) ? g.filter((x: any) => x.status === 'active') : []);
    } catch { toast.error('Yuklab olmadi'); }
    finally { setLoading(false); }
  };

  const fetchDebtors = async () => {
    setDebtLoading(true);
    try {
      const r = await fetch(`/api/finance/debtors?month=${debtMonth}`, { headers: authH() });
      const d = await r.json();
      setDebtors(Array.isArray(d) ? d : []);
    } catch { toast.error('Yuklab olmadi'); }
    finally { setDebtLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterMonth]);
  useEffect(() => { if (tab === 'debtors') fetchDebtors(); }, [tab, debtMonth]);

  const filteredPayments = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter(p => p.student_name?.toLowerCase().includes(q) || p.student_phone?.includes(q));
  }, [payments, search]);

  const totalDebt = useMemo(() => debtors.reduce((a, d) => a + d.debt, 0), [debtors]);

  const openQuickPay = (d: Debtor) => {
    setPayForm({ student_id: String(d.id), group_id: String(d.group_id), amount: String(d.debt), payment_type: 'cash', purpose: 'tuition', month_for: debtMonth, notes: '' });
    setShowPayForm(true);
  };

  const handleAddPayment = async () => {
    if (!payForm.student_id || !payForm.amount) return toast.error("O'quvchi va summa majburiy");
    setSaving(true);
    try {
      const r = await fetch('/api/payments', { method: 'POST', headers: jsonH(), body: JSON.stringify({ ...payForm, amount: parseInt(payForm.amount), group_id: payForm.group_id || null, student_id: parseInt(payForm.student_id) }) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success("To'lov qo'shildi ✓");
      setShowPayForm(false);
      setPayForm(EMPTY_PAY);
      fetchAll();
      if (tab === 'debtors') fetchDebtors();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleAddExpense = async () => {
    if (!expForm.title || !expForm.amount || !expForm.date) return toast.error('Barcha maydonlar majburiy');
    setSaving(true);
    try {
      const r = await fetch('/api/expenses', { method: 'POST', headers: jsonH(), body: JSON.stringify({ ...expForm, amount: parseInt(expForm.amount) }) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success("Xarajat qo'shildi");
      setShowExpForm(false);
      setExpForm(EMPTY_EXP);
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const deletePayment = async (id: number) => {
    if (!confirm("To'lovni o'chirasizmi?")) return;
    await fetch(`/api/payments/${id}`, { method: 'DELETE', headers: authH() });
    setPayments(p => p.filter(x => x.id !== id));
    toast.success("O'chirildi");
  };

  const deleteExpense = async (id: number) => {
    if (!confirm("Xarajatni o'chirasizmi?")) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE', headers: authH() });
    setExpenses(e => e.filter(x => x.id !== id));
    toast.success("O'chirildi");
  };

  const exportPaymentsCSV = () => {
    const h = ['ID', "O'quvchi", 'Telefon', 'Guruh', 'Summa', 'Tur', 'Maqsad', 'Oy', 'Sana'];
    const rows = filteredPayments.map(p => [p.id, `"${p.student_name}"`, p.student_phone, `"${p.group_name||''}"`, p.amount, PAY_TYPES.find(x=>x.key===p.payment_type)?.label||p.payment_type, PURPOSES.find(x=>x.key===p.purpose)?.label||p.purpose, p.month_for, new Date(p.paid_at).toLocaleDateString('uz-UZ')]);
    const csv = [h,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));
    a.download = `payments-${filterMonth}.csv`; a.click();
    toast.success('CSV yuklab olindi');
  };

  const exportDebtorsCSV = () => {
    const h = ["O'quvchi", 'Telefon', 'Guruh', 'Kutilgan', "To'langan", 'Qarz'];
    const rows = debtors.map(d => [`"${d.name}"`, d.phone, `"${d.group_name}"`, d.expected, d.paid, d.debt]);
    const csv = [h,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'}));
    a.download = `debtors-${debtMonth}.csv`; a.click();
    toast.success('CSV yuklab olindi');
  };

  const card = `rounded-2xl border ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'}`;
  const lbl = `block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
  const tt = { backgroundColor: isDark ? '#1e293b' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: '12px', color: isDark ? '#e2e8f0' : '#1e293b' };

  const thisMonthExpense = useMemo(() => {
    const m = new Date().toISOString().slice(0,7);
    return expenses.filter(e => e.date?.startsWith(m)).reduce((a,e) => a + e.amount, 0);
  }, [expenses]);
  const profit = (summary?.thisMonth || 0) - thisMonthExpense;

  const TABS = [
    { key: 'summary',  label: '📊 Xulosa' },
    { key: 'payments', label: "💸 To'lovlar", count: payments.length },
    { key: 'expenses', label: '📤 Xarajatlar', count: expenses.length },
    { key: 'debtors',  label: '⚠️ Qarzdorlar', count: debtors.length, alert: true },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <DollarSign className="text-emerald-500" size={26} /> Moliya
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To'lovlar, xarajatlar va daromad hisobi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setShowExpForm(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><TrendingDown size={15} /> Xarajat</button>
          <button onClick={() => { setPayForm(EMPTY_PAY); setShowPayForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-colors"><Plus size={16} /> To'lov</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Bu oy daromad', val: summary?.thisMonth || 0, icon: TrendingUp, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Bu oy xarajat', val: thisMonthExpense, icon: TrendingDown, color: 'text-red-500', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' },
          { label: 'Sof foyda', val: profit, icon: DollarSign, color: profit >= 0 ? 'text-blue-500' : 'text-red-500', bg: profit >= 0 ? (isDark ? 'bg-blue-500/10' : 'bg-blue-50') : (isDark ? 'bg-red-500/10' : 'bg-red-50') },
          { label: 'Jami daromad', val: summary?.totalRevenue || 0, icon: BarChart2, color: 'text-violet-500', bg: isDark ? 'bg-violet-500/10' : 'bg-violet-50' },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${card}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}><Icon size={18} className={color} /></div>
            <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{Math.abs(val).toLocaleString()}</div>
            <div className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex rounded-xl overflow-hidden border w-fit ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {TABS.map(({ key, label, count, alert }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`relative px-4 py-2 text-sm font-bold transition-colors ${tab === key ? (alert && count ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white') : isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-white'}`}>
            {label}
            {count !== undefined && count > 0 && tab !== key && (
              <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${alert ? 'bg-red-500 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === 'summary' && summary && (
        <div className="space-y-5">
          {summary.revenueByMonth?.length > 0 && (
            <div className={`p-5 rounded-2xl ${card}`}>
              <h3 className={`font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>So'nggi 6 oy daromadi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[...summary.revenueByMonth].reverse()}>
                  <XAxis dataKey="month" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => (v/1000000).toFixed(1)+'M'} />
                  <Tooltip contentStyle={tt} formatter={(v: any) => [v.toLocaleString() + " so'm", "Daromad"]} />
                  <Bar dataKey="total" radius={[6,6,0,0]}>
                    {[...summary.revenueByMonth].reverse().map((_: any, i: number) => <Cell key={i} fill={i === summary.revenueByMonth.length - 1 ? '#10b981' : '#3b82f6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {summary.byType?.length > 0 && (
              <div className={`p-5 rounded-2xl ${card}`}>
                <h3 className={`font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>To'lov usuli bo'yicha</h3>
                <div className="space-y-3">
                  {summary.byType.map((t: any) => {
                    const maxVal = Math.max(...summary.byType.map((x: any) => x.total));
                    const pct = maxVal > 0 ? (t.total / maxVal) * 100 : 0;
                    return (
                      <div key={t.payment_type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{PAY_TYPES.find(x=>x.key===t.payment_type)?.label || t.payment_type}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.count} ta</span>
                            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.total.toLocaleString()} so'm</span>
                          </div>
                        </div>
                        <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {summary.byPurpose?.length > 0 && (
              <div className={`p-5 rounded-2xl ${card}`}>
                <h3 className={`font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Maqsad bo'yicha</h3>
                <div className="space-y-3">
                  {summary.byPurpose.map((p: any) => {
                    const cfg = PURPOSES.find(x=>x.key===p.purpose);
                    const maxVal = Math.max(...summary.byPurpose.map((x: any) => x.total));
                    const pct = maxVal > 0 ? (p.total / maxVal) * 100 : 0;
                    return (
                      <div key={p.purpose}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${cfg?.color || ''}`}>{cfg?.label || p.purpose}</span>
                          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.total.toLocaleString()} so'm</span>
                        </div>
                        <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div className={`h-1.5 rounded-full ${cfg?.bg?.replace('bg-','bg-').replace('/10','') || 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className={`flex gap-3 p-3 rounded-2xl ${card}`}>
            <div className="relative flex-1">
              <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="O'quvchi nomi yoki telefon..." className={inp + ' pl-9'} />
            </div>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={inp + ' w-44'} />
            <button onClick={exportPaymentsCSV} disabled={filteredPayments.length === 0} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Download size={15} /> CSV</button>
          </div>
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            {loading ? <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>
              : filteredPayments.length === 0 ? <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><DollarSign size={40} className="mx-auto mb-3 opacity-30" /><p>To'lov topilmadi</p></div>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase`}>
                      <tr>
                        <th className="px-4 py-3 text-left">O'quvchi</th>
                        <th className="px-4 py-3 text-left">Guruh</th>
                        <th className="px-4 py-3 text-left">Summa</th>
                        <th className="px-4 py-3 text-left">Tur</th>
                        <th className="px-4 py-3 text-left">Maqsad</th>
                        <th className="px-4 py-3 text-left">Oy</th>
                        <th className="px-4 py-3 text-left">Sana</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPayments.map(p => {
                        const purp = PURPOSES.find(x => x.key === p.purpose);
                        const ptype = PAY_TYPES.find(x => x.key === p.payment_type);
                        return (
                          <tr key={p.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                            <td className="px-4 py-3">
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.student_name}</p>
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.student_phone}</p>
                            </td>
                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.group_name || '—'}</td>
                            <td className={`px-4 py-3 font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{p.amount.toLocaleString()} so'm</td>
                            <td className={`px-4 py-3 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{ptype?.label || p.payment_type}</td>
                            <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-lg ${purp?.bg} ${purp?.color}`}>{purp?.label || p.purpose}</span></td>
                            <td className={`px-4 py-3 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.month_for || '—'}</td>
                            <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(p.paid_at).toLocaleDateString('uz-UZ')}</td>
                            <td className="px-4 py-3"><button onClick={() => deletePayment(p.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {expenses.length === 0
            ? <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><TrendingDown size={40} className="mx-auto mb-3 opacity-30" /><p>Xarajat topilmadi</p></div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase`}>
                    <tr>
                      <th className="px-4 py-3 text-left">Nomi</th>
                      <th className="px-4 py-3 text-left">Kategoriya</th>
                      <th className="px-4 py-3 text-left">Summa</th>
                      <th className="px-4 py-3 text-left">Sana</th>
                      <th className="px-4 py-3 text-left">Izoh</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {expenses.map(e => (
                      <tr key={e.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.title}</td>
                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{EXPENSE_CATS.find(c=>c.key===e.category)?.label || e.category}</td>
                        <td className="px-4 py-3 font-black text-red-500">{e.amount.toLocaleString()} so'm</td>
                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{e.date}</td>
                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{e.notes || '—'}</td>
                        <td className="px-4 py-3"><button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* Debtors Tab */}
      {tab === 'debtors' && (
        <div className="space-y-4">
          {/* Debt header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input type="month" value={debtMonth} onChange={e => setDebtMonth(e.target.value)} className={inp + ' w-44'} />
              <button onClick={fetchDebtors} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><RefreshCw size={16} className={debtLoading ? 'animate-spin' : ''} /></button>
            </div>
            <div className="flex items-center gap-3">
              {totalDebt > 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <AlertTriangle size={15} className="text-red-500" />
                  <span className="text-sm font-black text-red-500">Jami qarz: {totalDebt.toLocaleString()} so'm</span>
                </div>
              )}
              <button onClick={exportDebtorsCSV} disabled={debtors.length === 0} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Download size={15} /> CSV</button>
            </div>
          </div>

          {debtLoading ? (
            <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-red-500" size={28} /></div>
          ) : debtors.length === 0 ? (
            <div className={`text-center py-20 rounded-2xl border ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500 opacity-60" />
              <p className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Barcha to'lovlar amalga oshirilgan!</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{debtMonth} oy uchun qarzdor o'quvchi yo'q</p>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-red-50 text-slate-500'} text-xs font-bold uppercase`}>
                    <tr>
                      <th className="px-4 py-3 text-left">O'quvchi</th>
                      <th className="px-4 py-3 text-left">Guruh</th>
                      <th className="px-4 py-3 text-right">Kutilgan</th>
                      <th className="px-4 py-3 text-right">To'langan</th>
                      <th className="px-4 py-3 text-right text-red-500">Qarz</th>
                      <th className="px-4 py-3 text-left">So'nggi to'lov</th>
                      <th className="px-4 py-3 text-center">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {debtors.map((d, i) => (
                      <motion.tr key={`${d.id}-${d.group_id}`}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-red-50/50'} transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-black text-red-500 shrink-0">
                              {d.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{d.name}</p>
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{d.group_name}</td>
                        <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{d.expected.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-bold ${d.paid > 0 ? 'text-emerald-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>{d.paid > 0 ? d.paid.toLocaleString() : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-black text-red-500">{d.debt.toLocaleString()} so'm</span>
                          {d.discount > 0 && <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d.discount}% chegirma</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {d.last_payment_at ? new Date(d.last_payment_at).toLocaleDateString('uz-UZ') : <span className="text-red-400 font-bold">Hech qachon</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => openQuickPay(d)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors mx-auto">
                            <Plus size={12} /> To'lov
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPayForm(false)}>
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi to'lov</h2>
                <button onClick={() => setShowPayForm(false)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className={lbl}>O'quvchi *</label>
                  <select value={payForm.student_id} onChange={e => setPayForm(f => ({ ...f, student_id: e.target.value }))} className={inp}>
                    <option value="">Tanlang...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Guruh</label>
                  <select value={payForm.group_id} onChange={e => setPayForm(f => ({ ...f, group_id: e.target.value }))} className={inp}>
                    <option value="">Tanlang (ixtiyoriy)</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name} — {g.price_per_month.toLocaleString()} so'm/oy</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Summa (so'm) *</label>
                    <input type="number" min={0} value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} className={inp} placeholder="500000" />
                  </div>
                  <div>
                    <label className={lbl}>To'lov usuli</label>
                    <select value={payForm.payment_type} onChange={e => setPayForm(f => ({ ...f, payment_type: e.target.value }))} className={inp}>
                      {PAY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Maqsad</label>
                    <select value={payForm.purpose} onChange={e => setPayForm(f => ({ ...f, purpose: e.target.value }))} className={inp}>
                      {PURPOSES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Qaysi oy uchun</label>
                    <input type="month" value={payForm.month_for} onChange={e => setPayForm(f => ({ ...f, month_for: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Izoh</label>
                  <input value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} className={inp} placeholder="Qo'shimcha izoh..." />
                </div>
              </div>
              <div className={`flex justify-end gap-3 p-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setShowPayForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Bekor</button>
                <button onClick={handleAddPayment} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {showExpForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExpForm(false)}>
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi xarajat</h2>
                <button onClick={() => setShowExpForm(false)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className={lbl}>Nomi *</label><input value={expForm.title} onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))} className={inp} placeholder="Ijara to'lovi, ish haqi..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Summa *</label><input type="number" min={0} value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} className={inp} placeholder="1000000" /></div>
                  <div>
                    <label className={lbl}>Kategoriya</label>
                    <select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                      {EXPENSE_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={lbl}>Sana *</label><input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Izoh</label><input value={expForm.notes} onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))} className={inp} placeholder="Qo'shimcha..." /></div>
              </div>
              <div className={`flex justify-end gap-3 p-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setShowExpForm(false)} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Bekor</button>
                <button onClick={handleAddExpense} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">
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
