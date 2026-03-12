import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <PublicLayout>
        <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 animate-float rounded-full bg-primary-100/50 blur-3xl dark:bg-primary-900/10" />
          <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 animate-float-delayed rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-900/10" />
          <div className="relative z-10 w-full max-w-md">
            <div className="card relative animate-scale-in overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-600" />
              <div className="alert-error mt-4">
                Invalid or missing reset token. Please request a new password reset link.
              </div>
              <p className="body-text mt-6 text-center text-neutral-600 dark:text-neutral-400">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center rounded-md bg-primary-100/50 px-2.5 py-1 text-primary-900 transition-colors duration-200 hover:bg-primary-500 hover:!text-white dark:bg-primary-900/20 dark:text-primary-200 dark:hover:bg-primary-600 dark:hover:!text-white"
                >
                  Request new link
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 animate-float rounded-full bg-primary-100/50 blur-3xl dark:bg-primary-900/10" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 animate-float-delayed rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-900/10" />
        <div className="relative z-10 w-full max-w-md">
          <div className="card relative animate-scale-in overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-600" />
            <h2 className="page-title mb-2 mt-3 text-center text-neutral-900 dark:text-white">
              Set New Password
            </h2>
            <p className="body-text mb-6 text-center text-neutral-600 dark:text-neutral-400">
              Enter your new password below.
            </p>

            {error && (
              <div className="alert-error mb-4">
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-4">
                <div className="alert-success">
                  Your password has been reset successfully! Redirecting to login...
                </div>
                <Link
                  to="/login"
                  className="btn-primary block w-full text-center"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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

                <div>
                  <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="input-field"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <p className="body-text mt-6 text-center text-neutral-600 dark:text-neutral-400">
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-md bg-primary-100/50 px-2.5 py-1 text-primary-900 transition-colors duration-200 hover:bg-primary-500 hover:!text-white dark:bg-primary-900/20 dark:text-primary-200 dark:hover:bg-primary-600 dark:hover:!text-white"
                  >
                    Back to Login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <LoadingOverlay
        open={loading}
        title="Resetting password"
        message="Please wait while we update your password."
        blockNavigation
      />
    </PublicLayout>
  );
}
