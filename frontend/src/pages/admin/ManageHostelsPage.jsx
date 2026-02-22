import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client.js';

export default function ManageHostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHostels();
  }, []);

  async function loadHostels() {
    try {
      const data = await apiRequest('/api/admin/hostels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
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
      await apiRequest('/api/admin/hostels', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      setShowForm(false);
      setForm({ name: '', location: '' });
      loadHostels();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(hostel) {
    try {
      await apiRequest(`/api/admin/hostels/${hostel.id}`, {
        method: 'PUT',
        body: { name: hostel.name, location: hostel.location, active: !hostel.active },
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      loadHostels();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Hostels</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Create and manage hostel buildings
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
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Hostel Form */}
      {showForm && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Add New Hostel</h2>
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
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Hostel'}
            </button>
          </form>
        </div>
      )}

      {/* Hostels List */}
      {hostels.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <span className="text-3xl">🏢</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Hostels Yet</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Click "Add Hostel" to create your first hostel
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hostels.map((hostel) => (
            <div key={hostel.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{hostel.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{hostel.location}</p>
                </div>
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
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleActive(hostel)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                    hostel.active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {hostel.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
