import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.password
      });
      navigate('/student');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
              Create Account
            </h2>

            {error && (
              <div className="alert-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-fullname" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Full Name
                </label>
                <input
                  id="register-fullname"
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="register-phone" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Phone
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  className="input-field"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="register-gender" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Gender
                </label>
                <select
                  id="register-gender"
                  className="input-field"
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="body-text mt-6 text-center text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-700 hover:underline dark:text-primary-300">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <LoadingOverlay
        open={loading}
        title="Creating your account"
        message="Please wait while we set things up for you."
        blockNavigation
      />
    </PublicLayout>
  );
}
