import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { Instagram, Key, Hash, Save, CheckCircle, ExternalLink, AlertCircle, Info, Wifi, RefreshCw, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
});

export default function IGSettings() {
  const { isDark } = useTheme();
  const [token, setToken] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    fetch('/api/ig/settings', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setBusinessId(d.ig_business_id || '');
        setConfigured(!!d.ig_access_token);
        setSavedAt(d.saved_at || null);
      })
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    if (!businessId.trim()) { toast.error('Business ID kiritilishi shart'); return; }
    // token bo'sh bo'lsa — mavjud token saqlanib qoladi
    setSaving(true);
    setTestResult(null);
    try {
      const body: Record<string, string> = { ig_business_id: businessId.trim() };
      if (token.trim()) body.ig_access_token = token.trim();
      const res = await fetch('/api/ig/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success('Instagram sozlamalari saqlandi!');
      setConfigured(true);
      setSavedAt(new Date().toLocaleString('uz-UZ'));
      setToken(''); // clear token field after save (security)
    } catch (e: any) {
      toast.error(e.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleExtend = async () => {
    setExtending(true);
    setTestResult(null);
    try {
      const body: Record<string, string> = {};
      if (token.trim()) body.short_token = token.trim();
      const res = await fetch('/api/ig/extend-token', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(d.message || 'Token 60 kunga uzaytirildi!');
      setConfigured(true);
      setSavedAt(new Date().toLocaleString('uz-UZ'));
      setToken('');
      setTestResult({ ok: true, msg: `✅ ${d.message}` });
    } catch (e: any) {
      setTestResult({ ok: false, msg: `❌ ${e.message}` });
      toast.error(e.message || 'Token uzaytirish xatoligi');
    } finally {
      setExtending(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ig/overview?days=7', { headers: authHeaders() });
      const d = await res.json();
      if (res.ok && d.account) {
        setTestResult({ ok: true, msg: `✅ Ulandi! Akaunt: @${d.account.username} — ${d.account.followers_count?.toLocaleString()} ta follower` });
      } else if (d.setup_required) {
        setTestResult({ ok: false, msg: '⚠️ Token kiritilmagan — avval tokenni saqlang' });
      } else {
        setTestResult({ ok: false, msg: `❌ Xatolik: ${d.error || 'API javob bermadi'}` });
      }
    } catch {
      setTestResult({ ok: false, msg: '❌ Server bilan bog\'lanib bo\'lmadi' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Instagram size={18} className="text-pink-500" />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Instagram Sozlamalari</span>
        </div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Token Sozlash</h1>
      </div>

      {/* Status */}
      <div className={`rounded-2xl p-4 border flex items-center justify-between gap-3 ${configured
        ? isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
        : isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-3">
          {configured
            ? <CheckCircle size={18} className="text-green-500 shrink-0" />
            : <AlertCircle size={18} className="text-amber-500 shrink-0" />}
          <div>
            <span className={`text-sm font-medium block ${configured
              ? isDark ? 'text-green-300' : 'text-green-700'
              : isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              {configured ? '✅ Instagram token sozlangan — analitika sahifalari ishlaydi' : '⚠️ Instagram token sozlanmagan — analitika uchun token kiriting'}
            </span>
            {savedAt && <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Saqlangan: {savedAt}</span>}
          </div>
        </div>
        {configured && (
          <button onClick={handleTest} disabled={testing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
            {testing ? <RefreshCw size={12} className="animate-spin" /> : <Wifi size={12} />}
            {testing ? 'Tekshirilmoqda...' : 'Ulanishni sinash'}
          </button>
        )}
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`rounded-xl p-3 text-sm font-medium border ${testResult.ok
          ? isDark ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
          : isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {testResult.msg}
        </div>
      )}

      {/* Form */}
      <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Key size={14} className="inline mr-1" />
                Instagram Access Token
              </label>
              {configured && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                  ✓ Saqlangan
                </span>
              )}
            </div>
            <textarea
              value={token}
              onChange={e => setToken(e.target.value)}
              rows={4}
              placeholder={configured ? "Token allaqachon sozlangan. Yangilash uchun yangi token kiriting (ixtiyoriy)" : "EAAVBMe... (token kiriting)"}
              className={`w-full px-4 py-3 rounded-xl border font-mono text-xs resize-none transition-colors ${isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-pink-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-400'} focus:outline-none`}
            />
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {configured
                ? '💡 Token bo\'sh qoldirilsa — mavjud token saqlanib qoladi. Faqat yangilash kerak bo\'lsa to\'ldiring.'
                : '⚠️ Analitika ishlashi uchun token kiritilishi shart.'}
            </p>
          </div>

          <div>
            <label className={`text-sm font-bold block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Hash size={14} className="inline mr-1" />
              Instagram Business ID
            </label>
            <input
              type="text"
              value={businessId}
              onChange={e => setBusinessId(e.target.value)}
              placeholder="17841422858670678"
              className={`w-full px-4 py-3 rounded-xl border font-mono text-sm transition-colors ${isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-pink-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-400'} focus:outline-none`}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button onClick={handleExtend} disabled={extending}
              title="Mavjud yoki yangi tokenni Meta API orqali 60 kunlik uzun tokenga almashtiradi"
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 border-2 ${isDark
                ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                : 'border-amber-400 text-amber-600 hover:bg-amber-50'}`}>
              {extending ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
              {extending ? 'Uzaytirilmoqda...' : '60 kunga uzaytirish'}
            </button>
          </div>
          <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
            <Clock size={13} className="shrink-0 mt-0.5" />
            <span>
              <strong>60 kunga uzaytirish</strong> — Qisqa tokenni (1–2 soatlik) Meta serverlar orqali 60 kunlik uzun tokenga almashtiradi.
              Token maydoniga yangi token kiriting yoki bo'sh qoldiring (mavjud token uzaytiriladi).
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram Access Token Olish Yo'riqnomasi</h3>
        </div>
        <ol className="space-y-3">
          {[
            { step: 1, text: 'Meta Business Suite ga kiring', link: 'https://business.facebook.com' },
            { step: 2, text: "Sozlamalar → Advanced → System Users → 'Add' bosingiz" },
            { step: 3, text: "System user yarating va 'Instagram' ruxsatini bering" },
            { step: 4, text: "'Generate Token' bosing va tokenni nusxalang" },
            { step: 5, text: "Yuqoridagi formaga tokenni joylashtiring va saqlang" },
          ].map(item => (
            <li key={item.step} className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{item.step}</span>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {item.text}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-1 text-[#0061ff] font-medium">
                    {item.link} <ExternalLink size={11} />
                  </a>
                )}
              </span>
            </li>
          ))}
        </ol>
        <div className={`mt-4 p-3 rounded-xl text-xs ${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
          ⚠️ Token odatda 60 kun amal qiladi. Muddati tugaganda ushbu sahifadan yangilang.
        </div>
      </div>
    </div>
  );
}
