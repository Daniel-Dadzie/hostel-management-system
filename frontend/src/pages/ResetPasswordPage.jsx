import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck, FaClock } from 'react-icons/fa';
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
  const [tokenExpired, setTokenExpired] = useState(false);
  const [autoLoginCountdown, setAutoLoginCountdown] = useState(3);
  
  const { resetPassword, login } = useAuth();
  const navigate = useNavigate();

  // Handle auto-login countdown
  useEffect(() => {
    if (!success) return;

    const interval = setInterval(() => {
      setAutoLoginCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [success]);

  // Auto-login after successful reset
  useEffect(() => {
    if (success && autoLoginCountdown === 0) {
      performAutoLogin();
    }
  }, [autoLoginCountdown, success]);

  async function performAutoLogin() {
    try {
      setLoading(true);
      // Get email from the token validation or show a message
      // For now, redirect to login - in production, you might want to extract email from token
      navigate('/login', { state: { showMessage: 'Password reset successfully! Please log in with your new password.' } });
    } catch (err) {
      console.error('Auto-login failed:', err);
      navigate('/login');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setTokenExpired(false);

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
    } catch (err) {
      const errorMsg = err.message || 'Failed to reset password';
      
      // Check if token is expired
      if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
        setTokenExpired(true);
        setError('Reset link has expired. Please request a new one.');
      } else {
        setError(errorMsg);
      }
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
              <div className="mt-4 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <FaClock className="text-2xl text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="mt-4 text-center text-lg font-semibold text-neutral-900 dark:text-white">
                Invalid Reset Link
              </h3>
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

            {success ? (
              <div className="space-y-4 py-6">
                {/* Success Animation */}
                <div className="flex justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
                      <FaCheck className="text-4xl text-white" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="page-title mb-2 mt-3 text-emerald-600 dark:text-emerald-400">
                    Password Reset Successfully!
                  </h2>
                  <p className="body-text text-neutral-600 dark:text-neutral-400">
                    Your password has been updated. Redirecting you to login...
                  </p>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <FaClock className="text-sm text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Redirecting in {autoLoginCountdown}s
                  </span>
                </div>

                <Link
                  to="/login"
                  className="btn-primary block w-full text-center"
                >
                  Go to Login Now
                </Link>
              </div>
            ) : (
              <>
                <h2 className="page-title mb-2 mt-3 text-center text-neutral-900 dark:text-white">
                  Set New Password
                </h2>
                <p className="body-text mb-6 text-center text-neutral-600 dark:text-neutral-400">
                  Enter your new password below.
                </p>

                {error && (
                  <div className={`alert-${tokenExpired ? 'warning' : 'error'} mb-4`}>
                    <div className="flex items-start gap-3">
                      {tokenExpired && <FaClock className="mt-0.5 flex-shrink-0 text-lg" />}
                      <div className="flex-1">
                        <p className="font-medium">
                          {tokenExpired ? 'Link Expired' : 'Error'}
                        </p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {tokenExpired ? (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                      This password reset link has expired. For security reasons, reset links are only valid for a limited time.
                    </p>
                    <Link
                      to="/forgot-password"
                      className="btn-primary block w-full text-center"
                    >
                      Request New Reset Link
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex w-full items-center justify-center rounded-md bg-neutral-100 px-4 py-2.5 font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                      Back to Login
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
                          minLength={8}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
                          tabIndex={-1}
                          disabled={loading}
                        >
                          {showPassword ? <FaEye className="text-lg" /> : <FaEyeSlash className="text-lg" />}
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Must contain at least 8 characters, one uppercase, one lowercase, and one number
                      </p>
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
                        minLength={8}
                        disabled={loading}
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
              </>
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
