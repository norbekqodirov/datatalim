import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search, X } from 'lucide-react';
import { useScroll } from 'framer-motion';
import { SEO } from '../components/SEO';
import { useLanguage } from '../i18n';
import { uz, useMotionReduced } from '../components/v2/utils';
import { Mask, Star3D } from '../components/v2/fx';
import { PostCover } from '../components/v2/pages/blog/PostCover';
import { Reveal } from '../components/v2/pages/blog/Reveal';
import { Star4 } from '../components/v2/pages/blog/Star';
import {
  BlogPostData as Post,
  postTitle,
  postExcerpt,
  postDate,
  formatDate,
  readingMinutes,
  postContent,
} from '../components/v2/pages/blog/blogUtils';
import '../components/v2/v2.css';
import '../components/v2/pages/blog/blog.css';

const Meta: React.FC<{ post: Post; lang: string }> = ({ post, lang }) => {
  const d = postDate(post);
  const mins = readingMinutes(postContent(post, lang));
  return (
    <p className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] ink-3">
      {post.category && <span className="ink-cyan uppercase tracking-[0.12em]">{uz(post.category)}</span>}
      {post.category && d && <span className="meta-dot" aria-hidden="true" />}
      {d && <time dateTime={d.toISOString()}>{formatDate(d, lang)}</time>}
      <span className="meta-dot" aria-hidden="true" />
      <span>{mins} daqiqa</span>
    </p>
  );
};

const Blog: React.FC = () => {
  const { lang, t } = useLanguage();
  const reduced = useMotionReduced();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  useEffect(() => {
    fetch('/api/posts?published=1')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean) as string[]);
    return Array.from(cats);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      const matchSearch = !q || postTitle(p, lang).toLowerCase().includes(q);
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, search, selectedCategory, lang]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const filtering = !!search.trim() || !!selectedCategory;
  const clear = () => {
    setSearch('');
    setSelectedCategory('');
  };

  return (
    <div className="v2">
      <SEO title="Blog" description="IT, dizayn va zamonaviy kasblar haqida foydali maqolalar — DATA Ta'lim Stansiyasi blogi." />

      {/* ---------------------------------------------------------------- masthead */}
      <header ref={heroRef} className="relative overflow-hidden pt-32 sm:pt-40 pb-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 55% at 80% 20%, rgba(0,97,255,.16), transparent 70%)' }}
        />
        {!reduced && (
          <Star3D
            progress={scrollYProgress}
            layers={7}
            spin={60}
            className="pointer-events-none absolute -right-16 sm:right-[6%] top-20 w-56 h-56 sm:w-80 sm:h-80 lg:w-[26rem] lg:h-[26rem] opacity-40 sm:opacity-80"
          />
        )}
        <div className="wrap relative">
          <p className="t-kicker mb-6 flex items-center gap-3">
            <Star4 className="w-3.5 h-3.5 ink-cyan" />
            DATA · Jurnal
          </p>
          <Mask>
            <h1 className="t-display">
              <span className="ink-grad">{t('nav.blog') || 'Blog'}</span>
            </h1>
          </Mask>
          <p className="t-lead mt-6 max-w-[34rem]">{uz("Eng so'nggi maqolalar va yangiliklar")}</p>
        </div>
      </header>

      {/* ---------------------------------------------------------------- filters */}
      <section aria-label="Qidiruv va toifalar" className="wrap pb-10">
        <div className="hairline pt-8 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="search-wrap w-full lg:max-w-md">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Maqolalarni qidirish"
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field"
            />
          </div>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Toifalar">
            <button type="button" className="chip" aria-pressed={!selectedCategory} onClick={() => setSelectedCategory('')}>
              Barchasi
            </button>
            {categories.map(cat => (
              <button key={cat} type="button" className="chip" aria-pressed={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                {uz(cat)}
              </button>
            ))}
          </div>
          {!loading && posts.length > 0 && (
            <p className="mono text-[0.8125rem] ink-3 lg:ml-auto" aria-live="polite">
              {filtered.length} / {posts.length}
            </p>
          )}
        </div>
      </section>

      <section aria-label="Maqolalar" className="wrap pb-[12vh]" aria-busy={loading}>
        {/* ---------------------------------------------------------------- loading */}
        {loading && (
          <div aria-label="Yuklanmoqda" role="status">
            <div className="panel grid lg:grid-cols-12 gap-0 overflow-hidden">
              <div className="lg:col-span-7 skeleton aspect-[16/10] !rounded-none" />
              <div className="lg:col-span-5 p-8 lg:p-12 space-y-4">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-4/5" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-4">
                  <div className="skeleton aspect-[16/10]" />
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-7 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- featured */}
        {!loading && featured && (
          <Reveal>
            <article className="panel post-card overflow-hidden relative">
              <Link to={`/blog/${featured.slug}`} className="post-link grid lg:grid-cols-12 items-stretch !rounded-[var(--radius)]">
                <div className="lg:col-span-7 p-3 sm:p-4">
                  <PostCover
                    src={featured.cover_image}
                    title={postTitle(featured, lang)}
                    category={featured.category}
                    seed={featured.id}
                    big
                    className="!aspect-[16/10] lg:!aspect-auto lg:h-full lg:min-h-[26rem]"
                  />
                </div>
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-12 flex flex-col justify-center gap-6">
                  <p className="t-kicker flex items-center gap-2">
                    <Star4 className="w-3 h-3 ink-cyan" />
                    {filtering ? 'Natija' : 'Eng soʻnggi maqola'}
                  </p>
                  <h2 className="feature-title post-title-link">{uz(postTitle(featured, lang))}</h2>
                  {postExcerpt(featured, lang) && <p className="t-lead clamp-3">{uz(postExcerpt(featured, lang))}</p>}
                  <Meta post={featured} lang={lang} />
                  <span className="link-arrow">
                    Oʻqish <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </article>
          </Reveal>
        )}

        {/* ---------------------------------------------------------------- grid */}
        {!loading && rest.length > 0 && (
          <>
            <div className="mt-16 mb-8 flex items-center gap-4">
              <h2 className="t-kicker">Barcha maqolalar</h2>
              <span className="h-px flex-1" style={{ background: 'var(--line)' }} aria-hidden="true" />
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {rest.map((post, i) => (
                <Reveal as="li" key={post.id} delay={(i % 3) * 0.08}>
                  <article className="post-card h-full">
                    <Link to={`/blog/${post.slug}`} className="post-link">
                      <PostCover src={post.cover_image} title={postTitle(post, lang)} category={post.category} seed={post.id} />
                      <div className="pt-5 flex flex-col gap-3">
                        <Meta post={post} lang={lang} />
                        <h3 className="t-h3 clamp-2 post-title-link">{uz(postTitle(post, lang))}</h3>
                        {postExcerpt(post, lang) && <p className="t-body clamp-3">{uz(postExcerpt(post, lang))}</p>}
                      </div>
                    </Link>
                  </article>
                </Reveal>
              ))}
            </ul>
          </>
        )}

        {/* ---------------------------------------------------------------- empty */}
        {!loading && filtered.length === 0 && (
          <Reveal>
            <div className="panel relative overflow-hidden px-6 py-16 sm:py-24 text-center">
              <Star4 className="absolute -right-10 -top-10 w-56 h-56 opacity-[0.07] ink-cyan" />
              <Star4 className="mx-auto w-8 h-8 ink-cyan" />
              <p className="t-h3 mt-6">Maqolalar topilmadi</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {filtering ? (
                  <button type="button" onClick={clear} className="btn btn-ghost">
                    <X size={18} aria-hidden="true" /> Filtrni tozalash
                  </button>
                ) : (
                  <Link to="/karyera-testi" className="btn btn-primary">
                    Karyera testi <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
};

export default Blog;
