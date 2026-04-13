import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, AlertCircle, Save, Loader2,
  ChevronLeft, ChevronRight, Users, BarChart2, RefreshCw,
  Calendar, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';

interface Group { id: number; name: string; course_id: string; days: string; start_time: string; end_time: string; student_count: number; status: string; }
interface AttRecord { student_id: number; student_name: string; student_phone: string; status: string; note: string; }
interface StatRow { id: number; name: string; phone: string; present: number; absent: number; late: number; excused: number; total_days: number; }

const ATT_STATUS = [
  { key: 'present',  label: 'Keldi',      icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500', short: '✓' },
  { key: 'absent',   label: 'Kelmadi',    icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500',   short: '✗' },
  { key: 'late',     label: 'Kech keldi', icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500', short: '~' },
  { key: 'excused',  label: 'Sababli',    icon: AlertCircle, color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500',  short: 'S' },
];

export default function ManageAttendance() {
  const { isDark } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selGroup, setSelGroup] = useState<number | null>(null);
  const [selDate, setSelDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<number, { status: string; note: string }>>({});
  const [groupStudents, setGroupStudents] = useState<{ id: number; name: string; phone: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'input' | 'stats'>('input');
  const [stats, setStats] = useState<StatRow[]>([]);
  const [statsMonth, setStatsMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [statsLoading, setStatsLoading] = useState(false);

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    fetch('/api/groups', { headers: authH() })
      .then(r => r.json())
      .then(data => setGroups(Array.isArray(data) ? data.filter((g: Group) => g.status === 'active') : []));
  }, []);

  useEffect(() => {
    if (!selGroup) return;
    loadGroupStudents(selGroup);
    loadAttendance(selGroup, selDate);
  }, [selGroup, selDate]);

  const loadGroupStudents = async (gid: number) => {
    const r = await fetch(`/api/groups/${gid}`, { headers: authH() });
    const data = await r.json();
    const students = (data.students || []).filter((s: any) => s.enroll_status === 'active');
    setGroupStudents(students);
    // Initialize records with 'present' default
    const init: Record<number, { status: string; note: string }> = {};
    students.forEach((s: any) => { init[s.id] = { status: 'present', note: '' }; });
    setRecords(init);
  };

  const loadAttendance = async (gid: number, date: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/attendance?group_id=${gid}&date=${date}`, { headers: authH() });
      const data: AttRecord[] = await r.json();
      if (data.length > 0) {
        const map: Record<number, { status: string; note: string }> = {};
        data.forEach(d => { map[d.student_id] = { status: d.status, note: d.note || '' }; });
        setRecords(prev => {
          const updated = { ...prev };
          Object.entries(map).forEach(([id, val]) => { updated[parseInt(id)] = val; });
          return updated;
        });
      }
    } finally { setLoading(false); }
  };

  const loadStats = async () => {
    if (!selGroup) return;
    setStatsLoading(true);
    const r = await fetch(`/api/attendance/stats/${selGroup}?month=${statsMonth}`, { headers: authH() });
    setStats(await r.json());
    setStatsLoading(false);
  };

  useEffect(() => { if (tab === 'stats' && selGroup) loadStats(); }, [tab, selGroup, statsMonth]);

  const setStatus = (sid: number, status: string) => setRecords(prev => ({ ...prev, [sid]: { ...prev[sid], status } }));
  const setNote = (sid: number, note: string) => setRecords(prev => ({ ...prev, [sid]: { ...prev[sid], note } }));

  const handleSave = async () => {
    if (!selGroup) return toast.error('Guruh tanlang');
    const toSave = groupStudents.map(s => ({ student_id: s.id, status: records[s.id]?.status || 'present', note: records[s.id]?.note || '' }));
    setSaving(true);
    try {
      const r = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authH() },
        body: JSON.stringify({ group_id: selGroup, date: selDate, records: toSave })
      });
      if (!r.ok) throw new Error();
      toast.success(`${toSave.length} ta davomat saqlandi ✓`);
    } catch { toast.error('Xatolik yuz berdi'); }
    finally { setSaving(false); }
  };

  const prevDate = () => { const d = new Date(selDate); d.setDate(d.getDate() - 1); setSelDate(d.toISOString().slice(0,10)); };
  const nextDate = () => { const d = new Date(selDate); d.setDate(d.getDate() + 1); setSelDate(d.toISOString().slice(0,10)); };

  const presentCount = useMemo(() => Object.values(records).filter(r => r.status === 'present').length, [records]);
  const absentCount = useMemo(() => Object.values(records).filter(r => r.status === 'absent').length, [records]);

  const card = `rounded-2xl border ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inp = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-400'}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CheckCircle className="text-green-500" size={26} /> Davomat
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Guruh davomati va statistikasi</p>
        </div>
        <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {['input', 'stats'].map(t => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${tab === t ? 'bg-blue-600 text-white' : isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-white'}`}>
              {t === 'input' ? '📋 Davomat' : '📊 Statistika'}
            </button>
          ))}
        </div>
      </div>

      {/* Group selector */}
      <div className={`p-4 rounded-2xl ${card}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Guruh</label>
            <select value={selGroup || ''} onChange={e => setSelGroup(parseInt(e.target.value) || null)} className={inp}>
              <option value="">Guruh tanlang...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.course_id}) · {g.student_count || 0} o'q.</option>)}
            </select>
          </div>
          {tab === 'input' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sana</label>
              <div className="flex items-center gap-2">
                <button onClick={prevDate} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><ChevronLeft size={16} /></button>
                <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} className={inp + ' flex-1'} />
                <button onClick={nextDate} className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
          {tab === 'stats' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Oy</label>
              <input type="month" value={statsMonth} onChange={e => setStatsMonth(e.target.value)} className={inp} />
            </div>
          )}
        </div>
      </div>

      {/* Attendance Input Tab */}
      {tab === 'input' && selGroup && (
        <>
          {/* Summary bar */}
          {groupStudents.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Keldi", val: presentCount, color: "text-green-500", bg: isDark ? "bg-green-500/10" : "bg-green-50" },
                { label: "Kelmadi", val: absentCount, color: "text-red-500", bg: isDark ? "bg-red-500/10" : "bg-red-50" },
                { label: "Kech", val: Object.values(records).filter(r => r.status === 'late').length, color: "text-amber-500", bg: isDark ? "bg-amber-500/10" : "bg-amber-50" },
                { label: "Sababli", val: Object.values(records).filter(r => r.status === 'excused').length, color: "text-blue-500", bg: isDark ? "bg-blue-500/10" : "bg-blue-50" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`p-3 rounded-2xl border text-center ${card}`}>
                  <div className={`text-2xl font-black ${color}`}>{val}</div>
                  <div className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {!selGroup ? (
            <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><BookOpen size={40} className="mx-auto mb-3 opacity-30" /><p>Guruh tanlang</p></div>
          ) : loading ? (
            <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
          ) : groupStudents.length === 0 ? (
            <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><Users size={40} className="mx-auto mb-3 opacity-30" /><p>Bu guruhda o'quvchi yo'q</p></div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(selDate).toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{groupStudents.length} o'quvchi</span>
              </div>
              <div className="divide-y divide-white/5">
                {groupStudents.map((s, idx) => {
                  const rec = records[s.id] || { status: 'present', note: '' };
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                      className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.phone}</p>
                      </div>
                      {/* Status buttons */}
                      <div className="flex gap-1 shrink-0">
                        {ATT_STATUS.map(st => (
                          <button key={st.key} onClick={() => setStatus(s.id, st.key)}
                            title={st.label}
                            className={`w-9 h-9 rounded-xl text-sm font-black border transition-all ${rec.status === st.key ? `${st.bg} ${st.color} ${st.border}` : isDark ? 'border-slate-700 text-slate-600 hover:border-slate-500' : 'border-slate-200 text-slate-300 hover:border-slate-300'}`}>
                            {st.short}
                          </button>
                        ))}
                      </div>
                      {/* Note */}
                      <input value={rec.note} onChange={e => setNote(s.id, e.target.value)}
                        placeholder="Izoh..."
                        className={`w-32 px-3 py-1.5 rounded-xl border text-xs outline-none transition-all hidden lg:block ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-400'}`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {groupStudents.length > 0 && (
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-500/25 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Davomatni Saqlash
              </button>
            </div>
          )}
        </>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && selGroup && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {statsLoading ? (
            <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
          ) : stats.length === 0 ? (
            <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <BarChart2 size={40} className="mx-auto mb-3 opacity-30" /><p>Ma'lumot topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase`}>
                <tr>
                  <th className="px-4 py-3 text-left">O'quvchi</th>
                  <th className="px-4 py-3 text-center text-green-500">Keldi</th>
                  <th className="px-4 py-3 text-center text-red-500">Kelmadi</th>
                  <th className="px-4 py-3 text-center text-amber-500">Kech</th>
                  <th className="px-4 py-3 text-center text-blue-500">Sababli</th>
                  <th className="px-4 py-3 text-right">% Davomat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.map(s => {
                  const pct = s.total_days > 0 ? Math.round(((s.present + s.late * 0.5) / s.total_days) * 100) : 0;
                  return (
                    <tr key={s.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-3">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-500">{s.present}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-500">{s.absent}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-500">{s.late}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-500">{s.excused}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`flex-1 max-w-[60px] h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-black w-10 text-right ${pct >= 80 ? 'text-green-500' : pct >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selGroup && (
        <div className={`text-center py-20 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
          <Calendar size={48} className="mx-auto mb-4 opacity-40" />
          <p className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Davomat olish uchun guruh tanlang</p>
        </div>
      )}
    </div>
  );
}
