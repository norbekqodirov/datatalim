import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, BookOpen, FileText, Users, HelpCircle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTheme } from '../store/ThemeContext';
import { useLanguage } from '../i18n';

interface SearchResult {
  type: 'course' | 'page' | 'faq';
  title: string;
  description?: string;
  path: string;
  icon: React.ElementType;
}

const STATIC_PAGES: SearchResult[] = [
  { type: 'page', title: 'Bosh Sahifa', path: '/', icon: Globe },
  { type: 'page', title: 'Kurslar', path: '/kurslar', icon: BookOpen },
  { type: 'page', title: 'Biz haqimizda', path: '/biz-haqimizda', icon: Users },
  { type: 'page', title: 'Jamoa', path: '/jamoa', icon: Users },
  { type: 'page', title: 'Til kurslari', path: '/til-kurslari', icon: Globe },
  { type: 'page', title: 'Blog', path: '/blog', icon: FileText },
  { type: 'page', title: 'Karyera testi', path: '/karyera-testi', icon: HelpCircle },
];

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { courses } = useStore();
  const { isDark } = useTheme();
  const { lang } = useLanguage();

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const getResults = useCallback((): SearchResult[] => {
    if (!query.trim()) return STATIC_PAGES;

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search courses
    courses.forEach(course => {
      const name = course.title
        ? ((course.title as any)[lang] || (course.title as any).uz || '')
        : '';
      if (name.toLowerCase().includes(q)) {
        results.push({
          type: 'course',
          title: name,
          description: 'Kurs',
          path: `/kurslar/${course.id}`,
          icon: BookOpen,
        });
      }
    });

    // Search pages
    STATIC_PAGES.forEach(page => {
      if (page.title.toLowerCase().includes(q)) {
        results.push(page);
      }
    });

    return results.slice(0, 8);
  }, [query, courses, lang]);

  const results = getResults();

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[201] w-[90%] max-w-xl"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: isDark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Search Input */}
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <Search size={20} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Qidirish... (kurslar, sahifalar)"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  className={`flex-1 bg-transparent text-lg font-medium outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                />
                <button
                  onClick={() => setOpen(false)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto py-2 px-2">
                {results.length === 0 ? (
                  <div className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Search size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Natija topilmadi</p>
                  </div>
                ) : (
                  results.map((result, idx) => (
                    <button
                      key={`${result.type}-${result.path}-${idx}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left group ${
                        idx === selectedIndex
                          ? isDark
                            ? 'bg-[#0061ff]/15 text-white'
                            : 'bg-blue-50 text-slate-900'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800/60'
                            : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          idx === selectedIndex
                            ? 'bg-[#0061ff]/20 text-[#0061ff]'
                            : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <result.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{result.title}</p>
                        {result.description && (
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{result.description}</p>
                        )}
                      </div>
                      <ArrowRight
                        size={14}
                        className={`shrink-0 transition-all ${
                          idx === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                        } ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
                      />
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className={`flex items-center justify-between px-5 py-3 border-t text-[11px] font-semibold ${isDark ? 'border-white/5 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                <span>↑↓ tanlash · Enter ochish · ESC yopish</span>
                <span>Ctrl+K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
