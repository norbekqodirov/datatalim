import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../store/ThemeContext';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Clock, MapPin, Users, Filter, Search, Trash2, X, Save, 
  RefreshCw, School, Check, Edit, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ScheduleEvent {
  id: number;
  group_id: number;
  room_id: number | null;
  teacher_id: number | null;
  day_of_week: string; // "1", "2", etc.
  start_time: string;
  end_time: string;
  group_name?: string;
  room_name?: string;
  teacher_name?: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
}

interface Teacher {
  id: number;
  name: string;
  specialty: string;
}

interface Group {
  id: number;
  name: string;
  teacher?: string;
  room?: string;
}

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 dan 20:00 gacha

const COLORS = ['blue', 'purple', 'emerald', 'pink', 'amber', 'cyan'];

const COLOR_MAP: Record<string, { bg: string, text: string, border: string, darkBg: string, indicator: string }> = {
  blue: { bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'bg-blue-950/40 border-blue-500/30 text-blue-300 hover:bg-blue-950/60', indicator: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', darkBg: 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-950/60', indicator: 'bg-purple-500' },
  emerald: { bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60', indicator: 'bg-emerald-500' },
  pink: { bg: 'bg-pink-50 border-pink-200 hover:bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', darkBg: 'bg-pink-950/40 border-pink-500/30 text-pink-300 hover:bg-pink-950/60', indicator: 'bg-pink-500' },
  amber: { bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/60', indicator: 'bg-amber-500' },
  cyan: { bg: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', darkBg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60', indicator: 'bg-cyan-500' },
};

export default function Schedule() {
  const { isDark } = useTheme();
  
  // Navigation & View states
  const [activeTab, setActiveTab] = useState<'calendar' | 'rooms'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Data States
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // Form States for Yangi Dars
  const [formGroup, setFormGroup] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formDay, setFormDay] = useState('1'); // "1" = Dushanba
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:30');
  const [savingSlot, setSavingSlot] = useState(false);

  // Form States for Rooms (Classrooms) CRUD
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState<number>(15);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [savingRoom, setSavingRoom] = useState(false);

  const token = () => localStorage.getItem('adminToken');

  // Fetch all databases
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      
      const [resSchedule, resRooms, resTeachers, resGroups] = await Promise.all([
        fetch('/api/schedule', { headers }),
        fetch('/api/rooms', { headers }),
        fetch('/api/teachers', { headers }),
        fetch('/api/groups', { headers })
      ]);

      if (resSchedule.ok) setEvents(await resSchedule.json());
      if (resRooms.ok) setRooms(await resRooms.json());
      if (resTeachers.ok) setTeachers(await resTeachers.json());
      if (resGroups.ok) setGroups(await resGroups.json());

    } catch (err) {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Time conversion helper
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Add dars slot
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGroup) return toast.error('Guruhni tanlang');
    if (!formRoom) return toast.error('Xonani tanlang');
    if (!formTeacher) return toast.error('Ustozni tanlang');

    const startMin = timeToMinutes(formStart);
    const endMin = timeToMinutes(formEnd);
    if (startMin >= endMin) {
      return toast.error("Dars boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak");
    }

    setSavingSlot(true);
    try {
      const r = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          group_id: Number(formGroup),
          room_id: Number(formRoom),
          teacher_id: Number(formTeacher),
          day_of_week: formDay,
          start_time: formStart,
          end_time: formEnd
        })
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.error || 'Dars jadvalini qo\'shishda xatolik');
      }

      toast.success('Dars jadvali muvaffaqiyatli saqlandi!');
      setShowAddModal(false);
      
      // Reset form
      setFormGroup('');
      setFormRoom('');
      setFormTeacher('');
      setFormDay('1');
      setFormStart('09:00');
      setFormEnd('10:30');

      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSavingSlot(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu dars soatini jadvaldan o'chirmoqchimisiz?")) return;
    
    try {
      const r = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });

      if (!r.ok) throw new Error("O'chirishda xatolik yuz berdi");

      toast.success("Dars soati o'chirildi");
      setShowDetailModal(false);
      setSelectedEvent(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Room CRUD: Add/Edit
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error('Xona nomini kiriting');

    setSavingRoom(true);
    try {
      const url = editingRoomId ? `/api/rooms/${editingRoomId}` : '/api/rooms';
      const method = editingRoomId ? 'PUT' : 'POST';

      const r = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          name: roomName.trim(),
          capacity: Number(roomCapacity)
        })
      });

      if (!r.ok) throw new Error("Xonani saqlashda xatolik yuz berdi");

      toast.success(editingRoomId ? "Xona yangilandi" : "Yangi xona qo'shildi");
      setRoomName('');
      setRoomCapacity(15);
      setEditingRoomId(null);
      
      const updatedRooms = await (await fetch('/api/rooms', { headers: { Authorization: `Bearer ${token()}` } })).json();
      setRooms(updatedRooms);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingRoom(false);
    }
  };

  // Room CRUD: Edit load
  const handleEditRoomLoad = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setRoomCapacity(room.capacity);
  };

  // Room CRUD: Delete
  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Ushbu xonani o'chirasizmi? U bilan bog'liq darslar ham bekor bo'lishi mumkin.")) return;

    try {
      const r = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });

      if (!r.ok) throw new Error("Xonani o'chirishda xatolik");

      toast.success("Xona o'chirildi");
      setRooms(prev => prev.filter(rm => rm.id !== id));
      fetchData(); // reload schedule just in case
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filtered Events logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filter by room
      if (filterRoom !== 'all' && event.room_id !== Number(filterRoom)) return false;
      // Filter by teacher
      if (filterTeacher !== 'all' && event.teacher_id !== Number(filterTeacher)) return false;
      // Filter by group
      if (filterGroup !== 'all' && event.group_id !== Number(filterGroup)) return false;
      
      // Filter by text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const groupName = event.group_name?.toLowerCase() || '';
        const teacherName = event.teacher_name?.toLowerCase() || '';
        const roomName = event.room_name?.toLowerCase() || '';
        if (!groupName.includes(query) && !teacherName.includes(query) && !roomName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [events, filterRoom, filterTeacher, filterGroup, searchQuery]);

  // Design styles
  const cardStyle = `rounded-3xl border transition-all ${isDark ? 'bg-slate-900/60 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;
  const inputStyle = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`;
  const labelStyle = `block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  // Automatically select default teacher when group changes in form
  const handleGroupChange = (gid: string) => {
    setFormGroup(gid);
    const selected = groups.find(g => g.id === Number(gid));
    if (selected && selected.teacher) {
      // Try to find teacher in teachers list by name
      const teacherObj = teachers.find(t => t.name.toLowerCase() === selected.teacher?.toLowerCase());
      if (teacherObj) {
        setFormTeacher(teacherObj.id.toString());
      }
    }
    if (selected && selected.room) {
      const roomObj = rooms.find(r => r.name.toLowerCase() === selected.room?.toLowerCase());
      if (roomObj) {
        setFormRoom(roomObj.id.toString());
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Top Banner Control */}
      <div className={`p-4 sm:p-5 ${cardStyle} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <CalendarIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Dars Jadvali va Xonalar</h1>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xonalar bandligi va dars taqsimotini real vaqtda boshqarish</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Main Tab Toggle */}
          <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <CalendarIcon size={16} /> Kalendar
            </button>
            <button 
              onClick={() => setActiveTab('rooms')} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'rooms' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <School size={16} /> Xonalar Boshqaruvi
            </button>
          </div>

          {activeTab === 'calendar' && (
            <>
              {/* Search input */}
              <div className={`relative hidden sm:block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Qidiruv (Guruh, o'qituvchi)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-4 py-2 w-52 text-xs rounded-xl border outline-none focus:w-64 transition-all ${isDark ? 'bg-slate-950 border-white/10 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
                />
              </div>

              {/* Filter toggle */}
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)} 
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
                  showFilterPanel || filterRoom !== 'all' || filterTeacher !== 'all' || filterGroup !== 'all'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500' 
                  : isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={15} /> <span>Filtrlar</span>
              </button>

              <button 
                onClick={() => setShowAddModal(true)} 
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus size={18} /> Yangi Dars
              </button>
            </>
          )}

          <button 
            onClick={fetchData} 
            className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* FILTER PANEL - Dropdown transition */}
      <AnimatePresence>
        {activeTab === 'calendar' && showFilterPanel && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 ${cardStyle} grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm`}
          >
            <div>
              <label className={labelStyle}>Xona bo'yicha</label>
              <select 
                value={filterRoom} 
                onChange={e => setFilterRoom(e.target.value)} 
                className={inputStyle}
              >
                <option value="all">Barcha xonalar</option>
                {rooms.map(rm => (
                  <option key={rm.id} value={rm.id}>{rm.name} (Sig'im: {rm.capacity})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelStyle}>Ustoz bo'yicha</label>
              <select 
                value={filterTeacher} 
                onChange={e => setFilterTeacher(e.target.value)} 
                className={inputStyle}
              >
                <option value="all">Barcha o'qituvchilar</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelStyle}>Guruh bo'yicha</label>
              <select 
                value={filterGroup} 
                onChange={e => setFilterGroup(e.target.value)} 
                className={inputStyle}
              >
                <option value="all">Barcha guruhlar</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ma'lumotlar bazasi yuklanmoqda...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* TAB 1: CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className={`flex-1 rounded-3xl border flex flex-col overflow-hidden shadow-sm ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-200'}`}>
              
              {/* Calendar Days Legend/Timeline */}
              <div className="flex-1 overflow-auto scrollbar-thin relative flex">
                
                {/* Time Axis Column */}
                <div className={`w-20 flex-shrink-0 border-r sticky left-0 z-20 ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className={`h-14 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div> {/* Empty top corner */}
                  {HOURS.map(hour => (
                    <div key={hour} className={`h-24 border-b relative ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Days Grid Column */}
                <div className="flex-1 min-w-[900px]">
                  {/* Days Legend Headers */}
                  <div className={`flex sticky top-0 z-10 border-b backdrop-blur-xl ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                    {DAYS.map((day, i) => {
                      const todayIndex = new Date().getDay(); // 0=Sunday, 1=Monday
                      const isToday = todayIndex === (i === 6 ? 0 : i + 1);
                      return (
                        <div key={day} className={`flex-1 min-w-[120px] h-14 flex flex-col items-center justify-center border-r last:border-r-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-500 font-extrabold' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${isToday ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Kun {i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid Timetable Slots */}
                  <div className="flex relative">
                    {DAYS.map((day, dayIndex) => {
                      const dayValStr = (dayIndex + 1).toString();
                      const dayEvents = filteredEvents.filter(e => e.day_of_week === dayValStr);

                      return (
                        <div key={day} className={`flex-1 min-w-[120px] border-r last:border-r-0 relative ${isDark ? 'border-white/5 bg-slate-900/5' : 'border-slate-100'}`}>
                          {/* Hour lines */}
                          {HOURS.map(hour => (
                            <div key={hour} className={`h-24 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}></div>
                          ))}

                          {/* Database dars blocks */}
                          {dayEvents.map((event, idx) => {
                            const startMin = timeToMinutes(event.start_time);
                            const endMin = timeToMinutes(event.end_time);
                            const gridStartMin = 8 * 60; // Grid starts at 08:00
                            
                            // 96px is height of 1 hour (h-24)
                            const topOffset = ((startMin - gridStartMin) / 60) * 96;
                            const height = ((endMin - startMin) / 60) * 96;
                            
                            // Select dynamic stable color based on group_id
                            const colorIndex = event.group_id % COLORS.length;
                            const c = COLOR_MAP[COLORS[colorIndex]] || COLOR_MAP.blue;

                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02, zIndex: 10 }}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowDetailModal(true);
                                }}
                                className={`absolute left-1 right-1 rounded-xl p-2 border cursor-pointer overflow-hidden transition-all shadow-sm ${
                                  isDark ? c.darkBg : c.bg
                                }`}
                                style={{ top: `${topOffset}px`, height: `${height}px` }}
                              >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.indicator}`} />
                                <div className="pl-1.5 flex flex-col h-full justify-between">
                                  <div>
                                    <h4 className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                      {event.group_name}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-0.5 text-[9px] font-bold opacity-80">
                                      <Clock size={9} />
                                      <span>{event.start_time} - {event.end_time}</span>
                                    </div>
                                  </div>

                                  <div className="text-[9px] font-bold space-y-0.5 opacity-70 truncate">
                                    <div className="flex items-center gap-1">
                                      <Users size={8} />
                                      <span className="truncate">{event.teacher_name || 'Noma\'lum'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin size={8} />
                                      <span className="truncate">{event.room_name || 'Xonasiz'}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ROOMS/CLASSROOMS CRUD PANEL */}
          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-auto">
              
              {/* Form: Add/Edit Room */}
              <div className={`${cardStyle} p-5 self-start`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <School className="text-blue-500" />
                  {editingRoomId ? "Xonani Tahrirlash" : "Yangi Xona Qo'shish"}
                </h3>
                
                <form onSubmit={handleSaveRoom} className="space-y-4">
                  <div>
                    <label className={labelStyle}>Xona Nomi</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Xona 1 (IT), English Room..."
                      value={roomName}
                      onChange={e => setRoomName(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>O'quvchilar Sig'imi (O'rindiqlar)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      placeholder="Masalan: 15, 20"
                      value={roomCapacity}
                      onChange={e => setRoomCapacity(Number(e.target.value))}
                      className={inputStyle}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingRoomId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoomId(null);
                          setRoomName('');
                          setRoomCapacity(15);
                        }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-colors ${
                          isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Bekor qilish
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingRoom}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {savingRoom ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {editingRoomId ? "Yangilash" : "Xonani Saqlash"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Classrooms Grid List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className={`text-md font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Mavjud O'quv Xonalari ({rooms.length})</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.length === 0 ? (
                    <div className={`col-span-2 text-center py-12 ${cardStyle} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <School size={40} className="mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-xs">Birorta ham xona kiritilmagan.</p>
                    </div>
                  ) : (
                    rooms.map(room => {
                      // Calculate active schedules in this room
                      const roomSlots = events.filter(e => e.room_id === room.id);
                      return (
                        <div key={room.id} className={`${cardStyle} p-4 flex flex-col justify-between hover:border-blue-500/40`}>
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{room.name}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                Sig'imi: {room.capacity} ta o'quvchi
                              </span>
                            </div>
                            <p className={`text-[10px] font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Haftalik bandlik: <span className="text-blue-500 font-extrabold">{roomSlots.length} ta dars soati</span>
                            </p>
                          </div>

                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                            <button
                              onClick={() => handleEditRoomLoad(room)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDark ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* MODAL 1: YANGI DARS QO'SHISH (ADD SCHEDULE SLOT) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md p-6 overflow-hidden ${cardStyle} shadow-2xl z-10 max-h-[90vh] overflow-y-auto`}
            >
              <button 
                onClick={() => setShowAddModal(false)} 
                className={`absolute right-4 top-4 p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>

              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dars Jadvaliga Qo'shish</h3>
              
              <form onSubmit={handleSaveSlot} className="space-y-4">
                <div>
                  <label className={labelStyle}>O'quv Guruhi</label>
                  <select
                    required
                    value={formGroup}
                    onChange={e => handleGroupChange(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.teacher || 'Ustozsiz'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>O'quv Xonasi</label>
                  <select
                    required
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">Xonani tanlang...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Sig'im: {r.capacity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>O'qituvchi / Ustoz</label>
                  <select
                    required
                    value={formTeacher}
                    onChange={e => setFormTeacher(e.target.value)}
                    className={inputStyle}
                  >
                    <option value="">O'qituvchini tanlang...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Hafta Kuni</label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(e.target.value)}
                    className={inputStyle}
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={(index + 1).toString()}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Boshlanish Vaqti</label>
                    <input
                      type="time"
                      required
                      value={formStart}
                      onChange={e => setFormStart(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Tugash Vaqti</label>
                    <input
                      type="time"
                      required
                      value={formEnd}
                      onChange={e => setFormEnd(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSlot}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  {savingSlot ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Jadvalga Saqlash
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DARS SLOTI BAFURJA KO'RISH (DETAIL POPUP) */}
      <AnimatePresence>
        {showDetailModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDetailModal(false);
                setSelectedEvent(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-sm p-6 overflow-hidden ${cardStyle} shadow-2xl z-10`}
            >
              <button 
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEvent(null);
                }} 
                className={`absolute right-4 top-4 p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'border-white/10 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className={`text-md font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Dars Tafsilotlari</h3>
                  <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ID: #{selectedEvent.id}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className={labelStyle}>O'quv Guruhi</span>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.group_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelStyle}>Hafta Kuni</span>
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {DAYS[Number(selectedEvent.day_of_week) - 1] || selectedEvent.day_of_week}
                    </p>
                  </div>
                  <div>
                    <span className={labelStyle}>Dars Vaqti</span>
                    <p className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Clock size={12} className="text-blue-500" />
                      {selectedEvent.start_time} - {selectedEvent.end_time}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelStyle}>O'qituvchi (Ustoz)</span>
                    <p className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <Users size={12} className="text-emerald-500" />
                      {selectedEvent.teacher_name || 'Noma\'lum'}
                    </p>
                  </div>
                  <div>
                    <span className={labelStyle}>Dars Xonasi</span>
                    <p className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <MapPin size={12} className="text-pink-500" />
                      {selectedEvent.room_name || 'Xonasiz'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSlot(selectedEvent.id)}
                className="w-full py-2.5 border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Darsni Jadvaldan O'chirish
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
