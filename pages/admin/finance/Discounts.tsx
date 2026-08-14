import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  Tag, Plus, Search, Trash2, X, Loader2,
  RefreshCw, CheckCircle, Percent, Coins, HelpCircle,
  Copy, Check, Gift, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Discount {
  id: number;
  name: string;
  code: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function Discounts() {
  const { isDark } = useTheme();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [isPromo, setIsPromo] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/discounts', { headers: authH() });
      const data = await r.json();
      setDiscounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Chegirmalarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Chegirma nomini kiriting");
    if (isPromo && !code.trim()) return toast.error("Promokod kalit so'zini kiriting");
    if (value <= 0) return toast.error("Qiymat noldan katta bo'lishi kerak");

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        code: isPromo ? code.trim().toUpperCase() : null,
        type,
        value,
        status: 'active'
      };

      const r = await fetch('/api/discounts', {
        method: 'POST',
        headers: jsonH(),
        body: JSON.stringify(payload)
      });

      if (!r.ok) throw new Error((await r.json()).error);

      toast.success("Chegirma muvaffaqiyatli yaratildi");
      setShowModal(false);
      setName('');
      setIsPromo(false);
      setCode('');
      setType('percentage');
      setValue(10);
      fetchDiscounts();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const r = await fetch(`/api/discounts/${id}/status`, {
        method: 'PATCH',
        headers: jsonH(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (!r.ok) throw new Error();
      setDiscounts(prev =>
        prev.map(d => d.id === id ? { ...d, status: nextStatus as any } : d)
      );
      toast.success("Status o'zgartirildi");
    } catch {
      toast.error("Statusni o'zgartirib bo'lmadi");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu chegirmani o'chirib tashlamoqchimisiz?")) return;
    try {
      const r = await fetch(`/api/discounts/${id}`, { method: 'DELETE', headers: authH() });
      if (!r.ok) throw new Error();
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success("Chegirma o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const copyCode = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Promokod nusxalandi!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  };

  const filtered = discounts.filter(d => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q));
  });

  const cardBase = `rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inputBase = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`;
  const labelBase = `block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  const formatValue = (d: Discount) => {
    if (d.type === 'percentage') return `${d.value}%`;
    return `${d.value.toLocaleString()} UZS`;
  };

  const activePromoCount = discounts.filter(d => d.code && d.status === 'active').length;
  const activeRuleCount = discounts.filter(d => !d.code && d.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 sm:p-5 ${cardBase} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Tag size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Chegirmalar va Promokodlar</h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'quvchilar va to'lovlar uchun chegirma tizimini sozlash</p>
          </div>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all w-full sm:w-48 ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`}
            />
          </div>
          <button onClick={fetchDiscounts} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} /> Yangi Chegirma
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`${cardBase} p-5 flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Faol Promokodlar</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activePromoCount} ta</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><Gift size={20} /></div>
        </div>
        <div className={`${cardBase} p-5 flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Chegirma Qoidalari</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeRuleCount} ta</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Percent size={20} /></div>
        </div>
        <div className={`${cardBase} p-5 flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Jami Variantlar</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{discounts.length} ta</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Tag size={20} /></div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2 className="animate-spin text-emerald-500 mx-auto mb-3" size={32} />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yuklanmoqda...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardBase} p-16 text-center`}>
          <Tag size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
          <p className={`font-semibold text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {search ? 'Qidiruv natijasi topilmadi' : 'Hozircha hech qanday chegirma mavjud emas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${cardBase} overflow-hidden hover:border-emerald-500/30 hover:shadow-lg transition-all relative group`}
            >
              {/* Decorative dash pattern border on top for coupon vibes */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{d.name}</h3>
                    <p className={`text-[10px] font-bold mt-0.5 ${d.code ? 'text-purple-500' : 'text-emerald-500'}`}>
                      {d.code ? '🎟️ PROMO KOD' : '🏷️ MAXSUS CHEGIRMA'}
                    </p>
                  </div>

                  <span className={`text-lg font-black px-3 py-1 rounded-xl ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {formatValue(d)}
                  </span>
                </div>

                {d.code && (
                  <div className={`p-3 rounded-2xl flex items-center justify-between mb-4 border ${
                    isDark ? 'bg-slate-950/80 border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className="font-mono text-sm font-black tracking-wider text-slate-400">{d.code}</span>
                    <button
                      onClick={() => copyCode(d.code!, d.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        copiedId === d.id
                          ? 'bg-emerald-500 text-white'
                          : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {copiedId === d.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Holat</span>
                    <button onClick={() => toggleStatus(d.id, d.status)} className="transition-all hover:scale-105">
                      {d.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">
                          Noactive
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(d.id, d.status)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark ? 'border-white/5 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d.status === 'active' ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-md p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button onClick={() => setShowModal(false)} className={`absolute right-4 top-4 p-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi Chegirma Yaratish</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>To'lovlar uchun yangi qoida yoki kod kiritish</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className={labelBase}>Chegirma Nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Ikkinchi farzand uchun, Yozgi promo..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputBase}
                  />
                </div>

                {/* Promo check */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                  <div>
                    <span className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Promokodmi?</span>
                    <span className="text-[9px] text-slate-400">O'quvchi to'lovda promo kodni o'zi kiritishi mumkin</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPromo}
                    onChange={e => setIsPromo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 border-slate-300 focus:ring-emerald-500"
                  />
                </div>

                {isPromo && (
                  <div>
                    <label className={labelBase}>Promokod (Kalit so'zi)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Masalan: SUMMER20"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className={`${inputBase} uppercase`}
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className={`px-3 rounded-xl border font-bold text-xs shrink-0 transition-colors ${
                          isDark ? 'border-white/10 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Avto
                      </button>
                    </div>
                  </div>
                )}

                {/* Type Selection */}
                <div>
                  <label className={labelBase}>Turi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        type === 'percentage'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500 shadow-sm'
                          : isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Percent size={14} /> Foizda (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        type === 'fixed'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500 shadow-sm'
                          : isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Coins size={14} /> Ruxsat etilgan summa
                    </button>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className={labelBase}>Chegirma Qiymati</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      required
                      value={value}
                      onChange={e => setValue(Number(e.target.value))}
                      className={inputBase}
                    />
                    <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">
                      {type === 'percentage' ? '%' : 'UZS'}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Info size={10} />
                    {type === 'percentage'
                      ? "Oylik to'lov summasidan belgilangan foiz chegirib tashlanadi."
                      : "Belgilangan to'g'ridan-to'g'ri o'zgarmas chegirma summasi."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Tag size={18} />}
                  Chegirma Yaratish
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
