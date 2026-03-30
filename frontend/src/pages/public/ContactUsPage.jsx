import { Link } from 'react-router-dom';

const contacts = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Email Support',
    value: 'support@unihostel.edu',
    href: 'mailto:support@unihostel.edu',
    note: 'Replies within 24 hours on business days',
    accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: 'Phone',
    value: '+233(0) 59 795 8369',
    href: 'tel:+233597958369',
    note: 'Available during office hours',
    accent: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    border: 'hover:border-sky-300 dark:hover:border-sky-700',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Office Hours',
    value: 'Mon – Fri, 8:00 AM – 5:00 PM',
    href: null,
    note: 'Closed on weekends & public holidays',
    accent: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    border: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
];

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Support Team Online
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 max-w-xl">
            Need help with your application, booking, or payments? Our support team is ready to assist you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {contacts.map((c) => (
            <div
              key={c.label}
              className={`rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 dark:border-neutral-700/80 dark:bg-neutral-800/80 ${c.border}`}
            >
              <div className={`inline-flex rounded-xl p-2.5 ${c.accent} mb-4`}>
                {c.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {c.label}
              </p>
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-1 block text-sm font-semibold text-neutral-900 dark:text-white hover:underline underline-offset-2"
                >
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">{c.value}</p>
              )}
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{c.note}</p>
            </div>
          ))}
        </div>

        {/* Tip banner */}
        <div className="mt-8 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-6 py-5 dark:border-amber-800/40 dark:bg-amber-900/20 flex items-start gap-4">
          <div className="mt-0.5 shrink-0 rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">Looking for quick answers?</p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              Check your student portal dashboard for booking status, payment receipts, and room allocation updates before reaching out.
            </p>
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
