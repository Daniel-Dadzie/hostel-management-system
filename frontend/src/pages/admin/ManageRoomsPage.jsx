import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client.js';

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    hostelId: '',
    roomNumber: '',
    capacity: 2,
    gender: 'MALE',
    hasAc: false,
    hasWifi: true,
    mattressType: 'NORMAL',
    price: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const token = localStorage.getItem('hms.token');
      const headers = { Authorization: `Bearer ${token}` };
      const [roomsData, hostelsData] = await Promise.all([
        apiRequest('/api/admin/rooms', { headers }),
        apiRequest('/api/admin/hostels', { headers })
      ]);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setHostels(Array.isArray(hostelsData) ? hostelsData : []);
      if (hostelsData?.length > 0) {
        setForm(prev => ({ ...prev, hostelId: hostelsData[0].id }));
      }
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
      await apiRequest('/api/admin/rooms', {
        method: 'POST',
        body: {
          ...form,
          capacity: Number.parseInt(form.capacity, 10),
          price: Number.parseFloat(form.price) || 0
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      setShowForm(false);
      setForm({
        hostelId: hostels[0]?.id || '',
        roomNumber: '',
        capacity: 2,
        gender: 'MALE',
        hasAc: false,
        hasWifi: true,
        mattressType: 'NORMAL',
        price: ''
      });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    FULL: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };

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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Rooms</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Create and manage hostel rooms
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          disabled={hostels.length === 0}
        >
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {hostels.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
          Please create a hostel first before adding rooms.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Add Room Form */}
      {showForm && hostels.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Add New Room</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="room-hostel" className="mb-1 block text-sm font-medium">Hostel</label>
                <select
                  id="room-hostel"
                  className="input-field"
                  value={form.hostelId}
                  onChange={(e) => setForm({ ...form, hostelId: e.target.value })}
                  required
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="room-number" className="mb-1 block text-sm font-medium">Room Number</label>
                <input
                  id="room-number"
                  type="text"
                  className="input-field"
                  placeholder="e.g., 101"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="room-capacity" className="mb-1 block text-sm font-medium">Capacity</label>
                <input
                  id="room-capacity"
                  type="number"
                  className="input-field"
                  min="1"
                  max="10"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="room-gender" className="mb-1 block text-sm font-medium">Gender</label>
                <select
                  id="room-gender"
                  className="input-field"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="room-mattress" className="mb-1 block text-sm font-medium">Mattress Type</label>
                <select
                  id="room-mattress"
                  className="input-field"
                  value={form.mattressType}
                  onChange={(e) => setForm({ ...form, mattressType: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="QUEEN">Queen</option>
                </select>
              </div>
              <div>
                <label htmlFor="room-price" className="mb-1 block text-sm font-medium">Price (per semester)</label>
                <input
                  id="room-price"
                  type="number"
                  className="input-field"
                  placeholder="e.g., 500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasAc}
                  onChange={(e) => setForm({ ...form, hasAc: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Air Conditioning</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasWifi}
                  onChange={(e) => setForm({ ...form, hasWifi: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">WiFi</span>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Room'}
            </button>
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {rooms.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <span className="text-3xl">🛏️</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Rooms Yet</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Click "Add Room" to create your first room
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Room</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Hostel</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Gender</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Capacity</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Amenities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-4 py-3 font-medium">{room.roomNumber}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{room.hostelName}</td>
                  <td className="px-4 py-3">{room.gender}</td>
                  <td className="px-4 py-3">
                    {room.currentOccupancy || 0}/{room.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[room.status] || statusColors.AVAILABLE}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {room.hasAc && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs dark:bg-blue-900/30">AC</span>}
                      {room.hasWifi && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs dark:bg-green-900/30">WiFi</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
