// @ts-nocheck
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Xatolik yuz berdi</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              {this.state.error?.message || "Kutilmagan xatolik yuz berdi."}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0061ff, #60efff)' }}
            >
              Qayta urinish
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
