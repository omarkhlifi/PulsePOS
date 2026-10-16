/**
 * PulsePOS — Footer with Portfolio Ownership, MIT License & GitHub Attribution
 * @author Omar Khlifi (https://github.com/omarkhlifi)
 * @license MIT
 */

import React from 'react';
import { Github, Scale, ShieldCheck, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { usePOS } from '../hooks/usePOS';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePOS();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="no-print pointer-events-none fixed bottom-14 left-4 z-50 flex flex-col gap-2 sm:left-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-pop-in pointer-events-auto flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md ${
            t.type === 'success'
              ? 'border-emerald-500/50 bg-slate-900/95 text-emerald-300'
              : t.type === 'warning'
              ? 'border-amber-500/50 bg-slate-900/95 text-amber-300'
              : t.type === 'error'
              ? 'border-rose-500/50 bg-slate-900/95 text-rose-300'
              : 'border-sky-500/50 bg-slate-900/95 text-sky-300'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {t.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
          {t.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="h-4 w-4 text-sky-400 shrink-0" />}
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="ml-1 text-slate-500 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="no-print border-t border-slate-800/80 bg-slate-950 px-4 py-2 text-[11px] text-slate-400 sm:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>PulsePOS Client-Side Engine (LocalStorage Sync Active)</span>
          </span>
          <span className="hidden text-slate-700 sm:inline">|</span>
          <span className="hidden items-center gap-1 text-slate-400 sm:inline-flex">
            <Scale className="h-3 w-3 text-slate-500" />
            <span>MIT License — Free for Commercial & Portfolio Use</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Designed & Built by{' '}
            <strong className="font-semibold text-white">Omar Khlifi</strong>
          </span>
          <a
            href="https://github.com/omarkhlifi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <Github className="h-3 w-3" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

