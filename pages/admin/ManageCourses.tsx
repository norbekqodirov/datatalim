import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, X, Edit } from 'lucide-react';
import { Course } from '../../data/courses';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { compressImage } from '../../utils/imageCompressor';
import { useLanguage } from '../../i18n';

export default function ManageCourses() {
  const { courses, deleteCourse, addCourse, updateCourse } = useStore();
  const { isDark } = useTheme();
  const { tField } = useLanguage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Course>>({});
  const [activeLang, setActiveLang] = useState<Lang>('uz');

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    const normalize = (val: any) => typeof val === 'string' ? { uz: val, ru: val, en: val } : (val || { uz: '', ru: '', en: '' });

    const normalizedMentors = (course.mentors || []).map(m => ({
      ...m,
      name: normalize(m.name),
      role: normalize(m.role)
    }));

    const normalizedModules = (course.modules || []).map(mod => ({
      ...mod,
      title: normalize(mod.title),
      lessons: (mod.lessons || []).map((l: any) => normalize(l))
    }));

    setFormData({
      ...course,
      title: normalize(course.title),
      duration: normalize(course.duration),
      monthlyPrice: normalize(course.monthlyPrice),
      totalPrice: normalize(course.totalPrice),
      description: normalize(course.description),
      mentors: normalizedMentors,
      modules: normalizedModules
    });
    setIsAdding(false);
    setActiveLang('uz');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setActiveLang('uz');
    setFormData({
      id: `course-${Date.now()}`,
      title: { uz: '', ru: '', en: '' },
      category: 'programming',
      duration: { uz: '', ru: '', en: '' },
      monthlyPrice: { uz: '', ru: '', en: '' },
      totalPrice: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      coverImage: '',
      technologies: [],
      mentors: [],
      modules: []
    });
  };

  const handleSave = () => {
    if (!formData.title?.uz || !formData.category) {
      toast.error('O\'zbek tilida Sarlavha kiritilishi shart!');
      return;
    }

    if (isAdding) {
      addCourse(formData as Course);
      toast.success('Yangi kurs qo\'shildi!');
    } else if (editingId) {
      updateCourse(editingId, formData);
      toast.success('Kurs yangilandi!');
    }

    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Rostdan ham bu kursni o\'chirmoqchimisiz?')) {
      deleteCourse(id);
      toast.success('Kurs o\'chirildi!');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, coverImage: compressedBase64 }));
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof Course] as any),
        [activeLang]: value
      }
    }));
  };

  const handleAddMentor = () => {
    setFormData(prev => ({ ...prev, mentors: [...(prev.mentors || []), { name: { uz: '', ru: '', en: '' }, role: { uz: '', ru: '', en: '' }, image: '' }] }));
  };
  const handleRemoveMentor = (idx: number) => {
    setFormData(prev => ({ ...prev, mentors: (prev.mentors || []).filter((_, i) => i !== idx) }));
  };
  const handleMentorChange = (idx: number, field: 'name' | 'role', value: string) => {
    const newMentors = [...(formData.mentors || [])];
    newMentors[idx] = { ...newMentors[idx], [field]: { ...(newMentors[idx][field] as any), [activeLang]: value } };
    setFormData(prev => ({ ...prev, mentors: newMentors }));
  };
  const handleMentorImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        const newMentors = [...(formData.mentors || [])];
        newMentors[idx] = { ...newMentors[idx], image: compressedBase64 };
        setFormData(prev => ({ ...prev, mentors: newMentors }));
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleAddModule = () => {
    setFormData(prev => ({ ...prev, modules: [...(prev.modules || []), { title: { uz: '', ru: '', en: '' }, lessons: [] }] }));
  };
  const handleRemoveModule = (idx: number) => {
    setFormData(prev => ({ ...prev, modules: (prev.modules || []).filter((_, i) => i !== idx) }));
  };
  const handleModuleChange = (idx: number, value: string) => {
    const newModules = [...(formData.modules || [])];
    newModules[idx] = { ...newModules[idx], title: { ...(newModules[idx].title as any), [activeLang]: value } };
    setFormData(prev => ({ ...prev, modules: newModules }));
  };
  const handleAddLesson = (moduleIdx: number) => {
    const newModules = [...(formData.modules || [])];
    newModules[moduleIdx].lessons = [...(newModules[moduleIdx].lessons || []), { uz: '', ru: '', en: '' }];
    setFormData(prev => ({ ...prev, modules: newModules }));
  };
  const handleRemoveLesson = (moduleIdx: number, lessonIdx: number) => {
    const newModules = [...(formData.modules || [])];
    newModules[moduleIdx].lessons = newModules[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };
  const handleLessonChange = (moduleIdx: number, lessonIdx: number, value: string) => {
    const newModules = [...(formData.modules || [])];
    const lesson = newModules[moduleIdx].lessons[lessonIdx] as any;
    newModules[moduleIdx].lessons[lessonIdx] = { ...lesson, [activeLang]: value };
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Kurslar</h1>
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saytdagi barcha kurslarni boshqarish.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="bg-[#0061ff] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Plus size={20} />
            Yangi Kurs
          </button>
        )}
      </motion.div>

      {(isAdding || editingId) ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-[2.5rem] p-8 border shadow-sm ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAdding ? "Yangi Kurs Qo'shish" : 'Kursni Tahrirlash'}</h2>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X size={24} />
            </button>
          </div>

          <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kurs Nomi ({activeLang.toUpperCase()})</label>
              <input type="text" name="title" value={formData.title?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kategoriya (Umumiy)</label>
              <select name="category" value={formData.category || 'programming'} onChange={handleStringChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`}>
                <option value="programming">Dasturlash</option>
                <option value="media">Media va Dizayn</option>
                <option value="finance">Moliya va Buxgalteriya</option>
                <option value="kids">Bolalar uchun</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Davomiyligi ({activeLang.toUpperCase()})</label>
              <input type="text" name="duration" value={formData.duration?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Oylik To'lov ({activeLang.toUpperCase()})</label>
              <input type="text" name="monthlyPrice" value={formData.monthlyPrice?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Umumiy To'lov ({activeLang.toUpperCase()})</label>
              <input type="text" name="totalPrice" value={formData.totalPrice?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Muqova Rasmi (Yuklash)</label>
              <div className="flex gap-4 items-center">
                {formData.coverImage && <img src={formData.coverImage} className={`w-16 h-16 rounded-xl object-cover shrink-0 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0061ff]/10 file:text-[#0061ff] hover:file:bg-[#0061ff]/20 transition-all focus:outline-none`} />
                </div>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>*Rasm avtomatik tarzda siqiladi va yengil formatda saqlanadi.</p>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tavsif ({activeLang.toUpperCase()})</label>
              <textarea name="description" value={formData.description?.[activeLang] || ''} onChange={handleLocalizedChange} rows={4} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Texnologiyalar (Vergul bilan ajrating, Umumiy)</label>
              <input type="text" value={formData.technologies?.map((s: any) => typeof s === 'string' ? s : s.uz).join(', ') || ''} onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>

            {/* Mentors Section */}
            <div className="md:col-span-2 border-t pt-6 mt-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-4">
                <label className={`block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Kurs Ustozlari</label>
                <button onClick={handleAddMentor} type="button" className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-[#60efff] hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>
                  <Plus size={18} /> Ustoz qo'shish
                </button>
              </div>
              <div className="space-y-4">
                {(formData.mentors || []).map((mentor, mIdx) => (
                  <div key={mIdx} className={`p-4 rounded-2xl border relative flex flex-col md:flex-row gap-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button type="button" onClick={() => handleRemoveMentor(mIdx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ism ({activeLang.toUpperCase()})</label>
                        <input type="text" value={(mentor.name as any)?.[activeLang] || ''} onChange={(e) => handleMentorChange(mIdx, 'name', e.target.value)} className={`w-full px-3 py-2 text-sm rounded-xl border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300'}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Lavozim ({activeLang.toUpperCase()})</label>
                        <input type="text" value={(mentor.role as any)?.[activeLang] || ''} onChange={(e) => handleMentorChange(mIdx, 'role', e.target.value)} className={`w-full px-3 py-2 text-sm rounded-xl border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300'}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rasm (Yuklash)</label>
                        <div className="flex gap-3 items-center">
                          {mentor.image && <img src={mentor.image} className="w-10 h-10 rounded-lg object-cover" />}
                          <input type="file" accept="image/*" onChange={(e) => handleMentorImageUpload(mIdx, e)} className={`w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'} file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-[#0061ff]/10 file:text-[#0061ff]`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules Section */}
            <div className="md:col-span-2 border-t pt-6 mt-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-center mb-4">
                <label className={`block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dars Rejasi (Modullar)</label>
                <button type="button" onClick={handleAddModule} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-[#60efff] hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>
                  <Plus size={18} /> Modul qo'shish
                </button>
              </div>
              <div className="space-y-6">
                {(formData.modules || []).map((mod, modIdx) => (
                  <div key={modIdx} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex-1">
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Modul Nomi ({activeLang.toUpperCase()})</label>
                        <input type="text" value={(mod.title as any)?.[activeLang] || ''} onChange={(e) => handleModuleChange(modIdx, e.target.value)} className={`w-full px-3 py-2 rounded-xl border outline-none font-bold ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
                      </div>
                      <button type="button" onClick={() => handleRemoveModule(modIdx)} className="p-2 text-red-500 hover:text-red-700 mt-5 bg-red-500/10 rounded-xl">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={`block text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Darslar ro'yxati ({activeLang.toUpperCase()})</label>
                        <button type="button" onClick={() => handleAddLesson(modIdx)} className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-[#60efff]' : 'text-blue-600'}`}>
                          <Plus size={14} /> Dars qo'shish
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(mod.lessons || []).map((lesson, lessonIdx) => (
                          <div key={lessonIdx} className="flex gap-2">
                            <input type="text" value={(lesson as any)?.[activeLang] || ''} onChange={(e) => handleLessonChange(modIdx, lessonIdx, e.target.value)} placeholder={`Dars ${lessonIdx + 1}`} className={`flex-1 px-3 py-1.5 text-sm rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-200'}`} />
                            <button type="button" onClick={() => handleRemoveLesson(modIdx, lessonIdx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className={`px-6 py-3 rounded-2xl font-bold transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
              Bekor qilish
            </button>
            <button onClick={handleSave} className="bg-[#0061ff] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
              <Save size={20} />
              Saqlash
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div key={course.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between group hover:shadow-md transition-all ${isDark ? 'bg-slate-900/50 border-white/5 shadow-black/50 hover:bg-slate-800' : 'bg-white border-slate-100'}`}>
              <div>
                <div className={`inline-block px-3 py-1 rounded-full font-bold text-xs mb-4 uppercase tracking-wider ${isDark ? 'bg-blue-500/20 text-[#60efff]' : 'bg-blue-50 text-blue-600'}`}>
                  {course.category}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(course.title)}</h3>
                <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tField(course.description)}</p>
                <div className={`flex justify-between items-center text-sm font-bold mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>{tField(course.duration)}</span>
                  <span>{tField(course.monthlyPrice)}</span>
                </div>
              </div>
              <div className={`flex justify-end gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button onClick={() => handleEdit(course)} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-[#60efff] hover:bg-slate-800' : 'text-slate-400 hover:text-[#0061ff] hover:bg-blue-50'}`}>
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(course.id)} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
