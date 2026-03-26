import { Link } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Last updated: March 26, 2026</p>

        <section className="mt-8 space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Use of Service</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              This platform is intended for registered students and authorized administrators only.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Account Responsibility</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Users are responsible for maintaining account confidentiality and providing accurate information.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Payments and Bookings</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Room allocation and booking confirmation are subject to payment verification and policy compliance.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Policy Updates</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Terms may be updated periodically. Continued use of the platform indicates acceptance of changes.
            </p>
          </div>
        </section>

        <div className="mt-10">
          <Link to="/" className="btn-ghost">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
