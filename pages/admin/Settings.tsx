import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Bot, Key, Link2, Shield, Loader2, Send, Lock,
  Eye, EyeOff, User, CheckCircle, RefreshCw, Info, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface AppSettings {
  telegramBotToken?: string;
  telegramChannelId?: string;
  instagramAccessToken?: string;
  metaAppId?: string;
}

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

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object') setSettings(prev => ({ ...prev, ...data })); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#0061ff] outline-none font-medium transition-all text-sm ${
    isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
  }`;
  const labelClass = `block text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`;

  const pwStrength = (p: string) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Juda qisqa', color: 'bg-red-500', w: '25%' };
    if (p.length < 8) return { label: 'Zaif', color: 'bg-amber-500', w: '50%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "O'rtacha", color: 'bg-yellow-400', w: '70%' };
    return { label: 'Kuchli', color: 'bg-green-500', w: '100%' };
  };
  const strength = pwStrength(newPassword);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Tizim Sozlamalari</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>API kalitlar, integratsiyalar va xavfsizlik</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0061ff] hover:bg-[#0052cc] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Saqlash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Telegram */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center">
              <Send className="text-[#0088cc]" size={20} />
            </div>
            <div>
              <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Telegram</h2>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bot va kanal ulash</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}><Bot size={14} /> Bot Token</label>
              <div className="relative">
                <input type="password" name="telegramBotToken" value={settings.telegramBotToken}
                  onChange={e => setSettings({ ...settings, telegramBotToken: e.target.value })}
                  placeholder="123456:ABC-DEF..." className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}><Link2 size={14} /> Kanal Username / ID</label>
              <input type="text" name="telegramChannelId" value={settings.telegramChannelId}
                onChange={e => setSettings({ ...settings, telegramChannelId: e.target.value })}
                placeholder="@data_talim_stansiyasi" className={inputClass} />
              <p className={`text-xs mt-1.5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
                ⚠️ Bot administrator bo'lishi shart
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instagram */}
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
              <label className={labelClass}><Key size={14} /> Access Token (Long-lived)</label>
              <input type="password" name="instagramAccessToken" value={settings.instagramAccessToken}
                onChange={e => setSettings({ ...settings, instagramAccessToken: e.target.value })}
                placeholder="EAAI..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Shield size={14} /> Meta App ID</label>
              <input type="text" name="metaAppId" value={settings.metaAppId}
                onChange={e => setSettings({ ...settings, metaAppId: e.target.value })}
                placeholder="123456789012345" className={inputClass} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Change Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Lock className="text-purple-500" size={20} />
          </div>
          <div>
            <h2 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Parol va Kirish Ma'lumotlari</h2>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Admin login va parolni o'zgartirish</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* New username */}
            <div>
              <label className={labelClass}><User size={14} /> Yangi Login (ixtiyoriy)</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder="Hozirgi: admin" className={inputClass} />
            </div>
            {/* Current password */}
            <div>
              <label className={labelClass}><Lock size={14} /> Joriy Parol</label>
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
              <label className={labelClass}><Key size={14} /> Yangi Parol</label>
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
              <label className={labelClass}><CheckCircle size={14} /> Tasdiqlash</label>
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
            Parol o'zgartirilgandan so'ng tizimdan chiqib, yangi parol bilan qayta kirishingiz kerak bo'ladi.
          </p>
        </div>

        <button onClick={handleChangePassword} disabled={changingPass}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50">
          {changingPass ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Parolni O'zgartirish
        </button>
      </motion.div>

      {/* Info card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-blue-900/10 border-blue-700/30' : 'bg-blue-50 border-blue-200'}`}>
        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>Muhim eslatma</p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            API kalitlar xavfsiz saqlash uchun — hech kimga ulashmang. Har 60 kunda parolingizni yangilash tavsiya etiladi.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
