import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import hostelLogo from '../assets/hostel-logo.svg';
import heroImage3 from '../assets/umat3.jpg';

const features = [
  {
    icon: 'accommodation',
    title: 'Comfortable Accommodation',
    description: 'Modern rooms with AC, WiFi, and comfortable bedding options to suit your preferences.'
  },
  {
    icon: 'booking',
    title: 'Easy Online Booking',
    description: 'Apply for hostel accommodation online and track your application status in real-time.'
  },
  {
    icon: 'security',
    title: 'Secure Environment',
    description: '24/7 security surveillance and controlled access ensure a safe living environment.'
  },
  {
    icon: 'pricing',
    title: 'Transparent Pricing',
    description: 'Clear fee structure with online payment tracking and payment history.'
  },
  {
    icon: 'community',
    title: 'Community Living',
    description: 'Connect with fellow students in well-maintained common areas and study rooms.'
  },
  {
    icon: 'maintenance',
    title: 'Maintenance Support',
    description: 'Quick response to maintenance requests through our online portal.'
  }
];

function FeatureIcon({ type }) {
  const iconClassName = 'h-5 w-5';

  switch (type) {
    case 'accommodation':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3.75 10.5 12 4l8.25 6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.25 9.75V19.5h13.5V9.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 19.5v-4.5h6v4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'booking':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 3.75V7" strokeLinecap="round" />
          <path d="M16 3.75V7" strokeLinecap="round" />
          <path d="M7.5 11.25h9" strokeLinecap="round" />
          <path d="m9.5 15 1.6 1.6 3.4-3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'security':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3.5 5.5 6v5.6c0 4.3 2.8 8.1 6.5 9.4 3.7-1.3 6.5-5.1 6.5-9.4V6L12 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m9.5 12 1.7 1.7 3.3-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'pricing':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 4.5v15" strokeLinecap="round" />
          <path d="M15.75 7.5c0-1.24-1.68-2.25-3.75-2.25S8.25 6.26 8.25 7.5 9.93 9.75 12 9.75s3.75 1.01 3.75 2.25-1.68 2.25-3.75 2.25-3.75 1.01-3.75 2.25 1.68 2.25 3.75 2.25 3.75-1.01 3.75-2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'community':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M15.75 19.5v-1.1a3.15 3.15 0 0 0-3.15-3.15H8.4a3.15 3.15 0 0 0-3.15 3.15v1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 12.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.75 19.5v-.75a2.7 2.7 0 0 0-2.1-2.63" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.75 6.95a2.65 2.65 0 0 1 0 5.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'maintenance':
      return (
        <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m14.25 6.75 3 3" strokeLinecap="round" />
          <path d="m5 19 5.35-1.18L18.5 9.68a2.12 2.12 0 0 0-3-3L7.35 14.82 5 19Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.5 8.25 16.75 11.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

const steps = [
  {
    number: 1,
    title: 'Register Account',
    description: 'Create your student account with your university email.'
  },
  {
    number: 2,
    title: 'Apply for Hostel',
    description: 'Submit your hostel application with room preferences.'
  },
  {
    number: 3,
    title: 'Confirm Booking',
    description: 'Receive your room allocation and complete payment.'
  },
  {
    number: 4,
    title: 'Move In',
    description: 'Check in to your assigned room on the designated date.'
  }
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const dashboardPath = role === 'ADMIN' ? '/admin' : '/student';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={hostelLogo}
              alt="UniHostel logo"
              className="h-9 w-9 shrink-0 rounded-xl shadow-md ring-1 ring-neutral-200/70 dark:ring-white/10"
            />
            <span className="text-[17px] font-bold tracking-tight text-neutral-900 dark:text-white">
              UniHostel
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300 lg:flex">
            <Link to="/contact-us" className="transition-colors hover:text-primary-700 dark:hover:text-primary-400">
              Contact Us
            </Link>
            <Link to="/about-us" className="transition-colors hover:text-primary-700 dark:hover:text-primary-400">
              About Us
            </Link>
            <Link to="/privacy-policy" className="transition-colors hover:text-primary-700 dark:hover:text-primary-400">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="transition-colors hover:text-primary-700 dark:hover:text-primary-400">
              Terms
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="btn-primary"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <img
          src={heroImage3}
          alt="Hostel building and facilities"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover blur-[6px] brightness-[0.88] contrast-[1.05] saturate-[1.08]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/72 via-white/48 to-white/58 dark:from-neutral-950/72 dark:via-neutral-900/42 dark:to-neutral-950/58" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.14),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 text-center">
              <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
                Your Home{' '}
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 bg-clip-text text-transparent dark:from-primary-400 dark:via-primary-300 dark:to-emerald-400">
                  Away From Home
                </span>
              </h1>
              <p className="animate-slide-up delay-150 mx-auto mt-6 max-w-2xl text-lg text-neutral-700 dark:text-neutral-200 sm:text-xl">
                Experience comfortable and secure hostel accommodation designed for students.
                Apply online, track your booking, and manage your stay all in one place.
              </p>
              <div className="animate-slide-up delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/register"
                    className="btn-primary group inline-flex items-center gap-2.5 px-8 py-3.5 text-base shadow-lg shadow-primary-900/20"
                  >
                    {'Apply for Hostel'}<span className="transition-transform duration-200 group-hover:translate-x-1">{'→'}</span>
                  </Link>
                  <Link
                    to="/login"
                    className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 text-base ring-1 ring-neutral-200 dark:ring-neutral-700"
                  >
                    Already have an account?
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link
                  to={dashboardPath}
                  className="btn-primary group inline-flex items-center gap-2.5 px-8 py-3.5 text-base shadow-lg shadow-primary-900/20"
                >
                  {'Go to Dashboard'}<span className="transition-transform duration-200 group-hover:translate-x-1">{'→'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative floating blobs */}
        <div className="absolute -right-40 -top-40 h-96 w-96 animate-float rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-900/15"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-float-delayed rounded-full bg-accent-200/20 blur-3xl dark:bg-accent-900/15"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-neutral-800 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Why Choose UniHostel?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-300">
              We provide everything you need for a comfortable and productive stay during your academic journey.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card group cursor-default hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-xl dark:hover:border-primary-800 dark:hover:shadow-primary-900/20"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-300/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-900/25 dark:ring-emerald-400/20">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-primary-50 dark:bg-neutral-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-300">
              Getting your hostel accommodation is simple and straightforward.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-xl font-bold text-white shadow-lg shadow-primary-900/25">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  {step.description}
                </p>
                {idx < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-y-1/2 bg-primary-200 dark:bg-primary-800 lg:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 bg-primary-700 dark:bg-primary-900 sm:py-24">
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Apply?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-100">
            Join hundreds of students who have found their home at UniHostel. 
            Start your application today and secure your spot.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-2xl"
              >
                {'Go to Dashboard'}<span className="transition-transform duration-200 group-hover:translate-x-1">{'→'}</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-2xl"
              >
                {'Create Your Account'}<span className="transition-transform duration-200 group-hover:translate-x-1">{'→'}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-neutral-200 bg-gradient-to-br from-white via-primary-50/70 to-emerald-50/80 dark:border-neutral-700 dark:from-neutral-800 dark:via-primary-950/25 dark:to-emerald-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_30%)]"></div>
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-900/20"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Top Section: Brand and Links */}
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              {/* Brand removed from footer */}
              {/* All Links in One Row */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-0">
                <Link to="/about-us" className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-white/60 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-primary-400">About Us</Link>
                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                <Link to="/contact-us" className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-white/60 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-primary-400">Contact Us</Link>
                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                <Link to="/privacy-policy" className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-white/60 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-primary-400">Privacy Policy</Link>
                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                <Link to="/terms-and-conditions" className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-white/60 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-primary-400">Terms & Conditions</Link>
              </div>
              {/* Social Icons */}
              <div className="flex gap-1.5">
                {/* Social buttons here, unchanged */}
              </div>
            </div>
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700"></div>
            {/* Bottom Section: Copyright and Contact */}
            <div className="flex flex-col items-center justify-between gap-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 sm:flex-row">
              <p>© {new Date().getFullYear()} UniHostel. All rights reserved.</p>
              <div className="flex gap-4 text-center sm:text-right">
                <div>
                  <a href="mailto:support@unihostel.com" className="hover:text-primary-600 dark:hover:text-primary-400">support@unihostel.com</a>
                </div>
                <span className="hidden text-neutral-300 dark:text-neutral-600 sm:inline">•</span>
                <a href="tel:+233123456789" className="hover:text-primary-600 dark:hover:text-primary-400">+233 (123) 456-789</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
