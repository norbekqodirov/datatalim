import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Send, Phone, Database, Save, Download, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const Settings: React.FC = () => {
  const { isDark } = useTheme();

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Telegram
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  // WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings', { headers: headers() });
        if (res.ok) {
          const data = await res.json();
          setBotToken(data.telegram_bot_token || '');
          setChatId(data.telegram_chat_id || '');
          setWhatsappPhone(data.whatsapp_phone || '');
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const changePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Barcha maydonlarni to\'ldiring'); return; }
    if (newPassword !== confirmPassword) { toast.error('Parollar mos kelmaydi'); return; }
    if (newPassword.length < 6) { toast.error('Parol kamida 6 belgidan iborat bo\'lsin'); return; }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success('Parol o\'zgartirildi');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Xatolik');
      }
    } catch { toast.error('Xatolik'); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ telegram_bot_token: botToken, telegram_chat_id: chatId, whatsapp_phone: whatsappPhone }),
      });
      if (res.ok) toast.success('Sozlamalar saqlandi');
      else toast.error('Saqlashda xatolik');
    } catch { toast.error('Xatolik'); }
    finally { setSaving(false); }
  };

  const downloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', { headers: headers() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup yuklandi');
    } catch { toast.error('Backup yuklashda xatolik'); }
  };

  const cardCls = `rounded-2xl border p-6 ${isDark ? 'bg-slate-800/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200'}`;
  const inputCls = `w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isDark ? 'bg-slate-700/50 border-white/10 text-white placeholder-slate-500 focus:border-[#0061ff]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0061ff]'}`;
  const labelCls = `block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-[#0061ff]" size={28} />
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Sozlamalar</h1>
      </div>

      {/* Password */}
      <div className={cardCls}>
        {sectionTitle(<Lock size={20} className="text-[#0061ff]" />, 'Parolni o\'zgartirish')}
        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelCls}>Joriy parol</label>
            <div className="relative">
              <input type={showPasswords ? 'text' : 'password'} className={inputCls} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <button onClick={() => setShowPasswords(!showPasswords)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Yangi parol</label>
            <input type={showPasswords ? 'text' : 'password'} className={inputCls} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Parolni tasdiqlash</label>
            <input type={showPasswords ? 'text' : 'password'} className={inputCls} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button onClick={changePassword} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
            <Lock size={16} /> Parolni o'zgartirish
          </button>
        </div>
      </div>

      {/* Telegram */}
      <div className={cardCls}>
        {sectionTitle(<Send size={20} className="text-[#0061ff]" />, 'Telegram sozlamalari')}
        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelCls}>Bot Token</label>
            <input className={inputCls} value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="123456:ABC-DEF..." />
          </div>
          <div>
            <label className={labelCls}>Chat ID</label>
            <input className={inputCls} value={chatId} onChange={e => setChatId(e.target.value)} placeholder="-1001234567890" />
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className={cardCls}>
        {sectionTitle(<Phone size={20} className="text-[#0061ff]" />, 'WhatsApp sozlamalari')}
        <div className="max-w-md">
          <label className={labelCls}>Telefon raqam</label>
          <input className={inputCls} value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} placeholder="+998901234567" />
        </div>
      </div>

      {/* Save settings */}
      <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
        <Save size={18} /> {saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
      </button>

      {/* Backup */}
      <div className={cardCls}>
        {sectionTitle(<Database size={20} className="text-[#0061ff]" />, 'Ma\'lumotlar zaxirasi')}
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Barcha ma'lumotlarning JSON nusxasini yuklab oling.</p>
        <button onClick={downloadBackup} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
          <Download size={18} /> Backup yuklash
        </button>
      </div>
    </div>
  );
};

export default Settings;
