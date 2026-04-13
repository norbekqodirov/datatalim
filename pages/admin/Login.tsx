import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Clock, Eye, EyeOff, User } from 'lucide-react';
import toast from 'react-hot-toast';

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
    if (isLocked) { toast.error(`Tizim qulflangan. ${remainingTime} soniya kuting.`); return; }
    if (!username.trim() || !password.trim()) { toast.error('Login va parolni kiriting'); return; }
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
          toast.error(`${MAX_ATTEMPTS} marta noto'g'ri! Tizim ${LOCKOUT_DURATION} soniyaga qulflandi.`);
        } else {
          toast.error(`Noto'g'ri login yoki parol (${newAttempts}/${MAX_ATTEMPTS})`);
        }
      }
    } catch {
      toast.error('Server bilan aloqa yo\'q. Backend ishlamoqdami?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              isLocked ? 'bg-red-500/20 shadow-red-500/20' : 'bg-blue-500/20 shadow-blue-500/20'
            }`}>
              {isLocked
                ? <ShieldAlert size={30} className="text-red-400" />
                : <Lock size={28} className="text-blue-400" />
              }
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-center text-sm mb-7">
            {isLocked ? 'Tizim vaqtincha qulflangan' : 'Kirish uchun ma\'lumotlaringizni kiriting'}
          </p>

          {/* Lockout warning */}
          {isLocked && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
              <Clock className="text-red-400 shrink-0" size={18} />
              <div>
                <p className="text-sm font-bold text-red-300">Tizim qulflangan</p>
                <p className="text-xs text-red-400">{remainingTime} soniyadan keyin qayta urinib ko'ring</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Login</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isLocked || loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm font-medium focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Parol</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLocked || loading}
                  className="w-full pl-10 pr-11 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm font-medium focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Attempts warning */}
            {attempts > 0 && !isLocked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <ShieldAlert size={12} />
                {attempts}/{MAX_ATTEMPTS} noto'g'ri urinish
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLocked || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Tekshirilmoqda...
                </span>
              ) : isLocked ? 'Qulflangan' : 'Kirish'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">DATA Ta'lim Stansiyasi © {new Date().getFullYear()}</p>
      </motion.div>
    </div>
  );
}
