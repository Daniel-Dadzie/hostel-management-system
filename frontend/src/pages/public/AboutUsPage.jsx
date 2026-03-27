import { Link } from 'react-router-dom';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          About UniHostel
        </h1>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          UniHostel is a student-first accommodation platform designed to make hostel booking,
          payment, and room management simple and transparent for both students and administrators.
        </p>

        <section className="mt-10 rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:shadow-black/20">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Our Mission</h2>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            To provide a reliable, secure, and efficient digital experience for hostel allocation and
            student residential life.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-lg shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:shadow-black/20">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">What We Offer</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
            <li>Real-time hostel and room availability</li>
            <li>Online booking and payment tracking</li>
            <li>Clear status updates from application to allocation</li>
            <li>Administrative tools for transparent room management</li>
          </ul>
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
