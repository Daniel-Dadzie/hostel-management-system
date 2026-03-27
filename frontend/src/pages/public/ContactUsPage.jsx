import { Link } from 'react-router-dom';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          Need help with your application, booking, or payments? Reach out to the hostel support team.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:shadow-black/20">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Email</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">support@unihostel.edu</p>
          </div>
          <div className="rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:shadow-black/20">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Phone</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">+233(0) 59 795 8369</p>
          </div>
          <div className="rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:shadow-black/20 sm:col-span-2">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Office Hours</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Monday to Friday, 8:00 AM to 5:00 PM
            </p>
          </div>
        </section>

        <div className="mt-10">
          <Link to="/" className="btn-ghost ring-1 ring-neutral-200/80 bg-white/70 backdrop-blur-sm hover:bg-white dark:ring-neutral-700/80 dark:bg-neutral-800/70 dark:hover:bg-neutral-800">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
