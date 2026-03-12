import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
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
            <h2 className="page-title mb-2 mt-3 text-center text-neutral-900 dark:text-white">
              Reset Password
            </h2>
            <p className="body-text mb-6 text-center text-neutral-600 dark:text-neutral-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="alert-error mb-4">
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-4">
                <div className="alert-success">
                  If an account exists with this email, a password reset link has been sent. 
                  Please check your email and follow the instructions.
                </div>
                <Link
                  to="/login"
                  className="btn-primary block w-full text-center"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="input-field"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="body-text mt-6 text-center text-neutral-600 dark:text-neutral-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-md bg-primary-100/50 px-2.5 py-1 text-primary-900 transition-colors duration-200 hover:bg-primary-500 hover:!text-white dark:bg-primary-900/20 dark:text-primary-200 dark:hover:bg-primary-600 dark:hover:!text-white"
                  >
                    Sign in here
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <LoadingOverlay
        open={loading}
        title="Processing request"
        message="Please wait while we send the password reset link."
        blockNavigation
      />
    </PublicLayout>
  );
}
