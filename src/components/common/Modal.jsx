import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full ${maxWidth} rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
