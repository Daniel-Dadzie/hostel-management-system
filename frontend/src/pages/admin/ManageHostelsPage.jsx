import { useEffect, useState } from 'react';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { createHostel, listHostels, updateHostel } from '../../services/hostelService.js';
import { uploadImage } from '../../services/uploadService.js';
import ImageUploadField from '../../components/ImageUploadField.jsx';
import { resolveAssetUrl } from '../../utils/assetUrl.js';
import hostelFallback1 from '../../assets/umat1.jpg';
import hostelFallback2 from '../../assets/umat2.jpg';
import hostelFallback3 from '../../assets/umat3.jpg';
import hostelFallback4 from '../../assets/umat4.jpg';

const hostelFallbackImages = [hostelFallback1, hostelFallback2, hostelFallback3, hostelFallback4];

export default function ManageHostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('distance-asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    distanceToCampusKm: '',
    imagePath: '',
    imagePreview: '',
    imageFile: null,
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [updatingImageHostelId, setUpdatingImageHostelId] = useState(null);

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
      let imagePath = form.imagePath || null;
      if (form.imageFile) {
        imagePath = await uploadImage(form.imageFile);
      }

      const payload = {
        name: form.name,
        location: form.location,
        active: form.active,
        imagePath,
        distanceToCampusKm:
          form.distanceToCampusKm === '' || form.distanceToCampusKm == null
            ? null
            : Number(form.distanceToCampusKm)
      };

      if (editingHostel) {
        await updateHostel(editingHostel.id, payload);
        setEditingHostel(null);
      } else {
        await createHostel(payload);
        setShowForm(false);
      }
      setForm({
        name: '',
        location: '',
        distanceToCampusKm: '',
        imagePath: '',
        imagePreview: '',
        imageFile: null,
        active: true
      });
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
      distanceToCampusKm:
        hostel.distanceToCampusKm === null || hostel.distanceToCampusKm === undefined
          ? ''
          : String(hostel.distanceToCampusKm),
      imagePath: hostel.imagePath || hostel.imageUrl || '',
      imagePreview: '',
      imageFile: null,
      active: hostel.active
    });
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingHostel(null);
    setForm({
      name: '',
      location: '',
      distanceToCampusKm: '',
      imagePath: '',
      imagePreview: '',
      imageFile: null,
      active: true
    });
  }

  async function toggleActive(hostel) {
    try {
      await updateHostel(hostel.id, {
        name: hostel.name,
        location: hostel.location,
        distanceToCampusKm: hostel.distanceToCampusKm ?? null,
        imagePath: hostel.imagePath || hostel.imageUrl || null,
        active: !hostel.active
      });
      loadHostels();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleQuickImageChange(hostel, event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image is too large (max 5MB).');
      return;
    }

    setError('');
    setUpdatingImageHostelId(hostel.id);

    try {
      const imagePath = await uploadImage(file);
      await updateHostel(hostel.id, {
        name: hostel.name,
        location: hostel.location,
        distanceToCampusKm: hostel.distanceToCampusKm ?? null,
        imagePath,
        active: hostel.active
      });
      await loadHostels();
    } catch (err) {
      setError(err.message || 'Failed to update hostel image.');
    } finally {
      setUpdatingImageHostelId(null);
    }
  }

  const filteredHostels = hostels.filter((hostel) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      hostel.name?.toLowerCase().includes(query) ||
      hostel.location?.toLowerCase().includes(query) ||
      String(hostel.distanceToCampusKm ?? '').toLowerCase().includes(query)
    );
  });

  const sortedHostels = [...filteredHostels].sort((a, b) => {
    if (sortBy === 'distance-asc') {
      const distanceA = a.distanceToCampusKm == null ? Number.POSITIVE_INFINITY : Number(a.distanceToCampusKm);
      const distanceB = b.distanceToCampusKm == null ? Number.POSITIVE_INFINITY : Number(b.distanceToCampusKm);
      return distanceA - distanceB;
    }

    if (sortBy === 'distance-desc') {
      const distanceA = a.distanceToCampusKm == null ? Number.NEGATIVE_INFINITY : Number(a.distanceToCampusKm);
      const distanceB = b.distanceToCampusKm == null ? Number.NEGATIVE_INFINITY : Number(b.distanceToCampusKm);
      return distanceB - distanceA;
    }

    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }

    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }

    return 0;
  });

  const usedImageUrls = new Set();

  function getHostelImage(hostel) {
    const normalizedHostelId = Number.isFinite(Number(hostel.id)) ? Number(hostel.id) : 0;
    const fallbackImage = hostelFallbackImages[Math.abs(normalizedHostelId) % hostelFallbackImages.length];
    const preferredImage = resolveAssetUrl(hostel.imagePath || hostel.imageUrl);
    const finalImage = !preferredImage || usedImageUrls.has(preferredImage)
      ? fallbackImage
      : preferredImage;
    usedImageUrls.add(finalImage);
    return finalImage;
  }

  let submitLabel = 'Save Hostel';
  if (saving) {
    submitLabel = 'Saving...';
  } else if (editingHostel) {
    submitLabel = 'Update Hostel';
  }

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
              <div>
                <label htmlFor="hostel-distance" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Distance to Campus (km)
                </label>
                <input
                  id="hostel-distance"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="e.g., 1.50"
                  value={form.distanceToCampusKm}
                  onChange={(e) => setForm({ ...form, distanceToCampusKm: e.target.value })}
                />
              </div>
            </div>
            <div>
              <ImageUploadField
                id="hostel-image"
                label="Hostel Photo"
                value={form.imagePreview || form.imagePath}
                onChange={(file, previewUrl) =>
                  setForm({
                    ...form,
                    imageFile: file,
                    imagePreview: previewUrl
                  })
                }
                onError={setError}
                onClear={() => setForm({ ...form, imagePath: '', imagePreview: '', imageFile: null })}
                helperText="Upload an image or take a picture with your camera."
              />
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
                {submitLabel}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                className="input-field sm:max-w-sm"
                placeholder="Search by name, location, or distance"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input-field sm:w-52"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort hostels"
              >
                <option value="distance-asc">Distance: Nearest first</option>
                <option value="distance-desc">Distance: Farthest first</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
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
            {sortedHostels.map((hostel) => (
              <div key={hostel.id} className="card space-y-2">
                <label
                  htmlFor={`hostel-photo-mobile-${hostel.id}`}
                  className="group relative block cursor-pointer overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
                  title="Click to change hostel image"
                >
                  <div className="h-32 w-full">
                    <img
                      src={getHostelImage(hostel)}
                      alt={hostel.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-center text-xs font-medium text-white">
                    {updatingImageHostelId === hostel.id ? 'Updating image...' : 'Click image to change'}
                  </div>
                </label>
                <input
                  id={`hostel-photo-mobile-${hostel.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={updatingImageHostelId === hostel.id}
                  onChange={(event) => handleQuickImageChange(hostel, event)}
                />
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
                <p className="body-text text-neutral-600 dark:text-neutral-300">Distance: {hostel.distanceToCampusKm ?? '-'} km</p>
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
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Photo</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Location</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Distance (km)</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Rooms</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHostels.map((hostel) => (
                <tr key={hostel.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-3 py-2">
                    <label
                      htmlFor={`hostel-photo-table-${hostel.id}`}
                      className="group relative block h-12 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700"
                      title="Click to change hostel image"
                    >
                      <img
                        src={getHostelImage(hostel)}
                        alt={hostel.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </label>
                    <input
                      id={`hostel-photo-table-${hostel.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={updatingImageHostelId === hostel.id}
                      onChange={(event) => handleQuickImageChange(hostel, event)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-neutral-900 dark:text-white">{hostel.name}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{hostel.location || '-'}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{hostel.distanceToCampusKm ?? '-'}</td>
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
