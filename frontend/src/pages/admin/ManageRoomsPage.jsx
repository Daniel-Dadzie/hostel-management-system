import { useEffect, useState } from 'react';
import { listHostels } from '../../services/hostelService.js';
import { createRoom, listRooms } from '../../services/roomService.js';

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    hostelId: '',
    roomNumber: '',
    capacity: 2,
    roomGender: 'MALE',
    hasAc: false,
    hasWifi: true,
    mattressType: 'NORMAL',
    price: '',
    floorNumber: 1
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [roomsData, hostelsData] = await Promise.all([
        listRooms(),
        listHostels()
      ]);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      // Show all hostels for room creation (not just active ones)
      const allHostels = Array.isArray(hostelsData) ? hostelsData : [];
      setHostels(allHostels);
      if (allHostels.length > 0) {
        setForm(prev => ({ ...prev, hostelId: allHostels[0].id }));
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
      await createRoom({
        ...form,
        hostelId: Number(form.hostelId),
        capacity: Number.parseInt(form.capacity, 10),
        price: Number.parseFloat(form.price) || 0,
        floorNumber: Number.parseInt(form.floorNumber, 10)
      });
      setShowForm(false);
      setForm({
        hostelId: hostels[0]?.id || '',
        roomNumber: '',
        capacity: 2,
        roomGender: 'MALE',
        hasAc: false,
        hasWifi: true,
        mattressType: 'NORMAL',
        price: '',
        floorNumber: 1
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

  const filteredRooms = rooms
    .filter((room) => (selectedHostel === 'ALL' ? true : String(room.hostelId) === selectedHostel))
    .filter((room) => (selectedStatus === 'ALL' ? true : room.status === selectedStatus))
    .filter((room) => (selectedGender === 'ALL' ? true : room.roomGender === selectedGender))
    .filter((room) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        room.roomNumber?.toLowerCase().includes(query) ||
        room.hostelName?.toLowerCase().includes(query)
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
          <h1 className="page-title text-neutral-900 dark:text-white">Manage Rooms</h1>
          <p className="section-subtitle">
            Create, filter, and monitor room allocation status
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
          No hostels found. Please create a hostel first before adding rooms.
        </div>
      )}

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Add Room Form */}
      {showForm && hostels.length > 0 && (
        <div className="card">
          <h2 className="card-header mb-4 text-neutral-900 dark:text-white">Add New Room</h2>
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
                  value={form.roomGender}
                  onChange={(e) => setForm({ ...form, roomGender: e.target.value })}
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
              <div>
                <label htmlFor="room-floor" className="mb-1 block text-sm font-medium">Floor Number</label>
                <input
                  id="room-floor"
                  type="number"
                  className="input-field"
                  min="1"
                  value={form.floorNumber}
                  onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 sm:gap-6">
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
      {rooms.length > 0 && (
        <div className="card">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              className="input-field"
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
            >
              <option value="ALL">Hostel: All</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={String(hostel.id)}>
                  {hostel.name}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">Status: All</option>
              <option value="AVAILABLE">Available</option>
              <option value="FULL">Full</option>
            </select>

            <select
              className="input-field"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="ALL">Gender: All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>

            <input
              className="input-field lg:col-span-2"
              placeholder="Search room number or hostel"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {filteredRooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">🛏️</span>
          </div>
          <h3 className="empty-state-title">No Rooms Found</h3>
          <p className="section-subtitle">
            Add rooms or adjust the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:hidden">
            {filteredRooms.map((room) => (
              <div key={room.id} className="card space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-neutral-900 dark:text-white">Room {room.roomNumber}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[room.status] || statusColors.AVAILABLE}`}>
                    {room.status}
                  </span>
                </div>
                <p className="body-text text-neutral-600 dark:text-neutral-300">Hostel: {room.hostelName}</p>
                <p className="body-text text-neutral-600 dark:text-neutral-300">Gender: {room.roomGender} · Floor: {room.floorNumber}</p>
                <p className="body-text text-neutral-600 dark:text-neutral-300">Capacity: {room.currentOccupancy || 0}/{room.capacity}</p>
                <div className="flex gap-1">
                  {room.hasAc && <span className="rounded bg-accent-100 px-1.5 py-0.5 text-xs text-accent-900 dark:bg-accent-900/30 dark:text-accent-200">AC</span>}
                  {room.hasWifi && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs dark:bg-green-900/30">WiFi</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="card hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Room</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Hostel</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Gender</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Floor</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Capacity</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Amenities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-4 py-3 font-medium">{room.roomNumber}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{room.hostelName}</td>
                  <td className="px-4 py-3">{room.roomGender}</td>
                  <td className="px-4 py-3">{room.floorNumber}</td>
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
                      {room.hasAc && <span className="rounded bg-accent-100 px-1.5 py-0.5 text-xs text-accent-900 dark:bg-accent-900/30 dark:text-accent-200">AC</span>}
                      {room.hasWifi && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs dark:bg-green-900/30">WiFi</span>}
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
