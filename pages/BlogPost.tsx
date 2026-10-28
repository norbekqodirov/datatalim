import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Link2, Share2 } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { SEO, articleSchema, SITE_URL } from '../components/SEO';
import { EnrollModal } from '../components/EnrollModal';
import { useLanguage } from '../i18n';
import { uz, useMotionReduced, v2Toast } from '../components/v2/utils';
import { Mask } from '../components/v2/fx';
import { PostCover } from '../components/v2/pages/blog/PostCover';
import { Reveal } from '../components/v2/pages/blog/Reveal';
import { Star4 } from '../components/v2/pages/blog/Star';
import { renderPostMarkdown } from '../components/v2/pages/blog/markdown';
import {
  BlogPostData as Post,
  postTitle,
  postExcerpt,
  postContent,
  postDate,
  formatDate,
  readingMinutes,
} from '../components/v2/pages/blog/blogUtils';
import '../components/v2/v2.css';
import '../components/v2/pages/blog/blog.css';

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

const absUrl = (src?: string) => (src ? (src.startsWith('http') ? src : `${SITE_URL}${src}`) : undefined);

// ---------------------------------------------------------------- reading progress
const ReadingProgress: React.FC<{ target: React.RefObject<HTMLElement | null> }> = ({ target }) => {
  const reduced = useMotionReduced();
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.75', 'end 0.35'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      className="read-progress"
      aria-hidden="true"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  );
};

// ---------------------------------------------------------------- share
const ShareBar: React.FC<{ title: string; className?: string }> = ({ title, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
      toast.success('Havola nusxalandi', v2Toast());
    } catch {
      toast.error('Nusxalab boʻlmadi. Havolani brauzer satridan oling.', v2Toast());
    }
  };
  const share = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch (e) {
        if ((e as DOMException)?.name !== 'AbortError') void copy();
      }
    } else {
      void copy();
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <button type="button" onClick={share} className="btn btn-ghost !min-h-[44px] !px-5 !text-[0.9375rem]">
        <Share2 size={17} aria-hidden="true" /> Ulashish
      </button>
      <button type="button" onClick={copy} className="btn btn-ghost !min-h-[44px] !px-5 !text-[0.9375rem]" aria-live="polite">
        {copied ? <Check size={17} aria-hidden="true" style={{ color: 'var(--green-ink)' }} /> : <Link2 size={17} aria-hidden="true" />}
        {copied ? 'Nusxalandi!' : 'Havolani nusxalash'}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------- page
const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [others, setOthers] = useState<Post[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [consult, setConsult] = useState(false);

  useEffect(() => {
    let alive = true; // maqola almashganda eski javob yangisini bosib ketmasin
    setLoading(true);
    fetch(`/api/posts/${encodeURIComponent(slug ?? '')}`)
      .then(res => (res.ok ? res.json() : null))
      // 404 javobi ({ error }) post sifatida qabul qilinmasligi kerak
      .then(data => { if (alive) setPost(data && data.id && data.slug ? data : null); })
      .catch(() => { if (alive) setPost(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  // related / next: from the public list
  useEffect(() => {
    let alive = true;
    fetch('/api/posts?published=1')
      .then(r => (r.ok ? r.json() : []))
      .then(d => alive && setOthers(Array.isArray(d) ? d : []))
      .catch(() => alive && setOthers([]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const html = useMemo(() => (post ? sanitizePostHtml(renderPostMarkdown(postContent(post, lang))) : ''), [post, lang]);
  const minutes = useMemo(() => (post ? readingMinutes(postContent(post, lang)) : 1), [post, lang]);

  const related = useMemo(() => {
    if (!post) return [];
    const time = (p: Post) => postDate(p)?.getTime() ?? 0;
    return others
      .filter(p => p.slug !== post.slug)
      .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category) || time(b) - time(a))
      .slice(0, 3);
  }, [others, post]);

  if (loading) {
    return (
      <div className="v2">
        <div className="wrap pt-40 pb-[20vh]" role="status" aria-label="Yuklanmoqda">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-16 w-full max-w-3xl mt-8" />
          <div className="skeleton h-16 w-3/4 max-w-2xl mt-4" />
          <div className="skeleton aspect-[16/8] mt-12" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="v2 relative min-h-[80svh] flex items-center overflow-hidden">
        <SEO title="Maqola topilmadi" noindex />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 45% at 70% 30%, rgba(0,97,255,.16), transparent 70%)' }}
        />
        <div className="wrap relative pt-28 pb-20">
          <p className="t-kicker flex items-center gap-3">
            <Star4 className="w-3.5 h-3.5 ink-cyan" /> Xato 404
          </p>
          <h1 className="t-hero mt-6 max-w-[14ch]">
            Maqola <span className="ink-grad">topilmadi</span>.
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/blog" className="btn btn-primary">
              <ArrowLeft size={18} aria-hidden="true" /> Blogga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = postTitle(post, lang);
  const excerpt = postExcerpt(post, lang);
  const d = postDate(post);
  const image = absUrl(post.cover_image);

  return (
    <div className="v2">
      <SEO
        title={title}
        description={excerpt || post.excerpt_uz || undefined}
        type="article"
        url={`${SITE_URL}/blog/${post.slug}`}
        image={image}
        jsonLd={articleSchema({
          title,
          description: post.excerpt_uz || title,
          url: `${SITE_URL}/blog/${post.slug}`,
          image,
          datePublished: post.published_at || post.created_at || new Date().toISOString(),
          dateModified: post.updated_at || undefined,
        })}
      />
      <ReadingProgress target={bodyRef} />

      <article>
        {/* ---------------------------------------------------------------- header */}
        <header className="relative overflow-hidden pt-32 sm:pt-40">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(55% 60% at 85% 10%, rgba(0,97,255,.14), transparent 70%)' }}
          />
          <div className="wrap relative">
            <Link to="/blog" className="inline-flex items-center gap-2 min-h-[44px] -ml-1 pr-3 font-medium ink-2 hover:text-[color:var(--fg)] transition-colors">
              <ArrowLeft size={18} aria-hidden="true" /> Blogga qaytish
            </Link>

            <p className="mono mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] ink-3">
              {post.category && <span className="ink-cyan uppercase tracking-[0.12em]">{uz(post.category)}</span>}
              {post.category && <span className="meta-dot" aria-hidden="true" />}
              {d && <time dateTime={d.toISOString()}>{formatDate(d, lang)}</time>}
              {d && <span className="meta-dot" aria-hidden="true" />}
              <span>{minutes} daqiqalik oʻqish</span>
            </p>

            <Mask className="mt-6">
              <h1 className="post-h1 max-w-[22ch]">{uz(title)}</h1>
            </Mask>
            {excerpt && <p className="t-lead mt-6 max-w-[42rem]">{uz(excerpt)}</p>}
            <ShareBar title={title} className="mt-8" />
          </div>

          <div className="wrap relative mt-12">
            <Reveal y={36}>
              <PostCover
                src={post.cover_image}
                title={title}
                category={post.category}
                seed={post.id}
                big
                className="!aspect-[16/9] sm:!aspect-[21/9] !rounded-[var(--radius)]"
              />
            </Reveal>
          </div>
        </header>

        {/* ---------------------------------------------------------------- body */}
        <div className="wrap pt-14 sm:pt-20 pb-16">
          <div ref={bodyRef} className="prose-v2" dangerouslySetInnerHTML={{ __html: html }} />
          <Star4 className="prose-end-star" />

          {/* in-article CTA, matched to the post category */}
          {(() => {
            const cat = (post.category || '').toLowerCase();
            const kind = /til|lang|ielts|english/.test(cat) ? 'lang' : /dizayn|design|media|smm|grafik/.test(cat) ? 'media' : 'general';
            const copy = {
              lang: { k: 'Til kurslari', h: 'Xorijiy tilni ustoz bilan oʻrganing', p: "Ingliz, rus, koreys va nemis tili kurslari, bepul mock testlar va yakshanba tadbirlari.", to: '/til-kurslari', label: 'Til kurslarini koʻrish' },
              media: { k: 'Media va dizayn', h: 'Amaliy loyihalar bilan boshlang', p: "Grafik dizayn, SMM va mobilografiya kurslari: kichik guruhlar va amaliyotchi ustozlar.", to: '/kurslar', label: 'Kurslarni koʻrish' },
              general: { k: 'Keyingi qadam', h: 'Yoʻnalishni ustoz bilan birga tanlang', p: "Bepul konsultatsiyada maqsadingizga mos kursni aniqlab beramiz. Kichik guruhlar, amaliyotchi ustozlar, sertifikat.", to: '', label: 'Bepul konsultatsiya' },
            }[kind];
            return (
              <div className="mx-auto mt-14 max-w-[68ch] panel relative overflow-hidden p-7 sm:p-9">
                <Star4 className="pointer-events-none absolute -left-10 -bottom-12 w-48 h-48 opacity-[0.07] ink-cyan" />
                <p className="t-kicker mb-4 relative">{copy.k}</p>
                <h2 className="t-h3 relative">{uz(copy.h)}</h2>
                <p className="t-body mt-3 relative">{uz(copy.p)}</p>
                <div className="mt-6 flex flex-wrap gap-3 relative">
                  {copy.to ? (
                    <Link to={copy.to} className="btn btn-primary">{copy.label} <ArrowRight size={18} aria-hidden="true" /></Link>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={() => setConsult(true)}>{copy.label} <ArrowRight size={18} aria-hidden="true" /></button>
                  )}
                  {kind !== 'general' && <button type="button" className="btn btn-ghost" onClick={() => setConsult(true)}>Bepul konsultatsiya</button>}
                </div>
              </div>
            );
          })()}

          <div className="mx-auto mt-12 max-w-[68ch] hairline pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="t-kicker">Maqola yoqdimi?</p>
            <ShareBar title={title} />
          </div>
        </div>
      </article>

      {/* ---------------------------------------------------------------- related */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="pb-[10vh]">
          <div className="wrap">
            <div className="hairline pt-10 mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="t-kicker mb-4">Keyingi maqolalar</p>
                <h2 id="related-title" className="t-h2">Yana <span className="ink-grad">oʻqing</span></h2>
              </div>
              <div className="hidden sm:block">
                <Link to="/blog" className="link-arrow min-h-[44px]">
                  Barcha maqolalar <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {related.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 0.08}>
                  <article className="post-card h-full">
                    <Link to={`/blog/${p.slug}`} className="post-link">
                      <PostCover src={p.cover_image} title={postTitle(p, lang)} category={p.category} seed={p.id} />
                      <div className="pt-5 flex flex-col gap-3">
                        <p className="mono text-[0.8125rem] ink-3">
                          {formatDate(postDate(p), lang)} <span className="meta-dot mx-2 align-middle" aria-hidden="true" />
                          {readingMinutes(postContent(p, lang))} daqiqa
                        </p>
                        <h3 className="t-h3 clamp-2 post-title-link">{uz(postTitle(p, lang))}</h3>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              ))}
            </ul>
            <div className="mt-8 sm:hidden">
              <Link to="/blog" className="link-arrow min-h-[44px]">
                Barcha maqolalar <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- CTA: career test */}
      <section aria-labelledby="post-cta-title" className="pb-[12vh]">
        <div className="wrap">
          <Reveal>
            <div className="panel relative overflow-hidden p-8 sm:p-12 lg:p-16 grid lg:grid-cols-12 gap-10 items-center">
              <Star4 className="pointer-events-none absolute -right-16 -bottom-20 w-80 h-80 opacity-[0.08] ink-cyan" />
              <div className="lg:col-span-7 relative">
                <p className="t-kicker mb-6">Karyera laboratoriyasi</p>
                <h2 id="post-cta-title" className="t-h2">
                  Qaysi kasb sizga mos — <span className="ink-grad">maʼlumot</span> aytib beradi.
                </h2>
                <p className="t-lead mt-6 max-w-lg">
                  {uz("Holland RIASEC metodikasi asosidagi test qiziqishlaringizni olti o'lchovda baholaydi va sizga mos yo'nalishni ko'rsatadi.")}
                </p>
                <Link to="/karyera-testi" className="btn btn-ghost mt-9">
                  Testni boshlash <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <ul className="lg:col-span-5 relative grid grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--line)' }}>
                {[
                  ['≈12', 'daqiqa'],
                  ['6', 'oʻlchov'],
                  ['0', 'soʻm'],
                ].map(([n, l]) => (
                  <li key={l} className="p-4 sm:p-5" style={{ background: 'var(--bg-2)' }}>
                    <span className="block mono text-2xl" style={{ fontWeight: 500 }}>{n}</span>
                    <span className="block text-sm ink-3 mt-1">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
      <EnrollModal isOpen={consult} onClose={() => setConsult(false)} courseName="Bepul konsultatsiya" extraInfo={`Blog: ${title}`} type="consult" />
    </div>
  );
};

export default BlogPost;
