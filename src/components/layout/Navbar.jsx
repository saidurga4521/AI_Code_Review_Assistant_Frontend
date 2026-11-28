import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { GitBranch, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { activeRepo } = useSelector((state) => state.repos || state.repo || {});

  return (
    <header className="h-16 border-b border-surface-border bg-surface-dark/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      
      {/* Active Repository Chip */}
      <div className="flex items-center gap-2">
        {activeRepo ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-xs">
            <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">Active Repo:</span>
            <span className="font-semibold text-white">{activeRepo.name}</span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
              {activeRepo.status || 'READY'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">No active repository selected</span>
        )}
      </div>

      {/* User Session & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">{user?.email || 'Developer'}</span>
        </div>

        <button
          onClick={() => dispatch(logout())}
          title="Sign out"
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>

    </header>
  );
}
