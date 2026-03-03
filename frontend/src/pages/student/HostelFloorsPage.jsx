import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';

const FLOOR_BG = [
  'from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20',
  'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
  'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
  'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
  'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20'
];

const FLOOR_ICONS = ['🏢', '🏠', '🏡', '🏘', '🏗'];

function formatFloorLabel(n) {
  if (n === 1) return '1st Floor';
  if (n === 2) return '2nd Floor';
  if (n === 3) return '3rd Floor';
  if (n === 4) return '4th Floor';
  if (n === 5) return '5th Floor';
  return `${n}th Floor`;
}

export default function HostelFloorsPage() {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [floorSummaries, setFloorSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [hostels, rooms] = await Promise.all([
          listStudentHostels(),
          listStudentHostelRooms(Number(hostelId))
        ]);

        const found = (Array.isArray(hostels) ? hostels : []).find(
          (h) => String(h.id) === String(hostelId)
        );
        setHostel(found ?? null);

        const roomList = Array.isArray(rooms) ? rooms : [];
        const floors = [...new Set(roomList.map((r) => r.floorNumber))]
          .filter(Boolean)
          .sort((a, b) => a - b);

        setFloorSummaries(
          floors.map((floorNumber) => {
            const onFloor = roomList.filter((r) => r.floorNumber === floorNumber);
            const capacity = onFloor.reduce((s, r) => s + (r.capacity ?? 0), 0);
            const occupied = onFloor.reduce((s, r) => s + (r.currentOccupancy ?? 0), 0);
            const genders = [...new Set(onFloor.map((r) => r.roomGender).filter(Boolean))];
            return {
              floorNumber,
              roomCount: onFloor.length,
              availableSlots: Math.max(capacity - occupied, 0),
              genders
            };
          })
        );
      } catch (err) {
        setError(err.message || 'Failed to load floors');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hostelId]);

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
          onClick={() => navigate('/student/hostels')}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 dark:text-neutral-400 dark:hover:text-primary-300"
        >
          <FaArrowLeft className="text-xs" />
          Back to Hostels
        </button>
        <h1 className="page-title text-neutral-900 dark:text-white">
          {hostel?.name ?? 'Hostel'} — Select a Floor
        </h1>
        <p className="section-subtitle mt-1">Choose the floor you want to stay on.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {floorSummaries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">🏢</span>
          </div>
          <h3 className="empty-state-title">No Floors Available</h3>
          <p className="section-subtitle mt-1">This hostel has no rooms configured yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {floorSummaries.map((floor, idx) => (
            <button
              key={floor.floorNumber}
              type="button"
              onClick={() =>
                navigate(`/student/hostels/${hostelId}/floors/${floor.floorNumber}/rooms`)
              }
              className="group overflow-hidden rounded-2xl border border-neutral-200/70 bg-white text-left shadow-[0_1px_4px_0_rgb(0_0_0/0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark dark:hover:border-primary-600"
            >
              {/* Coloured top band with icon */}
              <div
                className={`flex h-28 items-center justify-center bg-gradient-to-br ${FLOOR_BG[idx % FLOOR_BG.length]}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-neutral-100 transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800 dark:ring-neutral-700">
                  <span className="text-4xl">{FLOOR_ICONS[idx % FLOOR_ICONS.length]}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">
                  {formatFloorLabel(floor.floorNumber)}
                </h3>

                <div className="space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Total rooms</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{floor.roomCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Available slots</span>
                    <span
                      className={`font-bold ${
                        floor.availableSlots > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {floor.availableSlots}
                    </span>
                  </div>
                  {floor.genders.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">For</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {floor.genders.map((g) => (g === 'MALE' ? '♂ Male' : '♀ Female')).join(' / ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400">
                  {'View rooms'}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{' →'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
