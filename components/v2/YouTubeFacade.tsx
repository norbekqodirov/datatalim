import React, { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Click-to-load YouTube embed. Shows only a thumbnail until the visitor asks for
 * the video, so the landing page doesn't pull ~1 MB of YouTube JS per iframe.
 */
export const YouTubeFacade: React.FC<{ id: string; title: string; className?: string; vertical?: boolean }> = ({ id, title, className = '', vertical }) => {
  const [on, setOn] = useState(false);
  if (!id) return null;
  return (
    <div className={`relative overflow-hidden ${vertical ? 'aspect-[9/16]' : 'aspect-video'} ${className}`} style={{ background: 'var(--bg-3)' }}>
      {on ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 w-full h-full cursor-pointer" aria-label={`Videoni ijro etish: ${title}`}>
          <img
            src={`https://i.ytimg.com/vi/${id}/${vertical ? 'oar2' : 'maxresdefault'}.jpg`}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              }
            }}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55) 100%)' }} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(255,255,255,.92)', boxShadow: '0 20px 60px -10px rgba(0,0,0,.5)' }}>
            <Play size={26} className="ml-1" fill="#000" color="#000" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
};
