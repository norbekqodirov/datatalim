import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Phone, Mail, Award, AlertTriangle, ShieldCheck, 
  Trash2, Edit3, X, Save, Sparkles, TrendingUp, Calendar, CheckCircle2, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyHeatmapItem {
  date: string;
  count: number;
}

interface TeamWorkloadItem {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
  phone: string;
  email: string;
  max_daily_tasks: number;
  status: string;
  total_tasks: number;
  done_tasks: number;
  active_tasks: number;
  weekly_heatmap: WeeklyHeatmapItem[];
}

export const PMTeam: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [workloads, setWorkloads] = useState<TeamWorkloadItem[]>([]);
  
  // Modals / Form toggles
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamWorkloadItem | null>(null);
  
  // Add Member Form
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatarColor, setAvatarColor] = useState('#EC4899');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [maxDailyTasks, setMaxDailyTasks] = useState(5);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchTeamWorkload();
  }, []);

  const fetchTeamWorkload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pm/analytics/team-workload', { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkloads(data);
      }
    } catch (err) {
      toast.error("Jamoa yuklamasini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      role,
      avatar_color: avatarColor,
      phone,
      email,
      max_daily_tasks: Number(maxDailyTasks),
      status: 'active'
    };

    try {
      const res = await fetch('/api/pm/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Jamoa a'zosi muvaffaqiyatli qo'shildi!");
        setAddOpen(false);
        setName('');
        setRole('member');
        setAvatarColor('#EC4899');
        setPhone('');
        setEmail('');
        setMaxDailyTasks(5);
        fetchTeamWorkload();
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;

    const payload = {
      name: editMember.name,
      role: editMember.role,
      avatar_color: editMember.avatar_color,
      phone: editMember.phone,
      email: editMember.email,
      max_daily_tasks: Number(editMember.max_daily_tasks),
      status: editMember.status
    };

    try {
      const res = await fetch(`/api/pm/members/${editMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Ma'lumotlar saqlandi!");
        setEditMember(null);
        fetchTeamWorkload();
      }
    } catch (err) {
      toast.error("Saqlashda xatolik");
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Jamoa a'zosini o'chirmoqchimisiz? Uning barcha vazifalari o'chirilmaydi, ammo biriktirishlar olib tashlanadi.")) return;

    try {
      const res = await fetch(`/api/pm/members/${id}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        toast.success("O'chirildi!");
        setEditMember(null);
        fetchTeamWorkload();
      }
    } catch (err) {
      toast.error("O'chirishda xatolik");
    }
  };

  // Heatmap rendering helpers
  const getHeatmapColor = (count: number, max: number) => {
    if (count === 0) return isDark ? 'bg-slate-900/40 text-slate-600' : 'bg-slate-100 text-slate-400';
    const ratio = count / max;
    if (ratio <= 0.4) return 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20';
    if (ratio <= 0.8) return 'bg-amber-500/20 text-amber-500 border border-amber-500/20';
    return 'bg-rose-500/20 text-rose-500 border border-rose-500/20 animate-pulse';
  };

  const getWeekDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { weekday: 'short' });
  };

  const getDayNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  // Average team loading
  const avgCompletionRate = workloads.length > 0 
    ? Math.round(
        (workloads.reduce((acc, m) => acc + m.done_tasks, 0) / 
         Math.max(workloads.reduce((acc, m) => acc + m.total_tasks, 0), 1)) * 100
      )
    : 0;

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300';

  const PRESET_COLORS = [
    '#EC4899', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#14B8A6', '#64748B'
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* Header Panel */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Users size={26} />
          </div>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Jamoa Yuklamalari va Boshqaruv
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              SMM va marketing jamoasi a'zolari profillari, ularning kunlik yuklamasi, max vazifa chegaralari va 7-kunlik reja heatmapi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAddOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/20 flex items-center gap-2"
          >
            <UserPlus size={15} />
            <span>Yangi Xodim Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Team Insights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Insight 1: Team Size */}
        <div className={`p-5 rounded-3xl border ${cardBg} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h4 className="text-2xl font-black">{workloads.length} nafar</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Faol jamoa a'zolari</p>
          </div>
        </div>

        {/* Insight 2: Workload distribution */}
        <div className={`p-5 rounded-3xl border ${cardBg} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <h4 className="text-2xl font-black">{avgCompletionRate}%</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vazifa yopilish samaradorligi</p>
          </div>
        </div>

        {/* Insight 3: Alerts/Threshold check */}
        <div className={`p-5 rounded-3xl border ${cardBg} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 className="text-2xl font-black">
              {workloads.filter(w => w.active_tasks > w.max_daily_tasks).length} kishi
            </h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yuklama chegarasidan oshganlar</p>
          </div>
        </div>

      </div>

      {/* Main Team Workload & Heatmap List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-4" />
            <div className="h-4 bg-slate-800 rounded w-1/3 mx-auto" />
          </div>
        ) : workloads.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center ${cardBg}`}>
            <p className="text-slate-500 text-xs">Jamoa a'zolari topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {workloads.map((member) => {
              const workloadPercent = Math.min(Math.round((member.active_tasks / member.max_daily_tasks) * 100), 100);
              const isOverloaded = member.active_tasks > member.max_daily_tasks;

              return (
                <motion.div
                  layoutId={`member-card-${member.id}`}
                  key={member.id}
                  className={`p-6 rounded-3xl border ${cardBg} flex flex-col xl:flex-row items-stretch gap-6`}
                >
                  {/* Left Column: Avatar & Role */}
                  <div className="flex items-center gap-4 min-w-[250px] shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg relative"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                      {member.status === 'active' ? (
                        <span className="absolute bottom-[-3px] right-[-3px] w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center" title="Faol">
                          <ShieldCheck size={10} className="text-white" />
                        </span>
                      ) : (
                        <span className="absolute bottom-[-3px] right-[-3px] w-4 h-4 bg-slate-500 rounded-full border-2 border-slate-900" />
                      )}
                    </div>

                    <div>
                      <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                      <p className="text-[10px] text-pink-500 uppercase tracking-widest font-extrabold mt-0.5">{member.role === 'lead' ? 'Team Lead / SMM Direktori' : member.role}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                        {member.phone && <span className="flex items-center gap-1"><Phone size={10} /> {member.phone}</span>}
                        {member.email && <span className="flex items-center gap-1"><Mail size={10} /> {member.email}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Current Load Slider */}
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className={isOverloaded ? 'text-rose-500' : 'text-slate-400'}>
                        {member.active_tasks} ta faol / maks. {member.max_daily_tasks}
                      </span>
                      <span className={isOverloaded ? 'text-rose-500 animate-pulse' : 'text-slate-350'}>
                        {workloadPercent}% Yuklama {isOverloaded && '(Oshgan)'}
                      </span>
                    </div>

                    <div className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-950/80 border border-white/5' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-750 ${
                          isOverloaded 
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse' 
                            : workloadPercent > 80 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                              : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                        }`}
                        style={{ width: `${workloadPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-1">
                      <span>Jami biriktirilgan: {member.total_tasks} ta</span>
                      <span className="text-emerald-500">Bajarildi: {member.done_tasks} ta</span>
                    </div>
                  </div>

                  {/* Right Column: 7-Day Matrix Heatmap */}
                  <div className="shrink-0 flex flex-col justify-center gap-2 min-w-[280px]">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Calendar size={11} />
                      <span>7-kunlik Reja & Yuklama</span>
                    </h5>

                    <div className="grid grid-cols-7 gap-1">
                      {member.weekly_heatmap?.map((day, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl flex flex-col items-center justify-between text-center transition-all ${getHeatmapColor(day.count, member.max_daily_tasks)}`}
                          title={`${day.date}: ${day.count} ta faol vazifa`}
                        >
                          <span className="text-[8px] font-black uppercase tracking-wider block opacity-70">
                            {getWeekDayName(day.date)}
                          </span>
                          <span className="text-xs font-black block mt-0.5">
                            {day.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit member trigger */}
                  <div className="shrink-0 flex items-center justify-end gap-1.5 self-center">
                    <button
                      onClick={() => setEditMember(member)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Tahrirlash"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── ADD TEAM MEMBER DIALOG MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-3xl border p-6 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-955'
              } shadow-2xl z-10 relative overflow-hidden`}
            >
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Yangi Jamoa A'zosi</h3>
                    <p className="text-[10px] text-slate-450">Marketing / SMM komandasi uchun profil</p>
                  </div>
                </div>

                <button
                  onClick={() => setAddOpen(false)}
                  className={`p-1.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">To'liq ismi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan, Alisher Qodirov"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Roli / Lavozimi</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    >
                      <option value="lead">Team Lead / Direktor</option>
                      <option value="copywriter">Copywriter</option>
                      <option value="designer">Grafik Dizayner</option>
                      <option value="videomaker">Videomaker / Operator</option>
                      <option value="editor">Video Montajchi</option>
                      <option value="smm">SMM Mutaxassisi</option>
                      <option value="member">Jamoa a'zosi</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Kunlik Maksimal vazifalar soni</label>
                    <input
                      type="number"
                      required
                      value={maxDailyTasks}
                      onChange={(e) => setMaxDailyTasks(Number(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Telefon raqami</label>
                    <input
                      type="text"
                      placeholder="+998901234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Elektron pochta</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>
                </div>

                {/* Avatar Color Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 block">Avatar rangi</label>
                  <div className="flex gap-2.5">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform shrink-0 ${
                          avatarColor === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/20"
                >
                  Saqlash va yaratish
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── EDIT TEAM MEMBER DIALOG MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-3xl border p-6 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-955'
              } shadow-2xl z-10 relative overflow-hidden`}
            >
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Xodim Ma'lumotlarini Tahrirlash</h3>
                    <p className="text-[10px] text-slate-450">Tizim bo'yicha profil tahriri</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMember(editMember.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Xodimni o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setEditMember(null)}
                    className={`p-1.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">To'liq ismi</label>
                  <input
                    type="text"
                    required
                    value={editMember.name}
                    onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Roli / Lavozimi</label>
                    <select
                      value={editMember.role}
                      onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                      }`}
                    >
                      <option value="lead">Team Lead / Direktor</option>
                      <option value="copywriter">Copywriter</option>
                      <option value="designer">Grafik Dizayner</option>
                      <option value="videomaker">Videomaker / Operator</option>
                      <option value="editor">Video Montajchi</option>
                      <option value="smm">SMM Mutaxassisi</option>
                      <option value="member">Jamoa a'zosi</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Kunlik Maksimal vazifalar soni</label>
                    <input
                      type="number"
                      required
                      value={editMember.max_daily_tasks}
                      onChange={(e) => setEditMember({ ...editMember, max_daily_tasks: Number(e.target.value) })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Telefon raqami</label>
                    <input
                      type="text"
                      value={editMember.phone}
                      onChange={(e) => setEditMember({ ...editMember, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Elektron pochta</label>
                    <input
                      type="email"
                      value={editMember.email}
                      onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Faollik Statusi</label>
                    <select
                      value={editMember.status}
                      onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-955'
                      }`}
                    >
                      <option value="active">Active (Faol)</option>
                      <option value="inactive">Inactive (Nofaol)</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Color Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 block">Avatar rangi</label>
                  <div className="flex gap-2.5">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditMember({ ...editMember, avatar_color: color })}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform shrink-0 ${
                          editMember.avatar_color === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg"
                >
                  O'zgarishlarni Saqlash
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PMTeam;
