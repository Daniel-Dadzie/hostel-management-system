import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import {
  activateAcademicTerm,
  createAcademicTerm,
  deleteAcademicTerm,
  listAcademicTerms,
  updateAcademicTerm
} from '../../services/bookingService.js';

const DEFAULT_FORM = {
  academicYear: '',
  semester: 1,
  startDate: '',
  endDate: '',
  reapplicationOpenDate: '',
  active: false
};

export default function ManageAcademicTermsPage() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    void loadTerms();
  }, []);

  async function loadTerms() {
    setLoading(true);
    setError('');
    try {
      const data = await listAcademicTerms();
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load academic terms.');
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setForm(DEFAULT_FORM);
    setEditingTerm(null);
    setShowForm(false);
  }

  function startCreate() {
    setEditingTerm(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  }

  function startEdit(term) {
    setEditingTerm(term);
    setForm({
      academicYear: term.academicYear || '',
      semester: Number(term.semester) || 1,
      startDate: term.startDate || '',
      endDate: term.endDate || '',
      reapplicationOpenDate: term.reapplicationOpenDate || '',
      active: Boolean(term.active)
    });
    setShowForm(true);
  }

  function validateForm() {
    if (!form.academicYear.trim()) {
      return 'Academic year is required.';
    }
    const sem = String(form.semester).toUpperCase();
    if (sem !== '1' && sem !== '2' && sem !== 'REGULAR') {
      return 'Semester must be 1, 2, or REGULAR.';
    }
    if (!form.startDate || !form.endDate || !form.reapplicationOpenDate) {
      return 'Start date, end date, and reapplication open date are required.';
    }
    if (form.startDate >= form.endDate) {
      return 'Start date must be before end date.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        academicYear: form.academicYear.trim(),
        semester: Number(form.semester),
        startDate: form.startDate,
        endDate: form.endDate,
        reapplicationOpenDate: form.reapplicationOpenDate,
        active: Boolean(form.active)
      };

      if (editingTerm) {
        await updateAcademicTerm(editingTerm.id, payload);
      } else {
        await createAcademicTerm(payload);
      }

      await loadTerms();
      resetFormState();
    } catch (err) {
      setError(err.message || 'Failed to save academic term.');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(termId) {
    setError('');
    try {
      await activateAcademicTerm(termId);
      await loadTerms();
    } catch (err) {
      setError(err.message || 'Failed to activate academic term.');
    }
  }

  async function handleDelete(term) {
    if (!globalThis.confirm(`Delete ${term.academicYear} semester ${term.semester}?`)) {
      return;
    }

    setError('');
    try {
      await deleteAcademicTerm(term.id);
      await loadTerms();
      if (editingTerm?.id === term.id) {
        resetFormState();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete academic term.');
    }
  }

  const filteredTerms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return terms.filter((term) => {
      if (!query) {
        return true;
      }
      return (
        term.academicYear?.toLowerCase().includes(query)
        || String(term.semester).includes(query)
      );
    });
  }, [terms, search]);

  let submitLabel = 'Create Term';
  if (saving) {
    submitLabel = 'Saving...';
  } else if (editingTerm) {
    submitLabel = 'Update Term';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">Academic Terms</h1>
          <p className="section-subtitle mt-1">
            Configure semester windows, activate the current term, and control reapplication timing.
          </p>
        </div>
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={startCreate}>
          <FaPlus className="text-xs" />
          New Term
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <form className="card space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingTerm ? 'Edit Academic Term' : 'Create Academic Term'}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>Academic Year</span>
              <input
                type="text"
                className="input-field mt-1"
                placeholder="e.g. 2025/2026"
                value={form.academicYear}
                onChange={(event) => setForm((prev) => ({ ...prev, academicYear: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>Semester</span>
              <select
                className="input-field mt-1"
                value={form.semester}
                onChange={(event) => setForm((prev) => ({ ...prev, semester: Number(event.target.value) }))}
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>Reapplication Opens</span>
              <input
                type="date"
                className="input-field mt-1"
                value={form.reapplicationOpenDate}
                onChange={(event) => setForm((prev) => ({ ...prev, reapplicationOpenDate: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>Start Date</span>
              <input
                type="date"
                className="input-field mt-1"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <span>End Date</span>
              <input
                type="date"
                className="input-field mt-1"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </label>
            <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              <span>Set as active term</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {submitLabel}
            </button>
            <button type="button" onClick={resetFormState} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">All Terms</h2>
          <input
            type="search"
            className="input-field max-w-xs"
            placeholder="Search term"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                  <th className="pb-2 pr-4">Academic Year</th>
                  <th className="pb-2 pr-4">Semester</th>
                  <th className="pb-2 pr-4">Window</th>
                  <th className="pb-2 pr-4">Reapplication</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTerms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-neutral-500">
                      No academic terms found.
                    </td>
                  </tr>
                ) : (
                  filteredTerms.map((term) => (
                    <tr key={term.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2.5 pr-4 font-semibold text-neutral-900 dark:text-white">{term.academicYear}</td>
                      <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">Semester {term.semester}</td>
                      <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">
                        {term.startDate} to {term.endDate}
                      </td>
                      <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">{term.reapplicationOpenDate}</td>
                      <td className="py-2.5 pr-4">
                        {term.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                            <FaCheckCircle className="text-[10px]" /> Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(term)}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                          >
                            <span className="inline-flex items-center gap-1"><FaEdit /> Edit</span>
                          </button>
                          {!term.active && (
                            <button
                              type="button"
                              onClick={() => handleActivate(term.id)}
                              className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(term)}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
                          >
                            <span className="inline-flex items-center gap-1"><FaTrash /> Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
