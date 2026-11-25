import { ShieldAlert, Sparkles, Terminal } from 'lucide-react';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-8 shadow-2xl backdrop-blur-xl max-w-md w-full">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          AI Code Review Assistant
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Vite + React + Tailwind CSS environment initialized.
        </p>

        <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 text-xs font-mono text-emerald-400 border border-slate-800">
          <Terminal className="h-4 w-4" />
          <span>Backend Target: http://localhost:8000/api/v1</span>
        </div>
      </div>
    </div>
  );
}

export default App;