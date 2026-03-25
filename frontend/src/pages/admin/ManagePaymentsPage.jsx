import { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaDownload, FaEye } from 'react-icons/fa';
import {
  cancelPaymentByBooking,
  confirmPaymentByBooking,
  fetchPaymentReceiptBlob,
  listPaymentRecords
} from '../../services/paymentService.js';
import Alert from '../../components/admin/Alert.jsx';
import { MiniStatsCard } from '../../components/admin/StatsCard.jsx';
import { exportToCSV } from '../../utils/exportUtils.js';
import { toastService } from '../../hooks/useToast.js';

export default function ManagePaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processing, setProcessing] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPayments();

    // Set up polling every 60 seconds to auto-refresh payment records
    const pollingInterval = setInterval(async () => {
      try {
        const data = await listPaymentRecords();
        const bookingsArray = Array.isArray(data) ? data : [];
        // Map to state but don't show toast - just silently update
        setBookings((prevBookings) => {
          const mapped = new Map(prevBookings.map((b) => [b.id, b]));
          bookingsArray.forEach((b) => mapped.set(b.id, b));
          return Array.from(mapped.values());
        });
      } catch (err) {
        // Keep polling non-blocking for UX; errors are surfaced on manual actions.
      }
    }, 60000); // Poll every 60 seconds

    // Cleanup
    return () => clearInterval(pollingInterval);
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await listPaymentRecords();
      const bookingsArray = Array.isArray(data) ? data : [];
      setBookings(bookingsArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId, status) {
    setProcessing(bookingId);
    setError('');
    setSuccessMessage('');
    
    const actionLabel = status === 'APPROVED' ? 'confirm' : 'cancel';
    const toastId = toastService.loading(`${actionLabel === 'confirm' ? 'Confirming' : 'Cancelling'} payment...`);
    
    try {
      if (status === 'APPROVED') {
        await confirmPaymentByBooking(bookingId);
      } else {
        await cancelPaymentByBooking(bookingId);
      }
      await loadPayments();
      
      toastService.dismiss(toastId);
      const message = `Payment ${status === 'APPROVED' ? 'confirmed' : 'cancelled'} successfully`;
      toastService.success(message);
    } catch (err) {
      toastService.dismiss(toastId);
      const errorMessage = err.message || 'Failed to update payment status';
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  }

  async function previewReceipt(bookingId) {
    setReceiptLoading(`preview-${bookingId}`);
    setError('');
    try {
      const { blob } = await fetchPaymentReceiptBlob(bookingId, false);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err.message);
    } finally {
      setReceiptLoading('');
    }
  }

  async function downloadReceipt(bookingId) {
    setReceiptLoading(`download-${bookingId}`);
    setError('');
    try {
      const { blob, filename } = await fetchPaymentReceiptBlob(bookingId, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setReceiptLoading('');
    }
  }

  const filteredRows = bookings.filter((item) =>
    statusFilter === 'ALL' ? true : (item.paymentStatus || 'N/A') === statusFilter
  );

  const handleExport = () => {
    const columns = [
      { key: 'id', label: 'Booking ID' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'paymentStatus', label: 'Status' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'paymentAmount', label: 'Amount' },
      { key: 'transactionReference', label: 'Reference' },
      { key: 'paymentDueAt', label: 'Due Date' }
    ];
    
    try {
      exportToCSV(filteredRows, columns, `payments-${new Date().toISOString().split('T')[0]}.csv`);
      setSuccessMessage('Payment data exported successfully');
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Manage Payments</h1>
        <p className="body-text mt-1 text-neutral-600 dark:text-neutral-400">
          Review and manage payment records for active bookings.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} autoClose={3000} />
      )}

      {/* Payment Statistics */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStatsCard
          label="Total Payments"
          value={bookings.length}
          icon={FaClock}
          color="primary"
        />
        <MiniStatsCard
          label="Completed"
          value={bookings.filter((b) => b.paymentStatus === 'COMPLETED').length}
          icon={FaCheckCircle}
          color="emerald"
        />
        <MiniStatsCard
          label="Pending"
          value={bookings.filter((b) => b.paymentStatus === 'PENDING').length}
          icon={FaClock}
          color="yellow"
        />
        <MiniStatsCard
          label="Cancelled"
          value={bookings.filter((b) => b.paymentStatus === 'CANCELLED').length}
          icon={FaTimesCircle}
          color="red"
        />
      </div>

      {/* Payment Records Table */}
      <div className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-header text-neutral-900 dark:text-white">Payment Records</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <FaDownload className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Mobile view */}
        <div className="space-y-3 md:hidden">
          {filteredRows.map((row) => (
            <div key={row.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">Booking #{row.id}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{row.studentName}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  row.paymentStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : row.paymentStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {row.paymentStatus || 'N/A'}
                </span>
              </div>
              
              <div className="space-y-1.5 text-sm mb-3">
                <p><span className="text-neutral-600 dark:text-neutral-400">Method:</span> {row.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Amount:</span> {row.paymentAmount || 'N/A'}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Reference:</span> {row.transactionReference || 'N/A'}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Due:</span> {row.paymentDueAt ? new Date(row.paymentDueAt).toLocaleDateString() : '-'}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                {row.receiptFilename && (
                  <>
                    <button
                      type="button"
                      className="flex-1 rounded px-2 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      onClick={() => previewReceipt(row.id)}
                      disabled={receiptLoading === `preview-${row.id}`}
                    >
                      {receiptLoading === `preview-${row.id}` ? 'Opening...' : 'View Receipt'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded px-2 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      onClick={() => downloadReceipt(row.id)}
                      disabled={receiptLoading === `download-${row.id}`}
                    >
                      {receiptLoading === `download-${row.id}` ? 'Downloading...' : 'Download'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className={`rounded px-2 py-1.5 text-xs font-medium ${
                    processing === row.id
                      ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                  onClick={() => updateBookingStatus(row.id, 'APPROVED')}
                  disabled={processing === row.id}
                  aria-busy={processing === row.id}
                >
                  {processing === row.id ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1.5 text-xs font-medium ${
                    processing === row.id || row.paymentStatus === 'COMPLETED' || row.paymentStatus === 'CANCELLED'
                      ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                  onClick={() => updateBookingStatus(row.id, 'CANCELLED')}
                  disabled={processing === row.id || row.paymentStatus === 'COMPLETED' || row.paymentStatus === 'CANCELLED'}
                  aria-busy={processing === row.id}
                >
                  {processing === row.id ? 'Processing...' : 'Cancel'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden overflow-x-auto md:block rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50">
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Booking</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Payment Info</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Receipt</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/30">
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">#{row.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{row.studentName}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{row.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <p>Method: {row.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
                    <p>Amount: {row.paymentAmount || 'N/A'}</p>
                    <p className="text-xs">Ref: {row.transactionReference || '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      row.paymentStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : row.paymentStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {row.paymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.receiptFilename ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          onClick={() => previewReceipt(row.id)}
                          disabled={receiptLoading === `preview-${row.id}`}
                          title="Preview receipt"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          onClick={() => downloadReceipt(row.id)}
                          disabled={receiptLoading === `download-${row.id}`}
                          title="Download receipt"
                        >
                          <FaDownload className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500">No receipt</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`rounded px-2.5 py-1 text-xs font-medium ${
                          processing === row.id
                            ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        onClick={() => updateBookingStatus(row.id, 'APPROVED')}
                        disabled={processing === row.id}
                        aria-busy={processing === row.id}
                      >
                        {processing === row.id ? 'Processing...' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        className={`rounded px-2.5 py-1 text-xs font-medium ${
                          processing === row.id || row.paymentStatus === 'COMPLETED' || row.paymentStatus === 'CANCELLED'
                            ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                        onClick={() => updateBookingStatus(row.id, 'CANCELLED')}
                        disabled={processing === row.id || row.paymentStatus === 'COMPLETED' || row.paymentStatus === 'CANCELLED'}
                        aria-busy={processing === row.id}
                      >
                        {processing === row.id ? 'Processing...' : 'Cancel'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="rounded-lg border border-neutral-200 p-8 text-center dark:border-neutral-800">
            <p className="text-neutral-600 dark:text-neutral-400">No payment records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
