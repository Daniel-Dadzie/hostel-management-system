import ThemeToggle from './components/ThemeToggle.jsx';

export default function App() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hostel Management System</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            School theme: forest green (primary), gold (accent), cream surfaces.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Booking Status</span>
            <span className="badge-pending">PENDING_PAYMENT</span>
          </div>
          <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
            Primary actions use green; highlights use gold.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" type="button">Primary</button>
            <button className="btn-accent" type="button">Accent</button>
            <button className="btn-ghost" type="button">Ghost</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Example Badges</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-approved">APPROVED</span>
            <span className="badge-pending">PENDING</span>
            <span className="badge-rejected">REJECTED</span>
          </div>
          <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-300">
            Note: Payment can be PENDING; booking uses PENDING_PAYMENT.
          </p>
        </div>
      </div>
    </div>
  );
}
