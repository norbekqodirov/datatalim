import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Link2, Check } from 'lucide-react';
import { SEO, articleSchema, SITE_URL } from '../components/SEO';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';
import DOMPurify from 'dompurify';

// --- Blog HTML sanitizer (XSS himoyasi) ---
// Faqat YouTube embed'lariga ruxsat; qolgan iframe'lar o'chiriladi.
const YT_EMBED_RE = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'IFRAME') {
    const src = node.getAttribute('src') || '';
    if (!YT_EMBED_RE.test(src)) {
      node.parentNode?.removeChild(node);
      return;
    }
    node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
    node.setAttribute('loading', 'lazy');
  }
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const sanitizePostHtml = (html: string): string =>
  DOMPurify.sanitize(html || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
  });

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
  published_at?: string | null;
  updated_at?: string | null;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${encodeURIComponent(slug ?? '')}`)
      .then(res => (res.ok ? res.json() : null))
      // 404 javobi ({ error }) post sifatida qabul qilinmasligi kerak
      .then(data => setPost(data && data.id && data.slug ? data : null))
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
        <SEO title="Maqola topilmadi" noindex />
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {lang === 'ru' ? 'Статья не найдена' : lang === 'en' ? 'Post not found' : 'Maqola topilmadi'}
        </h1>
        <Link to="/blog" className="text-[#0061ff] font-bold hover:underline">
          {lang === 'ru' ? 'Назад к блогу' : lang === 'en' ? 'Back to blog' : 'Blogga qaytish'}
        </Link>
      </div>
    );
  }

  const title = getTitle(post);
  const content = sanitizePostHtml(getContent(post));

  return (
    <>
      <SEO
        title={title}
        description={(lang === 'ru' ? post.excerpt_ru : lang === 'en' ? post.excerpt_en : post.excerpt_uz) || post.excerpt_uz || undefined}
        type="article"
        url={`${SITE_URL}/blog/${post.slug}`}
        image={post.cover_image ? (post.cover_image.startsWith('http') ? post.cover_image : `${SITE_URL}${post.cover_image}`) : undefined}
        jsonLd={articleSchema({
          title,
          description: post.excerpt_uz || title,
          url: `${SITE_URL}/blog/${post.slug}`,
          image: post.cover_image ? (post.cover_image.startsWith('http') ? post.cover_image : `${SITE_URL}${post.cover_image}`) : undefined,
          datePublished: post.published_at || post.created_at || new Date().toISOString(),
          dateModified: post.updated_at || undefined,
        })}
      />

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
