import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Bot, Key, Link2, Shield, Loader2, Send, Lock,
  Eye, EyeOff, User, CheckCircle, RefreshCw, Info, AlertTriangle,
  UserCheck, Trash2, Plus, X, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface AppSettings {
  telegramBotToken?: string;
  telegramChannelId?: string;
  instagramAccessToken?: string;
  metaAppId?: string;
}

interface UserAccount {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'teacher';
  created_at: string;
}

const ROLE_BADGES = {
  admin: { label: 'Admin', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  manager: { label: 'Manager', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  teacher: { label: 'O\'qituvchi', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
};

export default function Settings() {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    telegramBotToken: '',
    telegramChannelId: '',
    instagramAccessToken: '',
    metaAppId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'manager' | 'teacher'>('manager');
  const [creatingUser, setCreatingUser] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const token = localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  // Simple self-decode JWT to find current user ID
  const getCurrentUserFromToken = () => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const fetchAccounts = async () => {
    try {
      const r = await fetch('/api/admin/users', { headers: authH() });
      if (r.ok) {
        setAccounts(await r.json());
      }
    } catch {}
  };

  useEffect(() => {
    setCurrentUser(getCurrentUserFromToken());
    
    // Load Settings
    fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object') setSettings(prev => ({ ...prev, ...data })); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Load Accounts
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (res.ok) toast.success('Sozlamalar saqlandi');
      else toast.error('Xatolik yuz berdi');
    } catch { toast.error('Tarmoq xatosi'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) return toast.error('Joriy parolni kiriting');
    if (!newPassword || newPassword.length < 6) return toast.error('Yangi parol kamida 6 ta belgi');
    if (newPassword !== confirmPassword) return toast.error('Parollar mos kelmadi');

    setChangingPass(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword, newUsername: newUsername || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Parol muvaffaqiyatli o\'zgartirildi! Qayta kiring.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setNewUsername('');
        setTimeout(() => {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminToken');
          window.location.href = '/paneladmindata/login';
        }, 2000);
      } else {
        toast.error(data.error || 'Xatolik yuz berdi');
      }
    } catch { toast.error('Tarmoq xatosi'); }
    finally { setChangingPass(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || !addPassword) return toast.error("Barcha maydonlarni to'ldiring");
    if (addPassword.length < 6) return toast.error("Parol kamida 6 ta belgi bo'lishi kerak");

    setCreatingUser(true);
    try {
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: jsonH(),
        body: JSON.stringify({ username: addUsername, password: addPassword, role: addRole })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      toast.success("Foydalanuvchi yaratildi!");
      setShowAddUser(false);
      setAddUsername('');
      setAddPassword('');
      setAddRole('manager');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (currentUser && currentUser.id === id) {
      return toast.error("O'z hisobingizni o'chira olmaysiz!");
    }
    if (!confirm("Haqiqatan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz?")) return;
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: authH() });
      if (!r.ok) throw new Error();
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success("Foydalanuvchi o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all text-sm ${
    isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  }`;
  const labelClass = `block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
  const cardClass = `p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;

  const pwStrength = (p: string) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Juda qisqa', color: 'bg-red-500', w: '25%' };
    if (p.length < 8) return { label: 'Zaif', color: 'bg-amber-500', w: '50%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "O'rtacha", color: 'bg-yellow-400', w: '70%' };
    return { label: 'Kuchli', color: 'bg-green-500', w: '100%' };
  };
  const strength = pwStrength(newPassword);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className={`p-4 sm:p-5 ${cardClass} flex items-center justify-between`}>
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Tizim Sozlamalari</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>API kalitlar, integratsiyalar va xavfsizlik sozlamalari</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Saqlash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telegram Bot Setting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Send className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Telegram</h2>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bot va kanal ulash</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Bot Token</label>
              <input type="password" name="telegramBotToken" value={settings.telegramBotToken}
                onChange={e => setSettings({ ...settings, telegramBotToken: e.target.value })}
                placeholder="123456:ABC-DEF..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kanal Username / ID</label>
              <input type="text" name="telegramChannelId" value={settings.telegramChannelId}
                onChange={e => setSettings({ ...settings, telegramChannelId: e.target.value })}
                placeholder="@data_talim_stansiyasi" className={inputClass} />
              <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
                <AlertTriangle size={12} />
                Bot administrator bo'lishi shart
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instagram/Meta Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Shield className="text-pink-500" size={20} />
            </div>
            <div>
              <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Meta (Instagram)</h2>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Graph API ulash</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Access Token (Long-lived)</label>
              <input type="password" name="instagramAccessToken" value={settings.instagramAccessToken}
                onChange={e => setSettings({ ...settings, instagramAccessToken: e.target.value })}
                placeholder="EAAI..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta App ID</label>
              <input type="text" name="metaAppId" value={settings.metaAppId}
                onChange={e => setSettings({ ...settings, metaAppId: e.target.value })}
                placeholder="123456789012345" className={inputClass} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* RBAC Users & Accounts Management Section */}
      {currentUser?.role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={cardClass}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="text-emerald-500" size={20} />
              </div>
              <div>
                <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Foydalanuvchilar va Rollar (RBAC)</h2>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tizimga kirish huquqiga ega bo'lgan foydalanuvchilar</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus size={14} /> Qo'shish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => {
              const badge = ROLE_BADGES[acc.role] || ROLE_BADGES.manager;
              const isSelf = currentUser && currentUser.id === acc.id;

              return (
                <div key={acc.id} className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {acc.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`text-sm font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {acc.username}
                          {isSelf && <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">Siz</span>}
                        </h4>
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 mt-1 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(acc.id)}
                        className="p-1.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className={`text-[9px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    Yaratilgan: {new Date(acc.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Password Change Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Lock className="text-purple-500" size={20} />
          </div>
          <div>
            <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Parol va Kirish Ma'lumotlari</h2>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hozirgi profil parolini o'zgartirish</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* New username */}
            <div>
              <label className={labelClass}>Yangi Login (ixtiyoriy)</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder={`Hozirgi: ${currentUser?.username || 'admin'}`} className={inputClass} />
            </div>
            {/* Current password */}
            <div>
              <label className={labelClass}>Joriy Parol</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Hozirgi parolni kiriting" className={inputClass + ' pr-10'} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* New password */}
            <div>
              <label className={labelClass}>Yangi Parol</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi" className={inputClass + ' pr-10'} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.w }} />
                  </div>
                  <p className="text-xs mt-1 text-slate-400">{strength.label}</p>
                </div>
              )}
            </div>
            {/* Confirm */}
            <div>
              <label className={labelClass}>Tasdiqlash</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Yangi parolni qayta kiriting"
                className={inputClass + (confirmPassword && confirmPassword !== newPassword ? ' border-red-400' : confirmPassword && confirmPassword === newPassword ? ' border-green-400' : '')} />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs mt-1 text-red-500">Parollar mos kelmadi</p>
              )}
            </div>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-xl flex items-start gap-2 ${isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}>
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            Parol o'zgartirilgandan so'ng xavfsizlik uchun tizimdan avtomatik chiqib ketasiz.
          </p>
        </div>

        <button onClick={handleChangePassword} disabled={changingPass}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md shadow-purple-500/10">
          {changingPass ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Parolni O'zgartirish
        </button>
      </motion.div>

      {/* Modal Add User Account */}
      <AnimatePresence>
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddUser(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-md p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button onClick={() => setShowAddUser(false)} className={`absolute right-4 top-4 p-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi Tizim Foydalanuvchisi</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rollar orqali dashboard imkoniyatlarini chegaralash</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className={labelClass}>Login (Username)</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: jasur_teacher, malika_manager"
                    value={addUsername}
                    onChange={e => setAddUsername(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Parol</label>
                  <input
                    type="password"
                    required
                    placeholder="Kamida 6 ta belgi"
                    value={addPassword}
                    onChange={e => setAddPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tizimdagi Rol</label>
                  <select
                    value={addRole}
                    onChange={e => setAddRole(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="manager">Manager (Guruhlar, O'quvchilar, Leads)</option>
                    <option value="teacher">O'qituvchi (Faqat dars jurnali va davomat)</option>
                    <option value="admin">Admin (To'liq tizim ruxsatlari)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {creatingUser ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                  Foydalanuvchi Yaratish
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
