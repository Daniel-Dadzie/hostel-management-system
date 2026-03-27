import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyBooking,
  initiateGatewayPayment,
  submitPaymentReceipt,
  verifyGatewayPayment
} from '../../services/studentService.js';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'MTN_MOMO', label: 'MTN Mobile Money' },
  { value: 'TELECEL_CASH', label: 'Telecel Cash' },
  { value: 'VISA_CARD', label: 'Visa Card' },
  { value: 'BANK_CARD', label: 'Other Bank Card' }
];

function getPaymentBadgeClass(status) {
  if (status === 'PENDING_PAYMENT') return 'badge-pending';
  if (status === 'APPROVED') return 'badge-approved';
  return 'badge-rejected';
}

function renderPaymentHistoryRow(booking) {
  if (!booking) {
    return (
      <tr>
        <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400" colSpan={3}>
          No payment records yet.
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800">
      <td className="px-3 py-2">#{booking.id}</td>
      <td className="px-3 py-2">{booking.hostelName || '-'} / {booking.roomNumber || '-'}</td>
      <td className="px-3 py-2">{booking.status.replace('_', ' ')}</td>
    </tr>
  );
}

export default function MyPaymentsPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [processingGateway, setProcessingGateway] = useState(false);
  const [verifyingGateway, setVerifyingGateway] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('MTN_MOMO');
  const [transactionReference, setTransactionReference] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    loadPaymentContext();
  }, []);

  async function loadPaymentContext() {
    try {
      const data = await getMyBooking();
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReceiptSubmit(event) {
    event.preventDefault();
    if (!booking?.id) return;

    if (!receiptFile) {
      setError('Please choose a receipt file before submitting.');
      return;
    }

    setSubmittingReceipt(true);
    setError('');
    setNotice('');

    try {
      const result = await submitPaymentReceipt({
        bookingId: booking.id,
        paymentMethod,
        transactionReference,
        receipt: receiptFile
      });

      setNotice(result?.message || 'Receipt submitted successfully.');
      setTransactionReference('');
      setReceiptFile(null);
      await loadPaymentContext(); // Always refresh booking/payment status after payment
    } catch (err) {
      // Show user-friendly error messages for backend exceptions
      let msg = err.message || 'Unable to submit receipt.';
      if (msg.includes('already been submitted')) {
        msg = 'A payment receipt has already been submitted and approved for this booking.';
      } else if (msg.includes('Payment is only allowed for pending bookings')) {
        msg = 'Payment is only allowed for bookings that are pending payment.';
      }
      setError(msg);
    } finally {
      setSubmittingReceipt(false);
    }
  }

  async function handleGatewayPay() {
    if (!booking?.id) return;
    setProcessingGateway(true);
    setError('');
    setNotice('');

    try {
      const result = await initiateGatewayPayment({
        bookingId: booking.id,
        paymentMethod
      });
      if (result?.authorizationUrl) {
        window.open(result.authorizationUrl, '_blank', 'noopener,noreferrer');
      }
      setNotice(result?.message || 'Gateway initialized. Complete payment and verify.');
    } catch (err) {
      setError(err.message || 'Gateway payment failed.');
    } finally {
      setProcessingGateway(false);
    }
  }

  async function handleGatewayVerify() {
    if (!booking?.id) return;
    setVerifyingGateway(true);
    setError('');
    setNotice('');
    try {
      const result = await verifyGatewayPayment({ bookingId: booking.id });
      setNotice(result?.message || 'Verification complete.');
      await loadPaymentContext();
    } catch (err) {
      setError(err.message || 'Unable to verify payment status.');
    } finally {
      setVerifyingGateway(false);
    }
  }

  const paymentSummary = useMemo(() => {
    if (!booking) {
      return {
        status: 'NOT_CREATED',
        amount: 'N/A',
        reference: 'No active booking'
      };
    }

    return {
      status: booking.status,
      amount: booking.paymentAmount == null ? 'N/A' : `GHS ${booking.paymentAmount}`,
      reference: booking.transactionReference || `Booking #${booking.id}`
    };
  }, [booking]);

  const paymentBadgeClass = getPaymentBadgeClass(paymentSummary.status);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">My Payments</h1>
          <p className="section-subtitle">
            Track payment status linked to your booking lifecycle.
          </p>
        </div>
        <Link to="/student/payment-history" className="btn-secondary whitespace-nowrap">
          View Transaction History
        </Link>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          {notice}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-header text-neutral-900 dark:text-white">Latest Payment</h2>
          <span className={paymentBadgeClass}>{paymentSummary.status.replace('_', ' ')}</span>
        </div>
        <div className="body-text mt-4 space-y-2 text-neutral-600 dark:text-neutral-300">
          <p>Amount: {paymentSummary.amount}</p>
          <p>Reference: {paymentSummary.reference}</p>
          <p>Method: {booking?.paymentMethod ? booking.paymentMethod.replace('_', ' ') : 'Not selected'}</p>
          <p>Payment State: {booking?.paymentStatus || 'N/A'}</p>
          {booking?.paymentDueAt && (
            <p>Due At: {new Date(booking.paymentDueAt).toLocaleString()}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/student/booking" className="btn-primary">
            Go to Booking
          </Link>
          <Link to="/student/apply" className="btn-ghost">
            New Application
          </Link>
        </div>
      </div>

      {booking?.status === 'PENDING_PAYMENT' && (
        <div className="card">
          <h2 className="card-header text-neutral-900 dark:text-white">Pay For This Booking</h2>
          <p className="section-subtitle mt-2 dark:text-neutral-300">
            Choose MTN, Telecel, or card payment. You can upload a receipt or pay through the real gateway flow.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Payment Method</span>
              <select
                className="input-field"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Transaction Reference</span>
              <input
                className="input-field"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. MOMO123456 or VISAAUTH2026"
              />
            </label>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleReceiptSubmit}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Upload Receipt (JPG, PNG, PDF)</span>
              <input
                className="input-field"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit" disabled={submittingReceipt}>
                {submittingReceipt ? 'Submitting...' : 'Submit Receipt'}
              </button>
              <button
                className="btn-ghost"
                type="button"
                disabled={processingGateway}
                onClick={handleGatewayPay}
              >
                {processingGateway ? 'Initializing...' : 'Pay With Gateway'}
              </button>
              <button
                className="btn-ghost"
                type="button"
                disabled={verifyingGateway || !booking?.transactionReference}
                onClick={handleGatewayVerify}
              >
                {verifyingGateway ? 'Verifying...' : 'Verify Gateway Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Payment History</h2>
        <p className="section-subtitle mt-2 dark:text-neutral-300">
          History is currently derived from your most recent booking record.
        </p>
        <div className="mt-4 md:hidden">
          {booking ? (
            <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="font-medium text-neutral-900 dark:text-white">#{booking.id}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">{booking.hostelName || '-'} / {booking.roomNumber || '-'}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">{booking.status.replace('_', ' ')}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 p-3 section-subtitle dark:border-neutral-800">
              No payment records yet.
            </div>
          )}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Booking</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Hostel/Room</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {renderPaymentHistoryRow(booking)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
