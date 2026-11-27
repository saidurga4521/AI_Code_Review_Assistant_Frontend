import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  GitPullRequest, 
  Terminal,
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Redux Auth State
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // 2. Local Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localValidation, setLocalValidation] = useState('');

  // 3. Clear previous errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 4. Redirect to Dashboard upon successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalValidation('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setLocalValidation('Please enter both your email and password.');
      return;
    }

    // Dispatches thunk -> calls authService.login -> stores JWT in localStorage -> fetches /auth/me
    dispatch(loginUser(formData));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      
      {/* Left Column: Product Showcase & Brand (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-surface-border bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-12 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">ReviewAI</span>
            <span className="text-xs font-mono text-indigo-400">Autonomous Codebase Intelligence</span>
          </div>
        </div>

        {/* Central Value Proposition */}
        <div className="space-y-6 z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Terminal className="h-3.5 w-3.5" />
            <span>FastAPI Backend Ready • v1.0</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            AI-driven PR audits with <span className="text-indigo-400">Human-in-the-Loop</span> verification.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Connect repositories, query your code with semantic RAG embeddings, and stage automated patches with zero hallucinated risk.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>AST-level chunking and vulnerability classification</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <GitPullRequest className="h-3.5 w-3.5" />
              </div>
              <span>Interactive Git diffs with staged patch approvals</span>
            </div>
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md z-10">
          <p className="text-xs font-mono text-slate-400">
            <span className="text-emerald-400">● Live Connection:</span> http://localhost:8000/api/v1
          </p>
        </div>

      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter your developer credentials to access your repositories.
            </p>
          </div>

          {/* Validation or API Error Alert */}
          {(localValidation || error) && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{localValidation || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="developer@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

          {/* Switch to Register */}
          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Create one now
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}