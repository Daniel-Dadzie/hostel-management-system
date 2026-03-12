import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBed,
  FaBuilding,
  FaCheckCircle,
  FaLayerGroup,
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
  const v = Number(n) % 100;
  const suffix = suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0];
  return `${n}${suffix} Floor`;
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

function formatRoomType(roomType) {
  if (!roomType) return 'Standard';
  return roomType.charAt(0) + roomType.slice(1).toLowerCase();
}

const STATUS_CFG = {
  available: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    label: '🟢 Available',
    valueClass: 'text-emerald-600 dark:text-emerald-400',
  },
  almost: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-400',
    label: '🟡 Almost Full',
    valueClass: 'text-amber-600 dark:text-amber-400',
  },
  full: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800/40',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    dot: 'bg-red-500',
    label: '🔴 Full',
    valueClass: 'text-red-600 dark:text-red-400',
  },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function ConfirmRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
        {icon}
      </span>
      <span className="flex-1 text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-sm font-bold text-right ${valueClass || 'text-neutral-800 dark:text-neutral-100'}`}>
        {value}
      </span>
    </div>
  );
}

import PropTypes from 'prop-types';

ConfirmRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  valueClass: PropTypes.string,
};
ConfirmRow.defaultProps = { valueClass: '' };

// ─── main page ────────────────────────────────────────────────────────────────

export default function ConfirmBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hostelId     = searchParams.get('hostelId') || '';
  const floorNumber  = searchParams.get('floorNumber') || '';
  const roomId       = searchParams.get('roomId') || '';

  const [hostel, setHostel] = useState(null);
  const [room,   setRoom]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [hostels, allRooms] = await Promise.all([
          listStudentHostels(),
          listStudentHostelRooms(Number(hostelId)),
        ]);
        setHostel((Array.isArray(hostels) ? hostels : []).find(
          (h) => String(h.id) === String(hostelId)
        ) ?? null);
        setRoom((Array.isArray(allRooms) ? allRooms : []).find(
          (r) => String(r.id) === String(roomId)
        ) ?? null);
      } catch (err) {
        setError(err.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hostelId, roomId]);

  // ── navigation helpers ──
  function goBack() {
    if (hostelId && floorNumber) {
      navigate(`/student/hostels/${hostelId}/floors/${floorNumber}/rooms`);
    } else {
      navigate(-1);
    }
  }

  function goConfirm() {
    navigate(
      `/student/apply?hostelId=${hostelId}&floorNumber=${floorNumber}&roomId=${roomId}`
    );
  }

  // ── loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // ── not found ──
  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-3">
        <FaTimesCircle className="text-4xl text-red-400" />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Room Not Found</h2>
        <p className="text-sm text-neutral-500">This room may have been removed or is unavailable.</p>
        <button type="button" onClick={goBack}
          className="mt-2 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400">
          ← Go Back
        </button>
      </div>
    );
  }

  const occupied   = room.currentOccupancy ?? 0;
  const capacity   = room.capacity ?? 0;
  const available  = capacity - occupied;
  const status     = getRoomStatus(occupied, capacity);
  const cfg        = STATUS_CFG[status];
  const isFull     = status === 'full';
  const typeLabel  = formatRoomType(room.roomType);

  return (
    <div className="animate-fade-in mx-auto max-w-lg space-y-5">

      {/* ── back breadcrumb ── */}
      <button type="button" onClick={goBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 dark:text-neutral-400 dark:hover:text-primary-300">
        <FaArrowLeft className="text-xs" /> Back to Rooms
      </button>

      {/* ── page title ── */}
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Confirm Room Selection</h1>
        <p className="section-subtitle mt-1">
          Review the details below before confirming your application.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ══════════════════════════════════════════
          CARD — Room summary
      ══════════════════════════════════════════ */}
      <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm`}>

        {/* colour band header */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <FaBed className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">Room {room.roomNumber}</p>
              <p className="text-xs text-white/70">{hostel?.name ?? 'Hostel'}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* info rows */}
        <div className="px-4 py-1 bg-white dark:bg-surface-dark">
          <ConfirmRow
            icon={<FaBed />}
            label="Room Number"
            value={`Room ${room.roomNumber}`}
          />
          <ConfirmRow
            icon={<FaLayerGroup />}
            label="Floor"
            value={formatFloorLabel(Number(floorNumber))}
          />
          <ConfirmRow
            icon={<FaBuilding />}
            label="Hostel"
            value={hostel?.name ?? '—'}
          />
          <ConfirmRow
            icon={<FaUsers />}
            label="Capacity"
            value={`${capacity} person${capacity === 1 ? '' : 's'}`}
          />
          <ConfirmRow
            icon={<FaCheckCircle />}
            label="Available Space"
            value={`${available} slot${available === 1 ? '' : 's'}`}
            valueClass={cfg.valueClass}
          />
          <ConfirmRow
            icon={<FaLock />}
            label="Gender"
            value={getGenderLabel(room.roomGender)}
          />
          <ConfirmRow
            icon={<FaBed />}
            label="Room Type"
            value={typeLabel}
          />
        </div>

        {/* amenity chips */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-neutral-100 bg-white dark:border-neutral-700 dark:bg-surface-dark">
          {room.hasAc && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
              <FaSnowflake /> Air Conditioning
            </span>
          )}
          {room.hasWifi && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
              <FaWifi /> Wi-Fi
            </span>
          )}
          {(!room.hasAc && !room.hasWifi) && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600">No listed amenities</span>
          )}
        </div>

        {/* price row */}
        {room.price != null && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/60">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Annual fee (₵ / GHS)</span>
            <span className="text-xl font-extrabold text-primary-700 dark:text-primary-400">
              ₵ {Number(room.price).toLocaleString()} (GHS)
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          ACTION BUTTONS
      ══════════════════════════════════════════ */}
      {isFull ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800/40 dark:bg-red-900/15 flex flex-col items-center gap-2 text-center">
          <FaTimesCircle className="text-3xl text-red-400" />
          <p className="font-bold text-red-700 dark:text-red-400">This room is fully occupied</p>
          <p className="text-sm text-neutral-500">Please go back and select a different room.</p>
          <button type="button" onClick={goBack}
            className="mt-2 rounded-xl border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20">
            ← Choose Another Room
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* Cancel */}
          <button
            type="button"
            onClick={goBack}
            className="flex-1 rounded-2xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>

          {/* Confirm */}
          <button
            type="button"
            onClick={goConfirm}
            className="flex-1 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary-700 active:bg-primary-800"
          >
            Confirm →
          </button>
        </div>
      )}

    </div>
  );
}
