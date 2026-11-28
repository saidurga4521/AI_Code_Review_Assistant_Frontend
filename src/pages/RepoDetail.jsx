import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { repoService } from '../api/repoService';
import { reviewService } from '../api/reviewService';
import { feedbackService } from '../api/feedbackService';
import { setActiveRepo, triggerIndexRepository } from '../store/repoSlice';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import DiffViewer from '../components/code/DiffViewer';
import FeedbackWidget from '../components/common/FeedbackWidget';
import Modal from '../components/common/Modal';
import { 
  ArrowLeft, 
  GitBranch, 
  ExternalLink, 
  Cpu, 
  MessageSquare, 
  ShieldAlert, 
  Layers, 
  BarChart3, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  GitPullRequest, 
  Loader2, 
  FileCode2, 
  FileText,
  Clock,
  ThumbsUp
} from 'lucide-react';

export default function RepoDetail() {
  const { repoId } = useParams();
  const dispatch = useDispatch();

  const { activeRepo, repositories } = useSelector((state) => state.repos);

  // Current repo state
  const [repo, setRepo] = useState(null);
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [activeTab, setActiveTab] = useState('qa'); // 'qa' | 'review' | 'chunks' | 'stats'

  // Index Modal
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [repoPathInput, setRepoPathInput] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);

  // --- TAB 1: CODEBASE Q&A STATE ---
  const [qaQuery, setQaQuery] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaMessages, setQaMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I have indexed your repository AST. Ask me anything about your architecture, authentication, API routes, or database models.',
      evidence: [],
    },
  ]);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);

  // --- TAB 2: PR REVIEW STATE ---
  const [reviewForm, setReviewForm] = useState({
    diff_text: '',
    pr_number: 42,
    commit_sha: 'a1b2c3d4',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- TAB 3: CHUNKS STATE ---
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // --- TAB 4: FEEDBACK STATS ---
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // 1. Fetch Repository Details
  useEffect(() => {
    async function loadData() {
      setLoadingRepo(true);
      try {
        const repoData = await repoService.getRepositoryById(repoId);
        setRepo(repoData);
        dispatch(setActiveRepo(repoData));
      } catch (err) {
        // Fallback to redux list if available
        const matched = repositories.find((r) => String(r.id) === String(repoId));
        if (matched) {
          setRepo(matched);
          dispatch(setActiveRepo(matched));
        }
      } finally {
        setLoadingRepo(false);
      }
    }
    loadData();
    loadStats();
  }, [repoId, dispatch, repositories]);

  // Load Review History
  const loadReviewHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await reviewService.getReviewsByRepo(repoId);
      setReviewHistory(data || []);
      if (data && data.length > 0 && !currentReview) {
        setCurrentReview(data[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch review history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load Chunks
  const loadChunks = async () => {
    setLoadingChunks(true);
    try {
      const data = await repoService.getRepositoryChunks(repoId);
      setChunks(data || []);
    } catch (err) {
      console.warn('Failed to load chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  // Load Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await feedbackService.getFeedbackStats(repoId);
      setStats(data);
    } catch (err) {
      // stats might not exist yet
    } finally {
      setLoadingStats(false);
    }
  };

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'review' && reviewHistory.length === 0) {
      loadReviewHistory();
    } else if (tab === 'chunks' && chunks.length === 0) {
      loadChunks();
    } else if (tab === 'stats') {
      loadStats();
    }
  };

  // Trigger Index
  const handleTriggerIndex = async (e) => {
    e.preventDefault();
    if (!repoPathInput.trim()) return;

    setIsIndexing(true);
    try {
      await dispatch(triggerIndexRepository({
        repoId: repo.id,
        repoPath: repoPathInput.trim(),
      })).unwrap();
      setIsIndexOpen(false);
      setRepo({ ...repo, status: 'READY' });
    } catch (err) {
      alert(`Indexing failed: ${err}`);
    } finally {
      setIsIndexing(false);
    }
  };

  // Handle Q&A Ask
  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!qaQuery.trim() || qaLoading) return;

    const userMessage = { role: 'user', text: qaQuery.trim() };
    setQaMessages((prev) => [...prev, userMessage]);
    setQaQuery('');
    setQaLoading(true);

    try {
      const res = await repoService.askRepository(repoId, userMessage.text);
      // res: { answer: "...", evidence: [...] }
      setQaMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer || 'No direct answer returned.',
          evidence: res.evidence || [],
        },
      ]);
    } catch (err) {
      setQaMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error processing query: ${err.response?.data?.detail || err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  // Handle PR Review Submission
  const handleSubmitPRReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.diff_text.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewService.submitReview(repoId, {
        diff_text: reviewForm.diff_text,
        pr_number: Number(reviewForm.pr_number) || 1,
        commit_sha: reviewForm.commit_sha || 'main',
      });
      setCurrentReview(res);
      setReviewHistory((prev) => [res, ...prev]);
    } catch (err) {
      alert(`Review submission failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Quick Sample Diff Loader
  const handleLoadSampleDiff = () => {
    setReviewForm({
      pr_number: 42,
      commit_sha: 'e4d8a1c',
      diff_text: `diff --git a/src/auth/token_service.py b/src/auth/token_service.py
index 4a12b3..9f88e2 100644
--- a/src/auth/token_service.py
+++ b/src/auth/token_service.py
@@ -25,5 +25,5 @@ def verify_jwt(token: str):
-    token_cache.set(token, True)
+    token_cache.set(token, True, ex=TOKEN_TTL_SECONDS)
     return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])`,
    });
  };

  if (loadingRepo && !repo) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const currentStatus = repo?.status || 'UNINDEXED';

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">{repo?.name || `Repository #${repoId}`}</h1>
            <StatusBadge status={currentStatus} />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-slate-500" />
              {repo?.default_branch || 'main'}
            </span>
            {repo?.clone_url && (
              <a
                href={repo.clone_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:underline"
              >
                <span>GitHub Source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {stats && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-mono">
              <span className="text-slate-400">Precision:</span>
              <span className="text-emerald-400 font-bold">{stats.precision_rate_percentage || 0}%</span>
            </div>
          )}

          <button
            onClick={() => setIsIndexOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/50 hover:text-white transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>{currentStatus === 'READY' ? 'Re-index AST' : 'Trigger Indexing'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-surface-border overflow-x-auto pb-px">
        <button
          onClick={() => handleTabChange('qa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'qa'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Codebase Q&A (RAG)</span>
        </button>

        <button
          onClick={() => handleTabChange('review')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'review'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>PR Review & Security Audit</span>
        </button>

        <button
          onClick={() => handleTabChange('chunks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'chunks'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>AST Chunks</span>
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Model Telemetry</span>
        </button>
      </div>

      {/* ================= TAB 1: CODEBASE Q&A (RAG) ================= */}
      {activeTab === 'qa' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Thread */}
          <div className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl border border-surface-border bg-surface-card/60 backdrop-blur-md overflow-hidden">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {qaMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : msg.isError
                        ? 'bg-rose-950/40 border border-rose-900/50 text-rose-300'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-200 shadow-md'
                    }`}
                  >
                    {/* Assistant Header */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px] mb-2 font-mono">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Codebase Intelligence</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Citations / Evidence Badges */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Grounding Evidence (AST Chunks):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.evidence.map((ev, evIdx) => (
                            <button
                              key={evIdx}
                              onClick={() => setActiveEvidenceModal(ev)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-[11px] font-mono text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                            >
                              <FileCode2 className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{ev.file_path}</span>
                              <span className="text-slate-400">
                                L{ev.start_line}-L{ev.end_line}
                              </span>
                              {ev.similarity_score && (
                                <span className="rounded bg-indigo-900/60 px-1 text-[9px] text-emerald-400">
                                  {Math.round(ev.similarity_score * 100)}%
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {qaLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-indigo-400 w-fit animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning AST semantic embeddings...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendQuery} className="p-3 border-t border-surface-border bg-slate-900/60 flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  currentStatus === 'READY'
                    ? 'Ask questions about codebase architecture, auth, or functions...'
                    : 'Warning: Repo is not indexed yet. Index it first for grounded answers.'
                }
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                className="flex-1 rounded-xl border border-surface-border bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={qaLoading || !qaQuery.trim()}
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>

          {/* Right Sidebar: Quick Prompts & Grounding Info */}
          <div className="space-y-4">
            
            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Suggested Inquiries
              </h3>
              <div className="space-y-1.5">
                {[
                  'How does authentication and token verification work?',
                  'Where are database models and migrations defined?',
                  'Explain the data flow from routes to services.',
                  'Are there any exposed credentials or hardcoded keys?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => setQaQuery(promptText)}
                    className="w-full text-left rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors leading-relaxed"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-4 text-xs space-y-2 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero Hallucination Guarantee</span>
              </div>
              <p className="leading-relaxed">
                Answers are synthesized strictly from retrieved AST chunks. Every answer provides source line ranges that point directly to your files.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: PR REVIEW & AUDIT ================= */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          
          {/* Submission Box */}
          <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">Submit Pull Request Diff for Security Audit</h3>
                <p className="text-xs text-slate-400">Runs AST pattern checks, detects CWE vulnerabilities, and stages suggested patches.</p>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleDiff}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono underline underline-offset-4 self-start sm:self-auto"
              >
                Load Sample Vulnerable Diff
              </button>
            </div>

            <form onSubmit={handleSubmitPRReview} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">PR Number</label>
                  <input
                    type="number"
                    value={reviewForm.pr_number}
                    onChange={(e) => setReviewForm({ ...reviewForm, pr_number: e.target.value })}
                    className="w-full rounded-xl border border-surface-border bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Commit SHA</label>
                  <input
                    type="text"
                    value={reviewForm.commit_sha}
                    onChange={(e) => setReviewForm({ ...reviewForm, commit_sha: e.target.value })}
                    className="w-full rounded-xl border border-surface-border bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Git Unified Diff Text</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste git diff output here (diff --git a/... b/...)"
                  value={reviewForm.diff_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, diff_text: e.target.value })}
                  className="w-full rounded-xl border border-surface-border bg-slate-950 p-3 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Auditing Diff with AI...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>Run PR Review & Security Audit</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Review Results */}
          {currentReview && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-slate-900/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Review Summary</span>
                    <SeverityBadge level={currentReview.risk_level || 'LOW'} />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {currentReview.summary || 'Audit completed without summary.'}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <div>Findings: {currentReview.findings?.length || 0}</div>
                  <div className="text-[10px] text-slate-500">ID: #{currentReview.id}</div>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Categorized Findings ({currentReview.findings?.length || 0})
                </h4>

                {(!currentReview.findings || currentReview.findings.length === 0) && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-emerald-400">
                    <CheckCircle2 className="mx-auto h-6 w-6 mb-2" />
                    <span>No vulnerabilities or bugs detected in this diff. Clean code!</span>
                  </div>
                )}

                {currentReview.findings?.map((finding, idx) => (
                  <div
                    key={finding.id || idx}
                    className="rounded-2xl border border-surface-border bg-surface-card/80 p-5 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <SeverityBadge level={finding.severity || finding.risk_level} />
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
                          {finding.category || 'SECURITY'}
                        </span>
                        <span className="text-xs font-medium text-white truncate max-w-md">
                          {finding.title || finding.description}
                        </span>
                      </div>

                      {finding.file_path && (
                        <span className="text-xs font-mono text-slate-400">
                          {finding.file_path}:{finding.line_number || '1'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {finding.explanation || finding.description}
                    </p>

                    {/* Suggested Diff Patch */}
                    {finding.suggested_diff && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Suggested Remediation Diff:
                        </span>
                        <DiffViewer diffText={finding.suggested_diff} title="Suggested Patch" />
                      </div>
                    )}

                    {/* Developer Feedback Loop */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <FeedbackWidget
                        findingId={finding.id || idx + 1}
                        onFeedbackSubmitted={loadStats}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Accordion / List */}
          {reviewHistory.length > 1 && (
            <div className="space-y-2 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Review History ({reviewHistory.length})
              </h4>
              <div className="space-y-2">
                {reviewHistory.map((rev) => (
                  <button
                    key={rev.id}
                    onClick={() => setCurrentReview(rev)}
                    className={`w-full text-left rounded-xl border p-3 text-xs flex items-center justify-between transition-colors ${
                      currentReview?.id === rev.id
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold text-white">Review #{rev.id}</span>
                      <SeverityBadge level={rev.risk_level} />
                      <span className="text-slate-400 truncate max-w-xs">{rev.summary}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {rev.findings?.length || 0} findings
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 3: AST CHUNKS ================= */}
      {activeTab === 'chunks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Parsed AST Syntax Chunks</h3>
              <p className="text-xs text-slate-400">Vectorized units of code used for semantic search grounding.</p>
            </div>
            <button
              onClick={loadChunks}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Refresh Chunks
            </button>
          </div>

          {loadingChunks && (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            </div>
          )}

          {!loadingChunks && chunks.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
              No code chunks found. Click &quot;Trigger Indexing&quot; to parse your repository.
            </div>
          )}

          <div className="space-y-3">
            {chunks.map((chunk, i) => (
              <div
                key={chunk.id || i}
                className="rounded-xl border border-surface-border bg-slate-900/60 p-4 font-mono text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-indigo-300 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
                    {chunk.file_path}
                  </span>
                  <span className="text-slate-500">
                    Lines {chunk.start_line} - {chunk.end_line}
                  </span>
                </div>
                {chunk.content && (
                  <pre className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
                    {chunk.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: TELEMETRY & STATS ================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5">
              <div className="text-xs text-slate-400">Precision Rate</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {stats?.precision_rate_percentage !== undefined ? `${stats.precision_rate_percentage}%` : 'N/A'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Accuracy based on developer feedback</div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5">
              <div className="text-xs text-slate-400">Total Feedback Submissions</div>
              <div className="text-3xl font-bold font-mono text-white mt-1">
                {stats?.total_feedback || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Telemetry data points in PostgreSQL</div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5">
              <div className="text-xs text-slate-400">Verified Useful Fixes</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {stats?.useful_count || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">ACCURATE_FIX confirmed</div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-5">
              <div className="text-xs text-slate-400">False Positives</div>
              <div className="text-3xl font-bold font-mono text-rose-400 mt-1">
                {stats?.false_positive_count || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Flagged for model fine-tuning</div>
            </div>

          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card/60 p-6 text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="text-sm font-semibold text-white">How the Feedback Loop Operates</h4>
            <p>
              Whenever you click Thumbs Up or Thumbs Down on any security finding, a payload is posted to <code>/findings/{'{id}'}/feedback</code>. 
              The backend computes precision metrics to evaluate model drift, reduce false positives, and ensure AST code reviews stay strictly relevant to your team&apos;s standards.
            </p>
          </div>
        </div>
      )}

      {/* Indexing Trigger Modal */}
      <Modal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        title={`Trigger AST Indexing: ${repo?.name}`}
      >
        <form onSubmit={handleTriggerIndex} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter the local filesystem path to the repository on your backend server:
          </p>
          <input
            type="text"
            required
            placeholder="/path/to/repo or C:\projects\repo"
            value={repoPathInput}
            onChange={(e) => setRepoPathInput(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
          />
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
              disabled={isIndexing}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isIndexing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run Indexing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Evidence Inspection Modal */}
      <Modal
        isOpen={!!activeEvidenceModal}
        onClose={() => setActiveEvidenceModal(null)}
        title={`Grounding Evidence: ${activeEvidenceModal?.file_path || ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Line Range: L{activeEvidenceModal?.start_line} - L{activeEvidenceModal?.end_line}</span>
            {activeEvidenceModal?.similarity_score && (
              <span className="text-emerald-400">
                Similarity Score: {Math.round(activeEvidenceModal.similarity_score * 100)}%
              </span>
            )}
          </div>
          {activeEvidenceModal?.snippet ? (
            <pre className="rounded-xl bg-slate-950 p-4 text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
              {activeEvidenceModal.snippet}
            </pre>
          ) : (
            <div className="rounded-xl bg-slate-950 p-4 text-slate-400 border border-slate-800 text-center">
              Retrieved from chunk index for file {activeEvidenceModal?.file_path}.
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
