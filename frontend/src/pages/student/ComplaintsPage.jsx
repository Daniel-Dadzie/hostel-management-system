import { useState, useEffect } from 'react';
import { FaBug, FaFire, FaLightbulb, FaTools, FaWater, FaWifi } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical', icon: FaLightbulb },
  { value: 'PLUMBING', label: 'Plumbing / Water', icon: FaWater },
  { value: 'AC', label: 'AC / Ventilation', icon: FaFire },
  { value: 'INTERNET', label: 'Internet / WiFi', icon: FaWifi },
  { value: 'FURNITURE', label: 'Structural / Furniture', icon: FaTools },
  { value: 'CLEANING', label: 'Cleaning', icon: FaBug }
];

const STATUS_STYLES = {
  OPEN: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CLOSED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
};

const BLANK_FORM = {
  title: '',
  category: '',
  description: '',
  roomId: null
};

export default function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [tickets, setTickets] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const response = await api.get('/api/student/maintenance-tickets');
      setTickets(response || []);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category || !form.title.trim() || !form.description.trim()) return;
    
    setSubmitting(true);
    try {
      const newTicket = await api.post('/api/student/maintenance-tickets', {
        category: form.category,
        title: form.title,
        description: form.description,
        roomId: form.roomId
      });
      
      setTickets((prev) => [newTicket, ...prev]);
      setForm(BLANK_FORM);
      setSubmitted(true);
      setShowForm(false);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError('Failed to submit ticket. Please try again.');
      console.error('Error submitting ticket:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/30 dark:bg-red-900/15 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

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

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-neutral-500">Loading tickets...</div>
          </div>
        ) : tickets.length === 0 ? (
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
                          TKT-{String(ticket.id).padStart(4, '0')} &middot; {formatDate(ticket.createdAt)} &middot; {catMeta?.label ?? ticket.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="line-clamp-2 pl-11 text-sm text-neutral-600 dark:text-neutral-400">
                    {ticket.description}
                  </p>
                  {ticket.adminNotes && (
                    <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Admin Notes:</p>
                      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{ticket.adminNotes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
