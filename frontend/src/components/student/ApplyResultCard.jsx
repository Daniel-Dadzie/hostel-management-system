import PropTypes from 'prop-types';
import { Card } from '../../ui/Card.jsx';
import { Text } from '../../ui/Text.jsx';

export default function ApplyResultCard({ result, onViewBooking, onApplyAgain }) {
  const isSuccess = result.status !== 'REJECTED';
  const cardClass = isSuccess ? 'border-green-300 dark:border-green-600' : 'border-red-300 dark:border-red-600';
  const iconClass = isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
  const titleClass = isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="mx-auto max-w-lg">
      <Card style={{ border: '1px solid', borderColor: isSuccess ? '#6ee7b7' : '#fca5a5', margin: 0 }}>
        <div className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconClass}`}>
            <span className="text-3xl">{isSuccess ? '✅' : '❌'}</span>
          </div>

          <Text as="h2" size="xl" weight="bold" style={{ color: isSuccess ? '#059669' : '#dc2626' }}>
            {isSuccess ? 'Application Submitted!' : 'Application Rejected'}
          </Text>

          <Text size="base" style={{ marginTop: 8, color: '#52525b' }}>
            {isSuccess
              ? 'Your hostel application has been submitted successfully.'
              : 'Unfortunately, no rooms are available matching your preferences.'}
          </Text>

          {isSuccess && result.hostelName ? (
            <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
              <Text size="sm" style={{ color: '#6b7280' }}>Allocated Room</Text>
              <Text as="h3" size="lg" weight="bold" style={{ color: '#18181b' }}>
                {result.hostelName} - Room {result.roomNumber}
              </Text>
              <Text size="sm" style={{ marginTop: 8, color: '#ca8a04' }}>
                Status: {result.status?.replace('_', ' ')}
              </Text>
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
      </Card>
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
