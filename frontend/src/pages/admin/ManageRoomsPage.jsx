import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import PaginationControls from '../../components/PaginationControls.jsx';
import { listHostels } from '../../services/hostelService.js';
import { createRoom, listRoomsPaginated, updateRoom } from '../../services/roomService.js';

function buildInitialForm(nextHostels) {
  return {
    hostelId: nextHostels[0]?.id || '',
    roomNumber: '',
    capacity: 2,
    roomGender: 'MALE',
    hasAc: false,
    hasWifi: true,
    mattressType: 'NORMAL',
    price: '',
    floorNumber: 1
  };
}

function filterRooms(rooms, selectedHostel, selectedStatus, selectedGender, search) {
  return rooms
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
}

function getToggleFormLabel(showForm, editingRoom) {
  if (showForm && editingRoom) return 'Cancel Edit';
  if (showForm) return 'Cancel';
  return 'Add Room';
}

function getSaveButtonLabel(saving, editingRoom) {
  if (saving) return 'Saving...';
  if (editingRoom) return 'Update Room';
  return 'Save Room';
}

function getFloorGenderState(rooms, selectedHostelId, selectedFloorNumber, editingRoomId, roomGender) {
  if (selectedHostelId == null || selectedFloorNumber == null) {
    return { floorAssignedGender: null, hasFloorGenderConflict: false };
  }

  const floorRooms = rooms.filter(
    (room) =>
      room.hostelId === selectedHostelId &&
      Number(room.floorNumber) === selectedFloorNumber &&
      (editingRoomId == null || room.id !== editingRoomId)
  );

  const floorAssignedGender = floorRooms.length > 0 ? floorRooms[0].roomGender || null : null;
  return {
    floorAssignedGender,
    hasFloorGenderConflict: floorAssignedGender != null && roomGender !== floorAssignedGender
  };
}

function hasDuplicateRoomNumberInHostel(rooms, selectedHostelId, roomNumber, editingRoomId) {
  const normalizedRoomNumber = (roomNumber || '').trim().toLowerCase();
  if (selectedHostelId == null || normalizedRoomNumber.length === 0) {
    return false;
  }

  return rooms.some(
    (room) =>
      room.hostelId === selectedHostelId &&
      String(room.roomNumber || '').trim().toLowerCase() === normalizedRoomNumber &&
      (editingRoomId == null || room.id !== editingRoomId)
  );
}

function toggleRoomForm(showForm, editingRoom, cancelEdit, setShowForm) {
  if (showForm && editingRoom) {
    cancelEdit();
    return;
  }
  setShowForm(!showForm);
}

function RoomResults({ filteredRooms, statusColors, onEdit }) {
  if (filteredRooms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <span className="text-3xl">🛏️</span>
        </div>
        <h3 className="empty-state-title">No Rooms Found</h3>
        <p className="section-subtitle">
          Add rooms or adjust the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {filteredRooms.map((room, idx) => (
          <div key={room.id} className="card space-y-2 animate-slide-up transition-all duration-300 hover:shadow-lg hover:border-neutral-300/90 dark:hover:border-neutral-700 dark:hover:shadow-lg"
            style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-neutral-900 dark:text-white">Room {room.roomNumber}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-110 ${statusColors[room.status] || statusColors.AVAILABLE}`}>
                {room.status}
              </span>
            </div>
            <p className="body-text text-neutral-600 dark:text-neutral-300">Hostel: {room.hostelName}</p>
            <p className="body-text text-neutral-600 dark:text-neutral-300">Gender: {room.roomGender} · Floor: {room.floorNumber}</p>
            <p className="body-text text-neutral-600 dark:text-neutral-300">Capacity: {room.currentOccupancy || 0}/{room.capacity}</p>
            <div className="flex gap-1">
              {room.hasAc && <span className="rounded bg-accent-100 px-1.5 py-0.5 text-xs text-accent-900 transition-all duration-200 hover:scale-105 dark:bg-accent-900/30 dark:text-accent-200">AC</span>}
              {room.hasWifi && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs transition-all duration-200 hover:scale-105 dark:bg-green-900/30">WiFi</span>}
            </div>
            <button
              type="button"
              className="btn-ghost mt-2 transition-all duration-200 hover:shadow-sm"
              onClick={() => onEdit(room)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="card hidden overflow-x-auto md:block transition-all duration-300 hover:shadow-md">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30">
          <tr>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Room</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Hostel</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Gender</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Floor</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Capacity</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Status</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Amenities</th>
            <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {filteredRooms.map((room, idx) => (
            <tr key={room.id} className="transition-all duration-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 group/row"
              style={{ transitionDelay: `${idx * 25}ms` }}>
              <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white group-hover/row:font-semibold">{room.roomNumber}</td>
              <td className="px-4 py-3 text-neutral-600 transition-colors duration-200 group-hover/row:text-neutral-700 dark:text-neutral-400 dark:group-hover/row:text-neutral-300">{room.hostelName}</td>
              <td className="px-4 py-3">{room.roomGender}</td>
              <td className="px-4 py-3">{room.floorNumber}</td>
              <td className="px-4 py-3">
                {room.currentOccupancy || 0}/{room.capacity}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-110 inline-block ${statusColors[room.status] || statusColors.AVAILABLE}`}>
                  {room.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {room.hasAc && <span className="rounded bg-accent-100 px-1.5 py-0.5 text-xs text-accent-900 transition-all duration-200 hover:scale-105 dark:bg-accent-900/30 dark:text-accent-200">AC</span>}
                  {room.hasWifi && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs transition-all duration-200 hover:scale-105 dark:bg-green-900/30">WiFi</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <button type="button" className="btn-ghost transition-all duration-200 hover:shadow-sm" onClick={() => onEdit(room)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

RoomResults.propTypes = {
  filteredRooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  statusColors: PropTypes.shape({
    AVAILABLE: PropTypes.string,
    FULL: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired
};

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
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
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false
  });

  useEffect(() => {
    loadHostels();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [pageNumber, pageSize, selectedHostel]);

  async function loadHostels() {
    try {
      const hostelsData = await listHostels();
      const allHostels = Array.isArray(hostelsData) ? hostelsData : [];
      setHostels(allHostels);
      if (!editingRoom && allHostels.length > 0) {
        setForm(prev => ({ ...prev, hostelId: allHostels[0].id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHostels(false);
    }
  }

  async function loadRooms() {
    try {
      const hostelId = selectedHostel === 'ALL' ? null : Number(selectedHostel);
      const data = await listRoomsPaginated(hostelId, pageNumber, pageSize);
      setRooms(Array.isArray(data?.content) ? data.content : []);
      setPaginationMeta({
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 0,
        isFirst: data?.isFirst ?? true,
        isLast: data?.isLast ?? true,
        hasNext: data?.hasNext ?? false,
        hasPrevious: data?.hasPrevious ?? false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      hostelId: Number(form.hostelId),
      capacity: Number.parseInt(form.capacity, 10),
      price: Number.parseFloat(form.price) || 0,
      floorNumber: Number.parseInt(form.floorNumber, 10)
    };

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
      } else {
        await createRoom(payload);
      }

      setShowForm(false);
      setEditingRoom(null);
      setForm(buildInitialForm(hostels));
      loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(room) {
    setEditingRoom(room);
    setShowForm(true);
    setError('');
    setForm({
      hostelId: room.hostelId,
      roomNumber: room.roomNumber || '',
      capacity: room.capacity ?? 2,
      roomGender: room.roomGender || 'MALE',
      hasAc: Boolean(room.hasAc),
      hasWifi: Boolean(room.hasWifi),
      mattressType: room.mattressType || 'NORMAL',
      price: room.price ?? '',
      floorNumber: room.floorNumber ?? 1
    });
  }

  function cancelEdit() {
    setEditingRoom(null);
    setShowForm(false);
    setError('');
    setForm(buildInitialForm(hostels));
  }

  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    FULL: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };

  const filteredRooms = filterRooms(rooms, selectedHostel, selectedStatus, selectedGender, search);

  const selectedHostelId = form.hostelId ? Number(form.hostelId) : null;
  const selectedFloorNumber = form.floorNumber ? Number(form.floorNumber) : null;
  const { floorAssignedGender, hasFloorGenderConflict } = getFloorGenderState(
    rooms,
    selectedHostelId,
    selectedFloorNumber,
    editingRoom?.id ?? null,
    form.roomGender
  );
  const hasDuplicateRoomNumber = hasDuplicateRoomNumberInHostel(
    rooms,
    selectedHostelId,
    form.roomNumber,
    editingRoom?.id ?? null
  );

  const toggleFormLabel = getToggleFormLabel(showForm, editingRoom);

  const saveButtonLabel = getSaveButtonLabel(saving, editingRoom);

  const loading = loadingHostels || loadingRooms;

  const pagination = {
    pageNumber,
    pageSize,
    totalElements: paginationMeta.totalElements,
    totalPages: paginationMeta.totalPages,
    isFirst: paginationMeta.isFirst,
    isLast: paginationMeta.isLast,
    hasNext: paginationMeta.hasNext,
    hasPrevious: paginationMeta.hasPrevious,
    goToPage: setPageNumber,
    nextPage: () => setPageNumber((prev) => prev + 1),
    prevPage: () => setPageNumber((prev) => Math.max(0, prev - 1)),
    goToFirst: () => setPageNumber(0),
    goToLast: () => {
      if (paginationMeta.totalPages > 0) {
        setPageNumber(paginationMeta.totalPages - 1);
      }
    },
    changePageSize: (newSize) => {
      setPageSize(newSize);
      setPageNumber(0);
    }
  };

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
          onClick={() => toggleRoomForm(showForm, editingRoom, cancelEdit, setShowForm)}
          className="btn-primary"
          disabled={hostels.length === 0}
        >
          {toggleFormLabel}
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-semibold">Floor Management</p>
        <p className="mt-1">
          Floors are added from this page. Click <span className="font-semibold">Add Room</span> and set a new value in{' '}
          <span className="font-semibold">Floor Number</span>. If that floor does not exist yet for the selected hostel,
          it will be created automatically.
        </p>
      </div>

      {/* Add Room Form */}
      {showForm && hostels.length > 0 && (
        <div className="card">
          <h2 className="card-header mb-4 text-neutral-900 dark:text-white">
            {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
          </h2>
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
                <label htmlFor="room-price" className="mb-1 block text-sm font-medium">Price (per year, ₵ / GHS)</label>
                <input
                  id="room-price"
                  type="number"
                  className="input-field"
                  placeholder="e.g., 5000"
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

            {selectedHostelId != null && selectedFloorNumber != null ? (
              <div
                className={`rounded-lg p-3 text-sm ${
                  hasFloorGenderConflict
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                }`}
              >
                {floorAssignedGender
                  ? `Floor ${selectedFloorNumber} is currently ${floorAssignedGender}.`
                  : `Floor ${selectedFloorNumber} has no rooms yet. You can set the gender for this floor.`}
              </div>
            ) : null}

            {hasDuplicateRoomNumber ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                This room number already exists in the selected hostel. Use a unique room number.
              </div>
            ) : null}
            
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

            <button
              type="submit"
              className="btn-primary"
              disabled={saving || hasFloorGenderConflict || hasDuplicateRoomNumber}
            >
              {saveButtonLabel}
            </button>
            {editingRoom ? (
              <button type="button" className="btn-ghost ml-2" onClick={cancelEdit}>
                Cancel
              </button>
            ) : null}
          </form>
        </div>
      )}

      {/* Rooms Table */}
      {paginationMeta.totalElements > 0 && (
        <div className="card">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              className="input-field"
              value={selectedHostel}
              onChange={(e) => {
                setSelectedHostel(e.target.value);
                setPageNumber(0);
              }}
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

      <RoomResults filteredRooms={filteredRooms} statusColors={statusColors} onEdit={startEdit} />

      {paginationMeta.totalElements > 0 && (
        <PaginationControls pagination={pagination} />
      )}
    </div>
  );
}
