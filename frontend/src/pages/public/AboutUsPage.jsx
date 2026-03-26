import { Link } from 'react-router-dom';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          About UniHostel
        </h1>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          UniHostel is a student-first accommodation platform designed to make hostel booking,
          payment, and room management simple and transparent for both students and administrators.
        </p>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Our Mission</h2>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            To provide a reliable, secure, and efficient digital experience for hostel allocation and
            student residential life.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">What We Offer</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
            <li>Real-time hostel and room availability</li>
            <li>Online booking and payment tracking</li>
            <li>Clear status updates from application to allocation</li>
            <li>Administrative tools for transparent room management</li>
          </ul>
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
