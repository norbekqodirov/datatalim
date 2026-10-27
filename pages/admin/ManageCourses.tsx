import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil, Search, BookOpen, ArrowLeft, Clock, Wallet, Users, ListChecks, FileText, X } from 'lucide-react';
import { Course } from '../../data/courses';
import toast from 'react-hot-toast';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { uploadImageToAPIWithStats } from '../../utils/api';
import { useLanguage } from '../../i18n';
import { PageHeader, Section, Field, ImageField, ConfirmDialog, SaveBar, useBeforeUnload } from '../../components/admin/ui/kit';

const CATEGORIES: { value: Course['category']; label: string; tone: string }[] = [
  { value: 'programming', label: 'Dasturlash', tone: 'is-blue' },
  { value: 'media', label: 'Media va Dizayn', tone: 'is-green' },
  { value: 'finance', label: 'Moliya va Buxgalteriya', tone: 'is-amber' },
  { value: 'kids', label: 'Bolalar uchun', tone: '' },
];
const catOf = (v?: string) => CATEGORIES.find(c => c.value === v);

export default function ManageCourses() {
  const { courses, deleteCourse, addCourse, updateCourse } = useStore();
  const { tField } = useLanguage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [webpSavings, setWebpSavings] = useState<string | null>(null);
  const [mentorWebpSavings, setMentorWebpSavings] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState<Partial<Course>>({});
  const [baseline, setBaseline] = useState('');
  const [techText, setTechText] = useState('');
  const [activeLang, setActiveLang] = useState<Lang>('uz');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'all' | Course['category']>('all');
  const [titleError, setTitleError] = useState('');

  const editing = isAdding || !!editingId;
  const dirty = editing && JSON.stringify(formData) !== baseline;
  useBeforeUnload(dirty);

  const begin = (data: Partial<Course>) => {
    setFormData(data);
    setBaseline(JSON.stringify(data));
    setTechText((data.technologies || []).map((s: any) => typeof s === 'string' ? s : s.uz).join(', '));
    setWebpSavings(null);
    setMentorWebpSavings({});
    setTitleError('');
    setActiveLang('uz');
  };

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

    begin({
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
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    begin({
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

  const closeEditor = () => { setIsAdding(false); setEditingId(null); setDiscardOpen(false); };
  const requestClose = () => { if (dirty) setDiscardOpen(true); else closeEditor(); };

  const handleSave = async () => {
    if (!formData.title?.uz || !formData.category) {
      setTitleError('O\'zbek tilida kurs nomi kiritilishi shart');
      setActiveLang('uz');
      toast.error('O\'zbek tilida Sarlavha kiritilishi shart!');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300)); // give UI time to update
    if (isAdding) {
      addCourse(formData as Course);
      toast.success('Yangi kurs qo\'shildi!');
    } else if (editingId) {
      updateCourse(editingId, formData);
      toast.success('Kurs yangilandi!');
    }
    setSaving(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCourse(deleteTarget.id);
    toast.success('Kurs o\'chirildi!');
    setDeleteTarget(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setWebpSavings(null);
        const result = await uploadImageToAPIWithStats(file);
        setFormData(prev => ({ ...prev, coverImage: result.url }));
        if (result.savingsLabel) setWebpSavings(result.savingsLabel);
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
    if (name === 'title' && value) setTitleError('');
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
        const result = await uploadImageToAPIWithStats(file);
        const newMentors = [...(formData.mentors || [])];
        newMentors[idx] = { ...newMentors[idx], image: result.url };
        setFormData(prev => ({ ...prev, mentors: newMentors }));
        if (result.savingsLabel) setMentorWebpSavings(prev => ({ ...prev, [idx]: result.savingsLabel! }));
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(c => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (!q) return true;
      return [c.title, c.description].some(f => {
        const v: any = f;
        return (typeof v === 'string' ? v : Object.values(v || {}).join(' ')).toLowerCase().includes(q);
      });
    });
  }, [courses, query, cat]);

  const L = activeLang.toUpperCase();
  const countBy = (v: 'all' | Course['category']) => v === 'all' ? courses.length : courses.filter(c => c.category === v).length;

  /* ------------------------------------------------ tahrirlash shakli ------------------------------------------------ */
  if (editing) {
    return (
      <div>
        <PageHeader
          kicker="Kurslar"
          title={isAdding ? 'Yangi kurs' : 'Kursni tahrirlash'}
          sub={isAdding ? 'Asosiy ma\'lumotlarni to\'ldiring, keyin saqlang.' : (formData.title?.uz || '')}
          actions={<button type="button" className="a-btn" onClick={requestClose}><ArrowLeft size={16} aria-hidden="true" /> Ro&apos;yxatga qaytish</button>}
        />

        <div className="a-lockbar">
          <div className="flex flex-wrap items-center gap-3">
            <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />
            <span className="a-sub" style={{ fontSize: '.8rem' }}>Tilga bog&apos;liq maydonlar ({L}) shu yerdan almashadi.</span>
          </div>
        </div>

        <div className="space-y-4">
          <Section title="Asosiy ma'lumotlar" desc="Nom, kategoriya va muqova rasmi." icon={<BookOpen size={18} />}>
            <div className="a-grid2">
              <Field label={`Kurs nomi (${L})`} error={activeLang === 'uz' ? titleError : ''}>
                {id => <input id={id} type="text" name="title" value={formData.title?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" aria-invalid={!!titleError && activeLang === 'uz'} />}
              </Field>
              <Field label="Kategoriya (umumiy)">
                {id => (
                  <select id={id} name="category" value={formData.category || 'programming'} onChange={handleStringChange} className="a-select">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                )}
              </Field>
              <ImageField className="a-span2" label="Muqova rasmi" value={formData.coverImage} onChange={handleImageUpload} savings={webpSavings} help="Rasm avtomatik WebP formatga o'tkaziladi va siqiladi." />
            </div>
          </Section>

          <Section title="Davomiylik va narx" desc="Kartochkada va kurs sahifasida ko'rinadi." icon={<Wallet size={18} />}>
            <div className="a-grid3">
              <Field label={`Davomiyligi (${L})`}>
                {id => <input id={id} type="text" name="duration" value={formData.duration?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label={`Oylik to'lov (${L})`}>
                {id => <input id={id} type="text" name="monthlyPrice" value={formData.monthlyPrice?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label={`Umumiy to'lov (${L})`}>
                {id => <input id={id} type="text" name="totalPrice" value={formData.totalPrice?.[activeLang] || ''} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
            </div>
          </Section>

          <Section title="Tavsif va texnologiyalar" icon={<FileText size={18} />}>
            <div className="grid gap-4">
              <Field label={`Tavsif (${L})`}>
                {id => <textarea id={id} name="description" value={formData.description?.[activeLang] || ''} onChange={handleLocalizedChange} rows={4} className="a-textarea" />}
              </Field>
              <Field label="Texnologiyalar (umumiy)" help="Vergul bilan ajrating: HTML, CSS, React">
                {id => (
                  <input
                    id={id} type="text" value={techText} className="a-input"
                    onChange={(e) => {
                      setTechText(e.target.value);
                      setFormData(prev => ({ ...prev, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
                    }}
                  />
                )}
              </Field>
            </div>
          </Section>

          <Section
            title="Kurs ustozlari" desc={`${(formData.mentors || []).length} ta ustoz`} icon={<Users size={18} />}
            action={<button type="button" onClick={handleAddMentor} className="a-btn"><Plus size={16} aria-hidden="true" /> Ustoz qo&apos;shish</button>}
          >
            {(formData.mentors || []).length === 0 ? (
              <p className="a-sub">Hali ustoz qo&apos;shilmagan.</p>
            ) : (
              <div className="grid gap-3">
                {(formData.mentors || []).map((mentor, mIdx) => (
                  <div key={mIdx} className="a-item">
                    <div className="flex items-center justify-between mb-3">
                      <span className="a-kicker">Ustoz {mIdx + 1}</span>
                      <button type="button" onClick={() => handleRemoveMentor(mIdx)} className="a-btn a-btn-danger a-icon-btn" aria-label={`Ustoz ${mIdx + 1} ni o'chirish`}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="a-grid2">
                      <Field label={`Ism (${L})`}>
                        {id => <input id={id} type="text" value={(mentor.name as any)?.[activeLang] || ''} onChange={(e) => handleMentorChange(mIdx, 'name', e.target.value)} className="a-input" />}
                      </Field>
                      <Field label={`Lavozim (${L})`}>
                        {id => <input id={id} type="text" value={(mentor.role as any)?.[activeLang] || ''} onChange={(e) => handleMentorChange(mIdx, 'role', e.target.value)} className="a-input" />}
                      </Field>
                      <ImageField className="a-span2" label="Rasm" round value={mentor.image} onChange={(e) => handleMentorImageUpload(mIdx, e)} savings={mentorWebpSavings[mIdx]} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Dars rejasi" desc={`${(formData.modules || []).length} ta modul`} icon={<ListChecks size={18} />}
            action={<button type="button" onClick={handleAddModule} className="a-btn"><Plus size={16} aria-hidden="true" /> Modul qo&apos;shish</button>}
          >
            {(formData.modules || []).length === 0 ? (
              <p className="a-sub">Hali modul qo&apos;shilmagan.</p>
            ) : (
              <div className="grid gap-3">
                {(formData.modules || []).map((mod, modIdx) => (
                  <div key={modIdx} className="a-item">
                    <div className="flex items-end gap-2">
                      <Field className="flex-1 min-w-0" label={`Modul ${modIdx + 1} nomi (${L})`}>
                        {id => <input id={id} type="text" value={(mod.title as any)?.[activeLang] || ''} onChange={(e) => handleModuleChange(modIdx, e.target.value)} className="a-input" style={{ fontWeight: 600 }} />}
                      </Field>
                      <button type="button" onClick={() => handleRemoveModule(modIdx)} className="a-btn a-btn-danger a-icon-btn shrink-0" style={{ height: 44 }} aria-label={`Modul ${modIdx + 1} ni o'chirish`}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="a-label" style={{ margin: 0 }}>Darslar ({L})</span>
                        <button type="button" onClick={() => handleAddLesson(modIdx)} className="a-btn a-btn-ghost" style={{ minHeight: 36, color: 'var(--a-blue-ink)' }}>
                          <Plus size={14} aria-hidden="true" /> Dars qo&apos;shish
                        </button>
                      </div>
                      <div className="grid gap-2">
                        {(mod.lessons || []).map((lesson, lessonIdx) => (
                          <div key={lessonIdx} className="flex gap-2">
                            <input type="text" aria-label={`Modul ${modIdx + 1}, dars ${lessonIdx + 1}`} value={(lesson as any)?.[activeLang] || ''} onChange={(e) => handleLessonChange(modIdx, lessonIdx, e.target.value)} placeholder={`Dars ${lessonIdx + 1}`} className="a-input" />
                            <button type="button" onClick={() => handleRemoveLesson(modIdx, lessonIdx)} className="a-btn a-btn-ghost a-icon-btn shrink-0" style={{ height: 44 }} aria-label={`Dars ${lessonIdx + 1} ni olib tashlash`}>
                              <X size={16} aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="mt-6">
          <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onCancel={requestClose} alwaysEnabled={isAdding} saveLabel={isAdding ? 'Kursni qo\'shish' : 'Saqlash'} hint={isAdding ? 'Yangi kurs hali saqlanmagan' : undefined} />
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
        title="Kurslar"
        sub={`Saytdagi kurslar: ${courses.length} ta. Kartani bosib tahrirlang.`}
        actions={<button type="button" onClick={handleAdd} className="a-btn a-btn-primary"><Plus size={18} aria-hidden="true" /> Yangi kurs</button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="a-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" className="a-input" placeholder="Kurs nomi bo'yicha qidirish" aria-label="Kurslarni qidirish" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="a-scrollx" role="group" aria-label="Kategoriya filtri" style={{ maxWidth: '100%' }}>
          {([{ value: 'all', label: 'Hammasi' }, ...CATEGORIES] as { value: 'all' | Course['category']; label: string }[]).map(c => (
            <button key={c.value} type="button" className="a-chip" aria-pressed={cat === c.value} onClick={() => setCat(c.value)}>
              {c.label}<span className="a-chip-n">{countBy(c.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="a-card a-empty">
          <BookOpen size={34} className="mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold" style={{ color: 'var(--a-fg-2)' }}>{courses.length === 0 ? 'Hali kurs yo\'q' : 'Hech narsa topilmadi'}</p>
          <p className="a-sub mt-1">{courses.length === 0 ? 'Birinchi kursni qo\'shing.' : 'Qidiruv yoki filtrni o\'zgartirib ko\'ring.'}</p>
          {courses.length === 0
            ? <button type="button" className="a-btn a-btn-primary mt-4" onClick={handleAdd}><Plus size={16} aria-hidden="true" /> Yangi kurs</button>
            : <button type="button" className="a-btn mt-4" onClick={() => { setQuery(''); setCat('all'); }}>Filtrni tozalash</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const c = catOf(course.category);
            return (
              <motion.article key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="a-card flex flex-col overflow-hidden">
                <div className={`a-thumb a-cover${course.coverImage ? '' : ' has-grad'}`}>
                  {course.coverImage ? <img src={course.coverImage} alt="" loading="lazy" decoding="async" /> : <BookOpen size={30} aria-hidden="true" />}
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <span className={`a-badge ${c?.tone || ''}`}>{c?.label || course.category}</span>
                    <h3 className="a-h2 mt-2.5 leading-snug">{tField(course.title)}</h3>
                    <p className="a-sub mt-1 line-clamp-2" style={{ fontSize: '.82rem' }}>{tField(course.description)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm mt-auto pt-1">
                    <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--a-fg-2)' }}><Clock size={14} aria-hidden="true" />{tField(course.duration) || '—'}</span>
                    <span className="a-num font-semibold">{tField(course.monthlyPrice) || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--a-line)' }}>
                    <button type="button" onClick={() => handleEdit(course)} className="a-btn flex-1"><Pencil size={15} aria-hidden="true" /> Tahrirlash</button>
                    <button type="button" onClick={() => setDeleteTarget(course)} className="a-btn a-btn-danger a-icon-btn" aria-label={`${tField(course.title)} kursini o'chirish`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget} title="Kursni o'chirasizmi?"
        message={deleteTarget ? `"${tField(deleteTarget.title)}" kursi saytdan olib tashlanadi. Bu amalni qaytarib bo'lmaydi.` : ''}
        confirmLabel="Ha, o'chirish" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
