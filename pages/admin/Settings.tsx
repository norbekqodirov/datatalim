import React, { useState } from 'react';
import { Lock, Database, Download, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, Section, Field, Spinner } from '../../components/admin/ui/kit';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

const Settings: React.FC = () => {
  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string; form?: string }>({});

  const changePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err: typeof errors = {};
    if (!currentPassword) err.current = 'Joriy parolni kiriting';
    if (!newPassword) err.next = 'Yangi parolni kiriting';
    else if (newPassword.length < 10) err.next = 'Parol kamida 10 belgidan iborat bo\'lsin';
    if (newPassword && newPassword !== confirmPassword) err.confirm = 'Parollar mos kelmaydi';
    if (err.current || err.next || err.confirm) { setErrors(err); return; }
    setErrors({});
    setPwBusy(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        // server yangi token beradi (eski tokenlar parol bilan birga bekor bo'ladi)
        const data = await res.json().catch(() => ({}));
        if (data?.token) localStorage.setItem('adminToken', data.token);
        toast.success('Parol o\'zgartirildi');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrors({ form: data.error || 'Parolni oʻzgartirib boʻlmadi' });
      }
    } catch { setErrors({ form: 'Server bilan aloqa yoʻq. Qaytadan urinib koʻring.' }); }
    finally { setPwBusy(false); }
  };

  const downloadBackup = async () => {
    setBackupBusy(true);
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
    finally { setBackupBusy(false); }
  };

  const type = showPasswords ? 'text' : 'password';

  return (
    <div>
      <PageHeader kicker="Tizim" title="Sozlamalar" sub="Admin paroli va ma'lumotlar zaxirasi." />

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <Section title="Parolni o'zgartirish" desc="Kamida 10 belgi. Oʻzgargach boshqa qurilmalardagi sessiyalar tugaydi." icon={<Lock size={18} />}>
          <form onSubmit={changePassword} className="grid gap-4" noValidate>
            {errors.form && <div className="a-error" role="alert"><AlertCircle size={16} className="shrink-0 mt-px" aria-hidden="true" />{errors.form}</div>}

            <Field label="Joriy parol" error={errors.current}>
              {id => (
                <div className="relative">
                  <input id={id} type={type} autoComplete="current-password" className="a-input" style={{ paddingRight: 52 }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} aria-invalid={!!errors.current} />
                  <button type="button" onClick={() => setShowPasswords(s => !s)} aria-pressed={showPasswords} aria-label={showPasswords ? 'Parollarni yashirish' : 'Parollarni koʻrsatish'} className="a-btn a-btn-ghost a-icon-btn absolute right-0.5 top-0.5" style={{ width: 40, height: 40 }}>
                    {showPasswords ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </Field>
            <Field label="Yangi parol" error={errors.next}>
              {id => <input id={id} type={type} autoComplete="new-password" className="a-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} aria-invalid={!!errors.next} />}
            </Field>
            <Field label="Parolni tasdiqlash" error={errors.confirm}>
              {id => <input id={id} type={type} autoComplete="new-password" className="a-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} aria-invalid={!!errors.confirm} />}
            </Field>

            <div>
              <button type="submit" disabled={pwBusy} className="a-btn a-btn-primary">
                {pwBusy ? <Spinner /> : <ShieldCheck size={16} aria-hidden="true" />}{pwBusy ? 'Saqlanmoqda...' : 'Parolni oʻzgartirish'}
              </button>
            </div>
          </form>
        </Section>

        <Section title="Ma'lumotlar zaxirasi" desc="Barcha sayt maʼlumotlarining JSON nusxasi." icon={<Database size={18} />}>
          <p className="a-sub mb-4">Zaxirani vaqti-vaqti bilan, ayniqsa katta o&apos;zgarishlardan oldin yuklab oling va xavfsiz joyda saqlang.</p>
          <button type="button" onClick={downloadBackup} disabled={backupBusy} className="a-btn a-btn-primary">
            {backupBusy ? <Spinner /> : <Download size={16} aria-hidden="true" />}{backupBusy ? 'Tayyorlanmoqda...' : 'Backup yuklash'}
          </button>
        </Section>
      </div>
    </div>
  );
};

export default Settings;
