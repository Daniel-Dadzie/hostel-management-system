import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastService } from '../../hooks/useToast.js';
import { getStudentPaymentHistory } from '../../services/paymentService.js';
import { FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

export default function PaymentTransactionHistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, cancelled
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

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

  // Filter and sort transactions
  const filteredTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.paymentStatus?.toLowerCase() === filterStatus);
    }

    // Apply sorting
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.createdAt || b.paidAt || 0) - new Date(a.createdAt || a.paidAt || 0));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.createdAt || a.paidAt || 0) - new Date(b.createdAt || b.paidAt || 0));
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    }

    return filtered;
  }, [transactions, filterStatus, sortBy]);

  const sorted = filteredTransactions();

  // Calculate summary stats
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.paymentStatus?.toLowerCase() === 'completed').length,
    pending: transactions.filter((t) => t.paymentStatus?.toLowerCase() === 'pending').length,
    cancelled: transactions.filter((t) => t.paymentStatus?.toLowerCase() === 'cancelled').length,
    totalAmount: transactions
      .filter((t) => t.paymentStatus?.toLowerCase() === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  function resolveSafeReceiptUrl(transaction) {
    const rawUrl = transaction.receiptUrl || `/uploads/payment-receipts/${transaction.receiptPath}`;

    try {
      const parsed = new URL(rawUrl, window.location.origin);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      if (!isHttp) return null;

      // Restrict absolute URLs to same-origin to avoid downloading from attacker-controlled domains.
      if (parsed.origin !== window.location.origin) return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  function handleDownloadReceipt(transaction) {
    if (!transaction.receiptPath && !transaction.receiptUrl) {
      toastService.error('Receipt file not available');
      return;
    }

    try {
      const receiptUrl = resolveSafeReceiptUrl(transaction);
      if (!receiptUrl) {
        toastService.error('Invalid receipt link');
        return;
      }

      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${transaction.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toastService.error('Failed to download receipt');
      console.error('Download error:', err);
    }
  }

  function getStatusBadge(status) {
    const statusLower = status?.toLowerCase() || 'unknown';
    const badgeConfig = {
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
    };

    const config = badgeConfig[statusLower] || badgeConfig.pending;
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  }

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
        <div className="alert-error">
          {error}
          <button onClick={loadTransactionHistory} className="ml-auto text-sm font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Total Transactions</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Completed</p>
          <p className="card-header mt-2 text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Pending</p>
          <p className="card-header mt-2 text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Total Paid</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{formatAmount(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white mb-4">Filters & Sort</h2>
        <div className="flex flex-wrap gap-4">
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
        <h2 className="card-header text-neutral-900 dark:text-white mb-4">
          Transactions ({sorted.length} of {transactions.length})
        </h2>

        {sorted.length === 0 ? (
          <div className="py-8 text-center">
            <p className="body-text text-neutral-500 dark:text-neutral-400">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Booking ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Paid Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900 dark:text-white">Reference</th>
                  <th className="px-4 py-3 text-center font-semibold text-neutral-900 dark:text-white">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {sorted.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">#{transaction.bookingId || '-'}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-semibold">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(transaction.paymentStatus)}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(transaction.dueAt)}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(transaction.paidAt)}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 text-xs">
                      {transaction.transactionRef || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transaction.paymentStatus?.toLowerCase() === 'completed' && (transaction.receiptPath || transaction.receiptUrl) ? (
                        <button
                          onClick={() => handleDownloadReceipt(transaction)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition"
                          title="Download Receipt"
                        >
                          <FaDownload className="h-4 w-4" />
                          <span className="text-xs font-medium">Download</span>
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
