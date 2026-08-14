import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  Award, Plus, Search, Trash2, X, Loader2,
  RefreshCw, QrCode, Download, CheckCircle, Shield,
  User, BookOpen, Calendar, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Certificate {
  id: number;
  student_id: number;
  course_id: string;
  certificate_code: string;
  issue_date: string;
  grade_average: number;
  status: 'active' | 'revoked';
  student_name: string;
  student_phone: string;
}

interface Student { id: number; name: string; phone: string; status: string; }

const GRADE_LABEL: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: 'A\'lo', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  4: { label: 'Yaxshi', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  3: { label: 'Qoniqarli', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  2: { label: 'Qoniqarsiz', color: 'text-red-500', bg: 'bg-red-500/10' },
};

// Simple QR-like visual indicator using the code
function QRDisplay({ code, size = 80 }: { code: string; size?: number }) {
  const cells = 7;
  // Deterministic pattern from code
  const hashCode = (s: string) => s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const seed = hashCode(code);
  const grid = Array.from({ length: cells * cells }, (_, i) => ((seed ^ (i * 2654435769)) >>> 0) % 3 === 0);
  // Force corner squares
  const corners = [0, 1, 7, 8, 42, 43, 49, cells - 2, cells - 1, cells * 6, cells * 6 + 1, cells * 7 - 2, cells * 7 - 1];
  corners.forEach(i => { if (i < grid.length) grid[i] = true; });

  return (
    <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: `repeat(${cells}, 1fr)`, gap: 1, padding: 4, background: 'white', borderRadius: 6 }}>
      {grid.map((on, i) => (
        <div key={i} style={{ background: on ? '#0f172a' : 'white', borderRadius: 1 }} />
      ))}
    </div>
  );
}

// Certificate Print Preview Card
function CertificatePreview({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const gradeInfo = GRADE_LABEL[cert.grade_average] || GRADE_LABEL[3];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        {/* Action bar */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-white text-sm font-bold">Sertifikat Oldindan Ko'rish</span>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">
              <Download size={13} /> Chop etish / Saqlash
            </button>
            <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none" id="certificate-print">
          {/* Top decorative bar */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="p-8 relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award size={300} className="text-blue-900" />
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-3">
                <Shield size={14} className="text-blue-600" />
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Rasmiy Sertifikat</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">Data Talim</h1>
              <p className="text-sm text-slate-500">O'quv Markazi</p>
            </div>

            {/* Body */}
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600 mb-2">Mazkur sertifikat</p>
              <h2 className="text-2xl font-black text-slate-900 mb-2 border-b-2 border-blue-200 pb-2 inline-block px-6">
                {cert.student_name}
              </h2>
              <p className="text-sm text-slate-600 mt-2">ga beriladi, chunki u</p>
              <div className="mt-3 mb-3">
                <span className="text-xl font-black text-blue-600">«{cert.course_id}»</span>
              </div>
              <p className="text-sm text-slate-600">kursini muvaffaqiyatli tamomladi.</p>

              {/* Grade badge */}
              <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full" style={{ background: '#f0f9ff' }}>
                <span className="text-sm font-bold text-slate-600">Umumiy baho:</span>
                <span className="text-xl font-black text-blue-600">{cert.grade_average}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${gradeInfo.bg} ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-100">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Berilgan sana</p>
                <p className="text-sm font-black text-slate-700">{cert.issue_date}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1">
                <QRDisplay code={cert.certificate_code} size={72} />
                <p className="text-[9px] font-mono text-slate-400">{cert.certificate_code}</p>
              </div>

              <div className="text-right">
                <div className="w-32 border-b-2 border-slate-300 mb-1" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direktor imzosi</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        </div>

        {/* Verify note */}
        <p className="text-center text-white/40 text-[10px] mt-2 font-mono">
          Tekshirish: sertifikat kodi {cert.certificate_code} · data-talim.uz/verify/{cert.certificate_code}
        </p>
      </motion.div>
    </div>
  );
}

export default function Certificates() {
  const { isDark } = useTheme();

  const [certs, setCerts] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Form state
  const [formStudent, setFormStudent] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formGrade, setFormGrade] = useState<number>(4);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/certificates', { headers: authH() });
      const data = await r.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Sertifikatlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const r = await fetch('/api/students', { headers: authH() });
      const data = await r.json();
      setStudents(Array.isArray(data) ? data.filter((s: Student) => s.status === 'active') : []);
    } catch {}
  };

  useEffect(() => {
    fetchCerts();
    fetchStudents();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudent) return toast.error("O'quvchini tanlang");
    if (!formCourse.trim()) return toast.error('Kurs nomini kiriting');

    setSaving(true);
    try {
      const r = await fetch('/api/certificates', {
        method: 'POST',
        headers: jsonH(),
        body: JSON.stringify({
          student_id: Number(formStudent),
          course_id: formCourse.trim(),
          grade_average: formGrade
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Sertifikat yaratishda xatolik");

      toast.success('Sertifikat muvaffaqiyatli yaratildi!');
      setShowForm(false);
      setFormStudent('');
      setFormCourse('');
      setFormGrade(4);
      fetchCerts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu sertifikatni bekor qilasizmi?")) return;
    try {
      await fetch(`/api/certificates/${id}`, { method: 'DELETE', headers: authH() });
      setCerts(prev => prev.filter(c => c.id !== id));
      toast.success("Sertifikat o'chirildi");
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const filtered = certs.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.student_name?.toLowerCase().includes(q) ||
      c.course_id?.toLowerCase().includes(q) ||
      c.certificate_code?.toLowerCase().includes(q);
  });

  const cardBase = `rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inputBase = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`;
  const labelBase = `block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  const stats = [
    { label: 'Jami sertifikatlar', value: certs.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'A\'lo baholar (5)', value: certs.filter(c => c.grade_average === 5).length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Yaxshi baholar (4)', value: certs.filter(c => c.grade_average === 4).length, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Faol holat', value: certs.filter(c => c.status === 'active').length, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 sm:p-5 ${cardBase} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Sertifikatlar</h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bitiruvchilarga QR-kodli sertifikatlar berish va boshqarish</p>
          </div>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all w-full sm:w-48 ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`}
            />
          </div>
          <button onClick={fetchCerts} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} /> Yangi Sertifikat
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`${cardBase} p-4`}>
            <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
            <div className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
            <div className={`w-full h-1 rounded-full mt-3 ${s.bg}`}>
              <div className={`h-1 rounded-full ${s.bg.replace('/10', '')} transition-all`}
                style={{ width: certs.length ? `${Math.min(100, (s.value / certs.length) * 100)}%` : '0%' }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2 className="animate-spin text-amber-500 mx-auto mb-3" size={32} />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yuklanmoqda...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardBase} p-16 text-center`}>
          <Award size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
          <p className={`font-semibold text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {search ? 'Qidiruv natijasi topilmadi' : 'Hali sertifikat berilmagan'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((cert, i) => {
            const gradeInfo = GRADE_LABEL[cert.grade_average] || GRADE_LABEL[3];
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`${cardBase} overflow-hidden hover:border-amber-500/40 hover:shadow-lg transition-all`}
              >
                {/* Top gradient strip */}
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                          {cert.student_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cert.student_name}</h3>
                          <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cert.student_phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${gradeInfo.bg} ${gradeInfo.color}`}>
                        {cert.grade_average} — {gradeInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Course & details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-xs font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cert.course_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cert.issue_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cert.certificate_code}</span>
                    </div>
                  </div>

                  {/* QR + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <QRDisplay code={cert.certificate_code} size={48} />
                      <div>
                        <p className={`text-[9px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Holat</p>
                        <div className={`flex items-center gap-1 text-[10px] font-black ${cert.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                          <CheckCircle size={10} />
                          {cert.status === 'active' ? 'Faol' : 'Bekor qilingan'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <QrCode size={12} /> Ko'rish
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Issue Certificate Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-md p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button onClick={() => setShowForm(false)} className={`absolute right-4 top-4 p-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Yangi Sertifikat Berish</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Noyob QR-kod avtomatik yaratiladi</p>
                </div>
              </div>

              <form onSubmit={handleIssue} className="space-y-4">
                <div>
                  <label className={labelBase}>O'quvchi</label>
                  <select
                    required
                    value={formStudent}
                    onChange={e => setFormStudent(e.target.value)}
                    className={inputBase}
                  >
                    <option value="">O'quvchini tanlang...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.phone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Kurs Nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Frontend React, English B2..."
                    value={formCourse}
                    onChange={e => setFormCourse(e.target.value)}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>Umumiy Baho</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 4, 3, 2].map(g => {
                      const gi = GRADE_LABEL[g];
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormGrade(g)}
                          className={`py-2 rounded-xl border text-sm font-black transition-all ${
                            formGrade === g
                              ? `${gi.bg} ${gi.color} border-current shadow-sm`
                              : isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {GRADE_LABEL[formGrade]?.label}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
                  Sertifikat Yaratish va Chiqarish
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {previewCert && (
          <CertificatePreview cert={previewCert} onClose={() => setPreviewCert(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
