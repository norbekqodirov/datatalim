import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ImagePlus, Loader2, CheckCircle2, X } from 'lucide-react';
import '../admin.css';
import './ui.css';

/** Sahifa sarlavhasi: nom, qisqa izoh, o'ngda asosiy amal. */
export const PageHeader: React.FC<{ title: string; sub?: string; kicker?: string; actions?: React.ReactNode }> = ({ title, sub, kicker, actions }) => (
  <header className="a-head">
    <div className="a-head-main">
      {kicker && <div className="a-kicker mb-1.5">{kicker}</div>}
      <h1 className="a-h1">{title}</h1>
      {sub && <p className="a-sub mt-1.5">{sub}</p>}
    </div>
    {actions && <div className="a-head-actions">{actions}</div>}
  </header>
);

/** Karta ichidagi bo'lim. */
export const Section: React.FC<{ title: string; desc?: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, desc, icon, action, children, className = '' }) => (
  <section className={`a-card a-section ${className}`}>
    <div className="a-section-head">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="a-section-ico" aria-hidden="true">{icon}</span>}
        <div className="min-w-0">
          <h2 className="a-h2">{title}</h2>
          {desc && <p className="a-sub mt-0.5" style={{ fontSize: '.8rem' }}>{desc}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/** Yorliqli maydon: children ga id beriladi (render-prop). */
export const Field: React.FC<{ label: string; help?: string; error?: string; className?: string; children: (id: string) => React.ReactNode }> = ({ label, help, error, className = '', children }) => {
  const id = useId();
  return (
    <div className={className}>
      <label className="a-label" htmlFor={id}>{label}</label>
      {children(id)}
      {help && !error && <p className="a-help">{help}</p>}
      {error && <p className="a-field-error" role="alert">{error}</p>}
    </div>
  );
};

export const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => <Loader2 size={size} className="a-spin" aria-hidden="true" />;

/** Rasm yuklash maydoni: oldindan ko'rish + fayl tanlash. Yuklash mantiqi sahifadagi onChange'da qoladi. */
export const ImageField: React.FC<{
  label: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  savings?: string | null; help?: string; round?: boolean; className?: string;
}> = ({ label, value, onChange, savings, help, round, className = '' }) => {
  const id = useId();
  const [busy, setBusy] = useState(false);
  return (
    <div className={className}>
      <span className="a-label" id={id + '-l'}>{label}</span>
      <div className="a-dropzone">
        <div className="a-thumb" style={round ? { borderRadius: '999px' } : undefined}>
          {value ? <img src={value} alt="" loading="lazy" decoding="async" /> : <ImagePlus size={22} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="a-btn" style={{ cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? <Spinner /> : <ImagePlus size={16} aria-hidden="true" />}
            {busy ? 'Yuklanmoqda...' : value ? 'Rasmni almashtirish' : 'Rasm tanlash'}
          </label>
          <input
            id={id} type="file" accept="image/*" className="sr-only" disabled={busy} aria-labelledby={id + '-l'}
            onChange={async (e) => {
              const input = e.target;
              setBusy(true);
              try { await onChange(e); } finally { setBusy(false); try { input.value = ''; } catch { /* noop */ } }
            }}
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--a-green-ink)' }}><CheckCircle2 size={13} aria-hidden="true" />WebP avtomatik</span>
            {savings && <span className="text-xs font-semibold" style={{ color: 'var(--a-blue-ink)' }}>{savings}</span>}
          </div>
        </div>
      </div>
      {help && <p className="a-help">{help}</p>}
    </div>
  );
};

export const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string; disabled?: boolean }> = ({ checked, onChange, label, disabled }) => (
  <span className="a-switch-hit">
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="a-switch" onClick={onChange} />
  </span>
);

const overlayStack: object[] = [];

/** Modal oyna (fokus qamrovi, Esc, orqa fon bosilsa yopiladi). Brauzer confirm/alert o'rniga. */
export const Overlay: React.FC<{ open: boolean; onClose: () => void; labelledBy?: string; wide?: boolean; children: React.ReactNode; lockClose?: boolean }> = ({ open, onClose, labelledBy, wide, children, lockClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const token = {};
    overlayStack.push(token);
    const isTop = () => overlayStack[overlayStack.length - 1] === token;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = ref.current;
    const focusables = (): HTMLElement[] => Array.from(node?.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? []);
    (node?.querySelector<HTMLElement>('[data-autofocus]') || focusables()[0] || node)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === 'Escape' && !lockClose) { e.stopPropagation(); closeRef.current(); }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { const i = overlayStack.indexOf(token); if (i >= 0) overlayStack.splice(i, 1); document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; prev?.focus?.(); };
  }, [open, lockClose]);
  if (!open) return null;
  return createPortal(
    <div className="adm" style={{ background: 'transparent' }}>
      <div className="a-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !lockClose) onClose(); }}>
        <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className={`a-dialog${wide ? ' is-wide' : ''}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean; title: string; message?: React.ReactNode; confirmLabel?: string; cancelLabel?: string;
  danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'Tasdiqlash', cancelLabel = 'Bekor qilish', danger = true, busy, onConfirm, onCancel }) => {
  const id = useId();
  return (
    <Overlay open={open} onClose={onCancel} labelledBy={id} lockClose={busy}>
      <div className="flex gap-3.5">
        <span className="a-ico-danger" style={danger ? undefined : { color: 'var(--a-blue-ink)', background: 'color-mix(in srgb, var(--a-blue) 12%, transparent)' }}><AlertTriangle size={20} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 id={id} className="a-h2">{title}</h2>
          {message && <p className="a-sub mt-1.5">{message}</p>}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 mt-6">
        <button type="button" className="a-btn" onClick={onCancel} disabled={busy} data-autofocus>{cancelLabel}</button>
        <button type="button" className={`a-btn ${danger ? 'a-btn-solid-danger' : 'a-btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner />}{confirmLabel}
        </button>
      </div>
    </Overlay>
  );
};

/** Saqlanmagan o'zgarishlar bo'lsa, sahifani yopishdan oldin brauzer ogohlantiradi. */
export function useBeforeUnload(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}

/** Yopish tugmasi (modal sarlavhasi uchun). */
export const CloseBtn: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Yopish' }) => (
  <button type="button" className="a-btn a-btn-ghost a-icon-btn" onClick={onClick} aria-label={label}><X size={18} aria-hidden="true" /></button>
);

export const SaveBar: React.FC<{ dirty: boolean; saving: boolean; onSave: () => void; onCancel?: () => void; cancelLabel?: string; saveLabel?: string; hint?: string; alwaysEnabled?: boolean }> = ({ dirty, saving, onSave, onCancel, cancelLabel = 'Bekor qilish', saveLabel = 'Saqlash', hint, alwaysEnabled }) => (
  <div className="a-savebar" role="region" aria-label="Saqlash paneli">
    <div className="flex items-center gap-2.5 min-w-0 text-sm" aria-live="polite">
      {dirty ? <><span className="a-dot" aria-hidden="true" /><span className="font-semibold">Saqlanmagan oʻzgarishlar bor</span></>
        : <span className="a-muted">{hint || 'Hamma oʻzgarishlar saqlangan'}</span>}
    </div>
    <div className="flex gap-2 ml-auto">
      {onCancel && <button type="button" className="a-btn" onClick={onCancel} disabled={saving}>{cancelLabel}</button>}
      <button type="button" className="a-btn a-btn-primary" onClick={onSave} disabled={saving || (!dirty && !alwaysEnabled)}>
        {saving ? <Spinner /> : null}{saving ? 'Saqlanmoqda...' : saveLabel}
      </button>
    </div>
  </div>
);
