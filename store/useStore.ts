import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { coursesData as initialCourses, Course } from '../data/courses';
import { LocalizedString } from '../types';

export interface TeamMember {
  id: string;
  name: LocalizedString;

  role: LocalizedString;
  image: string;
  bio: LocalizedString;
  skills: LocalizedString[];
}

const initialTeam: TeamMember[] = [
  {
    id: '1',
    name: { uz: "Shovvozbek Sattarov", ru: "Shovvozbek Sattarov", en: "Shovvozbek Sattarov" },
    role: { uz: "Ijrochi Direktor", ru: "Ijrochi Direktor", en: "Ijrochi Direktor" },
    image: "https://picsum.photos/seed/shovvoz/400/500",
    bio: { uz: "DATA Ta'lim Stansiyasining kundalik operatsiyalari va strategik rivojlanishiga mas'ul. Ta'lim menejmenti sohasida 5 yildan ortiq tajribaga ega.", ru: "DATA Ta'lim Stansiyasining kundalik operatsiyalari va strategik rivojlanishiga mas'ul. Ta'lim menejmenti sohasida 5 yildan ortiq tajribaga ega.", en: "DATA Ta'lim Stansiyasining kundalik operatsiyalari va strategik rivojlanishiga mas'ul. Ta'lim menejmenti sohasida 5 yildan ortiq tajribaga ega." },
    skills: [{ uz: "Menejment", ru: "Menejment", en: "Menejment" }, { uz: "Strategiya", ru: "Strategiya", en: "Strategiya" }, { uz: "Liderlik", ru: "Liderlik", en: "Liderlik" }]
  },
  {
    id: '2',
    name: { uz: "Shahruza Sultonova", ru: "Shahruza Sultonova", en: "Shahruza Sultonova" },
    role: { uz: "DATA Languages Rahbari", ru: "DATA Languages Rahbari", en: "DATA Languages Rahbari" },
    image: "https://picsum.photos/seed/shahruza/400/500",
    bio: { uz: "Xorijiy tillar bo'limi rahbari. Zamonaviy til o'rgatish metodikalari va xalqaro sertifikatlar bo'yicha mutaxassis.", ru: "Xorijiy tillar bo'limi rahbari. Zamonaviy til o'rgatish metodikalari va xalqaro sertifikatlar bo'yicha mutaxassis.", en: "Xorijiy tillar bo'limi rahbari. Zamonaviy til o'rgatish metodikalari va xalqaro sertifikatlar bo'yicha mutaxassis." },
    skills: [{ uz: "IELTS", ru: "IELTS", en: "IELTS" }, { uz: "Metodika", ru: "Metodika", en: "Metodika" }, { uz: "Jamoa boshqaruvi", ru: "Jamoa boshqaruvi", en: "Jamoa boshqaruvi" }]
  },
  {
    id: '3',
    name: { uz: "Boymirza Qalandarov", ru: "Boymirza Qalandarov", en: "Boymirza Qalandarov" },
    role: { uz: "Moliya Bo'limi Rahbari", ru: "Moliya Bo'limi Rahbari", en: "Moliya Bo'limi Rahbari" },
    image: "https://picsum.photos/seed/boymirza/400/500",
    bio: { uz: "Kompaniyaning moliyaviy barqarorligi va investitsiya loyihalari uchun javobgar. Moliyaviy tahlil va rejalashtirish bo'yicha ekspert.", ru: "Kompaniyaning moliyaviy barqarorligi va investitsiya loyihalari uchun javobgar. Moliyaviy tahlil va rejalashtirish bo'yicha ekspert.", en: "Kompaniyaning moliyaviy barqarorligi va investitsiya loyihalari uchun javobgar. Moliyaviy tahlil va rejalashtirish bo'yicha ekspert." },
    skills: [{ uz: "Moliya", ru: "Moliya", en: "Moliya" }, { uz: "Tahlil", ru: "Tahlil", en: "Tahlil" }, { uz: "Buxgalteriya", ru: "Buxgalteriya", en: "Buxgalteriya" }]
  },
  {
    id: '4',
    name: { uz: "Shonazar Xudoyberganov", ru: "Shonazar Xudoyberganov", en: "Shonazar Xudoyberganov" },
    role: { uz: "Ta'lim Bo'limi Rahbari", ru: "Ta'lim Bo'limi Rahbari", en: "Ta'lim Bo'limi Rahbari" },
    image: "https://picsum.photos/seed/shonazar/400/500",
    bio: { uz: "O'quv dasturlarini ishlab chiqish va sifat nazorati bo'yicha rahbar. IT ta'limida innovatsion yondashuvlar tarafdori.", ru: "O'quv dasturlarini ishlab chiqish va sifat nazorati bo'yicha rahbar. IT ta'limida innovatsion yondashuvlar tarafdori.", en: "O'quv dasturlarini ishlab chiqish va sifat nazorati bo'yicha rahbar. IT ta'limida innovatsion yondashuvlar tarafdori." },
    skills: [{ uz: "Ta'lim sifati", ru: "Ta'lim sifati", en: "Ta'lim sifati" }, { uz: "O'quv dasturlari", ru: "O'quv dasturlari", en: "O'quv dasturlari" }, { uz: "IT", ru: "IT", en: "IT" }]
  },
  {
    id: '5',
    name: { uz: "Azizbek Bekturdiyev", ru: "Azizbek Bekturdiyev", en: "Azizbek Bekturdiyev" },
    role: { uz: "Katta Dasturlash Ustoz", ru: "Katta Dasturlash Ustoz", en: "Katta Dasturlash Ustoz" },
    image: "https://picsum.photos/seed/azizbek/400/500",
    bio: { uz: "Full-stack dasturchi va tajribali ustoz. O'nlarcha muvaffaqiyatli loyihalar muallifi va yuzlab shogirdlar ustozi.", ru: "Full-stack dasturchi va tajribali ustoz. O'nlarcha muvaffaqiyatli loyihalar muallifi va yuzlab shogirdlar ustozi.", en: "Full-stack dasturchi va tajribali ustoz. O'nlarcha muvaffaqiyatli loyihalar muallifi va yuzlab shogirdlar ustozi." },
    skills: [{ uz: "React", ru: "React", en: "React" }, { uz: "Node.js", ru: "Node.js", en: "Node.js" }, { uz: "Python", ru: "Python", en: "Python" }]
  },
  {
    id: '6',
    name: { uz: "Malika Karimova", ru: "Malika Karimova", en: "Malika Karimova" },
    role: { uz: "Katta Dizayn Ustoz", ru: "Katta Dizayn Ustoz", en: "Katta Dizayn Ustoz" },
    image: "https://picsum.photos/seed/malika/400/500",
    bio: { uz: "UI/UX va Grafik dizayn bo'yicha yetakchi mutaxassis. Kreativ fikrlash va zamonaviy dizayn trendlari bo'yicha ekspert.", ru: "UI/UX va Grafik dizayn bo'yicha yetakchi mutaxassis. Kreativ fikrlash va zamonaviy dizayn trendlari bo'yicha ekspert.", en: "UI/UX va Grafik dizayn bo'yicha yetakchi mutaxassis. Kreativ fikrlash va zamonaviy dizayn trendlari bo'yicha ekspert." },
    skills: [{ uz: "Figma", ru: "Figma", en: "Figma" }, { uz: "Adobe CC", ru: "Adobe CC", en: "Adobe CC" }, { uz: "UI/UX", ru: "UI/UX", en: "UI/UX" }]
  }
];

export interface SiteContent {
  heroTitle: LocalizedString;
  heroSubtitle: LocalizedString;
  heroDescription: LocalizedString;
  tourVideoUrl: string;
  testimonialVideos: string[];
  aboutTitle: LocalizedString;
  aboutDescription: LocalizedString;
  aboutQuote: LocalizedString;
  aboutImage: string;
  contactAddress: LocalizedString;
  contactLandmark: LocalizedString;
  contactPhone: string;
  contactEmail: string;
  contactSchedule: LocalizedString;
  galleryImages: string[];
}

const initialSiteContent: SiteContent = {
  heroTitle: { uz: "Zamonaviy kasblarni biz bilan", ru: "Zamonaviy kasblarni biz bilan", en: "Zamonaviy kasblarni biz bilan" },
  heroSubtitle: { uz: "o'rganing.", ru: "o'rganing.", en: "o'rganing." },
  heroDescription: { uz: "DATA Ta'lim Stansiyasi — 7 yoshdan yuqori bo'lgan barcha uchun IT va zamonaviy kasblarni o'rgatuvchi innovatsion markaz.", ru: "DATA Ta'lim Stansiyasi — 7 yoshdan yuqori bo'lgan barcha uchun IT va zamonaviy kasblarni o'rgatuvchi innovatsion markaz.", en: "DATA Ta'lim Stansiyasi — 7 yoshdan yuqori bo'lgan barcha uchun IT va zamonaviy kasblarni o'rgatuvchi innovatsion markaz." },
  tourVideoUrl: "https://www.youtube.com/embed/pGHOIuzeVlI?si=ZT4PSM1PZsLywt6-&rel=0",
  testimonialVideos: [
    "0rupVUwcI1M",
    "nAVNrKrVxYQ",
    "guW3gO2X10s"
  ],
  aboutTitle: { uz: "Biz shunchaki o'quv markazi emasmiz", ru: "Biz shunchaki o'quv markazi emasmiz", en: "Biz shunchaki o'quv markazi emasmiz" },
  aboutDescription: { uz: "\"DATA UNION\" — mustaqil, o‘z rivojlanish strategiyasi, qadriyatlari va maqsadlariga ega kompaniya. Biz 2019-yilda tashkil topganmiz va shu kungacha minglab yoshlarga innovatsion texnologiyalar bo‘yicha ta’lim berib kelmoqdamiz.", ru: "\"DATA UNION\" — mustaqil, o‘z rivojlanish strategiyasi, qadriyatlari va maqsadlariga ega kompaniya. Biz 2019-yilda tashkil topganmiz va shu kungacha minglab yoshlarga innovatsion texnologiyalar bo‘yicha ta’lim berib kelmoqdamiz.", en: "\"DATA UNION\" — mustaqil, o‘z rivojlanish strategiyasi, qadriyatlari va maqsadlariga ega kompaniya. Biz 2019-yilda tashkil topganmiz va shu kungacha minglab yoshlarga innovatsion texnologiyalar bo‘yicha ta’lim berib kelmoqdamiz." },
  aboutQuote: { uz: "\"Bizning maqsadimiz — yuqori malakali, ijodiy fikrlaydigan va jamiyatimizga ijobiy ta’sir qiladigan avlodni yetishtirishdir.\"", ru: "\"Bizning maqsadimiz — yuqori malakali, ijodiy fikrlaydigan va jamiyatimizga ijobiy ta’sir qiladigan avlodni yetishtirishdir.\"", en: "\"Bizning maqsadimiz — yuqori malakali, ijodiy fikrlaydigan va jamiyatimizga ijobiy ta’sir qiladigan avlodni yetishtirishdir.\"" },
  aboutImage: "https://picsum.photos/seed/shahzod/600/700",
  contactAddress: { uz: "Xorazm viloyati, Urganch sh., V.Fayozov ko'chasi, 9-uy", ru: "Xorazm viloyati, Urganch sh., V.Fayozov ko'chasi, 9-uy", en: "Xorazm viloyati, Urganch sh., V.Fayozov ko'chasi, 9-uy" },
  contactLandmark: { uz: "Mo'ljal: Darital savdo markazi yonida", ru: "Mo'ljal: Darital savdo markazi yonida", en: "Mo'ljal: Darital savdo markazi yonida" },
  contactPhone: "+998 62 227-72-22",
  contactEmail: "dataunionuz@gmail.com",
  contactSchedule: { uz: "Har kuni 09:00 dan 18:00 gacha", ru: "Har kuni 09:00 dan 18:00 gacha", en: "Har kuni 09:00 dan 18:00 gacha" },
  galleryImages: [
    "https://picsum.photos/seed/gallery1/800/600",
    "https://picsum.photos/seed/gallery2/800/600",
    "https://picsum.photos/seed/gallery3/800/600",
    "https://picsum.photos/seed/gallery4/800/600",
    "https://picsum.photos/seed/gallery5/800/600",
    "https://picsum.photos/seed/gallery6/800/600"
  ]
};

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  tourVideo: boolean;
  courses: boolean;
  testimonials: boolean;
  careerTest: boolean;
  facilities: boolean;
  team: boolean;
  faq: boolean;
  gallery: boolean;
  contact: boolean;
}

const initialVisibility: SectionVisibility = {
  hero: true,
  about: true,
  tourVideo: true,
  courses: true,
  testimonials: true,
  careerTest: true,
  facilities: true,
  team: true,
  faq: true,
  gallery: true,
  contact: true,
};

interface AppState {
  courses: Course[];
  team: TeamMember[];
  siteContent: SiteContent;
  visibility: SectionVisibility;

  // Actions
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  setTeam: (team: TeamMember[]) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  updateSiteContent: (content: Partial<SiteContent>) => void;
  toggleSectionVisibility: (section: keyof SectionVisibility) => void;

  resetToDefaults: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      courses: initialCourses,
      team: initialTeam,
      siteContent: initialSiteContent,
      visibility: initialVisibility,

      setCourses: (courses) => set({ courses }),
      addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
      updateCourse: (id, updatedCourse) => set((state) => ({
        courses: state.courses.map(c => c.id === id ? { ...c, ...updatedCourse } : c)
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),

      setTeam: (team) => set({ team }),
      addTeamMember: (member) => set((state) => ({ team: [...state.team, member] })),
      updateTeamMember: (id, updatedMember) => set((state) => ({
        team: state.team.map(m => m.id === id ? { ...m, ...updatedMember } : m)
      })),
      deleteTeamMember: (id) => set((state) => ({
        team: state.team.filter(m => m.id !== id)
      })),

      updateSiteContent: (content) => set((state) => ({
        siteContent: { ...state.siteContent, ...content }
      })),

      toggleSectionVisibility: (section) => set((state) => ({
        visibility: { ...state.visibility, [section]: !state.visibility[section] }
      })),

      resetToDefaults: () => set({
        courses: initialCourses,
        team: initialTeam,
        siteContent: initialSiteContent,
        visibility: initialVisibility
      })
    }),
    {
      name: 'data-talim-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Reset to defaults if old data format
          return {
            ...persistedState,
            courses: initialCourses,
            team: initialTeam,
            siteContent: initialSiteContent,
            visibility: initialVisibility
          };
        }
        return persistedState as AppState;
      },
    }
  )
);
