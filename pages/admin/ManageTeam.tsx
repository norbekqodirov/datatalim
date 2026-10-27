import React, { useMemo, useState } from 'react';
import { useStore, TeamMember } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Users, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { uploadImageToAPIWithStats } from '../../utils/api';
import { useLanguage } from '../../i18n';
import { PageHeader, Section, Field, ImageField, ConfirmDialog, SaveBar, useBeforeUnload } from '../../components/admin/ui/kit';

export default function ManageTeam() {
  const { team, deleteTeamMember, addTeamMember, updateTeamMember } = useStore();
  const { tField } = useLanguage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [webpSavings, setWebpSavings] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [baseline, setBaseline] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [activeLang, setActiveLang] = useState<Lang>('uz');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState<{ name?: string; role?: string }>({});

  const editing = isAdding || !!editingId;
  const dirty = editing && JSON.stringify(formData) !== baseline;
  useBeforeUnload(dirty);

  const begin = (data: Partial<TeamMember>) => {
    setFormData(data);
    setBaseline(JSON.stringify(data));
    setSkillsText((data.skills || []).map((s: any) => typeof s === 'string' ? s : s.uz).join(', '));
    setWebpSavings(null);
    setErrors({});
    setActiveLang('uz');
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    const normalize = (val: any) => typeof val === 'string' ? { uz: val, ru: val, en: val } : val;
    begin({
      ...member,
      name: normalize(member.name),
      role: normalize(member.role),
      bio: normalize(member.bio)
    });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    begin({
      id: `team-${Date.now()}`,
      name: { uz: '', ru: '', en: '' },
      role: { uz: '', ru: '', en: '' },
      image: '',
      bio: { uz: '', ru: '', en: '' },
      skills: []
    });
  };

  const closeEditor = () => { setIsAdding(false); setEditingId(null); setDiscardOpen(false); };
  const requestClose = () => { if (dirty) setDiscardOpen(true); else closeEditor(); };

  const handleSave = async () => {
    if (!formData.name?.uz || !formData.role?.uz) {
      setErrors({
        name: formData.name?.uz ? undefined : 'Oʻzbek tilida ism kiritilishi shart',
        role: formData.role?.uz ? undefined : 'Oʻzbek tilida lavozim kiritilishi shart',
      });
      setActiveLang('uz');
      toast.error('O\'zbek tilida Ism va Lavozim kiritilishi shart!');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    if (isAdding) {
      addTeamMember(formData as TeamMember);
      toast.success('Yangi xodim qo\'shildi!');
    } else if (editingId) {
      updateTeamMember(editingId, formData);
      toast.success('Xodim ma\'lumotlari yangilandi!');
    }
    setSaving(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTeamMember(deleteTarget.id);
    toast.success('Xodim o\'chirildi!');
    setDeleteTarget(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setWebpSavings(null);
        const result = await uploadImageToAPIWithStats(file);
        setFormData(prev => ({ ...prev, image: result.url }));
        if (result.savingsLabel) setWebpSavings(result.savingsLabel);
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (value && (name === 'name' || name === 'role')) setErrors(p => ({ ...p, [name]: undefined }));
    setFormData(prev => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof TeamMember] as any),
        [activeLang]: value
      }
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsText(e.target.value);
    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean).map(s => ({ uz: s, ru: s, en: s }));
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return team;
    return team.filter(m => {
      const txt = [m.name, m.role].map((f: any) => typeof f === 'string' ? f : Object.values(f || {}).join(' ')).join(' ');
      return txt.toLowerCase().includes(q);
    });
  }, [team, query]);

  const L = activeLang.toUpperCase();

  /* ------------------------------------------------ tahrirlash shakli ------------------------------------------------ */
  if (editing) {
    return (
      <div>
        <PageHeader
          kicker="Jamoa"
          title={isAdding ? 'Yangi xodim' : 'Xodimni tahrirlash'}
          sub={isAdding ? 'Ma\'lumotlarni to\'ldiring, keyin saqlang.' : (formData.name?.uz || '')}
          actions={<button type="button" className="a-btn" onClick={requestClose}><ArrowLeft size={16} aria-hidden="true" /> Ro&apos;yxatga qaytish</button>}
        />
        <div className="a-lockbar">
          <div className="flex flex-wrap items-center gap-3">
            <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />
            <span className="a-sub" style={{ fontSize: '.8rem' }}>Tilga bog&apos;liq maydonlar ({L}) shu yerdan almashadi.</span>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Asosiy ma'lumotlar" desc="Ism, lavozim va surat." icon={<User size={18} />}>
            <div className="a-grid2">
              <Field label={`Ism familiya (${L})`} error={activeLang === 'uz' ? errors.name : ''}>
                {id => <input id={id} type="text" name="name" value={formData.name?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" aria-invalid={!!errors.name && activeLang === 'uz'} />}
              </Field>
              <Field label={`Lavozim (${L})`} error={activeLang === 'uz' ? errors.role : ''}>
                {id => <input id={id} type="text" name="role" value={formData.role?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" aria-invalid={!!errors.role && activeLang === 'uz'} />}
              </Field>
              <ImageField className="a-span2" round label="Xodim rasmi" value={formData.image} onChange={handleImageUpload} savings={webpSavings} help="Rasm avtomatik siqiladi va WebP formatida saqlanadi." />
            </div>
          </Section>

          <Section title="Bio va ko'nikmalar" icon={<Users size={18} />}>
            <div className="grid gap-4">
              <Field label={`Qisqacha ma'lumot — bio (${L})`}>
                {id => <textarea id={id} name="bio" value={formData.bio?.[activeLang] || ''} onChange={handleLocalizedChange} rows={4} className="a-textarea" />}
              </Field>
              <Field label="Ko'nikmalar (umumiy)" help="Vergul bilan ajrating: Python, SQL, Figma">
                {id => <input id={id} type="text" value={skillsText} onChange={handleSkillsChange} className="a-input" />}
              </Field>
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onCancel={requestClose} alwaysEnabled={isAdding} saveLabel={isAdding ? 'Xodimni qo\'shish' : 'Saqlash'} hint={isAdding ? 'Yangi xodim hali saqlanmagan' : undefined} />
        </div>

        <ConfirmDialog
          open={discardOpen} title="O'zgarishlar saqlanmasin?" danger={false}
          message="Saqlanmagan o'zgarishlar bor. Chiqsangiz, ular yo'qoladi."
          confirmLabel="Chiqish" cancelLabel="Tahrirlashda qolish" onConfirm={closeEditor} onCancel={() => setDiscardOpen(false)}
        />
      </div>
    );
  }

  /* ------------------------------------------------ ro'yxat ------------------------------------------------ */
  return (
    <div>
      <PageHeader
        kicker="Kontent"
        title="Jamoa"
        sub={`Saytdagi jamoa a'zolari: ${team.length} ta.`}
        actions={<button type="button" onClick={handleAdd} className="a-btn a-btn-primary"><Plus size={18} aria-hidden="true" /> Yangi xodim</button>}
      />

      {team.length > 3 && (
        <div className="a-search mb-5" style={{ maxWidth: 420 }}>
          <Search size={16} aria-hidden="true" />
          <input type="search" className="a-input" placeholder="Ism yoki lavozim bo'yicha qidirish" aria-label="Jamoani qidirish" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="a-card a-empty">
          <Users size={34} className="mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold" style={{ color: 'var(--a-fg-2)' }}>{team.length === 0 ? 'Hali xodim yo\'q' : 'Hech kim topilmadi'}</p>
          {team.length === 0 && <button type="button" className="a-btn a-btn-primary mt-4" onClick={handleAdd}><Plus size={16} aria-hidden="true" /> Yangi xodim</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <motion.article key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="a-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3.5">
                <div className="a-thumb" style={{ width: 56, height: 56, borderRadius: 999 }}>
                  {member.image ? <img src={member.image} alt="" loading="lazy" decoding="async" /> : <User size={22} aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <h3 className="a-h2 leading-tight truncate">{tField(member.name)}</h3>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--a-blue-ink)' }}>{tField(member.role)}</p>
                </div>
              </div>
              <p className="a-sub line-clamp-3" style={{ fontSize: '.82rem' }}>{tField(member.bio)}</p>
              <div className="flex flex-wrap gap-1.5">
                {(member.skills || []).slice(0, 3).map((skill: any, idx: number) => <span key={idx} className="a-badge">{tField(skill)}</span>)}
                {(member.skills || []).length > 3 && <span className="a-badge">+{member.skills.length - 3}</span>}
              </div>
              <div className="flex items-center gap-2 pt-3 mt-auto" style={{ borderTop: '1px solid var(--a-line)' }}>
                <button type="button" onClick={() => handleEdit(member)} className="a-btn flex-1"><Pencil size={15} aria-hidden="true" /> Tahrirlash</button>
                <button type="button" onClick={() => setDeleteTarget(member)} className="a-btn a-btn-danger a-icon-btn" aria-label={`${tField(member.name)} ni o'chirish`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget} title="Xodimni o'chirasizmi?"
        message={deleteTarget ? `"${tField(deleteTarget.name)}" jamoa ro'yxatidan olib tashlanadi. Bu amalni qaytarib bo'lmaydi.` : ''}
        confirmLabel="Ha, o'chirish" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
