import { Link } from 'react-router-dom';

const sections = [
  {
    number: '01',
    title: 'Use of Service',
    body: 'This platform is intended exclusively for registered students and authorized administrators of the institution. Any unauthorized access or misuse of the system is strictly prohibited.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Account Responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Providing accurate and up-to-date information is required at all times.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Payments & Bookings',
    body: 'Room allocation and booking confirmation are subject to successful payment verification and compliance with hostel policies. Incomplete or failed payments may result in forfeiture of a reserved room.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Hostel Conduct',
    body: 'Students are expected to comply with all hostel rules and regulations. Disruptive, dishonest, or harmful behaviour may result in suspension of access to the platform and/or hostel facilities.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Policy Updates',
    body: 'These terms may be updated periodically to reflect changes in our services or legal obligations. Continued use of the platform after changes are published constitutes your acceptance of the revised terms.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 bg-neutral-100/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-400 mb-4">
            📋 Legal Document
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">March 26, 2026</span>
          </p>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
            By using UniHostel, you agree to the following terms. Please read them carefully before booking or submitting an application.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.number}
              className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{s.number}</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span className="text-neutral-400 dark:text-neutral-500">{s.icon}</span>
                    {s.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement banner */}
        <div className="mt-8 rounded-2xl border border-neutral-200/70 bg-neutral-50/80 px-6 py-4 dark:border-neutral-700/50 dark:bg-neutral-800/40">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            By using this platform, you confirm that you have read, understood, and agree to these terms.
            Questions? Contact us at{' '}
            <a href="mailto:support@unihostel.edu" className="font-medium text-primary-600 underline underline-offset-2 dark:text-primary-400">
              support@unihostel.edu
            </a>.
          </p>
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
