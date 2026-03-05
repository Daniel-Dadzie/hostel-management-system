import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';

function formatFloorLabel(n) {
  return `Floor ${n}`;
}

function isRoomAvailable(r) {
  return (r.currentOccupancy ?? 0) < (r.capacity ?? 0);
}

function extractGenders(roomList) {
  return [...new Set(roomList.map((r) => r.roomGender).filter(Boolean))];
}

function buildFloorSummary(floorNumber, roomList) {
  const onFloor = roomList.filter((r) => r.floorNumber === floorNumber);
  return {
    floorNumber,
    totalRooms: onFloor.length,
    availableRooms: onFloor.filter(isRoomAvailable).length,
    genders: extractGenders(onFloor),
  };
}

function formatGender(genders) {
  if (!genders || genders.length === 0) return 'Mixed / Not specified';
  return genders.map((g) => (g === 'MALE' ? 'Male' : 'Female')).join(' & ');
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface-dark">
      <div className="h-24 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-1/3 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

const FLOOR_ACCENTS = [
  { bg: 'from-primary-500 to-emerald-500', icon: '🏢' },
  { bg: 'from-sky-500 to-blue-500',        icon: '🏠' },
  { bg: 'from-violet-500 to-purple-500',   icon: '🏡' },
  { bg: 'from-amber-500 to-orange-500',    icon: '🏘' },
  { bg: 'from-rose-500 to-pink-500',       icon: '🏗' },
];

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

        setFloorSummaries(floors.map((fn) => buildFloorSummary(fn, roomList)));
      } catch (err) {
        setError(err.message || 'Failed to load floors');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hostelId]);

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
          {'Back to Hostels'}
        </button>
        <h1 className="page-title text-neutral-900 dark:text-white">
          {hostel?.name ?? 'Hostel'}
        </h1>
        <p className="section-subtitle mt-1">Select a floor to view available rooms.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && floorSummaries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><span className="text-4xl">🏢</span></div>
          <h3 className="empty-state-title">No Floors Available</h3>
          <p className="section-subtitle mt-1">This hostel has no rooms configured yet.</p>
        </div>
      )}

      {/* Floor cards */}
      {!loading && floorSummaries.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {floorSummaries.map((floor, idx) => {
            const accent = FLOOR_ACCENTS[idx % FLOOR_ACCENTS.length];
            const hasRooms = floor.availableRooms > 0;
            return (
              <div
                key={floor.floorNumber}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-[0_2px_8px_0_rgb(0_0_0/0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark dark:hover:border-primary-600"
              >
                {/* Coloured top band */}
                <div className={`flex h-24 items-center gap-4 bg-gradient-to-r ${accent.bg} px-5`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-3xl shadow ring-2 ring-white/30 transition-transform duration-300 group-hover:scale-110">
                    {accent.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-white drop-shadow">
                    {formatFloorLabel(floor.floorNumber)}
                  </h3>
                </div>

                {/* Info rows */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-5 space-y-3">
                    <FloorRow
                      label="Gender"
                      value={formatGender(floor.genders)}
                      valueClass="text-neutral-800 dark:text-neutral-200"
                    />
                    <FloorRow
                      label="Total Rooms"
                      value={String(floor.totalRooms)}
                      valueClass="text-neutral-800 dark:text-neutral-200"
                    />
                    <FloorRow
                      label="Available Rooms"
                      value={String(floor.availableRooms)}
                      valueClass={
                        hasRooms
                          ? 'text-emerald-600 font-extrabold dark:text-emerald-400'
                          : 'text-red-500 font-extrabold dark:text-red-400'
                      }
                    />
                  </div>

                  {/* View Rooms button */}
                  <div className="mt-auto">
                    {hasRooms ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/student/hostels/${hostelId}/floors/${floor.floorNumber}/rooms`)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 active:scale-95"
                      >
                        {'View Rooms'}
                        <span className="transition-transform duration-200 group-hover:translate-x-1">{' →'}</span>
                      </button>
                    ) : (
                      <div className="rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-sm font-semibold text-red-600 dark:border-red-800/30 dark:bg-red-900/15 dark:text-red-400">
                        No Rooms Available
                      </div>
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

function FloorRow({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2.5 dark:bg-neutral-800/60">
      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-sm font-bold ${valueClass ?? 'text-neutral-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

FloorRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  valueClass: PropTypes.string,
};

FloorRow.defaultProps = {
  valueClass: '',
};
