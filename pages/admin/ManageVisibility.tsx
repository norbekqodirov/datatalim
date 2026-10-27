import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import { PageHeader, Switch, Spinner } from '../../components/admin/ui/kit';

const GROUPS: { title: string; desc: string; items: { key: string; label: string; desc: string }[] }[] = [
  {
    title: 'Bosh sahifa',
    desc: 'Mehmon birinchi ko\'radigan qismlar.',
    items: [
      { key: 'hero', label: 'Bosh qism (Hero)', desc: 'Birinchi ekrandagi sarlavha va asosiy tugma' },
      { key: 'about', label: 'Biz haqimizda', desc: 'Markaz va asoschi haqida qisqa blok' },
      { key: 'tourVideo', label: 'DATAga sayohat (video)', desc: 'Markaz bo\'ylab tur videosi' },
    ],
  },
  {
    title: 'Taʼlim',
    desc: 'Kurslar va ularni tanlashga yordam beruvchi qismlar.',
    items: [
      { key: 'courses', label: 'Kurslar', desc: 'Yoʻnalishlar va kurs kartochkalari' },
      { key: 'careerTest', label: 'Karyera testi', desc: 'Mos kasbni aniqlovchi interaktiv test' },
      { key: 'testimonials', label: 'Oʻquvchilar fikri', desc: 'Video sharhlar (YouTube Shorts)' },
    ],
  },
  {
    title: 'Markaz haqida',
    desc: 'Ishonch uyg\'otuvchi va tanishtiruvchi qismlar.',
    items: [
      { key: 'facilities', label: 'Sharoitlar', desc: 'Oʻquv xonalari va qulayliklar' },
      { key: 'team', label: 'Jamoa', desc: 'Ustozlar va xodimlar' },
      { key: 'gallery', label: 'Galereya', desc: 'Markazdan olingan rasmlar' },
    ],
  },
  {
    title: 'Yordam va aloqa',
    desc: 'Savollarga javob va bogʻlanish.',
    items: [
      { key: 'faq', label: 'Koʻp beriladigan savollar (FAQ)', desc: 'Savol-javoblar bloki' },
      { key: 'contact', label: 'Aloqa', desc: 'Manzil, telefon va xarita' },
    ],
  },
];

export default function ManageVisibility() {
  const { visibility, toggleSectionVisibility } = useStore();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleToggle = async (key: string) => {
    setSavingKey(key);
    try {
      await toggleSectionVisibility(key as keyof typeof visibility);
      toast.success('Holat o\'zgartirildi!');
    } catch (error) {
      toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setSavingKey(null);
    }
  };

  const all = GROUPS.flatMap(g => g.items);
  const visibleCount = all.filter(s => visibility[s.key as keyof typeof visibility]).length;

  return (
    <div>
      <PageHeader
        kicker="Tizim"
        title="Bo'limlar ko'rinishi"
        sub="Saytning qaysi qismlari mehmonlarga ko'rinishini boshqaring. O'zgarish darhol saqlanadi."
        actions={<span className="a-badge is-blue">{visibleCount} / {all.length} ko&apos;rinadi</span>}
      />

      <div className="grid gap-4">
        {GROUPS.map(group => (
          <section key={group.title} className="a-card" aria-labelledby={`vis-${group.title}`}>
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--a-line)' }}>
              <h2 id={`vis-${group.title}`} className="a-h2">{group.title}</h2>
              <p className="a-sub" style={{ fontSize: '.8rem' }}>{group.desc}</p>
            </div>
            <ul>
              {group.items.map(({ key, label, desc }, i) => {
                const isVisible = !!visibility[key as keyof typeof visibility];
                const busy = savingKey === key;
                return (
                  <li key={key} className="flex items-center gap-4 px-5 py-2.5" style={i > 0 ? { borderTop: '1px solid var(--a-line)' } : undefined}>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[.95rem]">{label}</div>
                      <div className="a-sub" style={{ fontSize: '.78rem' }}>{desc}</div>
                    </div>
                    <span className={`a-badge hidden sm:inline-flex ${isVisible ? 'is-green' : ''}`}>{isVisible ? 'Ko\'rinadi' : 'Yashirin'}</span>
                    {busy ? <span className="a-switch-hit a-muted"><Spinner size={18} /></span> : (
                      <Switch checked={isVisible} onChange={() => handleToggle(key)} label={`${label}: ${isVisible ? 'yashirish' : 'ko\'rsatish'}`} disabled={savingKey !== null} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
