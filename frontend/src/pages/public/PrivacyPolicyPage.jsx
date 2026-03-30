import { Link } from 'react-router-dom';

const sections = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Information We Collect',
    body: 'We collect account details (name, student ID, contact info) and booking information (room preferences, payment records) required to deliver hostel accommodation services.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'How We Use Your Data',
    body: 'Your data is used exclusively to process applications, manage room allocations, verify payments, and provide student support. We do not sell your personal information to third parties.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Data Security',
    body: 'We apply technical and organizational safeguards — including encrypted storage and access controls — to protect your personal data from unauthorized access, loss, or disclosure.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Your Rights',
    body: 'You have the right to access, correct, or request deletion of your personal data. Contact our support team at support@unihostel.edu to make a request.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Policy Changes',
    body: 'We may update this policy from time to time. When changes are made, the "Last updated" date at the top of this page will be revised. Continued use of the platform constitutes acceptance.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 bg-neutral-100/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-400 mb-4">
            🔒 Legal Document
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">March 26, 2026</span>
          </p>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
            We take your privacy seriously. This policy explains what data we collect, why we collect it, and how we keep it safe.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-800/80"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-700/70 dark:text-neutral-400 text-xs font-bold">
                  {i + 1}
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

        {/* Contact nudge */}
        <div className="mt-8 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-6 py-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Questions about this policy?{' '}
            <a href="mailto:support@unihostel.edu" className="font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400">
              Contact our support team
            </a>
            .
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
