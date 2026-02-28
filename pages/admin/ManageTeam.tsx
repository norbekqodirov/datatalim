import React, { useState } from 'react';
import { useStore, TeamMember } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { compressImage } from '../../utils/imageCompressor';
import { useLanguage } from '../../i18n';

export default function ManageTeam() {
  const { team, deleteTeamMember, addTeamMember, updateTeamMember } = useStore();
  const { isDark } = useTheme();
  const { tField } = useLanguage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [activeLang, setActiveLang] = useState<Lang>('uz');

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    const normalize = (val: any) => typeof val === 'string' ? { uz: val, ru: val, en: val } : val;
    setFormData({
      ...member,
      name: normalize(member.name),
      role: normalize(member.role),
      bio: normalize(member.bio)
    });
    setIsAdding(false);
    setActiveLang('uz');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setActiveLang('uz');
    setFormData({
      id: `team-${Date.now()}`,
      name: { uz: '', ru: '', en: '' },
      role: { uz: '', ru: '', en: '' },
      image: '',
      bio: { uz: '', ru: '', en: '' },
      skills: []
    });
  };

  const handleSave = () => {
    if (!formData.name?.uz || !formData.role?.uz) {
      toast.error('O\'zbek tilida Ism va Lavozim kiritilishi shart!');
      return;
    }

    if (isAdding) {
      addTeamMember(formData as TeamMember);
      toast.success('Yangi xodim qo\'shildi!');
    } else if (editingId) {
      updateTeamMember(editingId, formData);
      toast.success('Xodim ma\'lumotlari yangilandi!');
    }

    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Rostdan ham bu xodimni o\'chirmoqchimisiz?')) {
      deleteTeamMember(id);
      toast.success('Xodim o\'chirildi!');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, image: compressedBase64 }));
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof TeamMember] as any),
        [activeLang]: value
      }
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Jamoa</h1>
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Saytdagi barcha jamoa a\'zolarini boshqarish.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="bg-[#0061ff] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Plus size={20} />
            Yangi Xodim
          </button>
        )}
      </motion.div>

      {(isAdding || editingId) ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-[2.5rem] p-8 border shadow-sm ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{isAdding ? "Yangi Xodim Qo'shish" : 'Xodimni Tahrirlash'}</h2>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X size={24} />
            </button>
          </div>

          <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ism Familiya ({activeLang.toUpperCase()})</label>
              <input type="text" name="name" value={formData.name?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lavozim ({activeLang.toUpperCase()})</label>
              <input type="text" name="role" value={formData.role?.[activeLang] || ''} onChange={handleLocalizedChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Xodim Rasmi (Yuklash)</label>
              <div className="flex gap-4 items-center">
                {formData.image && <img src={formData.image} className={`w-16 h-16 rounded-xl object-cover shrink-0 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0061ff]/10 file:text-[#0061ff] hover:file:bg-[#0061ff]/20 transition-all focus:outline-none`} />
                </div>
              </div>
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>*Rasm avtomatik tarzda siqiladi va saqlanadi.</p>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ko'nikmalar (Vergul bilan ajrating, Umumiy)</label>
              <input type="text" value={formData.skills?.map((s: any) => typeof s === 'string' ? s : s.uz).join(', ') || ''} onChange={handleSkillsChange} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Qisqacha ma'lumot - Bio ({activeLang.toUpperCase()})</label>
              <textarea name="bio" value={formData.bio?.[activeLang] || ''} onChange={handleLocalizedChange} rows={4} className={`w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`} />
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
          {team.map((member) => (
            <motion.div key={member.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between group hover:shadow-md transition-all ${isDark ? 'bg-slate-900/50 border-white/5 shadow-black/50 hover:bg-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-4 mb-6">
                <img src={member.image} alt={tField(member.name)} className={`w-16 h-16 rounded-full object-cover border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                <div>
                  <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{tField(member.name)}</h3>
                  <p className={`text-sm font-medium ${isDark ? 'text-[#60efff]' : 'text-blue-600'}`}>{tField(member.role)}</p>
                </div>
              </div>
              <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tField(member.bio)}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {member.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className={`px-2 py-1 border rounded-lg text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && <span className={`px-2 py-1 border rounded-lg text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>+{member.skills.length - 3}</span>}
              </div>
              <div className={`flex justify-end gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button onClick={() => handleEdit(member)} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-[#60efff] hover:bg-slate-800' : 'text-slate-400 hover:text-[#0061ff] hover:bg-blue-50'}`}>
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(member.id)} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
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
