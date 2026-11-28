export function SeverityBadge({ level }) {
  const norm = (level || '').toUpperCase();

  const styles = {
    CRITICAL: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };

  const currentStyle = styles[norm] || 'bg-slate-700/20 text-slate-400 border-slate-700/30';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wide ${currentStyle}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {norm || 'UNKNOWN'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const norm = (status || '').toUpperCase();

  if (norm === 'READY') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        READY
      </span>
    );
  }

  if (norm === 'INDEXING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-mono font-medium text-amber-400 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        INDEXING
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-mono font-medium text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
      {norm || 'UNINDEXED'}
    </span>
  );
}
