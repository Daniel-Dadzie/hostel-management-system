import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getStudentPaymentHistory } from '../../services/paymentService.js';
import { downloadPaymentReceipt } from '../../services/studentService.js';
import { FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaUndo, FaArrowLeft } from 'react-icons/fa';

const STATUS_BADGES = {
  completed: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: FaCheckCircle,
    label: 'Completed',
  },
  pending: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: FaClock,
    label: 'Pending',
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: FaTimesCircle,
    label: 'Cancelled',
  },
  refunded: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: FaUndo,
    label: 'Refunded',
  },
};

function getStatusBadge(status) {
  const statusLower = status?.toLowerCase() || 'pending';
  const config = STATUS_BADGES[statusLower] || STATUS_BADGES.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function formatAmount(amount) {
  return `₵${Number(amount || 0).toFixed(2)}`;
}

export default function PaymentTransactionHistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  async function loadTransactionHistory() {
    try {
      setLoading(true);
      setError('');
      const response = await getStudentPaymentHistory();
      setTransactions(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Failed to load payment history');
      console.error('Error loading payment history:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadReceipt(transaction) {
    if (!transaction?.bookingId) return;
    setDownloadingId(transaction.id);
    setError('');
    setNotice('');
    try {
      await downloadPaymentReceipt(transaction.bookingId);
      setNotice('Payment receipt downloaded successfully!');
    } catch (err) {
      setError(err.message || 'Unable to download payment receipt.');
    } finally {
      setDownloadingId(null);
    }
  }

  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        const status = transaction.status?.toLowerCase();
        acc.total += 1;
        if (status === 'completed') {
          acc.completed += 1;
          acc.totalAmount += Number(transaction.amount || 0);
        } else if (status === 'pending') {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, totalAmount: 0 }
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((transaction) => transaction.status?.toLowerCase() === filterStatus);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.paidAt || a.dueAt || 0) - new Date(b.paidAt || b.dueAt || 0);
        case 'amount-desc':
          return Number(b.amount || 0) - Number(a.amount || 0);
        case 'amount-asc':
          return Number(a.amount || 0) - Number(b.amount || 0);
        case 'date-desc':
        default:
          return new Date(b.paidAt || b.dueAt || 0) - new Date(a.paidAt || a.dueAt || 0);
      }
    });

    return filtered;
  }, [transactions, filterStatus, sortBy]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">Payment Transaction History</h1>
          <p className="section-subtitle">View and download all your payment receipts and transaction details.</p>
        </div>
      </div>

      {error && (
        <div className="alert-error flex items-center">
          {error}
          <button onClick={loadTransactionHistory} className="ml-auto text-sm font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          {notice}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="section-subtitle">Total Transactions</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card">
          <p className="section-subtitle">Completed</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
        </div>
        <div className="card">
          <p className="section-subtitle">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="section-subtitle">Total Paid</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{formatAmount(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Filters &amp; Sort</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label htmlFor="status-filter" className="body-text text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="sort-by" className="body-text text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded bg-white dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">
          Transactions ({filteredTransactions.length} of {transactions.length})
        </h2>
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="body-text text-neutral-500 dark:text-neutral-400">No transactions found.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Booking ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Status</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white md:table-cell">Due Date</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white lg:table-cell">Paid Date</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white lg:table-cell">Reference</th>
                  <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-white">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">#{transaction.bookingId || '-'}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-semibold">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                    <td className="hidden px-4 py-3 text-neutral-600 dark:text-neutral-300 md:table-cell">{formatDate(transaction.dueAt)}</td>
                    <td className="hidden px-4 py-3 text-neutral-600 dark:text-neutral-300 lg:table-cell">{formatDate(transaction.paidAt)}</td>
                    <td className="hidden px-4 py-3 text-neutral-600 dark:text-neutral-300 text-xs lg:table-cell">
                      {transaction.transactionReference || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transaction.status?.toLowerCase() === 'completed' && transaction.hasReceipt ? (
                        <button
                          onClick={() => handleDownloadReceipt(transaction)}
                          disabled={downloadingId === transaction.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition text-xs font-medium disabled:opacity-60"
                          title="Download Receipt"
                        >
                          <FaDownload className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {downloadingId === transaction.id ? 'Downloading...' : 'Download'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
