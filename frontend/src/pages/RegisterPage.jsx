import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import PublicLayout from '../components/layouts/PublicLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import ImageUploadField from '../components/ImageUploadField.jsx';
import { uploadImage } from '../services/uploadService.js';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    profileImagePath: '',
    profileImagePreview: '',
    profileImageFile: null,
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
      let profileImagePath = form.profileImagePath || null;
      if (form.profileImageFile) {
        profileImagePath = await uploadImage(form.profileImageFile);
      }
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        profileImagePath,
        password: form.password
      });
      navigate('/login', { replace: true, state: { justRegistered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-[#0f6b46] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#0f6b46]/12 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-emerald-500 dark:focus:bg-white/8";
  const labelClass = "mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300";

  return (
    <PublicLayout>
      {/* ── Full-page green background ── */}
      <div className="relative min-h-screen overflow-hidden bg-[#0a4a30]">

        {/* ── Decorative background layers ── */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#0f6b46]/60 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#1a8a5a]/50 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22a06b]/20 blur-[80px]" />
          <div className="absolute left-10 top-1/4 h-64 w-64 rounded-full border border-white/5" />
          <div className="absolute left-16 top-1/4 h-48 w-48 rounded-full border border-white/5" />
          <div className="absolute right-10 bottom-1/4 h-80 w-80 rounded-full border border-white/5" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)'
            }}
          />
        </div>

        {/* ── Left decorative panel (desktop only) ── */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[38%] lg:block">
          <div className="flex h-full flex-col items-center justify-center px-14 text-white">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <FaLeaf className="text-4xl text-white/90" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white">
              Join the<br />Hostel Portal
            </h1>
            <p className="max-w-xs text-center text-base leading-relaxed text-white/60">
              Create your student account and start managing your hostel accommodation today.
            </p>
            <div className="mt-10 flex flex-col gap-3">
              {[
                'Instant room applications',
                'Track payment status',
                'Submit maintenance requests',
                'View announcements'
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 rounded-full bg-white/8 px-5 py-2.5 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: register card ── */}
        <div className="flex min-h-screen items-center justify-center px-4 py-10 lg:ml-[38%]">
          <div className="w-full max-w-[460px]">

            <div className="relative overflow-hidden rounded-[28px] bg-white/95 shadow-[0_32px_80px_rgba(0,0,0,0.28)] ring-1 ring-white/50 backdrop-blur-xl dark:bg-[#1a1d22]/95 dark:ring-white/8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#0f6b46] to-emerald-500" />

              <div className="px-8 pb-8 pt-9">
                {/* Logo */}
                <div className="mb-7 flex items-center gap-4">
                  {/* <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-[16px] bg-[#0f6b46] text-lg font-black text-white shadow-[0_8px_24px_rgba(15,107,70,0.40)]">
                    H
                  </div> */}
                  <div>
                    <p className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                      Hostel Management
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-white/40">
                      University Portal
                    </p>
                  </div>
                </div>

                <h2 className="mb-1 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Create your account
                </h2>
                <p className="mb-7 text-sm text-neutral-500 dark:text-neutral-400">
                  Fill in your details to get started
                </p>

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                    <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Row: Full Name + Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="register-fullname" className={labelClass}>Full Name</label>
                      <input
                        id="register-fullname"
                        type="text"
                        placeholder="Your full name"
                        value={form.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="register-phone" className={labelClass}>Phone</label>
                      <input
                        id="register-phone"
                        type="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row: Email + Gender */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="register-email" className={labelClass}>Email</label>
                      <input
                        id="register-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="register-gender" className={labelClass}>Gender</label>
                      <select
                        id="register-gender"
                        value={form.gender}
                        onChange={e => handleChange('gender', e.target.value)}
                        className={inputClass}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Password + Confirm Password */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="register-password" className={labelClass}>Password</label>
                      <div className="relative">
                        <input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={e => handleChange('password', e.target.value)}
                          required
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400 hover:text-neutral-600 dark:text-white/30 dark:hover:text-white/60"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEye className="text-base" /> : <FaEyeSlash className="text-base" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="register-confirm-password" className={labelClass}>Confirm Password</label>
                      <div className="relative">
                        <input
                          id="register-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={e => handleChange('confirmPassword', e.target.value)}
                          required
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400 hover:text-neutral-600 dark:text-white/30 dark:hover:text-white/60"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <FaEye className="text-base" /> : <FaEyeSlash className="text-base" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile photo */}
                  <div>
                    <ImageUploadField
                      id="register-profile-image"
                      label="Profile Photo"
                      value={form.profileImagePreview || form.profileImagePath}
                      onChange={(file, previewUrl) =>
                        setForm((prev) => ({
                          ...prev,
                          profileImageFile: file,
                          profileImagePreview: previewUrl
                        }))
                      }
                      onError={setError}
                      onClear={() =>
                        setForm((prev) => ({
                          ...prev,
                          profileImagePath: '',
                          profileImagePreview: '',
                          profileImageFile: null
                        }))
                      }
                      helperText="Optional — upload a photo or take one with your camera."
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0f6b46] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,107,70,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0c5a3b] hover:shadow-[0_12px_32px_rgba(15,107,70,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#0f6b46] hover:underline dark:text-emerald-400">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              © {new Date().getFullYear()} University Hostel Management System
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
