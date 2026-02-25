import PropTypes from 'prop-types';

function PreferenceToggle({ label, description, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-neutral-900 dark:text-white">{label}</p>
        <p className="body-text text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-primary-700' : 'bg-neutral-300 dark:bg-neutral-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

PreferenceToggle.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default function ApplyPreferencesForm({ form, hostels, loading, error, onChange, onSubmit }) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="page-title text-neutral-900 dark:text-white">Apply for Hostel</h1>
        <p className="body-text mt-1 text-neutral-500 dark:text-neutral-400">
          Select your room preferences. The system will automatically allocate the best available room.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Hostel Selection */}
          <div>
            <label htmlFor="apply-hostel" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Preferred Hostel
            </label>
            {hostels.length === 0 ? (
              <p className="body-text rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                No active hostels available. Please contact administration.
              </p>
            ) : (
              <select
                id="apply-hostel"
                className="input-field"
                value={form.hostelId}
                onChange={(e) => onChange('hostelId', e.target.value)}
                required
              >
                <option value="">Select a hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={String(hostel.id)}>
                    {hostel.name} {hostel.location ? `(${hostel.location})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Room Capacity Selection */}
          <div>
            <label className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Number of Roommates
            </label>
            <p className="body-text mb-3 text-neutral-500 dark:text-neutral-400">
              How many people would you like in your room?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange('preferredCapacity', num)}
                  className={`rounded-lg border-2 p-3 text-center transition-colors ${
                    form.preferredCapacity === num
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <span className="text-xl font-semibold text-neutral-900 dark:text-white">{num}</span>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {num === 1 ? 'Single' : num === 2 ? 'Double' : num === 3 ? 'Triple' : 'Quad'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <PreferenceToggle
            label="Air Conditioning"
            description="Prefer a room with AC"
            checked={form.hasAc}
            onToggle={() => onChange('hasAc', !form.hasAc)}
          />

          <PreferenceToggle
            label="WiFi"
            description="Prefer a room with WiFi"
            checked={form.hasWifi}
            onToggle={() => onChange('hasWifi', !form.hasWifi)}
          />

          <div>
            <label htmlFor="apply-mattress" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Mattress Type
            </label>
            <input id="apply-mattress" type="hidden" value={form.mattressType} readOnly />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChange('mattressType', 'NORMAL')}
                className={`rounded-lg border-2 p-3 text-center transition-colors ${
                  form.mattressType === 'NORMAL'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span className="text-2xl">🛏️</span>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">Normal</p>
              </button>
              <button
                type="button"
                onClick={() => onChange('mattressType', 'QUEEN')}
                className={`rounded-lg border-2 p-3 text-center transition-colors ${
                  form.mattressType === 'QUEEN'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span className="text-2xl">🛋️</span>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">Queen</p>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="apply-special-requests" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Special Requests (Optional)
            </label>
            <textarea
              id="apply-special-requests"
              className="input-field min-h-[100px]"
              placeholder="Any special requests or preferences..."
              value={form.specialRequests}
              onChange={(event) => onChange('specialRequests', event.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading || hostels.length === 0}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

ApplyPreferencesForm.propTypes = {
  form: PropTypes.shape({
    hostelId: PropTypes.string,
    preferredCapacity: PropTypes.number.isRequired,
    hasAc: PropTypes.bool.isRequired,
    hasWifi: PropTypes.bool.isRequired,
    mattressType: PropTypes.string.isRequired,
    specialRequests: PropTypes.string.isRequired
  }).isRequired,
  hostels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      location: PropTypes.string,
      active: PropTypes.bool
    })
  ),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

ApplyPreferencesForm.defaultProps = {
  hostels: []
};
