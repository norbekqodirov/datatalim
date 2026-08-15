import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, Database, Download, Eye, EyeOff } from 'lucide-react';
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
