import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, CheckCircle, Clock, AlertCircle, Calendar, Plus, User, 
  ChevronRight, Trash2, Edit3, MessageSquare, X, Check, Search, Filter, Play, CheckSquare, ListTodo
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  content_item_id: number | null;
  plan_id: number | null;
  title: string;
  description: string;
  task_type: string;
  assigned_to: number | null;
  status: string;
  priority: string;
  due_date: string;
  assignee_name: string | null;
  assignee_avatar_color: string | null;
  content_title: string | null;
  estimated_hours: number;
  actual_hours: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

export const MyDay: React.FC = () => {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Quick task creation form
  const [newTitle, setNewTitle] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);

  // Detailed Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [taskComments, setTaskComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    task_type: 'general',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to: '' as string | number,
    estimated_hours: 0,
    actual_hours: 0
  });

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMyDayData();
  }, []);

  const fetchMyDayData = async () => {
    try {
      setLoading(true);
      const teamRes = await fetch('/api/pm/members', { headers });
      if (teamRes.ok) setTeamMembers(await teamRes.json());

      const tasksRes = await fetch('/api/pm/tasks/my-day', { headers });
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const res = await fetch(`/api/pm/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(newStatus === 'done' ? "Vazifa bajarildi!" : "Vazifa qaytarildi");
        // Update local state smoothly
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        if (selectedTask?.id === task.id) {
          setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      toast.error("Statusni yangilab bo'lmadi");
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const payload = {
      title: newTitle.trim(),
      assigned_to: newAssignedTo ? Number(newAssignedTo) : null,
      priority: newPriority,
      due_date: todayStr,
      status: 'todo',
      task_type: 'general',
      description: 'Bugungi tezkor reja'
    };

    try {
      const res = await fetch('/api/pm/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Yangi tezkor vazifa qo'shildi!");
        setNewTitle('');
        setNewAssignedTo('');
        setNewPriority('medium');
        setIsAdding(false);
        fetchMyDayData();
      }
    } catch (err) {
      toast.error("Vazifa qo'shishda xatolik yuz berdi");
    }
  };

  const fetchTaskComments = async (taskId: number) => {
    try {
      const res = await fetch(`/api/pm/comments/task/${taskId}`, { headers });
      if (res.ok) setTaskComments(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type || 'general',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0
    });
    fetchTaskComments(task.id);
    setDetailOpen(true);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const payload = {
      ...selectedTask,
      title: editForm.title,
      description: editForm.description,
      task_type: editForm.task_type,
      status: editForm.status,
      priority: editForm.priority,
      due_date: editForm.due_date,
      assigned_to: editForm.assigned_to ? Number(editForm.assigned_to) : null,
      estimated_hours: Number(editForm.estimated_hours),
      actual_hours: Number(editForm.actual_hours)
    };

    try {
      const res = await fetch(`/api/pm/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Tafsilotlar yangilandi!");
        setDetailOpen(false);
        setSelectedTask(null);
        fetchMyDayData();
      }
    } catch (err) {
      toast.error("Saqlashda xatolik yuz berdi");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    const payload = {
      target_type: 'task',
      target_id: selectedTask.id,
      content: newCommentText.trim()
    };

    try {
      const res = await fetch('/api/pm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewCommentText('');
        fetchTaskComments(selectedTask.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm("Vazifani butunlay o'chirmoqchisiz?")) return;

    try {
      const res = await fetch(`/api/pm/tasks/${selectedTask.id}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast.success("O'chirildi");
        setDetailOpen(false);
        setSelectedTask(null);
        fetchMyDayData();
      }
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  // Filters logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAssignee = assigneeFilter === 'all' || String(task.assigned_to) === assigneeFilter;

    let matchesStatus = true;
    const todayStr = new Date().toISOString().split('T')[0];

    if (statusFilter === 'pending') {
      matchesStatus = task.status !== 'done';
    } else if (statusFilter === 'done') {
      matchesStatus = task.status === 'done';
    } else if (statusFilter === 'overdue') {
      matchesStatus = task.due_date < todayStr && task.status !== 'done';
    }

    return matchesSearch && matchesAssignee && matchesStatus;
  });

  // Calculate statistics for bugungi kun
  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const overdueCount = tasks.filter(t => {
    const todayStr = new Date().toISOString().split('T')[0];
    return t.due_date < todayStr && t.status !== 'done';
  }).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Render Date formatted
  const getTodayFormatted = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('uz-UZ', options);
  };

  // Badge priority
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'medium': return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  const getPriorityBorder = (p: string) => {
    switch (p) {
      case 'urgent': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'medium': return 'border-l-4 border-l-indigo-500';
      default: return 'border-l-4 border-l-slate-500';
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* Upper header */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Sun size={26} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bugungi Kunlik Vazifalar (My Day)
            </h2>
            <p className="text-xs text-pink-500 font-extrabold uppercase mt-0.5 tracking-wider">{getTodayFormatted()}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bugun bajarilishi kerak bo'lgan yoki muddatidan o'tib ketgan operatsion checklistlar
            </p>
          </div>
        </div>

        {/* Task Progress ring-like visual */}
        <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 bg-slate-950/20 px-5 py-3 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bugungi Progress</p>
            <p className={`text-lg font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {doneCount} / {totalCount} <span className="text-xs text-slate-500 font-normal">bajarildi</span>
            </p>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="#ec4899" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Filter and Fast add tasks */}
        <div className="space-y-6">
          
          {/* Quick Create Task Form */}
          <div className={`p-6 rounded-3xl border ${cardBg}`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                <Plus size={16} />
              </div>
              <h3 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Bugunga tezkor vazifa</h3>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Nima ish qilinishi kerak? (masalan, Reels montaj qilish)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                }`}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Mas'ul xodim</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  >
                    <option value="">O'zingizga</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">Prioritet</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  >
                    <option value="low">Past (Low)</option>
                    <option value="medium">O'rta (Medium)</option>
                    <option value="high">Yuqori (High)</option>
                    <option value="urgent">Kritik (Urgent)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                <span>Tezkor qo'shish</span>
              </button>
            </form>
          </div>

          {/* Quick Stats list */}
          <div className={`p-6 rounded-3xl border ${cardBg} space-y-3`}>
            <h4 className={`text-xs font-black uppercase text-slate-400 tracking-wider mb-2`}>Vazifalar Tafsiloti</h4>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 flex items-center gap-1.5"><ListTodo size={14} /> Jami vazifalar</span>
              <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalCount} ta</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-850/40">
              <span className="text-emerald-500 flex items-center gap-1.5"><CheckSquare size={14} /> Bajarilgan</span>
              <span className="font-black text-emerald-500">{doneCount} ta</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-850/40">
              <span className="text-rose-500 flex items-center gap-1.5"><AlertCircle size={14} /> Kechikkanlar</span>
              <span className="font-black text-rose-500">{overdueCount} ta</span>
            </div>
          </div>
        </div>

        {/* Right Side: Big Task List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col md:flex-row gap-4 items-center justify-between`}>
            {/* Left tab toggles */}
            <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto">
              {(['all', 'pending', 'done', 'overdue'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    statusFilter === tab
                      ? 'bg-pink-500 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'all' && 'Barchasi'}
                  {tab === 'pending' && 'Bajarilmagan'}
                  {tab === 'done' && 'Bajarilgan'}
                  {tab === 'overdue' && 'Kechikkan'}
                </button>
              ))}
            </div>

            {/* Right filters */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="relative flex-1 md:flex-none">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-4 py-2 w-full md:w-44 rounded-xl border text-[11px] outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                  }`}
                />
              </div>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-[11px] outline-none font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                }`}
              >
                <option value="all">Barcha Xodimlar</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks Container */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20 animate-pulse space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto" />
                <div className="h-4 rounded bg-slate-800 w-1/4 mx-auto" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className={`p-12 rounded-3xl border text-center ${cardBg} border-dashed`}>
                <CheckCircle size={40} className="mx-auto text-emerald-500 opacity-60 mb-3" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Vazifalar topilmadi
                </h4>
                <p className="text-xs text-slate-500 mt-1">Bugun bo'limi uchun barcha vazifalar bajarilgan yoki filtrga mos ish yo'q.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTasks.map(task => {
                  const isDone = task.status === 'done';
                  const isOverdue = !isDone && task.due_date < new Date().toISOString().split('T')[0];

                  return (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-2xl border transition-all hover:bg-slate-950/10 flex items-center justify-between gap-4 relative overflow-hidden group ${getPriorityBorder(task.priority)} ${
                        isDark 
                          ? isDone ? 'bg-slate-950/30 border-slate-900/60 opacity-60' : 'bg-slate-900/50 border-slate-850'
                          : isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Left Side: Checkbox + content */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : isOverdue 
                                ? 'border-rose-500 hover:bg-rose-500/10 text-transparent' 
                                : 'border-slate-500 hover:border-pink-500 text-transparent'
                          }`}
                        >
                          <Check size={13} className="stroke-[3px]" />
                        </button>

                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenDetail(task)}>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                              {task.priority === 'urgent' ? 'Kritik' : task.priority === 'high' ? 'Yuqori' : task.priority === 'medium' ? 'O\'rta' : 'Past'}
                            </span>
                            {task.content_title && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isDark ? 'bg-slate-800 text-slate-350' : 'bg-slate-100 text-slate-600'
                              } truncate max-w-[150px]`}>
                                🏷️ {task.content_title}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                                Kechikkan
                              </span>
                            )}
                          </div>
                          <h4 className={`text-xs font-bold leading-snug break-words ${isDone ? 'line-through text-slate-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 break-words">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: User initials, date info, details chevron */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Assignee display */}
                        <div className="flex items-center gap-1.5">
                          {task.assignee_avatar_color ? (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                              style={{ backgroundColor: task.assignee_avatar_color }}
                              title={task.assignee_name || 'Xodim'}
                            >
                              {task.assignee_name ? task.assignee_name.split(' ').map(n => n[0]).join('') : 'X'}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-850 flex items-center justify-center text-[10px] text-slate-400">
                              <User size={12} />
                            </div>
                          )}
                        </div>

                        {/* Chevron right to open details */}
                        <button
                          onClick={() => handleOpenDetail(task)}
                          className={`p-1.5 rounded-lg hover:bg-slate-850 transition-colors ${
                            isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

        </div>

      </div>

      {/* ─── DETAIL DIALOG MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {detailOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-4xl h-[80vh] rounded-3xl border flex flex-col ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              } shadow-2xl z-10 overflow-hidden relative`}
            >
              
              {/* Header */}
              <div className="p-6 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black truncate max-w-md">{selectedTask.title}</h3>
                    <p className="text-xs text-slate-400">Vazifa tafsilotlari va muhokamalar</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteTask}
                    className="px-3 py-1.5 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                  >
                    O'chirish
                  </button>
                  <button
                    onClick={() => setDetailOpen(false)}
                    className={`p-1.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-150'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Form & Comments Split View */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left side: parameters */}
                <form onSubmit={handleSaveDetails} className="w-full md:w-1/2 p-6 border-r border-slate-800/40 overflow-y-auto space-y-4 scrollbar-thin">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Sarlavha</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Vazifa tavsifi</label>
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border text-xs outline-none resize-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Biriktirilgan xodim</label>
                      <select
                        value={editForm.assigned_to}
                        onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="">Biriktirilmagan</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Muddat (Due Date)</label>
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="todo">Kutilmoqda</option>
                        <option value="in_progress">Jarayonda</option>
                        <option value="review">Tekshiruvda</option>
                        <option value="done">Bajarildi</option>
                        <option value="blocked">Bloklangan</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Prioritet</label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="low">Past</option>
                        <option value="medium">O'rta</option>
                        <option value="high">Yuqori</option>
                        <option value="urgent">Kritik</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Turi</label>
                      <select
                        value={editForm.task_type}
                        onChange={(e) => setEditForm({ ...editForm, task_type: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="general">Umumiy</option>
                        <option value="shooting">Suratga olish</option>
                        <option value="editing">Montaj</option>
                        <option value="design">Dizayn</option>
                        <option value="copywriting">Copywriting</option>
                        <option value="publishing">Nashr etish</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Reja soat (Estimate)</label>
                      <input
                        type="number"
                        value={editForm.estimated_hours}
                        onChange={(e) => setEditForm({ ...editForm, estimated_hours: Number(e.target.value) })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20"
                    >
                      O'zgarishlarni saqlash
                    </button>
                  </div>
                </form>

                {/* Right side: Comments */}
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 shrink-0 flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    <span>Muhokamalar</span>
                  </h4>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin mb-4">
                    {taskComments.map(comment => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-2xl border ${
                          isDark ? 'bg-slate-950/40 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-xs font-extrabold text-slate-400">{comment.author}</span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(comment.created_at).toLocaleString('uz-UZ')}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed">{comment.content}</p>
                      </div>
                    ))}

                    {taskComments.length === 0 && (
                      <div className="text-center py-12 text-xs text-slate-500">
                        Bu vazifada izohlar yo'q
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Jamoa bilan fikr almashish..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black"
                    >
                      Yozish
                    </button>
                  </form>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyDay;
