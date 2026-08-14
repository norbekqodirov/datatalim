import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import {
  BookOpen, ChevronLeft, ChevronRight, Search,
  Check, X, Loader2, RefreshCw, Edit3, Save, AlertCircle,
  Download, Users, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Group { id: number; name: string; course_id: string; teacher: string; }
interface Student { id: number; name: string; phone: string; status: string; }
interface JournalEntry {
  id: number;
  group_id: number;
  student_id: number;
  date: string;
  lesson_topic: string;
  grade: number | null;
  homework_grade: number | null;
  notes: string;
  student_name: string;
}

type CellMode = 'grade' | 'homework';

export default function Journal() {
  const { isDark } = useTheme();

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cellMode, setCellMode] = useState<CellMode>('grade');

  // Month navigation
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  // Cell editing state
  const [editingCell, setEditingCell] = useState<{ studentId: number; date: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingCell, setSavingCell] = useState(false);

  // Topic editing state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicDate, setTopicDate] = useState('');
  const [topicValue, setTopicValue] = useState('');

  const token = () => localStorage.getItem('adminToken');
  const authH = () => ({ Authorization: `Bearer ${token()}` });
  const jsonH = () => ({ 'Content-Type': 'application/json', ...authH() });

  const MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  // Generate lesson dates for the month (every Mon/Wed/Fri pattern by default)
  const getDatesInMonth = (y: number, m: number): string[] => {
    const dates: string[] = [];
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const day = date.getDay(); // 0=Sun, 1=Mon...
      // Show Mon, Wed, Fri, Sat as potential lesson days
      if ([1, 2, 3, 4, 5, 6].includes(day)) {
        dates.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
    }
    return dates;
  };

  const lessonDates = getDatesInMonth(year, month);

  const fetchGroups = async () => {
    try {
      const r = await fetch('/api/groups', { headers: authH() });
      const data = await r.json();
      setGroups(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0].id);
      }
    } catch {
      toast.error("Guruhlarni yuklab bo'lmadi");
    }
  };

  const fetchStudents = async (groupId: number) => {
    try {
      const r = await fetch(`/api/groups/${groupId}`, { headers: authH() });
      const data = await r.json();
      const active = (data.students || []).filter((s: any) => s.enroll_status === 'active');
      setStudents(active);
    } catch {
      toast.error("O'quvchilarni yuklab bo'lmadi");
    }
  };

  const fetchJournal = async (groupId: number) => {
    try {
      const r = await fetch(`/api/journal?group_id=${groupId}`, { headers: authH() });
      const data = await r.json();
      setJournal(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Jurnalni yuklab bo'lmadi");
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    await fetchGroups();
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (selectedGroup) {
      setLoading(true);
      Promise.all([fetchStudents(selectedGroup), fetchJournal(selectedGroup)])
        .finally(() => setLoading(false));
    }
  }, [selectedGroup]);

  // Get journal entry for a student on a date
  const getEntry = (studentId: number, date: string) =>
    journal.find(j => j.student_id === studentId && j.date === date);

  // Get topic for a date
  const getTopicForDate = (date: string) => {
    const entry = journal.find(j => j.date === date && j.lesson_topic);
    return entry?.lesson_topic || '';
  };

  // Save a grade
  const saveGrade = async (studentId: number, date: string, val: number | null) => {
    if (!selectedGroup) return;
    setSavingCell(true);
    try {
      const existing = getEntry(studentId, date);
      const payload: any = {
        group_id: selectedGroup,
        student_id: studentId,
        date,
        lesson_topic: existing?.lesson_topic || getTopicForDate(date) || '',
      };
      if (cellMode === 'grade') {
        payload.grade = val;
        payload.homework_grade = existing?.homework_grade ?? null;
      } else {
        payload.grade = existing?.grade ?? null;
        payload.homework_grade = val;
      }

      const r = await fetch('/api/journal', {
        method: 'POST',
        headers: jsonH(),
        body: JSON.stringify(payload)
      });

      if (!r.ok) throw new Error((await r.json()).error);

      const updated = await r.json();
      setJournal(prev => {
        const idx = prev.findIndex(j => j.student_id === studentId && j.date === date);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [...prev, { ...updated, student_name: students.find(s => s.id === studentId)?.name || '' }];
      });
    } catch (err: any) {
      toast.error(err.message || 'Saqlashda xatolik');
    } finally {
      setSavingCell(false);
      setEditingCell(null);
    }
  };

  const saveTopic = async () => {
    if (!selectedGroup || !topicDate) return;
    // For each student in the group, update/create topic
    setSavingCell(true);
    try {
      const promises = students.map(s => {
        const existing = getEntry(s.id, topicDate);
        return fetch('/api/journal', {
          method: 'POST',
          headers: jsonH(),
          body: JSON.stringify({
            group_id: selectedGroup,
            student_id: s.id,
            date: topicDate,
            lesson_topic: topicValue,
            grade: existing?.grade ?? null,
            homework_grade: existing?.homework_grade ?? null
          })
        });
      });
      await Promise.all(promises);
      await fetchJournal(selectedGroup);
      toast.success("Mavzu saqlandi");
      setShowTopicModal(false);
    } catch {
      toast.error("Mavzuni saqlashda xatolik");
    } finally {
      setSavingCell(false);
    }
  };

  const handleCellClick = (studentId: number, date: string) => {
    const existing = getEntry(studentId, date);
    const val = cellMode === 'grade'
      ? (existing?.grade?.toString() ?? '')
      : (existing?.homework_grade?.toString() ?? '');
    setEditingCell({ studentId, date });
    setEditValue(val);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, studentId: number, date: string) => {
    if (e.key === 'Enter') {
      const num = editValue === '' ? null : parseInt(editValue);
      if (num !== null && (num < 0 || num > 5)) {
        toast.error('Baho 0 dan 5 gacha bo\'lishi kerak');
        return;
      }
      saveGrade(studentId, date, num);
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(s =>
    !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute student averages
  const getStudentAvg = (studentId: number) => {
    const entries = journal.filter(j => j.student_id === studentId && j.grade !== null);
    if (!entries.length) return null;
    return Math.round(entries.reduce((acc, e) => acc + (e.grade ?? 0), 0) / entries.length * 10) / 10;
  };

  // Render grade cell
  const renderCellValue = (val: number | null | undefined) => {
    if (val === null || val === undefined) return null;
    if (val === 0) return <span className="text-red-500 font-black text-xs">0</span>;
    const colors: Record<number, string> = {
      1: 'text-red-500', 2: 'text-orange-500', 3: 'text-amber-500',
      4: 'text-blue-500', 5: 'text-emerald-500'
    };
    return <span className={`font-black text-sm ${colors[val] || 'text-slate-500'}`}>{val}</span>;
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cardBase = `rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inputBase = `px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`;

  return (
    <div className="space-y-5 max-w-[1800px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className={`p-4 sm:p-5 ${cardBase} flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Elektron Jurnal</h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Baholar va o'quv jarayonini real vaqtda kuzatish</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Group selector */}
          <select
            value={selectedGroup ?? ''}
            onChange={e => setSelectedGroup(Number(e.target.value))}
            className={`${inputBase} min-w-[200px]`}
          >
            <option value="">Guruhni tanlang...</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Cell mode toggle */}
          <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <button
              onClick={() => setCellMode('grade')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${cellMode === 'grade' ? 'bg-blue-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >Baho</button>
            <button
              onClick={() => setCellMode('homework')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${cellMode === 'homework' ? 'bg-purple-600 text-white shadow' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >Uy ishi</button>
          </div>

          {/* Search */}
          <div className={`relative flex items-center ${isDark ? 'text-white' : ''}`}>
            <Search size={14} className={`absolute left-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="O'quvchi qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`${inputBase} pl-9 w-40`}
            />
          </div>

          <button
            onClick={() => selectedGroup && fetchJournal(selectedGroup)}
            className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className={`flex-1 ${cardBase} flex flex-col overflow-hidden`}>
        {/* Month Nav */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              <ChevronLeft size={16} />
            </button>
            <h2 className={`text-base font-black min-w-[150px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Legend */}
          <div className={`hidden md:flex items-center gap-4 text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />4-5 (A'lo)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />3 (Qoniqarli)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />1-2 (Yomon)</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-sm bg-slate-400" />Kiritilmagan</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yuklanmoqda...</p>
            </div>
          </div>
        ) : !selectedGroup ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Guruhni tanlang</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto flex">
            {/* Frozen student column */}
            <div className={`w-[240px] flex-shrink-0 border-r sticky left-0 z-20 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className={`h-[52px] border-b flex items-center px-3 ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  O'quvchi F.I.O ({filteredStudents.length})
                </span>
              </div>
              {filteredStudents.length === 0 ? (
                <div className={`p-4 text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Users size={24} className="mx-auto mb-2 opacity-40" />
                  O'quvchi topilmadi
                </div>
              ) : (
                filteredStudents.map(student => {
                  const avg = getStudentAvg(student.id);
                  return (
                    <div key={student.id} className={`h-[48px] px-3 flex items-center justify-between border-b ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{student.name}</p>
                      </div>
                      {avg !== null && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                          avg >= 4 ? 'text-emerald-500 bg-emerald-500/10' :
                          avg >= 3 ? 'text-blue-500 bg-blue-500/10' :
                          'text-red-500 bg-red-500/10'
                        }`}>{avg}</span>
                      )}
                    </div>
                  );
                })
              )}
              {/* Footer */}
              <div className={`h-[44px] px-3 flex items-center border-t sticky bottom-0 ${isDark ? 'bg-slate-950 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} text-[10px] font-black uppercase`}>
                O'rtacha
              </div>
            </div>

            {/* Scrollable dates area */}
            <div className="flex-1 min-w-max">
              {/* Date headers */}
              <div className={`flex h-[52px] border-b sticky top-0 z-10 ${isDark ? 'border-white/10 bg-slate-900/95 backdrop-blur-md' : 'border-slate-200 bg-slate-50/95 backdrop-blur-md'}`}>
                {lessonDates.map(date => {
                  const d = new Date(date);
                  const dayNum = d.getDate();
                  const dayName = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'][d.getDay()];
                  const isToday = date === now.toISOString().split('T')[0];
                  const topic = getTopicForDate(date);
                  return (
                    <div
                      key={date}
                      title={topic || 'Mavzu kiritish uchun bosing'}
                      onClick={() => {
                        setTopicDate(date);
                        setTopicValue(topic);
                        setShowTopicModal(true);
                      }}
                      className={`w-12 flex-shrink-0 flex flex-col items-center justify-center border-r cursor-pointer transition-colors group ${
                        isDark ? 'border-white/5 hover:bg-slate-800' : 'border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className={`text-[9px] font-black uppercase ${isToday ? 'text-blue-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {dayName}
                      </span>
                      <span className={`text-sm font-black leading-none mt-0.5 ${isToday ? 'text-blue-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {dayNum}
                      </span>
                      {topic && <div className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
                    </div>
                  );
                })}
                {/* Average column header */}
                <div className={`w-16 flex-shrink-0 flex items-center justify-center border-r text-[9px] font-black uppercase ${isDark ? 'border-white/10 text-slate-500 bg-slate-800/50' : 'border-slate-200 text-slate-400 bg-slate-100/50'}`}>O'rtacha</div>
                <div className={`w-16 flex-shrink-0 flex items-center justify-center text-[9px] font-black uppercase ${isDark ? 'text-slate-500 bg-slate-800/50' : 'text-slate-400 bg-slate-100/50'}`}>Uy ishi</div>
              </div>

              {/* Rows */}
              {filteredStudents.map(student => (
                <div key={student.id} className={`flex h-[48px] border-b ${isDark ? 'border-white/5 hover:bg-white/3' : 'border-slate-100 hover:bg-slate-50/60'}`}>
                  {lessonDates.map(date => {
                    const entry = getEntry(student.id, date);
                    const isEditing = editingCell?.studentId === student.id && editingCell?.date === date;
                    const displayVal = cellMode === 'grade' ? entry?.grade : entry?.homework_grade;

                    return (
                      <div
                        key={date}
                        onClick={() => !isEditing && handleCellClick(student.id, date)}
                        className={`w-12 flex-shrink-0 relative flex items-center justify-center border-r cursor-pointer transition-colors ${
                          isEditing
                            ? isDark ? 'bg-blue-900/40 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                            : isDark ? 'border-white/5 hover:bg-slate-800/80' : 'border-slate-100 hover:bg-white'
                        }`}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            type="number"
                            min={0}
                            max={5}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => handleCellKeyDown(e, student.id, date)}
                            onBlur={() => {
                              const num = editValue === '' ? null : parseInt(editValue);
                              if (num === null || (num >= 0 && num <= 5)) {
                                saveGrade(student.id, date, num);
                              } else {
                                setEditingCell(null);
                              }
                            }}
                            className="w-10 h-8 text-center text-sm font-black bg-transparent border border-blue-500 rounded-lg outline-none text-blue-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            {displayVal !== null && displayVal !== undefined ? (
                              renderCellValue(displayVal)
                            ) : (
                              <div className={`w-1 h-1 rounded-full opacity-40 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Avg grade cell */}
                  {(() => {
                    const avg = getStudentAvg(student.id);
                    return (
                      <div className={`w-16 flex-shrink-0 flex items-center justify-center border-r font-black text-xs ${isDark ? 'border-white/10 bg-slate-800/30' : 'border-slate-100 bg-blue-50/40'}`}>
                        {avg !== null ? (
                          <span className={avg >= 4 ? 'text-emerald-500' : avg >= 3 ? 'text-blue-500' : 'text-red-500'}>
                            {avg}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Avg homework cell */}
                  {(() => {
                    const hwEntries = journal.filter(j => j.student_id === student.id && j.homework_grade !== null);
                    const hwAvg = hwEntries.length
                      ? Math.round(hwEntries.reduce((a, e) => a + (e.homework_grade ?? 0), 0) / hwEntries.length * 10) / 10
                      : null;
                    return (
                      <div className={`w-16 flex-shrink-0 flex items-center justify-center font-black text-xs ${isDark ? 'bg-slate-800/30' : 'bg-purple-50/40'}`}>
                        {hwAvg !== null ? (
                          <span className={hwAvg >= 4 ? 'text-emerald-500' : hwAvg >= 3 ? 'text-purple-500' : 'text-red-500'}>
                            {hwAvg}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}

              {/* Footer row (averages per date) */}
              <div className={`flex h-[44px] border-t sticky bottom-0 z-10 ${isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                {lessonDates.map(date => {
                  const dateEntries = journal.filter(j => j.date === date && j.grade !== null);
                  const avgForDate = dateEntries.length
                    ? Math.round(dateEntries.reduce((a, e) => a + (e.grade ?? 0), 0) / dateEntries.length * 10) / 10
                    : null;
                  return (
                    <div key={date} className={`w-12 flex-shrink-0 flex items-center justify-center border-r text-[10px] font-black ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                      {avgForDate ?? '—'}
                    </div>
                  );
                })}
                <div className={`w-16 flex-shrink-0 border-r ${isDark ? 'border-white/10' : 'border-slate-100'}`}></div>
                <div className="w-16 flex-shrink-0"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTopicModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`relative z-10 w-full max-w-md p-5 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <h3 className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dars Mavzusi</h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{topicDate}</p>
              <input
                type="text"
                value={topicValue}
                onChange={e => setTopicValue(e.target.value)}
                placeholder="Masalan: JavaScript async/await nima?"
                className={`w-full mb-4 ${inputBase}`}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setShowTopicModal(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Bekor</button>
                <button onClick={saveTopic} disabled={savingCell} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                  {savingCell ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Saqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
