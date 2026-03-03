import { useState } from 'react';
import { FaBug, FaFire, FaLightbulb, FaTools, FaWater, FaWifi } from 'react-icons/fa';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical', icon: FaLightbulb },
  { value: 'PLUMBING', label: 'Plumbing / Water', icon: FaWater },
  { value: 'HVAC', label: 'AC / Ventilation', icon: FaFire },
  { value: 'INTERNET', label: 'Internet / WiFi', icon: FaWifi },
  { value: 'STRUCTURAL', label: 'Structural / Furniture', icon: FaTools },
  { value: 'PEST', label: 'Pest Control', icon: FaBug }
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', desc: 'Not urgent, can wait', color: 'text-neutral-500' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Needs attention soon', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'HIGH', label: 'High', desc: 'Urgent — disrupting daily life', color: 'text-red-600 dark:text-red-400' }
];

const SAMPLE_TICKETS = [
  {
    id: 'TKT-001',
    title: 'Broken AC unit not cooling',
    category: 'HVAC',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    date: '28 Feb 2026',
    description: 'The AC in my room has been running but not producing cold air for 3 days.'
  },
  {
    id: 'TKT-002',
    title: 'Flickering overhead light',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    status: 'PENDING',
    date: '25 Feb 2026',
    description: 'The main ceiling light flickers every few minutes making it hard to study.'
  }
];

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CLOSED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
};

const PRIORITY_STYLES = {
  LOW: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const BLANK_FORM = {
  title: '',
  category: '',
  priority: 'MEDIUM',
  description: '',
  location: ''
};

export default function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category || !form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const newTicket = {
      id: `TKT-00${tickets.length + 3}`,
      title: form.title,
      category: form.category,
      priority: form.priority,
      status: 'PENDING',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      description: form.description
    };
    setTickets((prev) => [newTicket, ...prev]);
    setForm(BLANK_FORM);
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">Maintenance &amp; Complaints</h1>
          <p className="section-subtitle mt-1">
            Report issues and track the status of your maintenance requests.
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            + Report New Issue
          </button>
        )}
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/15 dark:text-emerald-400">
          ✅ Your ticket has been submitted. The maintenance team will review it shortly.
        </div>
      )}

      {/* Report form */}
      {showForm && (
        <div className="card animate-fade-in space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">New Maintenance Request</h2>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(BLANK_FORM); }}
              className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Broken window latch in room 204"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleChange('category', cat.value)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                        selected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-400 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300 dark:ring-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-primary-300 hover:bg-primary-50/40 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-primary-600'
                      }`}
                    >
                      <Icon className="shrink-0 text-sm" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority + Location row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      title={p.desc}
                      onClick={() => handleChange('priority', p.value)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all ${
                        form.priority === p.value
                          ? `border-transparent ${PRIORITY_STYLES[p.value]} ring-1 ring-inset ring-current`
                          : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Location (optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Block A, Room 204"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className="input-field resize-none"
                placeholder="Describe the issue in detail — when it started, how it affects you, etc."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(BLANK_FORM); }}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.category || !form.title.trim() || !form.description.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket list */}
      <div className="card">
        <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">My Tickets</h2>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <FaTools className="text-xl text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">No tickets yet</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Use the &ldquo;Report New Issue&rdquo; button to raise a maintenance request.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const catMeta = CATEGORIES.find((c) => c.value === ticket.category);
              const CatIcon = catMeta?.icon ?? FaTools;
              return (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-neutral-200 p-4 transition-all hover:border-primary-200 hover:shadow-sm dark:border-neutral-800 dark:hover:border-primary-800/40"
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                        <CatIcon className="text-sm text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {ticket.id} &middot; {ticket.date} &middot; {catMeta?.label ?? ticket.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="line-clamp-2 pl-11 text-sm text-neutral-600 dark:text-neutral-400">
                    {ticket.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
