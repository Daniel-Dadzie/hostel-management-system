import PropTypes from 'prop-types';

export default function ApplyResultCard({ result, onViewBooking, onApplyAgain }) {
  const isSuccess = result.status !== 'REJECTED';
  const cardClass = isSuccess ? 'border-green-300 dark:border-green-600' : 'border-red-300 dark:border-red-600';
  const iconClass = isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const titleClass = isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="mx-auto max-w-lg">
      <div className={`card ${cardClass}`}>
        <div className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconClass}`}>
            <span className="text-3xl">{isSuccess ? '✅' : '❌'}</span>
          </div>

          <h2 className={`text-xl font-bold ${titleClass}`}>
            {isSuccess ? 'Application Submitted!' : 'Application Rejected'}
          </h2>

          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {isSuccess
              ? 'Your hostel application has been submitted successfully.'
              : 'Unfortunately, no rooms are available matching your preferences.'}
          </p>

          {isSuccess && result.hostelName ? (
            <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Allocated Room</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {result.hostelName} - Room {result.roomNumber}
              </p>
              <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                Status: {result.status?.replace('_', ' ')}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex justify-center gap-3">
            <button onClick={onViewBooking} className="btn-primary">
              View Booking
            </button>
            <button
              onClick={onApplyAgain}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Apply Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ApplyResultCard.propTypes = {
  result: PropTypes.shape({
    status: PropTypes.string,
    hostelName: PropTypes.string,
    roomNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onViewBooking: PropTypes.func.isRequired,
  onApplyAgain: PropTypes.func.isRequired
};
