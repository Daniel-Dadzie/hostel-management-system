import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
              Your Home Away From Home
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300 sm:text-xl">
              Experience comfortable and secure hostel accommodation designed for students. 
              Apply online, track your booking, and manage your stay all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/register"
                    className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
                  >
                    Apply for Hostel
                    <span>→</span>
                  </Link>
                  <Link
                    to="/login"
                    className="btn-ghost inline-flex items-center gap-2 px-8 py-3 text-lg"
                  >
                    Already have an account?
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link
                  to={dashboardPath}
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
                >
                  Go to Dashboard
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-200/30 dark:bg-primary-900/20"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-200/30 dark:bg-accent-900/20"></div>
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
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:border-primary-300 dark:hover:border-primary-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-2xl dark:bg-primary-900/30">
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
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-700 text-xl font-bold text-white shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
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
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
              >
                Create Your Account
                <span>→</span>
              </Link>
            ) : (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
              >
                Go to Dashboard
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-12 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
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
