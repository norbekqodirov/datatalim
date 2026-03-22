import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Tag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';

interface Post {
  id: number;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  cover_image: string;
  category: string;
  created_at: string;
}

const Blog: React.FC = () => {
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetch('/api/posts?published=1')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const getTitle = (post: Post) => {
    if (lang === 'ru' && post.title_ru) return post.title_ru;
    if (lang === 'en' && post.title_en) return post.title_en;
    return post.title_uz;
  };

  const getExcerpt = (post: Post) => {
    if (lang === 'ru' && post.excerpt_ru) return post.excerpt_ru;
    if (lang === 'en' && post.excerpt_en) return post.excerpt_en;
    return post.excerpt_uz;
  };

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const title = getTitle(p).toLowerCase();
      const matchSearch = !search || title.includes(search.toLowerCase());
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [posts, search, selectedCategory, lang]);

  return (
    <>
      <Helmet>
        <title>{t('nav.blog') || 'Blog'} | DATA Ta'lim</title>
      </Helmet>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('nav.blog') || 'Blog'}
          </h1>
          <p className={`text-lg mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'ru' ? 'Последние статьи и новости' : lang === 'en' ? 'Latest articles and news' : 'Eng so\'nggi maqolalar va yangiliklar'}
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder={lang === 'ru' ? 'Поиск...' : lang === 'en' ? 'Search...' : 'Qidirish...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800/60 text-white border border-white/10 focus:border-blue-500/50 placeholder-slate-500'
                    : 'bg-white text-slate-900 border border-slate-200 focus:border-blue-400 placeholder-slate-400 shadow-sm'
                }`}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  !selectedCategory
                    ? 'bg-[#0061ff] text-white'
                    : isDark ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lang === 'ru' ? 'Все' : lang === 'en' ? 'All' : 'Barchasi'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0061ff] text-white'
                      : isDark ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061ff]" />
            </div>
          )}

          {/* Posts Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className={`group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDark
                      ? 'bg-slate-800/60 backdrop-blur-xl border border-white/10 hover:border-white/20'
                      : 'bg-white shadow-sm hover:shadow-lg'
                  }`}
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={getTitle(post)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                        isDark ? 'bg-blue-500/15 text-[#60efff]' : 'bg-blue-50 text-[#0061ff]'
                      }`}>
                        <Tag size={12} />
                        {post.category}
                      </span>
                    )}
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {getTitle(post)}
                    </h3>
                    {getExcerpt(post) && (
                      <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {getExcerpt(post)}
                      </p>
                    )}
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Calendar size={14} />
                      {new Date(post.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className={`text-center py-20 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <p className="text-lg font-medium">
                {lang === 'ru' ? 'Статьи не найдены' : lang === 'en' ? 'No posts found' : 'Maqolalar topilmadi'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
