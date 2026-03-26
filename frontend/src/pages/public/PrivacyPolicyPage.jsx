import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Last updated: March 26, 2026</p>

        <section className="mt-8 space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Information We Collect</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              We collect account and booking details required to provide hostel accommodation services.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">How We Use Data</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Data is used to process applications, manage room allocations, verify payments, and support users.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Data Security</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              We apply technical and organizational safeguards to protect personal data from unauthorized access.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Rights</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              You may request correction of inaccurate profile data by contacting the support team.
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
