import { Link } from 'react-router-dom';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          Need help with your application, booking, or payments? Reach out to the hostel support team.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Email</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">support@unihostel.edu</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Phone</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">+233(0) 59 795 8369</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:col-span-2">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Office Hours</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Monday to Friday, 8:00 AM to 5:00 PM
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
