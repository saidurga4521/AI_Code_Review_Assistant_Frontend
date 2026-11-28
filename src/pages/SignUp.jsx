import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/authSlice';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Terminal
} from 'lucide-react';

export default function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [localValidation, setLocalValidation] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear previous errors when landing on this page
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalValidation('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validations
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setLocalValidation('All fields are required.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalValidation('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalValidation('Passwords do not match.');
      return;
    }

    // 2. Dispatch register thunk
    try {
      await dispatch(
        registerUser({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      // Backend error is automatically populated into Redux `error`
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      
      {/* Left Column: Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-surface-border bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-12 relative overflow-hidden">
        
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

        {/* Central Info */}
        <div className="space-y-6 z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Terminal className="h-3.5 w-3.5" />
            <span>Developer Onboarding • v1.0</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Deploy your personal <span className="text-indigo-400">Code Review Agent</span> in seconds.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Index your GitHub repositories, inspect AST chunks, ask natural language codebase questions, and audit PR diffs with confidence.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>Private & isolated token-authenticated developer sessions</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Telemetry feedback loops for continuous accuracy improvements</span>
            </div>
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md z-10">
          <p className="text-xs font-mono text-slate-400">
            <span className="text-emerald-400">● Auth Service:</span> /api/v1/auth/register
          </p>
        </div>

      </div>

      {/* Right Column: Register Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Get started with your AI Code Review & Repository Assistant.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {(localValidation || error) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{localValidation || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Sai Kumar"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

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
                  placeholder="sai@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-border bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

          {/* Switch to Login */}
          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in instead
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}