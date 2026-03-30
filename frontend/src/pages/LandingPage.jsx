import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import heroImage from '../assets/hostel-building-2.jpg';

const features = [
  { icon: 'accommodation', title: 'Comfortable Accommodation', description: 'Modern rooms with AC, WiFi, and comfortable bedding options to suit your preferences.' },
  { icon: 'booking', title: 'Easy Online Booking', description: 'Apply for hostel accommodation online and track your application status in real-time.' },
  { icon: 'security', title: 'Secure Environment', description: '24/7 security surveillance and controlled access ensure a safe living environment.' },
  { icon: 'pricing', title: 'Transparent Pricing', description: 'Clear fee structure with online payment tracking and full payment history.' },
  { icon: 'community', title: 'Community Living', description: 'Connect with fellow students in well-maintained common areas and study rooms.' },
  { icon: 'maintenance', title: 'Maintenance Support', description: 'Quick response to maintenance requests through our online portal.' }
];

function FeatureIcon({ type }) {
  const cls = 'h-5 w-5';
  switch (type) {
    case 'accommodation': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3.75 10.5 12 4l8.25 6.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.25 9.75V19.5h13.5V9.75" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 19.5v-4.5h6v4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'booking': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="5" width="16" height="15" rx="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3.75V7M16 3.75V7M7.5 11.25h9" strokeLinecap="round" /><path d="m9.5 15 1.6 1.6 3.4-3.7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'security': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3.5 5.5 6v5.6c0 4.3 2.8 8.1 6.5 9.4 3.7-1.3 6.5-5.1 6.5-9.4V6L12 3.5Z" strokeLinecap="round" strokeLinejoin="round" /><path d="m9.5 12 1.7 1.7 3.3-3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'pricing': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4.5v15" strokeLinecap="round" /><path d="M15.75 7.5c0-1.24-1.68-2.25-3.75-2.25S8.25 6.26 8.25 7.5 9.93 9.75 12 9.75s3.75 1.01 3.75 2.25-1.68 2.25-3.75 2.25-3.75 1.01-3.75 2.25 1.68 2.25 3.75 2.25 3.75-1.01 3.75-2.25" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'community': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15.75 19.5v-1.1a3.15 3.15 0 0 0-3.15-3.15H8.4a3.15 3.15 0 0 0-3.15 3.15v1.1" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.5 12.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.75 19.5v-.75a2.7 2.7 0 0 0-2.1-2.63M15.75 6.95a2.65 2.65 0 0 1 0 5.1" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'maintenance': return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m14.25 6.75 3 3M5 19l5.35-1.18L18.5 9.68a2.12 2.12 0 0 0-3-3L7.35 14.82 5 19ZM13.5 8.25 16.75 11.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    default: return null;
  }
}

const steps = [
  { number: 1, title: 'Register Account', description: 'Create your student account with your university email.', emoji: '🏠' },
  { number: 2, title: 'Apply for Hostel', description: 'Submit your hostel application with your room preferences.', emoji: '📋' },
  { number: 3, title: 'Confirm Booking', description: 'Receive your room allocation and complete payment.', emoji: '✅' },
  { number: 4, title: 'Move In', description: 'Check in to your assigned room on the designated date.', emoji: '🎉' }
];

const stats = [
  { value: '500+', label: 'Students Housed' },
  { value: '8', label: 'Hostel Blocks' },
  { value: '191', label: 'Rooms Available' },
  { value: '24/7', label: 'Support' }
];

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { to: '/contact-us', label: 'Contact' },
  { to: '/about-us', label: 'About' }
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const dashboardPath = role === 'ADMIN' ? '/admin' : '/student';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">

      {/* ── Sticky Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a4a30]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-sm font-black text-white ring-1 ring-white/20 sm:h-9 sm:w-9">H</div>
            <span className="text-base font-bold tracking-tight text-white sm:text-[17px]">UniHostel</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.href ? (
                <a key={link.label} href={link.href} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/15">{link.label}</a>
              ) : (
                <Link key={link.label} to={link.to} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/15">{link.label}</Link>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f6b46] transition hover:bg-emerald-50 sm:px-5">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block">Login</Link>
                <Link to="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f6b46] shadow-lg transition hover:-translate-y-px hover:bg-emerald-50 sm:px-5">
                  Register
                </Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0a4a30] px-4 pb-4 pt-2 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.href ? (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{link.label}</a>
                ) : (
                  <Link key={link.label} to={link.to} onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{link.label}</Link>
                )
              )}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden sm:min-h-[92vh]">
        <img src={heroImage} alt="Hostel building"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'blur(3px) brightness(0.35) saturate(0.8)', transform: 'scale(1.05)' }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4a30]/80 via-[#0f6b46]/40 to-[#0a3020]/70" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 14px)' }} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
             
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Your Home{' '}
              <span className="block text-emerald-400">Away From Home</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:mt-6 sm:text-lg lg:text-xl">
              Experience comfortable and secure hostel accommodation designed for students.
              Apply online, track your booking, and manage your stay — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/register"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#0f6b46] px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_32px_rgba(15,107,70,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#0c5a3b] sm:px-8 sm:py-4">
                    Apply for Hostel <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-8 sm:py-4">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to={dashboardPath}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#0f6b46] px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_32px_rgba(15,107,70,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#0c5a3b] sm:px-8 sm:py-4">
                  Go to Dashboard <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:flex sm:flex-wrap sm:gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-black text-white sm:text-2xl">{s.value}</p>
                  <p className="text-xs font-medium text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-neutral-950 sm:h-32" />
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="bg-white py-16 dark:bg-neutral-950 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0f6b46] dark:bg-emerald-900/20 dark:text-emerald-400">Why Choose Us</span>
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">Everything You Need</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">
            We provide everything you need for a comfortable and productive stay during your academic journey.
          </p>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_60px_rgba(15,107,70,0.10)] dark:border-white/8 dark:bg-neutral-900 sm:p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 transition-all duration-300 group-hover:from-emerald-50/60 dark:group-hover:from-emerald-900/10" />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f6b46] text-white shadow-[0_8px_20px_rgba(15,107,70,0.30)] transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="relative overflow-hidden bg-[#0a4a30] py-16 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 14px)' }} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">Simple Process</span>
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-white/60 sm:text-lg">
            Getting your hostel accommodation is simple and straightforward.
          </p>

          <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                {idx < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+32px)] top-8 hidden h-0.5 w-[calc(100%-64px)] bg-white/15 lg:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-white ring-1 ring-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-white">{step.number}</span>
                    {step.emoji}
                  </div>
                  <h3 className="text-base font-bold text-white sm:text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-white py-16 dark:bg-neutral-950 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b46] via-[#0e6040] to-[#0a4a30] p-8 text-center shadow-[0_32px_80px_rgba(15,107,70,0.30)] sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 14px)' }} />
            <div className="relative">
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">Get Started Today</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">Ready to Apply?</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/65 sm:text-lg">
                Join hundreds of students who have found their home at UniHostel.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                {isAuthenticated ? (
                  <Link to={dashboardPath}
                    className="group w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#0f6b46] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto">
                    Go to Dashboard <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register"
                      className="group w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#0f6b46] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto">
                      Create Account <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                    <Link to="/login"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/20 sm:w-auto">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-100 bg-white dark:border-white/6 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f6b46] text-sm font-black text-white">H</div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">UniHostel</p>
                <p className="text-xs text-neutral-400">University Hostel Management</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link to="/about-us" className="hover:text-[#0f6b46] dark:hover:text-emerald-400">About Us</Link>
              <Link to="/contact-us" className="hover:text-[#0f6b46] dark:hover:text-emerald-400">Contact</Link>
              <Link to="/privacy-policy" className="hover:text-[#0f6b46] dark:hover:text-emerald-400">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-[#0f6b46] dark:hover:text-emerald-400">Terms</Link>
            </div>
            <div className="text-center text-sm text-neutral-400 dark:text-neutral-500 md:text-right">
              <a href="mailto:support@unihostel.com" className="block hover:text-[#0f6b46] dark:hover:text-emerald-400">support@unihostel.com</a>
              <a href="tel:+233123456789" className="block hover:text-[#0f6b46] dark:hover:text-emerald-400">+233 (123) 456-789</a>
            </div>
          </div>
          <div className="mt-6 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400 dark:border-white/6 dark:text-neutral-500">
            © {new Date().getFullYear()} UniHostel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
