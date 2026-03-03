import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBed, FaSnowflake, FaWifi } from 'react-icons/fa';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';

function formatFloorLabel(n) {
  if (n === 1) return '1st Floor';
  if (n === 2) return '2nd Floor';
  if (n === 3) return '3rd Floor';
  if (n === 4) return '4th Floor';
  if (n === 5) return '5th Floor';
  return `${n}th Floor`;
}

function OccupancyBar({ current, capacity }) {
  const safe = capacity > 0 ? capacity : 1;
  const pct = Math.min(100, Math.round((current / safe) * 100));
  const isFull = current >= capacity;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">
          {current}/{capacity} occupied
        </span>
        <span
          className={`font-bold ${
            isFull ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {capacity - current} {capacity - current === 1 ? 'slot' : 'slots'} left
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? 'bg-red-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

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
          Choose a room and apply for accommodation.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {rooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FaBed className="text-2xl text-neutral-400" />
          </div>
          <h3 className="empty-state-title">No Rooms Available</h3>
          <p className="section-subtitle mt-1">No rooms are available on this floor right now.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const isFull = (room.currentOccupancy ?? 0) >= (room.capacity ?? 0);
            return (
              <div
                key={room.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-[0_1px_4px_0_rgb(0_0_0/0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark"
              >
                {/* Top visual */}
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-emerald-50 dark:from-primary-900/20 dark:via-primary-900/30 dark:to-neutral-800">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-primary-100 transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800 dark:ring-primary-800/40">
                    <FaBed className="text-3xl text-primary-600 dark:text-primary-400" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  {/* Title row */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatFloorLabel(room.floorNumber)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xl font-extrabold text-primary-700 dark:text-primary-400">
                      GHS {room.price ?? 0}
                    </span>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mb-4">
                    <OccupancyBar
                      current={room.currentOccupancy ?? 0}
                      capacity={room.capacity ?? 1}
                    />
                  </div>

                  {/* Preference chips */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {'👥'} {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                    </span>

                    {room.roomGender && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {room.roomGender === 'MALE' ? '♂ Male' : '♀ Female'}
                      </span>
                    )}

                    {room.hasAc ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
                        <FaSnowflake className="text-[10px]" /> AC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 line-through">
                        No AC
                      </span>
                    )}

                    {room.hasWifi ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                        <FaWifi className="text-[10px]" /> WiFi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 line-through">
                        No WiFi
                      </span>
                    )}

                    {room.mattressType && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                        {'🛏'} {room.mattressType}
                      </span>
                    )}
                  </div>

                  {/* Apply button — pinned to bottom */}
                  <div className="mt-auto">
                    {isFull ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 py-2 text-center text-sm font-semibold text-red-600 dark:border-red-800/30 dark:bg-red-900/15 dark:text-red-400">
                        Room Full
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/student/apply?hostelId=${hostelId}&floorNumber=${floorNumber}&roomId=${room.id}`
                          )
                        }
                        className="btn-primary w-full"
                      >
                        Apply for this Room
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
