import PropTypes from 'prop-types';

function formatFloorLabel(floorNumber) {
  if (floorNumber === 1) {
    return '1st Floor';
  }
  if (floorNumber === 2) {
    return '2nd Floor';
  }
  if (floorNumber === 3) {
    return '3rd Floor';
  }
  return `${floorNumber}th Floor`;
}

export default function ApplyPreferencesForm({ form, hostels, floors, rooms, loading, error, onChange, onSubmit }) {
  const selectedRoom = rooms.find((room) => String(room.id) === String(form.roomId));

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="page-title text-neutral-900 dark:text-white">Apply for Hostel</h1>
        <p className="body-text mt-1 text-neutral-500 dark:text-neutral-400">
          Select the hostel and exact room you want, then submit your booking request.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="apply-hostel" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Hostel
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
                    {hostel.name}
                    {hostel.location ? ` (${hostel.location})` : ''}
                    {hostel.distanceToCampusKm == null ? '' : ` - ${hostel.distanceToCampusKm} km`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <p className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Floor
            </p>
            {floors.length === 0 ? (
              <p className="body-text rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                No floor available in this hostel right now.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {floors.map((floorNumber) => (
                  <button
                    key={floorNumber}
                    type="button"
                    onClick={() => onChange('floorNumber', String(floorNumber))}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      form.floorNumber === String(floorNumber)
                        ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-600'
                    }`}
                  >
                    <p className="font-semibold text-neutral-900 dark:text-white">{formatFloorLabel(floorNumber)}</p>
                    <p className="body-text text-neutral-600 dark:text-neutral-300">Tap to view available rooms</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="apply-room" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Room
            </label>
            {rooms.length === 0 ? (
              <p className="body-text rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                No available rooms on this floor right now.
              </p>
            ) : (
              <select
                id="apply-room"
                className="input-field"
                value={form.roomId}
                onChange={(e) => onChange('roomId', e.target.value)}
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={String(room.id)}>
                    Room {room.roomNumber} - GHS {room.price ?? 0}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedRoom ? (
            <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="font-medium text-neutral-900 dark:text-white">Selected Room Details</p>
              <p className="body-text mt-1 text-neutral-600 dark:text-neutral-300">
                Price: GHS {selectedRoom.price ?? 0}
              </p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">
                Occupancy: {selectedRoom.currentOccupancy}/{selectedRoom.capacity}
              </p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">
                Preferences: {selectedRoom.hasAc ? 'AC' : 'No AC'} • {selectedRoom.hasWifi ? 'WiFi' : 'No WiFi'} • {selectedRoom.mattressType}
              </p>
            </div>
          ) : null}

          <div>
            <label htmlFor="apply-special-requests" className="mb-2 block font-medium text-neutral-900 dark:text-white">
              Special Requests (Optional)
            </label>
            <textarea
              id="apply-special-requests"
              className="input-field min-h-[100px]"
              placeholder="Any special requests..."
              value={form.specialRequests}
              onChange={(event) => onChange('specialRequests', event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || hostels.length === 0 || rooms.length === 0 || !form.roomId}
          >
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
    floorNumber: PropTypes.string,
    roomId: PropTypes.string,
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
      distanceToCampusKm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      active: PropTypes.bool
    })
  ),
  floors: PropTypes.arrayOf(PropTypes.number),
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      roomNumber: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      capacity: PropTypes.number,
      currentOccupancy: PropTypes.number,
      hasAc: PropTypes.bool,
      hasWifi: PropTypes.bool,
      mattressType: PropTypes.string
    })
  ),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

ApplyPreferencesForm.defaultProps = {
  hostels: [],
  floors: [],
  rooms: []
};
