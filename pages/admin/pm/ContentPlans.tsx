import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Layers, Send, Film, Trash2, Edit, CheckCircle,
  Clock, ArrowRight, BookOpen, AlertCircle, FileText, Settings,
  Sparkles, MessageSquare, ClipboardList, HelpCircle, UserPlus,
  ArrowUpRight, Info, Check, Trash
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  title: string;
  description: string;
  month: string;
  status: string;
  goals: string[];
  content_pillars: string[];
  platforms: string[];
  created_by: string;
  created_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
}

interface HashtagSet {
  id: number;
  name: string;
  hashtags: string;
  platform: string;
}

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
  hashtag_set_id: number | null;
  media_urls: string[];
  assigned_to: number[];
  cover_image: string;
  reference_urls: string[];
  performance_data: any;
}

interface Task {
  id: number;
  title: string;
  status: string;
  task_type: string;
  due_date: string;
  assigned_to: number | null;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

export const ContentPlans: React.FC = () => {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hashtagSets, setHashtagSets] = useState<HashtagSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals status
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeItemTab, setActiveItemTab] = useState<'details' | 'scenario' | 'script' | 'tasks' | 'comments'>('details');

  // Plan Form State
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    month: new Date().toISOString().substring(0, 7),
    status: 'draft',
    goalsStr: '',
    content_pillarsStr: 'Ta\'limiy, Motivatsion, BTS, Reklama, Interaktiv',
    platforms: ['instagram', 'telegram']
  });

  // Content Item Form State
  const [itemForm, setItemForm] = useState({
    title: '',
    content_type: 'reel',
    platform: 'instagram',
    pillar: 'Ta\'limiy',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '18:00',
    status: 'idea',
    priority: 'medium',
    caption: '',
    scenario: '',
    script: '',
    visual_notes: '',
    hashtag_set_id: '' as string | number,
    cover_image: '',
    reference_urlsStr: '',
    assigned_to: [] as number[]
  });

  // Comments & Tasks helpers for selected content item
  const [itemTasks, setItemTasks] = useState<Task[]>([]);
  const [itemComments, setItemComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newManualTask, setNewManualTask] = useState({ title: '', task_type: 'general', due_date: '', assigned_to: '' });

  // Get active Token
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const plansRes = await fetch('/api/pm/plans', { headers });
      const teamRes = await fetch('/api/pm/members', { headers });
      const tagRes = await fetch('/api/pm/hashtag-sets', { headers });

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
        if (plansData.length > 0 && !selectedPlanId) {
          setSelectedPlanId(plansData[0].id);
        }
      }
      if (teamRes.ok) setTeamMembers(await teamRes.json());
      if (tagRes.ok) setHashtagSets(await tagRes.json());
    } catch (err) {
      toast.error("Ma'lumot yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlanId) {
      fetchPlanDetails(selectedPlanId);
    }
  }, [selectedPlanId]);

  const fetchPlanDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/pm/plans/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSelectedPlanDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch comments & tasks for single item
  const fetchItemSubData = async (itemId: number) => {
    try {
      // Get Comments
      const commRes = await fetch(`/api/pm/comments/content_item/${itemId}`, { headers });
      if (commRes.ok) setItemComments(await commRes.json());

      // Get Tasks for this item
      const taskRes = await fetch(`/api/pm/tasks?content_item_id=${itemId}`, { headers });
      if (taskRes.ok) setItemTasks(await taskRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Create or Update Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title || !planForm.month) {
      toast.error("Nom va oylik muddat shart!");
      return;
    }

    const payload = {
      title: planForm.title,
      description: planForm.description,
      month: planForm.month,
      status: planForm.status,
      goals: planForm.goalsStr.split(',').map(g => g.trim()).filter(Boolean),
      content_pillars: planForm.content_pillarsStr.split(',').map(p => p.trim()).filter(Boolean),
      platforms: planForm.platforms
    };

    try {
      const method = editingPlan ? 'PUT' : 'POST';
      const url = editingPlan ? `/api/pm/plans/${editingPlan.id}` : '/api/pm/plans';
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingPlan ? "Kontent reja yangilandi" : "Yangi kontent reja yaratildi");
        setPlanModalOpen(false);
        setEditingPlan(null);
        fetchInitialData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  const handleEditPlanClick = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      title: plan.title,
      description: plan.description,
      month: plan.month,
      status: plan.status,
      goalsStr: (plan.goals || []).join(', '),
      content_pillarsStr: (plan.content_pillars || []).join(', '),
      platforms: plan.platforms || []
    });
    setPlanModalOpen(true);
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu kontent rejani o'chirmoqchisiz? Barcha unga biriktirilgan postlar va vazifalar ham o'chib ketadi!")) return;

    try {
      const res = await fetch(`/api/pm/plans/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast.success("Reja o'chirildi");
        setSelectedPlanId(null);
        setSelectedPlanDetails(null);
        fetchInitialData();
      } else {
        toast.error("O'chirishda xatolik");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Open item modal for creation/edit
  const handleOpenItemModal = (item: ContentItem | null) => {
    setSelectedItem(item);
    setActiveItemTab('details');
    if (item) {
      setItemForm({
        title: item.title,
        content_type: item.content_type,
        platform: item.platform,
        pillar: item.pillar,
        scheduled_date: item.scheduled_date,
        scheduled_time: item.scheduled_time,
        status: item.status,
        priority: item.priority,
        caption: item.caption,
        scenario: item.scenario,
        script: item.script,
        visual_notes: item.visual_notes,
        hashtag_set_id: item.hashtag_set_id || '',
        cover_image: item.cover_image,
        reference_urlsStr: (item.reference_urls || []).join(', '),
        assigned_to: item.assigned_to || []
      });
      fetchItemSubData(item.id);
    } else {
      setItemForm({
        title: '',
        content_type: 'reel',
        platform: 'instagram',
        pillar: 'Ta\'limiy',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '18:00',
        status: 'idea',
        priority: 'medium',
        caption: '',
        scenario: '',
        script: '',
        visual_notes: '',
        hashtag_set_id: '',
        cover_image: '',
        reference_urlsStr: '',
        assigned_to: []
      });
      setItemTasks([]);
      setItemComments([]);
    }
    setContentModalOpen(true);
  };

  // Save Content Item
  const handleSaveContentItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title || !itemForm.scheduled_date) {
      toast.error("Sarlavha va muddat kiritilishi majburiy!");
      return;
    }

    const payload = {
      plan_id: selectedPlanId,
      title: itemForm.title,
      content_type: itemForm.content_type,
      platform: itemForm.platform,
      pillar: itemForm.pillar,
      scheduled_date: itemForm.scheduled_date,
      scheduled_time: itemForm.scheduled_time,
      status: itemForm.status,
      priority: itemForm.priority,
      caption: itemForm.caption,
      scenario: itemForm.scenario,
      script: itemForm.script,
      visual_notes: itemForm.visual_notes,
      hashtag_set_id: itemForm.hashtag_set_id ? Number(itemForm.hashtag_set_id) : null,
      cover_image: itemForm.cover_image,
      reference_urls: itemForm.reference_urlsStr.split(',').map(r => r.trim()).filter(Boolean),
      assigned_to: itemForm.assigned_to
    };

    try {
      const method = selectedItem ? 'PUT' : 'POST';
      const url = selectedItem ? `/api/pm/content-items/${selectedItem.id}` : '/api/pm/content-items';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(selectedItem ? "Kontent tahrirlandi" : "Yangi kontent qo'shildi");
        setContentModalOpen(false);
        setSelectedItem(null);
        if (selectedPlanId) fetchPlanDetails(selectedPlanId);
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Delete Content Item
  const handleDeleteContentItem = async (itemId: number) => {
    if (!confirm("Kontent elementini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/pm/content-items/${itemId}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast.success("O'chirildi");
        setContentModalOpen(false);
        setSelectedItem(null);
        if (selectedPlanId) fetchPlanDetails(selectedPlanId);
      } else {
        toast.error("Xatolik");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Auto Generate Tasks
  const handleAutoGenerateTasks = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/pm/content-items/${selectedItem.id}/generate-tasks`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        toast.success("Avtomatik checklist yaratildi!");
        fetchItemSubData(selectedItem.id);
      } else {
        toast.error("Generatsiyada xatolik");
      }
    } catch (err) {
      toast.error("Xatolik");
    }
  };

  // Add manual task
  const handleAddManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualTask.title) {
      toast.error("Vazifa nomi shart");
      return;
    }
    if (!selectedItem) return;

    const payload = {
      content_item_id: selectedItem.id,
      plan_id: selectedPlanId,
      title: newManualTask.title,
      task_type: newManualTask.task_type,
      priority: 'medium',
      due_date: newManualTask.due_date || selectedItem.scheduled_date,
      assigned_to: newManualTask.assigned_to ? Number(newManualTask.assigned_to) : null,
      status: 'todo'
    };

    try {
      const res = await fetch('/api/pm/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Vazifa biriktirildi");
        setNewManualTask({ title: '', task_type: 'general', due_date: '', assigned_to: '' });
        fetchItemSubData(selectedItem.id);
      } else {
        toast.error("Xatolik");
      }
    } catch (err) {
      toast.error("Tarmoq xatosi");
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedItem) return;

    const payload = {
      target_type: 'content_item',
      target_id: selectedItem.id,
      content: newCommentText.trim()
    };

    try {
      const res = await fetch('/api/pm/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewCommentText('');
        fetchItemSubData(selectedItem.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/pm/comments/${commentId}`, { method: 'DELETE', headers });
      if (res.ok && selectedItem) {
        fetchItemSubData(selectedItem.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle assigned team member in state form
  const toggleAssignedMember = (memberId: number) => {
    const list = [...itemForm.assigned_to];
    const idx = list.indexOf(memberId);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(memberId);
    }
    setItemForm({ ...itemForm, assigned_to: list });
  };

  // Helpers for badge styling
  const getPillarBadge = (pillar: string) => {
    switch (pillar.toLowerCase()) {
      case 'ta\'limiy':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'motivatsion':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'bts':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'reklama':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
      case 'planned': return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'review': return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
      case 'approved': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
      case 'published': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';
      default: return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* Strategic Plan Header & Select Dropdown */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-pink-500/25' : 'bg-pink-100'}`}>
            <BookOpen size={20} className="text-pink-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Kontent Rejalashtirish</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Haftalik & Oylik marketing maqsadlari va rejalari</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Plan Selector */}
          <select
            value={selectedPlanId || ''}
            onChange={(e) => setSelectedPlanId(Number(e.target.value))}
            className={`px-4 py-2.5 rounded-xl border text-sm font-bold ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="" disabled>Rejani tanlang</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.month})</option>
            ))}
          </select>

          {/* Edit Current Plan Button */}
          {selectedPlanDetails && (
            <button
              onClick={() => handleEditPlanClick(selectedPlanDetails)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Rejani tahrirlash"
            >
              <Edit size={16} />
            </button>
          )}

          {/* Delete Plan Button */}
          {selectedPlanDetails && (
            <button
              onClick={() => handleDeletePlan(selectedPlanDetails.id)}
              className={`p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all`}
              title="Rejani o'chirish"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* New Plan Button */}
          <button
            onClick={() => {
              setEditingPlan(null);
              setPlanForm({
                title: '',
                description: '',
                month: new Date().toISOString().substring(0, 7),
                status: 'draft',
                goalsStr: '',
                content_pillarsStr: 'Ta\'limiy, Motivatsion, BTS, Reklama, Interaktiv',
                platforms: ['instagram', 'telegram']
              });
              setPlanModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} /> Yangi Reja
          </button>
        </div>
      </div>

      {selectedPlanDetails ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Left panel: Strategy summary of selected plan */}
          <div className="xl:col-span-1 space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg} space-y-5`}>
              <div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black uppercase ${
                  selectedPlanDetails.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {selectedPlanDetails.status}
                </span>
                <h3 className={`text-xl font-black mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedPlanDetails.title}
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedPlanDetails.description || 'Strategik ta\'rif yozilmagan'}
                </p>
              </div>

              {/* Content Pillars */}
              <div className="space-y-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Ruknlar (Content Pillars)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedPlanDetails.content_pillars || []).map((pillar: string, i: number) => (
                    <span key={i} className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${getPillarBadge(pillar)}`}>
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Platforms */}
              <div className="space-y-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Platformalar
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedPlanDetails.platforms || []).map((plat: string, i: number) => (
                    <span key={i} className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold capitalize ${
                      plat === 'instagram' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {plat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Objectives / Goals */}
              <div className="space-y-3.5 pt-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  KPI Maqsadlar
                </h4>
                <ul className="space-y-2 text-xs font-semibold">
                  {(selectedPlanDetails.goals || []).map((goal: string, i: number) => (
                    <li key={i} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                  {(!selectedPlanDetails.goals || selectedPlanDetails.goals.length === 0) && (
                    <li className="text-slate-500">Maqsadlar belgilanmagan</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Right panel: Content list & posts grid */}
          <div className="xl:col-span-3 space-y-6">
            <div className={`p-6 rounded-3xl border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Jami Kontentlar ({selectedPlanDetails.content_items?.length || 0})
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Rejadagi barcha nashrlar, ssenariylar va vazifalar holati
                  </p>
                </div>

                <button
                  onClick={() => handleOpenItemModal(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Plus size={14} /> Kontent Qo'shish
                </button>
              </div>

              {selectedPlanDetails.content_items?.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-700 rounded-3xl">
                  <Film size={48} className="mx-auto text-slate-500 opacity-40 mb-3" />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Hozircha kontentlar kiritilmagan.
                  </p>
                  <button
                    onClick={() => handleOpenItemModal(null)}
                    className="mt-4 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs rounded-xl border border-indigo-500/20"
                  >
                    Birinchi Kontentni Qo'shish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPlanDetails.content_items.map((item: ContentItem) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenItemModal(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                        isDark 
                          ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-slate-700' 
                          : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border font-black ${
                            item.platform === 'instagram' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {item.platform}
                          </span>
                          <span className="ml-1.5 text-[9px] font-black uppercase text-slate-500">
                            {item.content_type}
                          </span>
                          <h4 className={`text-sm font-bold mt-1 line-clamp-1 group-hover:text-indigo-400 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-950'
                          }`}>
                            {item.title}
                          </h4>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getStatusBadge(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className={`text-xs line-clamp-2 mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.caption || item.visual_notes || 'Tavsif va matn mavjud emas'}
                      </p>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{item.scheduled_date} &bull; {item.scheduled_time}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border uppercase text-[9px] ${
                          item.priority === 'high' || item.priority === 'urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-800 text-slate-400 border-transparent'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-slate-500 opacity-40 mb-3" />
          <p className="text-sm text-slate-500">Iltimos, ishni boshlash uchun kontent reja tanlang yoki yangisini qo'shing.</p>
        </div>
      )}

      {/* ─── MODAL: NEW / EDIT PLAN ───────────────────────────────────────── */}
      <AnimatePresence>
        {planModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlanModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-3xl border ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              } p-6 shadow-2xl z-10 overflow-hidden relative`}
            >
              <h3 className="text-lg font-black mb-4">
                {editingPlan ? 'Kontent Rejani Tahrirlash' : 'Yangi Kontent Reja Yaratish'}
              </h3>

              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Reja Nomi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Iyun 2026 Oylik Rejasi"
                    value={planForm.title}
                    onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-1 focus:ring-pink-500 outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Rejalashtirilayotgan Oy</label>
                    <input
                      type="month"
                      value={planForm.month}
                      onChange={(e) => setPlanForm({ ...planForm, month: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Status</label>
                    <select
                      value={planForm.status}
                      onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                      }`}
                    >
                      <option value="draft">Draft (Qoralama)</option>
                      <option value="active">Faol (Active)</option>
                      <option value="completed">Yakunlangan (Completed)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Tavsif (Description)</label>
                  <textarea
                    rows={2}
                    placeholder="Plan maqsadlari va g'oyalari haqida umumiy tavsif..."
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border text-sm outline-none resize-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Content Pillars (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="Masalan: Ta'limiy, Reklama, BTS, Shaxsiy"
                    value={planForm.content_pillarsStr}
                    onChange={(e) => setPlanForm({ ...planForm, content_pillarsStr: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">KPI Maqsadlar (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="Masalan: 10K yangi obunachi, 5% faollik darajasi"
                    value={planForm.goalsStr}
                    onChange={(e) => setPlanForm({ ...planForm, goalsStr: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPlanModalOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/20"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CONTENT ITEM WORKBENCH (RICH SCENARIO / SCRIPTS / AUTO CHECKS) ───────────────────────── */}
      <AnimatePresence>
        {contentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContentModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className={`w-full max-w-5xl h-[85vh] rounded-3xl border flex flex-col ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              } shadow-2xl z-10 overflow-hidden relative`}
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                    <Film size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">
                      {selectedItem ? 'Kontent Laboratoriyasi & Tahrirlash' : 'Yangi Kontent Qo\'shish'}
                    </h3>
                    <p className="text-xs text-slate-400">Post ssenariylari, checklistlari va jamoaviy muhokama</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem && (
                    <button
                      onClick={() => handleDeleteContentItem(selectedItem.id)}
                      className="px-3.5 py-2 border border-red-500/25 bg-red-500/5 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                    >
                      O'chirish
                    </button>
                  )}
                  <button
                    onClick={() => setContentModalOpen(false)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Yopish
                  </button>
                </div>
              </div>

              {/* Workbench Tabs */}
              {selectedItem && (
                <div className="flex gap-1 border-b border-slate-800/50 bg-slate-950/20 p-2 shrink-0 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'details', icon: Info, label: 'Asosiy Sozlamalar' },
                    { id: 'scenario', icon: Sparkles, label: 'Visual Ssenariy' },
                    { id: 'script', icon: FileText, label: 'Matn (Script)' },
                    { id: 'tasks', icon: ClipboardList, label: 'SMM Checklist' },
                    { id: 'comments', icon: MessageSquare, label: 'Muhokamalar' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveItemTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeItemTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <tab.icon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Content Panels */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                
                {/* TAB 1: DETAILS */}
                {activeItemTab === 'details' && (
                  <form onSubmit={handleSaveContentItem} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: General configuration */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400">Post/Nashr Sarlavhasi</label>
                          <input
                            type="text"
                            placeholder="Reels yoki post sarlavhasi..."
                            value={itemForm.title}
                            onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 font-semibold">Turi (Format)</label>
                            <select
                              value={itemForm.content_type}
                              onChange={(e) => setItemForm({ ...itemForm, content_type: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            >
                              <option value="reel">Instagram Reel</option>
                              <option value="post">Rasm Post</option>
                              <option value="story">Story</option>
                              <option value="carousel">Carousel (Karusel)</option>
                              <option value="video">YouTube Video</option>
                              <option value="article">Maqola</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Platforma</label>
                            <select
                              value={itemForm.platform}
                              onChange={(e) => setItemForm({ ...itemForm, platform: e.target.value })}
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
                            <label className="text-xs font-bold text-slate-400">Sana (Sheduling)</label>
                            <input
                              type="date"
                              value={itemForm.scheduled_date}
                              onChange={(e) => setItemForm({ ...itemForm, scheduled_date: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Vaqt (Time)</label>
                            <input
                              type="time"
                              value={itemForm.scheduled_time}
                              onChange={(e) => setItemForm({ ...itemForm, scheduled_time: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Rukn (Pillar)</label>
                            <select
                              value={itemForm.pillar}
                              onChange={(e) => setItemForm({ ...itemForm, pillar: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            >
                              {(selectedPlanDetails?.content_pillars || ['Ta\'limiy', 'Motivatsion', 'BTS', 'Reklama']).map((p: string) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Prioritet</label>
                            <select
                              value={itemForm.priority}
                              onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            >
                              <option value="low">Low (Past)</option>
                              <option value="medium">Medium (O'rta)</option>
                              <option value="high">High (Yuqori)</option>
                              <option value="urgent">Urgent (Shoshilinch!)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Status</label>
                            <select
                              value={itemForm.status}
                              onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            >
                              <option value="idea">Idea (G'oya)</option>
                              <option value="planned">Planned (Rejalashtirilgan)</option>
                              <option value="in_progress">In Progress (Jarayonda)</option>
                              <option value="review">Review (Tekshiruvda)</option>
                              <option value="approved">Approved (Tasdiqlangan)</option>
                              <option value="published">Published (E'lon qilingan)</option>
                              <option value="rejected">Rejected (Rad etilgan)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">Hashtag Sets</label>
                            <select
                              value={itemForm.hashtag_set_id}
                              onChange={(e) => setItemForm({ ...itemForm, hashtag_set_id: e.target.value })}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                              }`}
                            >
                              <option value="">Hashtagsiz</option>
                              {hashtagSets.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Right: Team assignment & details */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400">Cover Rasm URL (Muqova)</label>
                          <input
                            type="text"
                            placeholder="Rasm havolasi..."
                            value={itemForm.cover_image}
                            onChange={(e) => setItemForm({ ...itemForm, cover_image: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                            }`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400">Referans Havolalar (Vergul bilan ajratilgan)</label>
                          <input
                            type="text"
                            placeholder="TikTok, Behance, Pinterest, YouTube referanslar..."
                            value={itemForm.reference_urlsStr}
                            onChange={(e) => setItemForm({ ...itemForm, reference_urlsStr: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                            }`}
                          />
                        </div>

                        {/* Multi assignment jamoa a'zolari */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 block">Jamoa A'zolarini Biriktirish</label>
                          <div className={`p-3 rounded-2xl border max-h-[160px] overflow-y-auto space-y-1.5 ${
                            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            {teamMembers.map((member) => {
                              const isChecked = itemForm.assigned_to.includes(member.id);
                              return (
                                <div
                                  key={member.id}
                                  onClick={() => toggleAssignedMember(member.id)}
                                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                                      : 'border border-transparent hover:bg-slate-800/40 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                      style={{ backgroundColor: member.avatar_color }}
                                    >
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span>{member.name} ({member.role})</span>
                                  </div>
                                  {isChecked && <Check size={14} className="text-indigo-400 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20"
                      >
                        {selectedItem ? 'O\'zgarishlarni Saqlash' : 'Kontent Qo\'shish'}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: RICH VISUAL SCENARIOGRAPHY */}
                {activeItemTab === 'scenario' && selectedItem && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-500">
                      <Info size={16} className="shrink-0" />
                      <p className="text-xs font-bold">
                        Visual scenariography video roliklaringiz uchun sahna-by-sahna (storyboard) vizual directives va fonlarni qamrab oladi.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Scenariography & Storyboard rejasi</label>
                        <textarea
                          rows={10}
                          placeholder="Masalan:&#10;Sahna 1: Norbek kameraga qarab gapiradi, orqa fonda neon yorug'liklar.&#10;Sahna 2: Ekran orqali dasturlash kodi yozilishi ko'rinadi (zoomed).&#10;Sahna 3: Yakuniy call-to-action (CTA)..."
                          value={itemForm.scenario}
                          onChange={(e) => setItemForm({ ...itemForm, scenario: e.target.value })}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none font-medium leading-relaxed ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Visual Notes & Texnik topshiriqlar (Kadr, fon, audio talablar)</label>
                        <input
                          type="text"
                          placeholder="Masalan: 4K 60FPS video format, font Inter, fon musiqasi: Lofi hip-hop beats..."
                          value={itemForm.visual_notes}
                          onChange={(e) => setItemForm({ ...itemForm, visual_notes: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveContentItem}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                        >
                          Ssenariyni Saqlash
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: RICH SCRIPT EDITOR */}
                {activeItemTab === 'script' && selectedItem && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-500">
                      <Info size={16} className="shrink-0" />
                      <p className="text-xs font-bold">
                        Script bo'limida rolikda o'qiladigan to'liq matn (speech script) va post tagida chiqadigan asosiy description caption yoziladi.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Rolik uchun Speech Script (Matn)</label>
                        <textarea
                          rows={6}
                          placeholder="Spiker gapiradigan to'liq so'zma-so'z matn..."
                          value={itemForm.script}
                          onChange={(e) => setItemForm({ ...itemForm, script: e.target.value })}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none font-medium leading-relaxed ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Post Caption (Ijtimoiy tarmoqdagi izoh matni)</label>
                        <textarea
                          rows={5}
                          placeholder="Post tagida nashr qilinadigan jozibali matn (SMM copy)..."
                          value={itemForm.caption}
                          onChange={(e) => setItemForm({ ...itemForm, caption: e.target.value })}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none font-medium leading-relaxed ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveContentItem}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                        >
                          Scriptni Saqlash
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: AUTOMATED SMM TASK GENERATION */}
                {activeItemTab === 'tasks' && selectedItem && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-3xl border border-pink-500/20 bg-pink-500/5 text-pink-500">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black">Intellektual Checklist Generatsiyasi</h4>
                          <p className="text-xs opacity-85 mt-0.5">
                            Kontent turiga qarab (Reel, Post, Story, Video) tizim avtomatik ravishda tayyorgarlik vazifalarini yaratib beradi.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleAutoGenerateTasks}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black shadow-md shadow-pink-500/20 transition-all shrink-0"
                      >
                        Avtomatik Ishlarni Bo'lish
                      </button>
                    </div>

                    {/* Manual Task Add */}
                    <form onSubmit={handleAddManualTask} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Qo'lda vazifa biriktirish</label>
                        <input
                          type="text"
                          placeholder="Vazifa sarlavhasi..."
                          value={newManualTask.title}
                          onChange={(e) => setNewManualTask({ ...newManualTask, title: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Mas'ul xodim</label>
                        <select
                          value={newManualTask.assigned_to}
                          onChange={(e) => setNewManualTask({ ...newManualTask, assigned_to: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                          }`}
                        >
                          <option value="">Belgilanmagan</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all h-9"
                      >
                        Topshiriq biriktirish
                      </button>
                    </form>

                    {/* Item checklist items list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-slate-400">Checklist tarkibi</h4>
                      
                      {itemTasks.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
                          Checklist bo'sh. Yuqoridagi "Avtomatik Ishlarni Bo'lish" tugmasini bosing.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {itemTasks.map(task => (
                            <div key={task.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                              task.status === 'done' 
                                ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400 line-through' 
                                : isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-800'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} />
                                <span>{task.title}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {task.task_type}
                                </span>
                                {task.assigned_to && (
                                  <span className="text-[10px] text-indigo-400">
                                    &bull; {teamMembers.find(m => m.id === task.assigned_to)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 5: COMMENTS SECTION */}
                {activeItemTab === 'comments' && selectedItem && (
                  <div className="space-y-6">
                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ushbu kontent bo'yicha fikringizni bildiring (izoh)..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className={`flex-1 px-4 py-3 rounded-2xl border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-md shrink-0"
                      >
                        Yuborish
                      </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {itemComments.map(comment => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-2xl border relative group ${
                            isDark ? 'bg-slate-950/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-xs font-black text-slate-200">{comment.author}</span>
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
                                title="O'chirish"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-medium leading-relaxed">{comment.content}</p>
                        </div>
                      ))}

                      {itemComments.length === 0 && (
                        <div className="text-center py-10 text-slate-500 text-xs">
                          Hali muhokamalar mavjud emas. Birinchi fikrni siz qoldiring!
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContentPlans;
