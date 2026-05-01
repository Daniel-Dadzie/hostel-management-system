import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(location.state?.justRegistered);
  const from = location.state?.from?.pathname || null;

  const LOGIN_STEPS = ['Verifying credentials', 'Loading profile', 'Preparing dashboard'];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingStep(0);
    
    try {
      // Step 0: Verify credentials
      await new Promise(resolve => {
        setTimeout(resolve, 600);
      });
      setLoadingStep(1);

      const data = await login(email, password);
      
      // Step 1: Loading profile
      await new Promise(resolve => {
        setTimeout(resolve, 600);
      });
      setLoadingStep(2);

      // Step 2: Preparing dashboard
      await new Promise(resolve => {
        setTimeout(resolve, 600);
      });

      const redirectPath = data.role === 'ADMIN' ? '/admin' : '/student/hostels';
      navigate(from || redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      {/* ── Full-page green background ── */}
      <div className="relative min-h-screen overflow-hidden bg-[#0a4a30]">

        {/* ── Decorative green background layers ── */}
        <div className="pointer-events-none absolute inset-0">
          {/* Large radial glow top-left */}
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#0f6b46]/60 blur-[120px]" />
          {/* Radial glow bottom-right */}
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#1a8a5a]/50 blur-[100px]" />
          {/* Subtle center accent */}
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22a06b]/20 blur-[80px]" />

          {/* Geometric decorative circles */}
          <div className="absolute left-10 top-1/4 h-64 w-64 rounded-full border border-white/5" />
          <div className="absolute left-16 top-1/4 h-48 w-48 rounded-full border border-white/5" />
          <div className="absolute right-10 bottom-1/4 h-80 w-80 rounded-full border border-white/5" />
          <div className="absolute right-20 bottom-1/4 h-56 w-56 rounded-full border border-white/5" />

          {/* Diagonal stripe texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)'
            }}
          />
        </div>

        {/* ── Left decorative panel (desktop only) ── */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[45%] lg:block">
          <div className="flex h-full flex-col items-center justify-center px-16 text-white">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <FaLeaf className="text-4xl text-white/90" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white">
              University<br />Hostel System
            </h1>
            <p className="max-w-xs text-center text-base leading-relaxed text-white/60">
              Manage your accommodation, payments, and room bookings from one unified platform.
            </p>

            {/* Feature pills */}
            <div className="mt-10 flex flex-col gap-3">
              {[
                'Room allocation & booking',
                'Payment tracking',
                'Maintenance requests',
                'Real-time notifications'
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 rounded-full bg-white/8 px-5 py-2.5 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: login card ── */}
        <div className="flex min-h-screen items-center justify-center px-4 py-12 lg:ml-[45%]">
          <div className="w-full max-w-[440px]">

            {/* Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-white/95 shadow-[0_32px_80px_rgba(0,0,0,0.28)] ring-1 ring-white/50 backdrop-blur-xl dark:bg-[#1a1d22]/95 dark:ring-white/8">
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#0f6b46] to-emerald-500" />

              <div className="px-8 pb-8 pt-9">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-4">
                  {/* <div className="flex h-13 w-13 items-center justify-center rounded-[16px] bg-[#0f6b46] text-lg font-black text-white shadow-[0_8px_24px_rgba(15,107,70,0.40)]">
                    H
                  </div> */}
                  <div className="align-middle">
                    <p className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                      Hostel Management
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-white/40">
                      University Portal
                    </p>
                  </div>
                </div>

                <h2 className="mb-1 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="mb-7 text-sm text-neutral-500 dark:text-neutral-400">
                  Sign in to your account to continue
                </p>

                {/* Success banner */}
                {justRegistered && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                    <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Registration successful — please sign in with your new account.
                    </p>
                  </div>
                )}

                {/* Error banner */}
                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                    <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Email address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-[#0f6b46] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0f6b46]/12 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-emerald-500 dark:focus:bg-white/8"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="login-password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-[#0f6b46] hover:underline dark:text-emerald-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-[#0f6b46] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0f6b46]/12 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-emerald-500 dark:focus:bg-white/8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400 hover:text-neutral-600 dark:text-white/30 dark:hover:text-white/60"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEye className="text-base" /> : <FaEyeSlash className="text-base" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`relative h-5 w-5 flex-shrink-0 rounded-md border-2 transition-all duration-150 ${
                        rememberMe
                          ? 'border-[#0f6b46] bg-[#0f6b46]'
                          : 'border-neutral-300 bg-white dark:border-white/20 dark:bg-white/5'
                      }`}
                      aria-label="Remember me"
                    >
                      {rememberMe && (
                        <svg className="absolute inset-0 m-auto h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Remember me for 30 days</span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0f6b46] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,107,70,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0c5a3b] hover:shadow-[0_12px_32px_rgba(15,107,70,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-[#0f6b46] hover:underline dark:text-emerald-400">
                    Create one here
                  </Link>
                </p>
              </div>
            </div>

            {/* <p className="mt-6 text-center text-xs text-white/40">
              © {new Date().getFullYear()} University Hostel Management System
            </p> */}
          </div>
        </div>
      </div>

      <LoadingOverlay
        open={loading}
        title="Signing you in"
        message="Setting up your secure session..."
        blockNavigation
        steps={LOGIN_STEPS}
        currentStep={loadingStep}
      />
    </PublicLayout>
  );
}
