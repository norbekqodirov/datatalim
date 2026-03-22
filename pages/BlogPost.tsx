import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Link2, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';

interface Post {
  id: number;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  cover_image: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const getTitle = (p: Post) => {
    if (lang === 'ru' && p.title_ru) return p.title_ru;
    if (lang === 'en' && p.title_en) return p.title_en;
    return p.title_uz;
  };

  const getContent = (p: Post) => {
    if (lang === 'ru' && p.content_ru) return p.content_ru;
    if (lang === 'en' && p.content_en) return p.content_en;
    return p.content_uz;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061ff]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-32 gap-4">
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'ru' ? 'Статья не найдена' : lang === 'en' ? 'Post not found' : 'Maqola topilmadi'}
        </p>
        <Link to="/blog" className="text-[#0061ff] font-bold hover:underline">
          {lang === 'ru' ? 'Назад к блогу' : lang === 'en' ? 'Back to blog' : 'Blogga qaytish'}
        </Link>
      </div>
    );
  }

  const title = getTitle(post);
  const content = getContent(post);

  return (
    <>
      <Helmet>
        <title>{title} | DATA Ta'lim</title>
        <meta name="description" content={(lang === 'ru' ? post.excerpt_ru : lang === 'en' ? post.excerpt_en : post.excerpt_uz) || ''} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            to="/blog"
            className={`inline-flex items-center gap-2 text-sm font-bold mb-8 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft size={16} />
            {lang === 'ru' ? 'Назад к блогу' : lang === 'en' ? 'Back to blog' : 'Blogga qaytish'}
          </Link>

          {/* Cover image */}
          {post.cover_image && (
            <div className="rounded-3xl overflow-hidden mb-8">
              <img src={post.cover_image} alt={title} className="w-full aspect-video object-cover" />
            </div>
          )}

          {/* Header */}
          <div className={`rounded-3xl p-8 mb-8 ${
            isDark
              ? 'bg-slate-800/60 backdrop-blur-xl border border-white/10'
              : 'bg-white shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.category && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                  isDark ? 'bg-blue-500/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'
                }`}>
                  <Tag size={12} />
                  {post.category}
                </span>
              )}
              <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Calendar size={14} />
                {new Date(post.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ')}
              </span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h1>

            {/* Share */}
            <button
              onClick={copyLink}
              className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
              {copied
                ? (lang === 'ru' ? 'Скопировано!' : lang === 'en' ? 'Copied!' : 'Nusxalandi!')
                : (lang === 'ru' ? 'Копировать ссылку' : lang === 'en' ? 'Copy link' : 'Havolani nusxalash')
              }
            </button>
          </div>

          {/* Content */}
          <div
            className={`rounded-3xl p-8 prose prose-lg max-w-none ${
              isDark
                ? 'bg-slate-800/60 backdrop-blur-xl border border-white/10 prose-invert'
                : 'bg-white shadow-sm'
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </article>
    </>
  );
};

export default BlogPost;
