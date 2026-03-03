import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStudentHostels } from '../../services/hostelService.js';

function estimateTimeToCampus(distanceToCampusKm) {
  if (distanceToCampusKm == null) return 'N/A';
  const minutes = Math.max(1, Math.round(Number(distanceToCampusKm) * 12));
  return `~${minutes} min`;
}

export default function HostelListPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listStudentHostels()
      .then((data) => setHostels(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load hostels'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Available Hostels</h1>
        <p className="section-subtitle mt-1">
          Select a hostel to explore its floors and available rooms.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {hostels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">🏨</span>
          </div>
          <h3 className="empty-state-title">No Hostels Available</h3>
          <p className="section-subtitle mt-1">Check back later or contact administration.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hostels.map((hostel) => (
            <button
              key={hostel.id}
              type="button"
              onClick={() => navigate(`/student/hostels/${hostel.id}/floors`)}
              className="group overflow-hidden rounded-2xl border border-neutral-200/70 bg-white text-left shadow-[0_1px_4px_0_rgb(0_0_0/0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark dark:hover:border-primary-600 dark:hover:shadow-primary-900/20"
            >
              {/* Image / Placeholder */}
              {hostel.imageUrl ? (
                <div className="h-44 w-full overflow-hidden">
                  <img
                    src={hostel.imageUrl}
                    alt={hostel.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(ev) => {
                      ev.currentTarget.parentElement.className =
                        'flex h-44 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 text-7xl';
                      ev.currentTarget.remove();
                      ev.currentTarget.parentElement.textContent = '🏨';
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-7xl dark:from-primary-900/20 dark:to-primary-900/40">
                  🏨
                </div>
              )}

              {/* Card body */}
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">{hostel.name}</h3>
                  <span className="flex-shrink-0 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {'View →'}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-700/60">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="text-base">📍</span>
                    <span>{hostel.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="text-base">📏</span>
                    <span>
                      {hostel.distanceToCampusKm != null
                        ? `${hostel.distanceToCampusKm} km from campus`
                        : 'Distance not set'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="text-base">🕐</span>
                    <span>{estimateTimeToCampus(hostel.distanceToCampusKm)} walk to campus</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
