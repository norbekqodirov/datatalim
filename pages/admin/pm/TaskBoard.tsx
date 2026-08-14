import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Kanban, Plus, Clock, User, AlertCircle, ChevronRight, Edit3, CheckCircle,
  MessageSquare, Trash2, Calendar, Layout, RefreshCw, X, Check
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

const COLUMNS = [
  { id: 'todo', title: 'Kutilmoqda (Todo)', color: 'border-t-slate-500 bg-slate-500/5 text-slate-400' },
  { id: 'in_progress', title: 'Jarayonda (In Progress)', color: 'border-t-amber-500 bg-amber-500/5 text-amber-400' },
  { id: 'review', title: 'Tekshiruvda (Review)', color: 'border-t-purple-500 bg-purple-500/5 text-purple-400' },
  { id: 'done', title: 'Bajarildi (Done)', color: 'border-t-emerald-500 bg-emerald-500/5 text-emerald-400' },
  { id: 'blocked', title: 'Bloklangan (Blocked)', color: 'border-t-rose-500 bg-rose-500/5 text-rose-400' },
];

export const TaskBoard: React.FC = () => {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [assignedFilter, setAssignedFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Selected Task detail slide-over
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [taskComments, setTaskComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Editing form inside detail panel
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
    fetchTasksAndTeam();
  }, [assignedFilter, priorityFilter]);

  const fetchTasksAndTeam = async () => {
    try {
      setLoading(true);
      
      // Get team members
      const teamRes = await fetch('/api/pm/members', { headers });
      if (teamRes.ok) setTeamMembers(await teamRes.json());

      // Get tasks
      let url = '/api/pm/tasks?1=1';
      if (assignedFilter) url += `&assigned_to=${assignedFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;

      const tasksRes = await fetch(url, { headers });
      if (tasksRes.ok) setTasks(await tasksRes.json());

    } catch (err) {
      toast.error("Vazifalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskComments = async (taskId: number) => {
    try {
      const res = await fetch(`/api/pm/comments/task/${taskId}`, { headers });
      if (res.ok) setTaskComments(await res.json());
    } catch(err) {
      console.error(err);
    }
  };

  // Open task details
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

  // Update task details
  const handleSaveTaskDetails = async (e: React.FormEvent) => {
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
        toast.success("Vazifa yangilandi!");
        setDetailOpen(false);
        setSelectedTask(null);
        fetchTasksAndTeam();
      } else {
        toast.error("Xatolik");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Quick switch status on the board (e.g. jarayonga o'tkazish)
  const handleMoveStatus = async (task: Task, newStatus: string) => {
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
        toast.success("Status o'zgartirildi");
        fetchTasksAndTeam();
      }
    } catch (err) {
      toast.error("Status yangilashda xatolik");
    }
  };

  // Post new comment for task
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

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/pm/comments/${commentId}`, { method: 'DELETE', headers });
      if (res.ok && selectedTask) {
        fetchTaskComments(selectedTask.id);
      }
    } catch(err) {
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
        fetchTasksAndTeam();
      }
    } catch(err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Find member initials & color
  const getMemberInitials = (memberId: number | null) => {
    if (!memberId) return null;
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return null;

    return {
      text: member.name.split(' ').map(n => n[0]).join(''),
      color: member.avatar_color,
      name: member.name
    };
  };

  // Priority color borders
  const getPriorityBorder = (p: string) => {
    switch (p) {
      case 'urgent': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-orange-500';
      case 'medium': return 'border-l-4 border-l-indigo-500';
      default: return 'border-l-4 border-l-slate-600';
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* Board Controls */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
            <Kanban size={20} className="text-pink-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Checklist & Vazifalar Kanban</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jarayondagi barcha SMM checklistlari, dizayn va video montaj vazifalari boshqaruvi</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
            }`}
          >
            <option value="">Barcha Xodimlar</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-850'
            }`}
          >
            <option value="">Barcha Prioritetlar</option>
            <option value="low">Low (Past)</option>
            <option value="medium">Medium (O'rta)</option>
            <option value="high">High (Yuqori)</option>
            <option value="urgent">Urgent (Shoshilinch)</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-3xl border border-t-4 p-4 min-h-[500px] flex flex-col ${col.color} ${
                isDark ? 'border-slate-850/60' : 'border-slate-200'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 shrink-0 px-1">
                <h3 className={`text-xs font-black tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  {col.title}
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-slate-950/60 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List inside column */}
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide max-h-[70vh]">
                {colTasks.map(task => {
                  const init = getMemberInitials(task.assigned_to);

                  return (
                    <motion.div
                      layoutId={`task-${task.id}`}
                      key={task.id}
                      onClick={() => handleOpenDetail(task)}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer relative hover:shadow-lg ${getPriorityBorder(task.priority)} ${
                        isDark 
                          ? 'bg-slate-950 border-slate-900 hover:border-slate-700 hover:bg-slate-950/70' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <h4 className={`text-xs font-bold line-clamp-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>

                      <div className="flex justify-between items-center mt-4 text-[9px] font-bold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{task.due_date || 'Muddat kiritilmagan'}</span>
                        </div>

                        {/* Avatar */}
                        {init ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                            style={{ backgroundColor: init.color }}
                            title={init.name}
                          >
                            {init.text}
                          </div>
                        ) : (
                          <User size={12} className="text-slate-600" />
                        )}
                      </div>

                      {/* Quick transition triggers */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== 'done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(task, 'done');
                            }}
                            className="p-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                            title="Bajarildi deb belgilash"
                          >
                            <Check size={10} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="text-center py-20 text-[10px] text-slate-500 opacity-60 font-semibold border border-dashed border-slate-800/40 rounded-3xl">
                    Vazifalar yo'q
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ─── DETAIL SLIDE-OVER / DETAILED KANBAN CARD DIALOG ───────────────── */}
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
                    <p className="text-xs text-slate-400">Vazifa kartasi va jamoaviy yozishmalar</p>
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

              {/* Form & Comments Content Area split */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* Left: Task attributes editing */}
                <form onSubmit={handleSaveTaskDetails} className="w-full md:w-1/2 p-6 border-r border-slate-800/40 overflow-y-auto space-y-4 scrollbar-thin">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Sarlavha (Nom)</label>
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
                    <label className="text-[10px] font-bold text-slate-400">Tavsif (Description)</label>
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
                      <label className="text-[10px] font-bold text-slate-400">Mas'ul xodim</label>
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
                      <label className="text-[10px] font-bold text-slate-400">Kanban Statusi</label>
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
                      <label className="text-[10px] font-bold text-slate-400">Muhimlik (Priority)</label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 font-semibold">Turi (Type)</label>
                      <select
                        value={editForm.task_type}
                        onChange={(e) => setEditForm({ ...editForm, task_type: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="general">Umumiy (General)</option>
                        <option value="shooting">Suratga olish (Shooting)</option>
                        <option value="editing">Montaj (Editing)</option>
                        <option value="design">Dizayn (Design)</option>
                        <option value="copywriting">Copywriting</option>
                        <option value="publishing">Nashr etish</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Mo'ljallangan soat (Estimate)</label>
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
                      O'zgarishlarni Saqlash
                    </button>
                  </div>
                </form>

                {/* Right: Comments and log history for task */}
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 shrink-0 flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    <span>Munozaralar (Izohlar)</span>
                  </h4>

                  {/* Comments Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin mb-4">
                    {taskComments.map(comment => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-2xl border relative group ${
                          isDark ? 'bg-slate-950/40 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-xs font-extrabold text-slate-350">{comment.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500">
                              {new Date(comment.created_at).toLocaleString('uz-UZ', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    ))}

                    {taskComments.length === 0 && (
                      <div className="text-center py-12 text-xs text-slate-500">
                        Hozircha izohlar yo'q. Birinchi izohni siz yozing!
                      </div>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Jamoa bilan muhokama qilish uchun izoh..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black shadow-md"
                    >
                      Yuborish
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

export default TaskBoard;
