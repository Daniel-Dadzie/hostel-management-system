import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBed,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaSnowflake,
  FaTimesCircle,
  FaUsers,
  FaWifi,
} from 'react-icons/fa';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatFloorLabel(n) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  return `${n}${suffix} Floor`;
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

function getGenderLabel(g) {
  if (g === 'MALE') return 'Male Only';
  if (g === 'FEMALE') return 'Female Only';
  return g ?? 'Mixed';
}

const STATUS_CONFIG = {
  available: {
    band: 'from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    label: '🟢 Available',
    availableClass: 'text-emerald-600 dark:text-emerald-400 font-bold',
  },
  almost: {
    band: 'from-amber-400 to-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    label: '🟡 Almost Full',
    availableClass: 'text-amber-600 dark:text-amber-400 font-bold',
  },
  full: {
    band: 'from-red-500 to-red-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    label: '🔴 Full',
    availableClass: 'text-red-600 dark:text-red-400 font-bold',
  },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <span className="mt-0.5 flex-shrink-0 text-primary-500 dark:text-primary-400">{icon}</span>
      <span className="w-40 flex-shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{value}</span>
    </div>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
};

function getBarColor(status) {
  if (status === 'full') return 'bg-red-500';
  if (status === 'almost') return 'bg-amber-400';
  return 'bg-emerald-500';
}

function OccupancyBar({ occupied, capacity }) {
  const safe = capacity > 0 ? capacity : 1;
  const pct = Math.min(100, Math.round((occupied / safe) * 100));
  const status = getRoomStatus(occupied, capacity);
  const barColor = getBarColor(status);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">
          {occupied} of {capacity} occupied ({pct}%)
        </span>
        <span className={STATUS_CONFIG[status].availableClass}>
          {capacity - occupied} slot{capacity - occupied === 1 ? '' : 's'} left
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

OccupancyBar.propTypes = {
  occupied: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
};

function AmenityChip({ icon, label, active }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
        {icon} {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-400 line-through dark:bg-neutral-800 dark:text-neutral-600">
      {icon} {label}
    </span>
  );
}

AmenityChip.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

const RULES = [
  'No smoking or open flames inside the room.',
  'Lights out / quiet hours: 10 PM – 6 AM.',
  'All guests must register at the front desk.',
  'Keep the room and shared bathrooms clean at all times.',
  'No cooking appliances (hot plates, grills) in the room.',
  'Report any maintenance issues to hostel management immediately.',
  'Respect the gender allocation of this room.',
  'Damage to hostel property will be charged to the occupant.',
];

// ─── main page ────────────────────────────────────────────────────────────────

export default function RoomDetailPage() {
  const { hostelId, floorNumber, roomId } = useParams();
  const navigate = useNavigate();

  const [hostel, setHostel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [hostels, allRooms] = await Promise.all([
          listStudentHostels(),
          listStudentHostelRooms(Number(hostelId)),
        ]);
        const foundHostel = (Array.isArray(hostels) ? hostels : []).find(
          (h) => String(h.id) === String(hostelId)
        );
        const foundRoom = (Array.isArray(allRooms) ? allRooms : []).find(
          (r) => String(r.id) === String(roomId)
        );
        setHostel(foundHostel ?? null);
        setRoom(foundRoom ?? null);
      } catch (err) {
        setError(err.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hostelId, floorNumber, roomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-3">
        <FaTimesCircle className="text-4xl text-red-400" />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Room Not Found</h2>
        <p className="text-sm text-neutral-500">This room may have been removed or is unavailable.</p>
        <button
          type="button"
          onClick={() => navigate(`/student/hostels/${hostelId}/floors/${floorNumber}/rooms`)}
          className="mt-2 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
        >
          ← Back to Rooms
        </button>
      </div>
    );
  }

  const occupied = room.currentOccupancy ?? 0;
  const capacity = room.capacity ?? 0;
  const available = capacity - occupied;
  const status = getRoomStatus(occupied, capacity);
  const cfg = STATUS_CONFIG[status];
  const isFull = status === 'full';
  const typeLabel = formatRoomType(room.roomType);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">

      {/* ── Back breadcrumb ── */}
      <button
        type="button"
        onClick={() => navigate(`/student/hostels/${hostelId}/floors/${floorNumber}/rooms`)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 dark:text-neutral-400 dark:hover:text-primary-300"
      >
        <FaArrowLeft className="text-xs" />
        Back to Rooms
      </button>

      {error && <div className="alert-error">{error}</div>}

      {/* ══════════════════════════════════════════
          SECTION 1 — Room Header
      ══════════════════════════════════════════ */}
      <div className={`overflow-hidden rounded-2xl bg-gradient-to-r ${cfg.band} shadow-lg`}>
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow">
              <FaBed className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-wide">
                Room {room.roomNumber}
              </h1>
              <p className="text-sm text-white/80 mt-0.5">
                {hostel?.name ?? 'Hostel'} · {formatFloorLabel(Number(floorNumber))}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — Room Information
      ══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-surface-dark">
        <div className="border-b border-neutral-100 px-6 py-3 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-800 dark:text-white">Room Information</h2>
        </div>
        <div className="px-6 py-2">
          <InfoRow icon={<FaBed />}   label="Room Number"  value={`Room ${room.roomNumber}`} />
          <InfoRow icon={<FaUsers />} label="Capacity"     value={`${capacity} person${capacity === 1 ? '' : 's'}`} />
          <InfoRow
            icon={<FaCheckCircle />}
            label="Available Slots"
            value={
              <span className={cfg.availableClass}>
                {available} slot{available === 1 ? '' : 's'}
              </span>
            }
          />
          <InfoRow icon={<FaBed />}   label="Room Type"    value={typeLabel} />
          <InfoRow icon={<FaLock />}  label="Gender"       value={getGenderLabel(room.roomGender)} />
          {room.mattressType && (
            <InfoRow icon={<FaBed />} label="Mattress"     value={room.mattressType} />
          )}
          {room.price != null && (
            <InfoRow
              icon={<span className="font-bold text-sm">₵</span>}
              label="Price / year"
              value={`₵ ${Number(room.price).toLocaleString()} (GHS)`}
            />
          )}
        </div>

        {/* Amenities */}
        <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-700">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            <AmenityChip icon={<FaSnowflake />} label="Air Conditioning" active={!!room.hasAc} />
            <AmenityChip icon={<FaWifi />}      label="Wi-Fi"            active={!!room.hasWifi} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3 — Current Occupants
      ══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-surface-dark">
        <div className="border-b border-neutral-100 px-6 py-3 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-800 dark:text-white">Current Occupancy</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <OccupancyBar occupied={occupied} capacity={capacity} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-neutral-50 py-3 dark:bg-neutral-800">
              <p className="text-2xl font-extrabold text-neutral-800 dark:text-white">{capacity}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Total Slots</p>
            </div>
            <div className="rounded-xl bg-neutral-50 py-3 dark:bg-neutral-800">
              <p className="text-2xl font-extrabold text-neutral-800 dark:text-white">{occupied}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Occupied</p>
            </div>
            <div className="rounded-xl bg-neutral-50 py-3 dark:bg-neutral-800">
              <p className={`text-2xl font-extrabold ${cfg.availableClass}`}>{available}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 4 — Rules
      ══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-surface-dark">
        <div className="border-b border-neutral-100 px-6 py-3 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-800 dark:text-white">
            <FaExclamationTriangle className="inline mr-2 text-amber-500" />
            Hostel Rules &amp; Regulations
          </h2>
        </div>
        <ul className="divide-y divide-neutral-100 px-6 dark:divide-neutral-700">
          {RULES.map((rule, ruleIdx) => (
            <li key={rule} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {ruleIdx + 1}
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 5 — Confirm Selection
      ══════════════════════════════════════════ */}
      <div className="rounded-2xl border border-neutral-200/70 bg-white px-6 py-5 shadow-sm dark:border-neutral-800 dark:bg-surface-dark">
        {isFull ? (
          <div className="flex flex-col items-center gap-2 text-center py-2">
            <FaTimesCircle className="text-3xl text-red-400" />
            <p className="font-bold text-red-600 dark:text-red-400">This room is fully occupied.</p>
            <p className="text-sm text-neutral-500">Please go back and choose another room.</p>
            <button
              type="button"
              onClick={() => navigate(`/student/hostels/${hostelId}/floors/${floorNumber}/rooms`)}
              className="mt-2 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              ← Choose Another Room
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-neutral-800 dark:text-white">
                Ready to apply for Room {room.roomNumber}?
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                You will be taken to the application form to complete your booking.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/student/confirm?hostelId=${hostelId}&floorNumber=${floorNumber}&roomId=${room.id}`
                )
              }
              className="flex-shrink-0 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-700 active:bg-primary-800 sm:w-auto w-full text-center"
            >
              Confirm Selection →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
