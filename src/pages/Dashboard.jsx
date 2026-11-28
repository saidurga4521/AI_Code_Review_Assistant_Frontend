import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRepositories, createRepository, setActiveRepo, triggerIndexRepository } from '../store/repoSlice';
import { actionService } from '../api/actionService';
import { StatusBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  ShieldCheck, 
  ExternalLink, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Loader2,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { repositories, loading, error } = useSelector((state) => state.repos);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [selectedRepoForIndex, setSelectedRepoForIndex] = useState(null);
  const [repoPathInput, setRepoPathInput] = useState('');
  const [isIndexingLoading, setIsIndexingLoading] = useState(false);

  // New Repo Form State
  const [newRepoData, setNewRepoData] = useState({
    name: '',
    clone_url: '',
    default_branch: 'main',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    dispatch(fetchRepositories());

    // Fetch pending actions count for quick stats
    actionService.getPendingActions()
      .then((actions) => setPendingApprovalsCount(actions?.length || 0))
      .catch(() => setPendingApprovalsCount(0));
  }, [dispatch]);

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    if (!newRepoData.name.trim() || !newRepoData.clone_url.trim()) {
      setCreateError('Repository name and clone URL are required.');
      return;
    }

    setIsCreating(true);
    setCreateError('');
    try {
      await dispatch(createRepository(newRepoData)).unwrap();
      setIsConnectOpen(false);
      setNewRepoData({ name: '', clone_url: '', default_branch: 'main' });
    } catch (err) {
      setCreateError(err || 'Failed to connect repository.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenIndexModal = (repo, e) => {
    e.stopPropagation();
    setSelectedRepoForIndex(repo);
    setRepoPathInput('');
    setIsIndexOpen(true);
  };

  const handleTriggerIndex = async (e) => {
    e.preventDefault();
    if (!selectedRepoForIndex || !repoPathInput.trim()) return;

    setIsIndexingLoading(true);
    try {
      await dispatch(triggerIndexRepository({
        repoId: selectedRepoForIndex.id,
        repoPath: repoPathInput.trim(),
      })).unwrap();
      setIsIndexOpen(false);
    } catch (err) {
      alert(`Indexing failed: ${err}`);
    } finally {
      setIsIndexingLoading(false);
    }
  };

  const handleSelectRepo = (repo) => {
    dispatch(setActiveRepo(repo));
    navigate(`/repos/${repo.id}`);
  };

  const filteredRepos = repositories.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexedCount = repositories.filter((r) => r.status === 'READY').length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Repository Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected repositories with AST semantic chunking and AI review status.
          </p>
        </div>

        <button
          onClick={() => setIsConnectOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Connect Repository</span>
        </button>
      </div>

      {/* Analytics / Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Repositories</span>
            <FolderGit2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{repositories.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Configured for user</div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Indexed (RAG Ready)</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{indexedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">AST embeddings generated</div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Pending Approvals</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{pendingApprovalsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting human review</div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Engine Status</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold font-mono text-white mt-1">FastAPI Live</div>
          <div className="text-[11px] text-emerald-400 mt-1">All subsystems online</div>
        </div>

      </div>

      {/* Repositories Section */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => dispatch(fetchRepositories())}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors self-end sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading && repositories.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl border border-surface-border bg-surface-card/40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRepos.length === 0 && (
          <div className="rounded-2xl border border-surface-border bg-surface-card/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No repositories found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No repositories match your search criteria.' : 'Connect your first GitHub repository to enable Codebase RAG and automated PR reviews.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsConnectOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Connect First Repo</span>
              </button>
            )}
          </div>
        )}

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => handleSelectRepo(repo)}
              className="group cursor-pointer rounded-2xl border border-surface-border bg-surface-card/70 p-5 shadow-lg backdrop-blur-md hover:border-indigo-500/50 hover:bg-surface-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FolderGit2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">
                        {repo.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <GitBranch className="h-3 w-3 text-slate-500" />
                        <span>{repo.default_branch || 'main'}</span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={repo.status} />
                </div>

                {/* Clone URL */}
                {repo.clone_url && (
                  <p className="text-[11px] text-slate-500 font-mono truncate mb-4">
                    {repo.clone_url}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => handleOpenIndexModal(repo, e)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
                >
                  <Cpu className="h-3 w-3" />
                  <span>{repo.status === 'READY' ? 'Re-index' : 'Trigger Index'}</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Assistant</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Connect Repository Modal */}
      <Modal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        title="Connect a GitHub Repository"
      >
        <form onSubmit={handleCreateRepo} className="space-y-4">
          {createError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Repository Name (e.g. owner/repo)
            </label>
            <input
              type="text"
              required
              placeholder="sai-kumar/fastapi-backend"
              value={newRepoData.name}
              onChange={(e) => setNewRepoData({ ...newRepoData, name: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Clone URL (HTTPS or SSH)
            </label>
            <input
              type="text"
              required
              placeholder="https://github.com/... or git@github.com:..."
              value={newRepoData.clone_url}
              onChange={(e) => setNewRepoData({ ...newRepoData, clone_url: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Default Branch
            </label>
            <input
              type="text"
              required
              placeholder="main"
              value={newRepoData.default_branch}
              onChange={(e) => setNewRepoData({ ...newRepoData, default_branch: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConnectOpen(false)}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect Repository'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Trigger Index Modal */}
      <Modal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        title={`Trigger AST Indexing: ${selectedRepoForIndex?.name || ''}`}
      >
        <form onSubmit={handleTriggerIndex} className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            The FastAPI backend will parse the repository files, generate AST syntax chunks, and compute vector embeddings for Codebase RAG queries.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Local Repository Path (on backend machine)
            </label>
            <input
              type="text"
              required
              placeholder="/home/user/projects/fastapi-backend or C:\repos\fastapi-backend"
              value={repoPathInput}
              onChange={(e) => setRepoPathInput(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Passes <code>?repo_path=...</code> to <code>POST /repositories/{'{id}'}/index</code>.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsIndexOpen(false)}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isIndexingLoading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isIndexingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Indexing AST...</span>
                </>
              ) : (
                'Start Indexing'
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
