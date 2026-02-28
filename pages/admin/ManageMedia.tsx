import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Save, Video, Type, Image as ImageIcon, MapPin, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../store/ThemeContext';
import { AdminLangTabs, Lang } from '../../components/admin/AdminLangTabs';
import { compressImage } from '../../utils/imageCompressor';

export default function ManageMedia() {
  const { siteContent, updateSiteContent } = useStore();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState(() => {
    const normalize = (val: any) => typeof val === 'string' ? { uz: val, ru: val, en: val } : (val || { uz: '', ru: '', en: '' });
    return {
      ...siteContent,
      heroTitle: normalize(siteContent.heroTitle),
      heroSubtitle: normalize(siteContent.heroSubtitle),
      heroDescription: normalize(siteContent.heroDescription),
      aboutTitle: normalize(siteContent.aboutTitle),
      aboutDescription: normalize(siteContent.aboutDescription),
      aboutQuote: normalize(siteContent.aboutQuote),
      contactAddress: normalize(siteContent.contactAddress),
      contactLandmark: normalize(siteContent.contactLandmark),
      contactSchedule: normalize(siteContent.contactSchedule),
    };
  });
  const [activeLang, setActiveLang] = useState<Lang>('uz');

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, aboutImage: compressedBase64 }));
      } catch (error) {
        toast.error('Rasm yuklashda xatolik yuz berdi');
      }
    }
  };

  const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        handleGalleryChange(index, compressedBase64);
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

  const handleSave = () => {
    updateSiteContent(formData);
    toast.success('O\'zgarishlar saqlandi!');
  };

  const inputClass = `w-full px-4 py-3 rounded-2xl border outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#60efff]' : 'bg-white border-slate-200 focus:border-[#0061ff] focus:ring-2 focus:ring-blue-100'}`;
  const labelClass = `block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const sectionTitleClass = `text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`;

  return (
    <div className="space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Media va Matnlar</h1>
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Asosiy matnlar, rasmlar va videolarni o\'zgartiring.</p>
        </div>
      </motion.div>

      <div className={`rounded-[2.5rem] p-8 border shadow-sm space-y-12 relative ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100'}`}>

        <div className="sticky top-0 z-10 pt-4 pb-2 bg-inherit backdrop-blur-xl border-b -mx-8 px-8 mb-8" style={{ borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <AdminLangTabs activeTab={activeLang} onTabChange={setActiveLang} />
        </div>

        {/* Hero Texts */}
        <div>
          <h2 className={sectionTitleClass}>
            <Type className={isDark ? "text-[#60efff]" : "text-blue-600"} />
            Bosh Sahifa Matnlari ({activeLang.toUpperCase()})
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Asosiy Sarlavha (1-qism)</label>
              <input type="text" name="heroTitle" value={formData.heroTitle?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Asosiy Sarlavha (2-qism, asosiy rangda)</label>
              <input type="text" name="heroSubtitle" value={formData.heroSubtitle?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tavsif (Description)</label>
              <textarea name="heroDescription" value={formData.heroDescription?.[activeLang] || ''} onChange={handleLocalizedChange} rows={3} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        <hr className={isDark ? "border-slate-800" : "border-slate-100"} />

        {/* About Texts */}
        <div>
          <h2 className={sectionTitleClass}>
            <Type className={isDark ? "text-[#60efff]" : "text-blue-600"} />
            Biz Haqimizda Matnlari ({activeLang.toUpperCase()})
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Sarlavha</label>
              <input type="text" name="aboutTitle" value={formData.aboutTitle?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tavsif</label>
              <textarea name="aboutDescription" value={formData.aboutDescription?.[activeLang] || ''} onChange={handleLocalizedChange} rows={4} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Iqtibos (Quote)</label>
              <textarea name="aboutQuote" value={formData.aboutQuote?.[activeLang] || ''} onChange={handleLocalizedChange} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Biz haqimizda Rasmi (Yuklash)</label>
              <div className="flex gap-4 items-center">
                {formData.aboutImage && <img src={formData.aboutImage} className={`w-16 h-16 rounded-xl object-cover shrink-0 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handleAboutImageUpload} className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0061ff]/10 file:text-[#0061ff] hover:file:bg-[#0061ff]/20 transition-all focus:outline-none`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className={isDark ? "border-slate-800" : "border-slate-100"} />

        {/* Contact Info */}
        <div>
          <h2 className={sectionTitleClass}>
            <MapPin className={isDark ? "text-[#60efff]" : "text-blue-600"} />
            Aloqa Ma'lumotlari
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Manzil ({activeLang.toUpperCase()})</label>
              <input type="text" name="contactAddress" value={formData.contactAddress?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mo'ljal ({activeLang.toUpperCase()})</label>
              <input type="text" name="contactLandmark" value={formData.contactLandmark?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon (Umumiy)</label>
              <input type="text" name="contactPhone" value={formData.contactPhone || ''} onChange={handleStringChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email (Umumiy)</label>
              <input type="text" name="contactEmail" value={formData.contactEmail || ''} onChange={handleStringChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Ish vaqti ({activeLang.toUpperCase()})</label>
              <input type="text" name="contactSchedule" value={formData.contactSchedule?.[activeLang] || ''} onChange={handleLocalizedChange} className={inputClass} />
            </div>
          </div>
        </div>

        <hr className={isDark ? "border-slate-800" : "border-slate-100"} />

        {/* Videos */}
        <div>
          <h2 className={sectionTitleClass}>
            <Video className={isDark ? "text-[#60efff]" : "text-blue-600"} />
            Videolar (Umumiy)
          </h2>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>DATAga Sayohat (YouTube Embed URL)</label>
              <input type="text" name="tourVideoUrl" value={formData.tourVideoUrl || ''} onChange={handleStringChange} className={`${inputClass} font-mono text-sm`} />
            </div>

            <div>
              <label className={labelClass}>O'quvchilar Fikri (YouTube Shorts ID'lari)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.testimonialVideos.map((id, idx) => (
                  <div key={idx}>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Video {idx + 1} ID</label>
                    <input type="text" value={id} onChange={(e) => handleTestimonialChange(idx, e.target.value)} className={`${inputClass} font-mono text-sm`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className={isDark ? "border-slate-800" : "border-slate-100"} />

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <ImageIcon className={isDark ? "text-[#60efff]" : "text-blue-600"} />
              Galereya Rasmlari (Umumiy)
            </h2>
            <button onClick={addGalleryImage} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-[#60efff] hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>
              <Plus size={18} /> Rasm qo'shish
            </button>
          </div>
          <div className="space-y-4">
            {formData.galleryImages.map((url, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                {url && (
                  <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={(e) => handleGalleryUpload(idx, e)} className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0061ff]/10 file:text-[#0061ff] hover:file:bg-[#0061ff]/20 transition-all focus:outline-none`} />
                </div>
                <button onClick={() => removeGalleryImage(idx)} className={`p-3 rounded-xl transition-colors shrink-0 ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex justify-end sticky bottom-8 z-20">
          <button onClick={handleSave} className="bg-[#0061ff] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
            <Save size={20} />
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
