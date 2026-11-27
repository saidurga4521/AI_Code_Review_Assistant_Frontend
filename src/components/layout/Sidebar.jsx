import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GitPullRequest, 
  ShieldCheck, 
  Sparkles, 
  FolderGit2
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Human Approvals', href: '/actions', icon: ShieldCheck },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-surface-border bg-surface-dark/95 flex flex-col justify-between p-4 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">ReviewAI</span>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block">Agent v1.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Platform</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            FastAPI Core
          </span>
          <span className="font-mono text-[10px] text-emerald-400">ONLINE</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono truncate">localhost:8000</p>
      </div>
    </aside>
  );
}