import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DiffViewer({ diffText, filePath, title }) {
  const [copied, setCopied] = useState(false);

  if (!diffText) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500 font-mono">
        No diff available.
      </div>
    );
  }

  const lines = diffText.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
      {/* Diff Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2 text-xs">
        <span className="font-mono text-slate-300 font-medium">
          {title || filePath || 'Unified Git Diff'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">
        {lines.map((line, idx) => {
          let lineClass = 'text-slate-300';
          let prefix = ' ';

          if (line.startsWith('+++') || line.startsWith('---')) {
            lineClass = 'text-indigo-400 font-semibold bg-indigo-950/20';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-sky-400 font-semibold bg-sky-950/30';
          } else if (line.startsWith('+')) {
            lineClass = 'text-emerald-300 bg-emerald-950/30 -mx-3 px-3';
            prefix = '+';
          } else if (line.startsWith('-')) {
            lineClass = 'text-rose-300 bg-rose-950/30 -mx-3 px-3';
            prefix = '-';
          }

          return (
            <div key={idx} className={`flex items-start ${lineClass} py-0.5`}>
              <span className="w-10 shrink-0 select-none text-right pr-4 text-slate-600 text-[11px]">
                {idx + 1}
              </span>
              <pre className="whitespace-pre-wrap font-mono flex-1">{line}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
