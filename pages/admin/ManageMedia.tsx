import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Video, Type, Image as ImageIcon, MapPin, Plus, Trash2, Home, Info, Phone, Globe2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { uploadImageToAPIWithStats } from '../../utils/api';
import { PageHeader, Section, Field, ImageField, SaveBar, useBeforeUnload } from '../../components/admin/ui/kit';

type TabKey = 'hero' | 'about' | 'contact' | 'videos' | 'gallery';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; localized: boolean }[] = [
  { key: 'hero', label: 'Bosh sahifa', icon: <Home size={15} aria-hidden="true" />, localized: true },
  { key: 'about', label: 'Biz haqimizda', icon: <Info size={15} aria-hidden="true" />, localized: true },
  { key: 'contact', label: 'Aloqa', icon: <Phone size={15} aria-hidden="true" />, localized: true },
  { key: 'videos', label: 'Videolar', icon: <Video size={15} aria-hidden="true" />, localized: false },
  { key: 'gallery', label: 'Galereya', icon: <ImageIcon size={15} aria-hidden="true" />, localized: false },
];

export default function ManageMedia() {
  const { siteContent, updateSiteContent } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [aboutSavings, setAboutSavings] = useState<string | null>(null);
  const [gallerySavings, setGallerySavings] = useState<Record<number, string>>({});
  const [tab, setTab] = useState<TabKey>('hero');

  const buildInitial = () => {
    const normalize = (val: any) => typeof val === 'string' ? { uz: val, ru: val, en: val } : (val || { uz: '', ru: '', en: '' });
    return {
      ...siteContent,
      heroTitle: normalize(siteContent.heroTitle),
      heroSubtitle: normalize(siteContent.heroSubtitle),
      heroDescription: normalize(siteContent.heroDescription),
      aboutTitle: normalize(siteContent.aboutTitle),
      aboutDescription: normalize(siteContent.aboutDescription),
      aboutQuote: normalize(siteContent.aboutQuote),
      founderName: normalize(siteContent.founderName),
      founderTitle: normalize(siteContent.founderTitle),
      contactAddress: normalize(siteContent.contactAddress),
      contactLandmark: normalize(siteContent.contactLandmark),
      contactSchedule: normalize(siteContent.contactSchedule),
    };
  };
  const [formData, setFormData] = useState(buildInitial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(formData));
  const [activeLang, setActiveLang] = useState<Lang>('uz');

  const dirty = useMemo(() => JSON.stringify(formData) !== baseline, [formData, baseline]);
  useBeforeUnload(dirty);

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setAboutSavings(null);
        const result = await uploadImageToAPIWithStats(file);
        setFormData(prev => ({ ...prev, aboutImage: result.url }));
        if (result.savingsLabel) setAboutSavings(result.savingsLabel);
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await uploadImageToAPIWithStats(file);
        handleGalleryChange(index, result.url);
        if (result.savingsLabel) setGallerySavings(prev => ({ ...prev, [index]: result.savingsLabel! }));
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof typeof prev] as any),
        [activeLang]: value
      }
    }));
  };

  const handleTestimonialChange = (index: number, value: string) => {
    const newTestimonials = [...formData.testimonialVideos];
    newTestimonials[index] = value;
    setFormData((prev) => ({ ...prev, testimonialVideos: newTestimonials }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.galleryImages];
    newGallery[index] = value;
    setFormData((prev) => ({ ...prev, galleryImages: newGallery }));
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ''] }));
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = formData.galleryImages.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, galleryImages: newGallery }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteContent(formData);
      setBaseline(JSON.stringify(formData));
      toast.success('O\'zgarishlar muvaffaqiyatli saqlandi!');
    } catch (error) {
      toast.error('Saqlashda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSaving(false);
    }
  };

  const L = activeLang.toUpperCase();
  const loc = (name: string) => ((formData as any)[name]?.[activeLang] as string) || '';
  const current = TABS.find(t => t.key === tab)!;

  return (
    <div className="pb-6">
      <PageHeader
        kicker="Kontent"
        title="Media va matnlar"
        sub="Sayt matnlari, rasmlar va videolarni bo'limlar bo'yicha tahrirlang."
      />

      <div className="a-lockbar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="a-scrollx" style={{ maxWidth: '100%' }}>
            <div className="a-tabs" role="tablist" aria-label="Bo'limlar" style={{ flexWrap: 'nowrap' }}>
              {TABS.map(t => (
                <button
                  key={t.key} type="button" role="tab" id={`mm-tab-${t.key}`} aria-controls="mm-panel"
                  aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                  className="a-tab inline-flex items-center gap-1.5" style={{ whiteSpace: 'nowrap' }}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
          {current.localized ? (
            <div className="flex items-center gap-2">
              <Globe2 size={15} className="a-muted" aria-hidden="true" />
              <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />
            </div>
          ) : (
            <span className="a-sub inline-flex items-center gap-1.5" style={{ fontSize: '.8rem' }}><Globe2 size={14} aria-hidden="true" />Bu bo&apos;lim barcha tillar uchun umumiy</span>
          )}
        </div>
      </div>

      <div id="mm-panel" role="tabpanel" aria-labelledby={`mm-tab-${tab}`} className="space-y-4">
        {tab === 'hero' && (
          <Section title={`Bosh sahifa matnlari`} desc={`Birinchi ekrandagi sarlavha va tavsif. Hozirgi til: ${L}.`} icon={<Type size={18} />}>
            <div className="grid gap-4">
              <Field label="Asosiy sarlavha (1-qism)">
                {id => <input id={id} type="text" name="heroTitle" value={loc('heroTitle')} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label="Asosiy sarlavha (2-qism, asosiy rangda)">
                {id => <input id={id} type="text" name="heroSubtitle" value={loc('heroSubtitle')} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label="Tavsif">
                {id => <textarea id={id} name="heroDescription" value={loc('heroDescription')} onChange={handleLocalizedChange} rows={3} className="a-textarea" />}
              </Field>
            </div>
          </Section>
        )}

        {tab === 'about' && (
          <>
            <Section title="Biz haqimizda matnlari" desc={`Bosh sahifadagi va alohida sahifadagi matn. Hozirgi til: ${L}.`} icon={<Type size={18} />}>
              <div className="grid gap-4">
                <Field label="Sarlavha">
                  {id => <input id={id} type="text" name="aboutTitle" value={loc('aboutTitle')} onChange={handleLocalizedChange} className="a-input" />}
                </Field>
                <Field label="Tavsif">
                  {id => <textarea id={id} name="aboutDescription" value={loc('aboutDescription')} onChange={handleLocalizedChange} rows={5} className="a-textarea" />}
                </Field>
                <Field label="Iqtibos (Quote)">
                  {id => <textarea id={id} name="aboutQuote" value={loc('aboutQuote')} onChange={handleLocalizedChange} rows={2} className="a-textarea" />}
                </Field>
              </div>
            </Section>
            <Section title="Asoschi" desc="Asoschi kartochkasi: surat, ism va lavozim." icon={<Info size={18} />}>
              <div className="grid gap-4">
                <ImageField
                  label="Asoschi surati"
                  value={formData.aboutImage}
                  onChange={handleAboutImageUpload}
                  savings={aboutSavings}
                  help={'Bosh sahifadagi "Biz haqimizda" bo\'limi va "Biz haqimizda" sahifasidagi asoschi kartochkasida ishlatiladi.'}
                />
                <div className="a-grid2">
                  <Field label={`Asoschi ismi (${L})`}>
                    {id => <input id={id} type="text" name="founderName" value={loc('founderName')} onChange={handleLocalizedChange} className="a-input" />}
                  </Field>
                  <Field label={`Asoschi lavozimi (${L})`}>
                    {id => <input id={id} type="text" name="founderTitle" value={loc('founderTitle')} onChange={handleLocalizedChange} className="a-input" />}
                  </Field>
                </div>
              </div>
            </Section>
          </>
        )}

        {tab === 'contact' && (
          <Section title="Aloqa ma'lumotlari" desc="Manzil, telefon va ish vaqti saytning aloqa qismida ko'rinadi." icon={<MapPin size={18} />}>
            <div className="a-grid2">
              <Field label={`Manzil (${L})`}>
                {id => <input id={id} type="text" name="contactAddress" value={loc('contactAddress')} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label={`Mo'ljal (${L})`}>
                {id => <input id={id} type="text" name="contactLandmark" value={loc('contactLandmark')} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
              <Field label="Telefon (umumiy)">
                {id => <input id={id} type="text" inputMode="tel" name="contactPhone" value={formData.contactPhone || ''} onChange={handleStringChange} className="a-input" />}
              </Field>
              <Field label="Email (umumiy)">
                {id => <input id={id} type="text" inputMode="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleStringChange} className="a-input" />}
              </Field>
              <Field label={`Ish vaqti (${L})`} className="a-span2">
                {id => <input id={id} type="text" name="contactSchedule" value={loc('contactSchedule')} onChange={handleLocalizedChange} className="a-input" />}
              </Field>
            </div>
          </Section>
        )}

        {tab === 'videos' && (
          <>
            <Section title="DATAga sayohat" desc="Bosh sahifadagi tur videosi." icon={<Video size={18} />}>
              <Field label="YouTube embed URL" help="Masalan: https://www.youtube.com/embed/...">
                {id => <input id={id} type="text" name="tourVideoUrl" value={formData.tourVideoUrl || ''} onChange={handleStringChange} className="a-input a-code" style={{ fontSize: '.85rem' }} />}
              </Field>
            </Section>
            <Section title="O'quvchilar fikri" desc="YouTube Shorts video ID'lari (havoladagi oxirgi qism)." icon={<Video size={18} />}>
              <div className="a-grid3">
                {formData.testimonialVideos.map((id, idx) => (
                  <Field key={idx} label={`Video ${idx + 1} ID`}>
                    {fid => <input id={fid} type="text" value={id} onChange={(e) => handleTestimonialChange(idx, e.target.value)} className="a-input a-code" style={{ fontSize: '.85rem' }} />}
                  </Field>
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === 'gallery' && (
          <Section
            title="Galereya rasmlari"
            desc={`${formData.galleryImages.length} ta rasm. Barcha tillar uchun umumiy.`}
            icon={<ImageIcon size={18} />}
            action={<button type="button" onClick={addGalleryImage} className="a-btn"><Plus size={16} aria-hidden="true" /> Rasm qo&apos;shish</button>}
          >
            {formData.galleryImages.length === 0 ? (
              <div className="a-empty"><ImageIcon size={32} className="mx-auto mb-2" aria-hidden="true" />Galereyada hali rasm yo&apos;q.</div>
            ) : (
              <div className="grid gap-3">
                {formData.galleryImages.map((url, idx) => (
                  <div key={idx} className="a-item flex items-start gap-3">
                    <ImageField
                      className="flex-1 min-w-0"
                      label={`Rasm ${idx + 1}`}
                      value={url}
                      onChange={(e) => handleGalleryUpload(idx, e)}
                      savings={gallerySavings[idx]}
                    />
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="a-btn a-btn-danger a-icon-btn mt-6 shrink-0" aria-label={`Rasm ${idx + 1} ni olib tashlash`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>

      <div className="mt-6">
        <SaveBar dirty={dirty} saving={isSaving} onSave={handleSave} />
      </div>
    </div>
  );
}
