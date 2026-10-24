import { uz } from '../../utils';

export interface BlogPostData {
  id: number;
  slug: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  content_uz?: string;
  content_ru?: string;
  content_en?: string;
  excerpt_uz?: string;
  excerpt_ru?: string;
  excerpt_en?: string;
  cover_image?: string;
  category?: string;
  is_published?: boolean | number;
  created_at: string;
  published_at?: string | null;
  updated_at?: string | null;
}

type Lang = string;

export const postTitle = (p: BlogPostData, lang: Lang) => {
  if (lang === 'ru' && p.title_ru) return p.title_ru;
  if (lang === 'en' && p.title_en) return p.title_en;
  return p.title_uz;
};

export const postExcerpt = (p: BlogPostData, lang: Lang) => {
  if (lang === 'ru' && p.excerpt_ru) return p.excerpt_ru;
  if (lang === 'en' && p.excerpt_en) return p.excerpt_en;
  return p.excerpt_uz || '';
};

export const postContent = (p: BlogPostData, lang: Lang) => {
  if (lang === 'ru' && p.content_ru) return p.content_ru;
  if (lang === 'en' && p.content_en) return p.content_en;
  return p.content_uz || '';
};

const MONTHS_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** SQLite-style "2026-03-18 15:49:58" is not valid ISO in every browser. */
export const parseDate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + (s.length <= 10 ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const postDate = (p: BlogPostData) => parseDate(p.published_at) || parseDate(p.created_at);

export const formatDate = (d: Date | null, lang: Lang): string => {
  if (!d) return '';
  if (lang === 'ru') return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  if (lang === 'en') return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  return uz(`${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`);
};

/** Words in the visible text of a markdown/HTML string. */
export const countWords = (src: string): number => {
  const text = src
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ');
  const m = text.match(/[\p{L}\p{N}ʻʼ'’-]+/gu);
  return m ? m.length : 0;
};

/** Estimated reading time in whole minutes (at least 1), ~200 words/min. */
export const readingMinutes = (src: string): number => Math.max(1, Math.round(countWords(src) / 200));
