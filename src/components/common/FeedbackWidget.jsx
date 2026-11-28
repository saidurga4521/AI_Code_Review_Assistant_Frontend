import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, Loader2 } from 'lucide-react';
import { feedbackService } from '../../api/feedbackService';

export default function FeedbackWidget({ findingId, onFeedbackSubmitted }) {
  const [status, setStatus] = useState(null); // 'useful' | 'not_useful' | null
  const [reason, setReason] = useState('ACCURATE_FIX');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const handleVote = (vote) => {
    setStatus(vote);
    setReason(vote === 'useful' ? 'ACCURATE_FIX' : 'FALSE_POSITIVE');
    setShowDrawer(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback(findingId, {
        is_useful: status === 'useful',
        reason,
        comment: comment.trim() || (status === 'useful' ? 'Accurate AI finding' : 'Flagged false positive'),
      });
      setSubmitted(true);
      setShowDrawer(false);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      console.error('Failed to submit finding feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        <span>Feedback recorded</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Helpful finding?</span>
        <button
          onClick={() => handleVote('useful')}
          className={`rounded-lg p-1.5 text-xs transition-colors border ${
            status === 'useful'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
          }`}
          title="Useful finding"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => handleVote('not_useful')}
          className={`rounded-lg p-1.5 text-xs transition-colors border ${
            status === 'not_useful'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
          }`}
          title="False positive / Not useful"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {showDrawer && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">
              {status === 'useful' ? 'Help us improve (Positive)' : 'Report False Positive'}
            </span>
            <button
              type="button"
              onClick={() => setShowDrawer(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ACCURATE_FIX">ACCURATE_FIX</option>
              <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Comment (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Verified with security team"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
