import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Info,
  Film, Layers, Send, Sparkles, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContentItem {
  id: number;
  plan_id: number;
  title: string;
  content_type: string;
  platform: string;
  pillar: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  priority: string;
  caption: string;
  scenario: string;
  script: string;
  visual_notes: string;
}

export const ContentCalendar: React.FC = () => {
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Workbench modals & state
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [selectedDayStr, setSelectedDayStr] = useState('');
  const [quickForm, setQuickForm] = useState({
    title: '',
    content_type: 'reel',
    platform: 'instagram',
    pillar: 'Ta\'limiy',
    scheduled_time: '18:00',
    priority: 'medium'
  });

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCalendarData();
  }, [platformFilter, statusFilter]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      let url = '/api/pm/content-items?1=1';
      if (platformFilter) url += `&platform=${platformFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      toast.error("Kalendar ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0, Monday = 1
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Shift index to match Mon-Sun layout
    // standard getDay: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // our index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    let shiftedFirstDay = firstDayIndex - 1;
    if (shiftedFirstDay === -1) shiftedFirstDay = 6; // Sunday becomes 6
    
    return { totalDays, firstDayShift: shiftedFirstDay };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if date is today
  const isToday = (dayNum: number) => {
    const today = new Date();
    return today.getDate() === dayNum &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();
  };

  // Map platform to CSS background classes for markers
  const getMarkerClass = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'reel':
        return 'bg-pink-500 text-white';
      case 'video':
        return 'bg-rose-600 text-white';
      case 'story':
        return 'bg-amber-500 text-white';
      case 'post':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  // Render Calendar Grid Cells
  const renderCells = () => {
    const { totalDays, firstDayShift } = getDaysInMonth(currentDate);
    const cells = [];
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    // Previous month filler cells
    for (let i = 0; i < firstDayShift; i++) {
      cells.push(
        <div
          key={`prev-${i}`}
          className={`min-h-[110px] p-2 border ${
            isDark ? 'border-slate-800/60 bg-slate-900/10' : 'border-slate-100 bg-slate-50/20'
          } opacity-30`}
        />
      );
    }

    // Active month day cells
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
      const dayItems = items.filter(item => item.scheduled_date === dayStr);

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => {
            setSelectedDayStr(dayStr);
            setQuickAddModalOpen(true);
          }}
          className={`min-h-[110px] p-2 border transition-all cursor-pointer relative ${
            isToday(day)
              ? isDark 
                ? 'border-pink-500 bg-pink-500/5 ring-1 ring-pink-500/25' 
                : 'border-pink-500 bg-pink-50/50'
              : isDark ? 'border-slate-800/80 hover:bg-slate-800/25' : 'border-slate-100 hover:bg-slate-50'
          }`}
        >
          {/* Day number */}
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-black ${
              isToday(day) 
                ? 'text-pink-500 bg-pink-500/10 w-5 h-5 flex items-center justify-center rounded-full text-[10px]' 
                : isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              {day}
            </span>
            {dayItems.length > 0 && (
              <span className={`text-[9px] font-black opacity-60`}>
                {dayItems.length} post
              </span>
            )}
          </div>

          {/* Content Markers */}
          <div className="space-y-1 max-h-[80px] overflow-y-auto scrollbar-hide">
            {dayItems.map(item => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Tahrirlash uchun Kontent Rejalar sahifasiga o'ting: "${item.title}"`);
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-extrabold truncate border border-white/5 shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1 ${getMarkerClass(item.content_type)}`}
                title={`${item.title} (${item.scheduled_time})`}
              >
                <span>{item.scheduled_time}</span>
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  // Quick Content Create
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.title || !selectedDayStr) return;

    // A content item must belong to a real plan — there is no implicit
    // "plan #1" to fall back to, especially on a fresh install with zero plans.
    let planId: number | null = null;
    try {
      const plansRes = await fetch('/api/pm/plans', { headers });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (Array.isArray(plansData) && plansData.length > 0) planId = plansData[0].id;
      }
    } catch(err) {
      console.error(err);
    }
    if (planId === null) {
      toast.error("Avval kontent rejasi yarating — hozircha birorta ham reja yo'q");
      return;
    }

    const payload = {
      plan_id: planId,
      title: quickForm.title,
      content_type: quickForm.content_type,
      platform: quickForm.platform,
      pillar: quickForm.pillar,
      scheduled_date: selectedDayStr,
      scheduled_time: quickForm.scheduled_time,
      priority: quickForm.priority,
      status: 'idea'
    };

    try {
      const res = await fetch('/api/pm/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Kalendarga post qo'shildi!");
        setQuickAddModalOpen(false);
        setQuickForm({ ...quickForm, title: '' });
        fetchCalendarData();
      } else {
        toast.error("Xatolik");
      }
    } catch(err) {
      toast.error("Xatolik");
    }
  };

  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* Calendar Header with Controllers & Filters */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
            <CalendarIcon size={20} className="text-pink-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Kalendar</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Platformalar bo'yicha visual oylik reja va optimal chiqish vaqtlari
            </p>
          </div>
        </div>

        {/* Controllers */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          
          {/* Platform Filters */}
          <div className="flex items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
              }`}
            >
              <option value="">Barcha Platformalar</option>
              <option value="instagram">Instagram</option>
              <option value="telegram">Telegram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
              }`}
            >
              <option value="">Barcha Statuslar</option>
              <option value="idea">Idea (G'oya)</option>
              <option value="planned">Planned (Rejalashtirilgan)</option>
              <option value="in_progress">Jarayonda</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={`text-sm font-black min-w-[120px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`rounded-3xl border overflow-hidden p-6 ${cardBg}`}>
        {/* Week Days Headers */}
        <div className="grid grid-cols-7 text-center py-2 shrink-0 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
          <div>Dush</div>
          <div>Sesh</div>
          <div>Chor</div>
          <div>Pay</div>
          <div>Jum</div>
          <div>Shan</div>
          <div>Yak</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 border-t border-l border-slate-800/40 rounded-2xl overflow-hidden shadow-inner">
          {renderCells()}
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md rounded-3xl border p-6 z-10 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-950'
              }`}
            >
              <h3 className="text-lg font-black mb-3">Post Rejalashtirish</h3>
              <p className="text-xs text-slate-400 mb-4">Sana: <span className="text-indigo-400 font-bold">{selectedDayStr}</span></p>

              <form onSubmit={handleQuickAdd} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Post Sarlavhasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kurs Promo Reels..."
                    value={quickForm.title}
                    onChange={(e) => setQuickForm({ ...quickForm, title: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Format</label>
                    <select
                      value={quickForm.content_type}
                      onChange={(e) => setQuickForm({ ...quickForm, content_type: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    >
                      <option value="reel">Reel (Video)</option>
                      <option value="post">Post (Rasm)</option>
                      <option value="story">Story</option>
                      <option value="video">YouTube Video</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Platforma</label>
                    <select
                      value={quickForm.platform}
                      onChange={(e) => setQuickForm({ ...quickForm, platform: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="telegram">Telegram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Optimal posting vaqti</label>
                    <input
                      type="time"
                      value={quickForm.scheduled_time}
                      onChange={(e) => setQuickForm({ ...quickForm, scheduled_time: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Prioritet</label>
                    <select
                      value={quickForm.priority}
                      onChange={(e) => setQuickForm({ ...quickForm, priority: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    >
                      <option value="low">Past (Low)</option>
                      <option value="medium">O'rta (Medium)</option>
                      <option value="high">Yuqori (High)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setQuickAddModalOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    Kalendarga yozish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContentCalendar;
