import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_PASSWORD = (process.env as any).VITE_ADMIN_PASSWORD || 'admin123';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60; // seconds

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load lockout state from localStorage
  useEffect(() => {
    const savedLockout = localStorage.getItem('adminLockoutEnd');
    const savedAttempts = localStorage.getItem('adminLoginAttempts');
    if (savedLockout) {
      const end = parseInt(savedLockout, 10);
      if (Date.now() < end) {
        setLockoutEnd(end);
      } else {
        localStorage.removeItem('adminLockoutEnd');
        localStorage.removeItem('adminLoginAttempts');
      }
    }
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts, 10));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutEnd) {
      setRemainingTime(0);
      return;
    }
    const interval = setInterval(() => {
      const diff = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutEnd(null);
        setAttempts(0);
        setRemainingTime(0);
        localStorage.removeItem('adminLockoutEnd');
        localStorage.removeItem('adminLoginAttempts');
        clearInterval(interval);
      } else {
        setRemainingTime(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const isLocked = lockoutEnd !== null && Date.now() < lockoutEnd;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(`Tizim qulflangan. ${remainingTime} soniya kuting.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      toast.error("Iltimos, login va parolni kiriting.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminToken', data.token); // Store JWT token
        localStorage.setItem('adminAuthTime', Date.now().toString());
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLockoutEnd');
        toast.success('Xush kelibsiz!');
        navigate('/paneladmindata');
      } else {
        handleFailedAttempt(data.error || "Noto'g'ri ism yoki parol");
      }
    } catch (error) {
      console.error("Login xatosi:", error);
      toast.error("Tarmoqda xatolik yuz berdi. Backend ishlayotganini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = (errorMessage: string) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('adminLoginAttempts', newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      const end = Date.now() + LOCKOUT_DURATION * 1000;
      setLockoutEnd(end);
      localStorage.setItem('adminLockoutEnd', end.toString());
      toast.error(`${MAX_ATTEMPTS} marta noto'g'ri urinish! Tizim ${LOCKOUT_DURATION} soniyaga qulflandi.`);
    } else {
      toast.error(`${errorMessage} (${newAttempts}/${MAX_ATTEMPTS})`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 max-w-md w-full border border-slate-100"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isLocked ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0061ff]'}`}>
          {isLocked ? <ShieldAlert size={32} /> : <Lock size={32} />}
        </div>
        <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-500 text-center mb-8 font-medium">
          {isLocked ? 'Tizim vaqtincha qulflangan' : 'Tizimga kirish uchun parolni kiriting'}
        </p>

        {isLocked && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Clock className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-red-700">Tizim qulflangan</p>
              <p className="text-xs text-red-500">{remainingTime} soniyadan keyin qayta urinib ko'ring</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Login username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium disabled:bg-slate-100 disabled:cursor-not-allowed mb-4"
              placeholder="admin"
              required
              disabled={isLocked || loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
              required
              disabled={isLocked || loading}
            />
          </div>
          {attempts > 0 && !isLocked && (
            <p className="text-xs text-amber-600 font-medium">
              ⚠️ {attempts}/{MAX_ATTEMPTS} noto'g'ri urinish
            </p>
          )}
          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-[#0061ff] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tekshirilmoqda...' : isLocked ? 'Qulflangan' : 'Kirish'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
