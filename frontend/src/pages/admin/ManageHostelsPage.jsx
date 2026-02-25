import { useEffect, useState } from 'react';
import { FaEdit, FaPencilAlt, FaTimes } from 'react-icons/fa';
import { createHostel, listHostels, updateHostel } from '../../services/hostelService.js';

export default function ManageHostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHostels();
  }, []);

  async function loadHostels() {
    try {
      const data = await listHostels();
      setHostels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingHostel) {
        await updateHostel(editingHostel.id, form);
        setEditingHostel(null);
      } else {
        await createHostel(form);
        setShowForm(false);
      }
      setForm({ name: '', location: '', active: true });
      loadHostels();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(hostel) {
    setEditingHostel(hostel);
    setForm({
      name: hostel.name,
      location: hostel.location || '',
      active: hostel.active
    });
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingHostel(null);
    setForm({ name: '', location: '', active: true });
  }

  async function toggleActive(hostel) {
    try {
      await updateHostel(hostel.id, {
        name: hostel.name,
        location: hostel.location,
        active: !hostel.active
      });
      loadHostels();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredHostels = hostels.filter((hostel) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      hostel.name?.toLowerCase().includes(query) ||
      hostel.location?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">Manage Hostels</h1>
          <p className="section-subtitle">
            Create, search, and manage hostel buildings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Hostel'}
        </button>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Add/Edit Hostel Form */}
      {(showForm || editingHostel) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-header text-neutral-900 dark:text-white">
              {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
            </h2>
            {editingHostel && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <FaTimes className="text-lg" />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hostel-name" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Hostel Name
                </label>
                <input
                  id="hostel-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g., Block A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="hostel-location" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Location
                </label>
                <input
                  id="hostel-location"
                  type="text"
                  className="input-field"
                  placeholder="e.g., North Campus"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="hostel-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="hostel-active" className="text-sm text-neutral-700 dark:text-neutral-300">
                Active (available for room assignment)
              </label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingHostel ? 'Update Hostel' : 'Save Hostel'}
              </button>
              {editingHostel && (
                <button type="button" onClick={cancelEdit} className="btn-ghost">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {hostels.length > 0 && (
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="card-header text-neutral-900 dark:text-white">Hostel List</h2>
            <input
              className="input-field sm:max-w-sm"
              placeholder="Search by name or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Hostels List */}
      {filteredHostels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">🏢</span>
          </div>
          <h3 className="empty-state-title">No Hostels Found</h3>
          <p className="section-subtitle">
            Add hostels or refine your search filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:hidden">
            {filteredHostels.map((hostel) => (
              <div key={hostel.id} className="card space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 dark:text-white">{hostel.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      hostel.active
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {hostel.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="body-text text-neutral-600 dark:text-neutral-300">Location: {hostel.location || '-'}</p>
                <p className="body-text text-neutral-600 dark:text-neutral-300">Rooms: {hostel.totalRooms || 0}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(hostel)}
                    className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    title="Edit hostel"
                  >
                    <FaPencilAlt className="inline" />
                  </button>
                  <button
                    onClick={() => toggleActive(hostel)}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      hostel.active
                        ? 'bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-900/30 dark:text-accent-200'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300'
                    }`}
                  >
                    {hostel.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Location</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Rooms</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHostels.map((hostel) => (
                <tr key={hostel.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-3 py-2 font-medium text-neutral-900 dark:text-white">{hostel.name}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{hostel.location || '-'}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{hostel.totalRooms || 0}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        hostel.active
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {hostel.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(hostel)}
                        className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                        title="Edit hostel"
                      >
                        <FaPencilAlt className="inline" />
                      </button>
                      <button
                        onClick={() => toggleActive(hostel)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          hostel.active
                            ? 'bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-900/30 dark:text-accent-200'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300'
                        }`}
                      >
                        {hostel.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
