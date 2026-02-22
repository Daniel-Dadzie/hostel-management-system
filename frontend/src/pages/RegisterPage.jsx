import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    password: '',
    confirmPassword: ''
  });
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
      <div className="mx-auto max-w-md">
        <div className="card">
          <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900 dark:text-white">
            Create Account
          </h2>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
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
              <input
                id="register-password"
                type="password"
                className="input-field"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                className="input-field"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
