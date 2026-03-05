import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBed, FaEye } from 'react-icons/fa';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';

function formatFloorLabel(n) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  return `${n}${suffix} Floor`;
}

function getGenderLabel(roomGender) {
  if (roomGender === 'MALE') return 'Male';
  if (roomGender === 'FEMALE') return 'Female';
  return roomGender ?? '—';
}

function formatRoomType(roomType) {
  if (!roomType) return 'Standard';
  return roomType.charAt(0) + roomType.slice(1).toLowerCase();
}

function getRoomStatus(occupied, capacity) {
  const available = (capacity ?? 0) - (occupied ?? 0);
  const pct = capacity > 0 ? occupied / capacity : 1;
  if (available <= 0) return 'full';
  if (available <= 2 || pct >= 0.75) return 'almost';
  return 'available';
}

const STATUS_CONFIG = {
  available: {
    band: 'from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    label: '🟢 Available',
    valueClass: 'text-emerald-600 dark:text-emerald-400',
  },
  almost: {
    band: 'from-amber-400 to-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-400',
    label: '🟡 Almost Full',
    valueClass: 'text-amber-600 dark:text-amber-400',
  },
  full: {
    band: 'from-red-500 to-red-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    dot: 'bg-red-500',
    label: '🔴 Full',
    valueClass: 'text-red-600 dark:text-red-400',
  },
};

function RoomRow({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-sm font-semibold ${valueClass || 'text-neutral-800 dark:text-neutral-100'}`}>
        {value}
      </span>
    </div>
  );
}

RoomRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueClass: PropTypes.string,
};

RoomRow.defaultProps = { valueClass: '' };

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-surface-dark">
      <div className="h-14 bg-neutral-200 dark:bg-neutral-700" />
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        ))}
        <div className="mt-4 flex gap-2">
          <div className="h-9 flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-9 flex-1 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

export default function HostelRoomsPage() {
  const { hostelId, floorNumber } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [hostels, allRooms] = await Promise.all([
          listStudentHostels(),
          listStudentHostelRooms(Number(hostelId))
        ]);
        const found = (Array.isArray(hostels) ? hostels : []).find(
          (h) => String(h.id) === String(hostelId)
        );
        setHostel(found ?? null);
        const floorRooms = (Array.isArray(allRooms) ? allRooms : []).filter(
          (r) => String(r.floorNumber) === String(floorNumber)
        );
        setRooms(floorRooms);
      } catch (err) {
        setError(err.message || 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hostelId, floorNumber]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/student/hostels/${hostelId}/floors`)}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 dark:text-neutral-400 dark:hover:text-primary-300"
        >
          <FaArrowLeft className="text-xs" />
          Back to Floors
        </button>
        <h1 className="page-title text-neutral-900 dark:text-white">
          {hostel?.name ?? 'Hostel'} — {formatFloorLabel(Number(floorNumber))}
        </h1>
        <p className="section-subtitle mt-1">
          Select a room to apply for accommodation.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FaBed className="text-2xl text-neutral-400" />
          </div>
          <h3 className="empty-state-title">No Rooms on This Floor</h3>
          <p className="section-subtitle mt-1">No rooms are listed for this floor right now.</p>
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => {
            const occupied = room.currentOccupancy ?? 0;
            const capacity = room.capacity ?? 0;
            const available = capacity - occupied;
            const status = getRoomStatus(occupied, capacity);
            const cfg = STATUS_CONFIG[status];
            const isFull = status === 'full';

            const genderLabel = getGenderLabel(room.roomGender);

            const typeLabel = formatRoomType(room.roomType);

            return (
              <div
                key={room.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-[0_1px_4px_0_rgb(0_0_0/0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark"
              >
                {/* Colored top band */}
                <div className={`bg-gradient-to-r ${cfg.band} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                      <FaBed className="text-white text-sm" />
                    </div>
                    <span className="text-base font-bold text-white tracking-wide">
                      Room {room.roomNumber}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Info rows */}
                <div className="flex flex-1 flex-col px-4 pt-3 pb-2">
                  <RoomRow label="Capacity" value={capacity} />
                  <RoomRow label="Occupied" value={occupied} />
                  <RoomRow
                    label="Available"
                    value={available}
                    valueClass={cfg.valueClass}
                  />
                  <RoomRow label="Type" value={typeLabel} />
                  <RoomRow label="Gender" value={genderLabel} />
                </div>

                {/* Action buttons */}
                <div className="px-4 pb-4 pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/hostels/${hostelId}/floors/${floorNumber}/rooms/${room.id}`
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <FaEye className="text-xs" />
                    View Details
                  </button>

                  {isFull ? (
                    <button
                      type="button"
                      disabled
                      className="flex-1 cursor-not-allowed rounded-xl bg-neutral-200 py-2 text-sm font-semibold text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                    >
                      Full
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/student/confirm?hostelId=${hostelId}&floorNumber=${floorNumber}&roomId=${room.id}`
                        )
                      }
                      className="flex-1 rounded-xl bg-primary-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
