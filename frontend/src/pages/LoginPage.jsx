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
      const redirectPath = data.role === 'ADMIN' ? '/admin' : '/student';
      navigate(from || redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md">
          <div className="card">
            <h2 className="page-title mb-6 text-center text-neutral-900 dark:text-white">
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
