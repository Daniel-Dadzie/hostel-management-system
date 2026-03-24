import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import heroImage3 from '../assets/umat3.jpg';

const features = [
  {
    icon: '🏠',
    title: 'Comfortable Accommodation',
    description: 'Modern rooms with AC, WiFi, and comfortable bedding options to suit your preferences.'
  },
  {
    icon: '📱',
    title: 'Easy Online Booking',
    description: 'Apply for hostel accommodation online and track your application status in real-time.'
  },
  {
    icon: '🔒',
    title: 'Secure Environment',
    description: '24/7 security surveillance and controlled access ensure a safe living environment.'
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    description: 'Clear fee structure with online payment tracking and payment history.'
  },
  {
    icon: '👥',
    title: 'Community Living',
    description: 'Connect with fellow students in well-maintained common areas and study rooms.'
  },
  {
    icon: '🛠️',
    title: 'Maintenance Support',
    description: 'Quick response to maintenance requests through our online portal.'
  }
];

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
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 text-sm font-bold text-white shadow-md ring-1 ring-white/20">
              H
            </div>
            <span className="text-[17px] font-bold tracking-tight text-neutral-900 dark:text-white">
              UniHostel
            </span>
          </Link>
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
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-white/55 dark:bg-neutral-900/55" />
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-2xl shadow-sm ring-1 ring-primary-200/60 transition-transform duration-300 group-hover:scale-110 dark:from-primary-900/30 dark:to-primary-900/50 dark:ring-primary-800/40">
                  {feature.icon}
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
      <section className="py-16 bg-primary-700 dark:bg-primary-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
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
      <footer className="border-t border-neutral-200 bg-white py-12 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 text-xs font-bold text-white">
                H
              </div>
              <span className="text-[16px] font-bold tracking-tight text-neutral-900 dark:text-white">
                UniHostel
              </span>
            </div>
            <div className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <Link to="/login" className="hover:text-primary-700 dark:hover:text-primary-400">
                Login
              </Link>
              <Link to="/register" className="hover:text-primary-700 dark:hover:text-primary-400">
                Register
              </Link>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © {new Date().getFullYear()} UniHostel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
