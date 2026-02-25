import { Link } from 'react-router-dom';

const preferenceItems = [
  { key: 'mattressType', label: 'Mattress Type', value: 'NORMAL or QUEEN' },
  { key: 'hasAc', label: 'Air Conditioning', value: 'Required / Not required' },
  { key: 'hasWifi', label: 'WiFi', value: 'Required / Not required' },
  { key: 'specialRequests', label: 'Special Requests', value: 'Optional additional details' }
];

export default function RoomPreferencesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Room Preferences</h1>
        <p className="section-subtitle">
          Set your preferences before applying. The system uses these values to auto-allocate a suitable room.
        </p>
      </div>

      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Preference Fields</h2>
        <div className="mt-4 space-y-2 md:hidden">
          {preferenceItems.map((item) => (
            <div key={item.key} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="font-medium text-neutral-900 dark:text-white">{item.label}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Field</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Description</th>
              </tr>
            </thead>
            <tbody>
              {preferenceItems.map((item) => (
                <tr key={item.key} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-3 py-2 font-medium text-neutral-900 dark:text-white">{item.label}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="body-text mt-4 text-neutral-500 dark:text-neutral-400">
          Update these values by submitting a new application.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/student/apply" className="btn-primary">
            Apply for Hostel
          </Link>
          <Link to="/student/booking" className="btn-ghost">
            View Current Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
