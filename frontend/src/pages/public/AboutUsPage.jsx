import { Link } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Real-time Availability',
    description: 'Browse live hostel and room availability without guesswork.',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Online Payments',
    description: 'Secure payment processing with instant confirmation and receipts.',
    accent: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: 'Status Tracking',
    description: 'Clear updates from application submission through to room allocation.',
    accent: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    title: 'Admin Tools',
    description: 'Powerful management tools for administrators to oversee allocations transparently.',
    accent: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  },
];

const stats = [
  { value: '500+', label: 'Rooms Managed' },
  { value: '2,000+', label: 'Students Served' },
  { value: '99%', label: 'Uptime' },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200/70 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-primary-400 mb-4">
            🏫 Student Housing Platform
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            About UniHostel
          </h1>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            A student-first accommodation platform designed to make hostel booking, payment, and room
            management simple and transparent — for both students and administrators.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Our Mission</h2>
              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                To provide a reliable, secure, and efficient digital experience for hostel allocation
                and student residential life — removing friction so students can focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 text-center shadow-sm backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* What We Offer */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">What We Offer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80"
              >
                <div className={`shrink-0 rounded-xl p-2.5 ${f.accent}`}>{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link to="/" className="btn-ghost ring-1 ring-neutral-200/80 bg-white/70 backdrop-blur-sm hover:bg-white dark:ring-neutral-700/80 dark:bg-neutral-800/70 dark:hover:bg-neutral-800">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
