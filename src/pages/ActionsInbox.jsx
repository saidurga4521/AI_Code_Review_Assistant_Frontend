import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { actionService } from '../api/actionService';
import { SeverityBadge } from '../components/common/Badge';
import DiffViewer from '../components/code/DiffViewer';
import Modal from '../components/common/Modal';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCode2, 
  RefreshCw, 
  Loader2, 
  Inbox,
  User,
  MessageSquare
} from 'lucide-react';

export default function ActionsInbox() {
  const { user } = useSelector((state) => state.auth);

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');

  // Modal State for Action Resolution
  const [modalMode, setModalMode] = useState(null); // 'approve' | 'reject' | null
  const [selectedAction, setSelectedAction] = useState(null);
  const [resolvedBy, setResolvedBy] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPendingActions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await actionService.getPendingActions();
      setActions(data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch pending actions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingActions();
    if (user?.email) {
      setResolvedBy(user.email);
    }
  }, [user]);

  const handleOpenModal = (action, mode) => {
    setSelectedAction(action);
    setModalMode(mode);
    setResolvedBy(user?.email || 'developer@company.com');
    setComment(mode === 'approve' ? 'Verified and approved for deployment.' : 'Rejected due to false positive.');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedAction(null);
    setComment('');
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!selectedAction || !modalMode) return;

    setIsSubmitting(true);
    try {
      const payload = {
        resolved_by: resolvedBy.trim() || 'engineer',
        comment: comment.trim(),
      };

      if (modalMode === 'approve') {
        await actionService.approveAction(selectedAction.id, payload);
        setBannerMessage(`Action #${selectedAction.id} was successfully APPROVED.`);
      } else {
        await actionService.rejectAction(selectedAction.id, payload);
        setBannerMessage(`Action #${selectedAction.id} was REJECTED.`);
      }

      // Remove the action from local state
      setActions((prev) => prev.filter((a) => a.id !== selectedAction.id));
      handleCloseModal();
      setTimeout(() => setBannerMessage(''), 4000);
    } catch (err) {
      alert(`Action resolution failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Human-in-the-Loop Approval Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review staged code write actions, vulnerability mitigations, and automated patches before application.
          </p>
        </div>

        <button
          onClick={loadPendingActions}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Resolution Banner */}
      {bannerMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && actions.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-surface-border bg-surface-card/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && actions.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface-card/40 p-16 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">Inbox Zero</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All AI-staged patches have been reviewed and approved. No actions are currently waiting in the pipeline.
          </p>
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-6">
        {actions.map((action) => (
          <div
            key={action.id}
            className="rounded-2xl border border-surface-border bg-surface-card/80 p-6 shadow-xl backdrop-blur-md space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
                  {action.action_type || 'APPLY_PATCH'}
                </span>
                <SeverityBadge level={action.severity || 'HIGH'} />
                <span className="text-xs font-mono text-slate-400">
                  Action #{action.id} • Finding #{action.finding_id}
                </span>
              </div>

              {action.file_path && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                  <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{action.file_path}</span>
                </div>
              )}
            </div>

            {/* Diff Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Staged Diff Payload:
              </span>
              <DiffViewer
                diffText={action.payload}
                filePath={action.file_path}
                title={`Staged Patch: ${action.file_path || 'Target File'}`}
              />
            </div>

            {/* Approval / Rejection Action Controls */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleOpenModal(action, 'reject')}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Patch</span>
              </button>

              <button
                onClick={() => handleOpenModal(action, 'approve')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Apply Patch</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Confirmation Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={handleCloseModal}
        title={
          modalMode === 'approve'
            ? `Approve Action #${selectedAction?.id}`
            : `Reject Action #${selectedAction?.id}`
        }
      >
        <form onSubmit={handleSubmitResolution} className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {modalMode === 'approve'
              ? 'Approving this action confirms that the patch has been verified for security and correctness. The backend will proceed to apply the change.'
              : 'Rejecting this action marks the finding as a false positive or unapproved modification.'}
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Resolved By (Email/Name)</span>
            </label>
            <input
              type="text"
              required
              placeholder="sai@company.com"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
              <span>Resolution Comment / Audit Rationale</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Verified with lead engineer"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-slate-950 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                modalMode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : modalMode === 'approve' ? (
                'Confirm Approval'
              ) : (
                'Confirm Rejection'
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
