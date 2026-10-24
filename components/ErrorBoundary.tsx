// @ts-nocheck
import * as React from 'react';

interface Props {
  children: React.ReactNode;
  /** Qiymat o'zgarsa (masalan, sahifa manzili) xato holati tozalanadi */
  resetKey?: string;
  /** Butun ilova darajasidagi chegaraga — to'liq ekran */
  fullScreen?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Yangi deploydan keyin eski chunk topilmasa — faqat sahifani qayta yuklash yordam beradi
const isChunkError = (e: Error | null) =>
  !!e && /dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically/i.test(e.message || '');

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UI xatosi:', error, info?.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    // React.lazy rad etilgan importni keshlaydi — qayta urinish uchun sahifani yangilash kerak
    if (isChunkError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const chunk = isChunkError(this.state.error);
      return (
        <div role="alert" className={`${this.props.fullScreen ? 'min-h-screen' : 'min-h-[60vh]'} flex items-center justify-center p-6`}>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Xatolik yuz berdi</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              {chunk
                ? 'Sayt yangilangan. Davom etish uchun sahifani yangilang.'
                : 'Sahifani koʻrsatishda kutilmagan xatolik yuz berdi. Qayta urinib koʻring.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 min-h-[44px]"
                style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}
              >
                {chunk ? 'Sahifani yangilash' : 'Qayta urinish'}
              </button>
              <a href="/" className="px-6 py-3 rounded-xl font-bold border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white min-h-[44px] inline-flex items-center">
                Bosh sahifa
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
