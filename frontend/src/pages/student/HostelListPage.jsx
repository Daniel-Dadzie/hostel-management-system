import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStudentHostels } from '../../services/hostelService.js';
import { resolveAssetUrl } from '../../utils/assetUrl.js';
import hostelFallback1 from '../../assets/umat1.jpg';
import hostelFallback2 from '../../assets/umat2.jpg';
import hostelFallback3 from '../../assets/umat3.jpg';
import hostelFallback4 from '../../assets/umat4.jpg';

const hostelFallbackImages = [hostelFallback1, hostelFallback2, hostelFallback3, hostelFallback4];

function estimateTimeToCampus(distanceToCampusKm) {
  if (distanceToCampusKm == null) return null;
  const minutes = Math.max(1, Math.round(Number(distanceToCampusKm) * 12));
  return `${minutes} min walk`;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface-dark">
      <div className="h-48 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  );
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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Available Hostels</h1>
        <p className="section-subtitle mt-1">
          Browse all on-campus hostels and apply for a room that suits you.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && hostels.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-4xl">🏨</span>
          </div>
          <h3 className="empty-state-title">No Hostels Available</h3>
          <p className="section-subtitle mt-1">Check back later or contact administration.</p>
        </div>
      )}

      {/* Hostel cards */}
      {!loading && hostels.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(() => {
            const usedImageUrls = new Set();

            return hostels.map((hostel) => {
              const time = estimateTimeToCampus(hostel.distanceToCampusKm);
              const normalizedHostelId = Number.isFinite(Number(hostel.id)) ? Number(hostel.id) : 0;
              const fallbackImage = hostelFallbackImages[Math.abs(normalizedHostelId) % hostelFallbackImages.length];
              const preferredImage = resolveAssetUrl(hostel.imagePath || hostel.imageUrl);
              const hostelImage = !preferredImage || usedImageUrls.has(preferredImage)
                ? fallbackImage
                : preferredImage;
              usedImageUrls.add(hostelImage);

              return (
                <div
                  key={hostel.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-[0_2px_8px_0_rgb(0_0_0/0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-xl dark:border-neutral-800 dark:bg-surface-dark dark:hover:border-primary-600 dark:hover:shadow-primary-900/20"
                >
                  {/* ── Image area ── */}
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={hostelImage}
                      alt={hostel.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(ev) => {
                        ev.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>

                  {/* ── Card body ── */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Hostel name */}
                    <h3 className="mb-4 text-lg font-extrabold leading-tight text-neutral-900 dark:text-white">
                      {hostel.name}
                    </h3>

                    {/* Info rows */}
                    <div className="mb-5 space-y-2.5">
                      <InfoRow icon="📍" label="Location" value={hostel.location || 'Not specified'} />
                      <InfoRow
                        icon="📏"
                        label="Distance"
                        value={
                          hostel.distanceToCampusKm == null
                            ? 'Not specified'
                            : `${hostel.distanceToCampusKm} km from campus`
                        }
                      />
                      <InfoRow
                        icon="🕒"
                        label="Time"
                        value={time ? `~${time} to campus` : 'Not specified'}
                      />
                    </div>

                    {/* View Hostel button — pinned to bottom */}
                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={() => navigate(`/student/hostels/${hostel.id}/floors`)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 active:scale-95 dark:bg-primary-600 dark:hover:bg-primary-500"
                      >
                        {'View Hostel'}
                        <span className="transition-transform duration-200 group-hover:translate-x-1">{' →'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}

/* Small helper for each info row */
function InfoRow({ icon, label, value }) {
  // prop-types handled below
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}:
        </span>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{value}</span>
      </div>
    </div>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
