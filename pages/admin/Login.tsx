import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Clock, Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../components/admin/admin.css';
import '../../components/admin/ui/ui.css';
import { Spinner } from '../../components/admin/ui/kit';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedLockout = localStorage.getItem('adminLockoutEnd');
    const savedAttempts = localStorage.getItem('adminLoginAttempts');
    if (savedLockout) {
      const end = parseInt(savedLockout, 10);
      if (Date.now() < end) setLockoutEnd(end);
      else { localStorage.removeItem('adminLockoutEnd'); localStorage.removeItem('adminLoginAttempts'); }
    }
    if (savedAttempts) setAttempts(parseInt(savedAttempts, 10));
  }, []);

  useEffect(() => {
    if (!lockoutEnd) { setRemainingTime(0); return; }
    const interval = setInterval(() => {
      const diff = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutEnd(null); setAttempts(0); setRemainingTime(0);
        localStorage.removeItem('adminLockoutEnd'); localStorage.removeItem('adminLoginAttempts');
        clearInterval(interval);
      } else setRemainingTime(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const isLocked = lockoutEnd !== null && Date.now() < lockoutEnd;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLocked) { toast.error(`Tizim qulflangan. ${remainingTime} soniya kuting.`); return; }
    if (!username.trim() || !password.trim()) { setError('Login va parolni kiriting'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminAuthTime', Date.now().toString());
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLockoutEnd');
        toast.success('Xush kelibsiz!');
        navigate('/paneladmindata');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('adminLoginAttempts', newAttempts.toString());
        if (newAttempts >= MAX_ATTEMPTS) {
          const end = Date.now() + LOCKOUT_DURATION * 1000;
          setLockoutEnd(end);
          localStorage.setItem('adminLockoutEnd', end.toString());
          setError(`${MAX_ATTEMPTS} marta notoʻgʻri kiritildi. Tizim ${LOCKOUT_DURATION} soniyaga qulflandi.`);
        } else {
          setError(`Notoʻgʻri login yoki parol (${newAttempts}/${MAX_ATTEMPTS})`);
        }
      }
    } catch {
      setError('Server bilan aloqa yoʻq. Birozdan keyin qayta urinib koʻring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--a-bg)' }}>
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-20%', left: '50%', width: 720, height: 720, transform: 'translateX(-50%)', background: 'radial-gradient(closest-side, color-mix(in srgb, var(--a-blue) 22%, transparent), transparent)' }} />
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '-25%', right: '-10%', width: 520, height: 520, background: 'radial-gradient(closest-side, color-mix(in srgb, var(--a-cyan) 16%, transparent), transparent)' }} />

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full relative"
        style={{ maxWidth: 400 }}
      >
        <div className="a-card" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)' }}>
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 18, color: '#fff', background: isLocked ? 'var(--a-red)' : 'var(--a-grad)', boxShadow: '0 12px 30px -12px rgba(0,97,255,.6)' }}>
              {isLocked ? <ShieldAlert size={26} aria-hidden="true" /> : <Lock size={24} aria-hidden="true" />}
            </span>
          </div>

          <h1 className="a-h1 text-center" style={{ fontSize: '1.5rem' }}>Admin panel</h1>
          <p className="a-sub text-center mt-1.5 mb-6">
            {isLocked ? 'Tizim vaqtincha qulflangan' : 'Davom etish uchun hisobingizga kiring'}
          </p>

          {isLocked && (
            <div className="a-error mb-4" role="alert" style={{ alignItems: 'center' }}>
              <Clock size={18} className="shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Tizim qulflangan</p>
                <p style={{ fontSize: '.75rem' }}>{remainingTime} soniyadan keyin qayta urinib ko&apos;ring</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="grid gap-4" noValidate>
            {error && !isLocked && (
              <div className="a-error" role="alert"><AlertCircle size={16} className="shrink-0 mt-px" aria-hidden="true" />{error}</div>
            )}

            <div>
              <label htmlFor="login-user" className="a-label">Login</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 a-muted pointer-events-none" aria-hidden="true" />
                <input
                  id="login-user" type="text" value={username} autoComplete="username" autoCapitalize="none" spellCheck={false}
                  onChange={e => { setUsername(e.target.value); if (error) setError(''); }}
                  placeholder="admin" disabled={isLocked || loading}
                  className="a-input" style={{ paddingLeft: 40 }} aria-invalid={!!error && !isLocked}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-pass" className="a-label">Parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 a-muted pointer-events-none" aria-hidden="true" />
                <input
                  id="login-pass" type={showPassword ? 'text' : 'password'} value={password} autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                  placeholder="••••••••" disabled={isLocked || loading}
                  className="a-input" style={{ paddingLeft: 40, paddingRight: 52 }} aria-invalid={!!error && !isLocked}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword} aria-label={showPassword ? 'Parolni yashirish' : 'Parolni koʻrsatish'}
                  className="a-btn a-btn-ghost a-icon-btn absolute right-0.5 top-0.5" style={{ width: 40, height: 40 }}
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {attempts > 0 && !isLocked && (
              <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--a-amber-ink)' }}>
                <ShieldAlert size={13} aria-hidden="true" />
                {attempts}/{MAX_ATTEMPTS} noto&apos;g&apos;ri urinish
              </p>
            )}

            <button type="submit" disabled={isLocked || loading} className="a-btn a-btn-primary w-full mt-1">
              {loading ? <><Spinner />Tekshirilmoqda...</> : isLocked ? 'Qulflangan' : 'Kirish'}
            </button>
          </form>
        </div>

        <p className="text-center a-muted text-xs mt-5">DATA Ta&apos;lim Stansiyasi © {new Date().getFullYear()}</p>
      </motion.main>
    </div>
  );
}
