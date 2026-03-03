import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Redirect based on role
      const redirectPath = data.role === 'ADMIN' ? '/admin' : '/student/hostels';
      navigate(from || redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 animate-float rounded-full bg-primary-100/50 blur-3xl dark:bg-primary-900/10" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 animate-float-delayed rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-900/10" />
        <div className="relative z-10 w-full max-w-md">
          <div className="card relative animate-scale-in overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-600" />
            <h2 className="page-title mb-6 mt-3 text-center text-neutral-900 dark:text-white">
              Welcome Back
            </h2>

            {error && (
              <div className="alert-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEye className="text-lg" /> : <FaEyeSlash className="text-lg" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="body-text mt-6 text-center text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="inline-flex items-center rounded-md bg-primary-100/50 px-2.5 py-1 text-primary-900 transition-colors duration-200 hover:bg-primary-500 hover:!text-white dark:bg-primary-900/20 dark:text-primary-200 dark:hover:bg-primary-600 dark:hover:!text-white"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <LoadingOverlay
        open={loading}
        title="Signing you in"
        message="Please wait while we verify your account."
        blockNavigation
      />
    </PublicLayout>
  );
}
