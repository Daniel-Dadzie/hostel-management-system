import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // Filtering and sorting logic goes here (if any)
    return filtered;
  }, [transactions]);

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

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  function formatAmount(amount) {
    return `₵${Number(amount).toFixed(2)}`;
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
        <Card style={{ border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px 0 #e5e7eb4d', backdropFilter: 'blur(2px)' }}>
          <Text size="sm" style={{ color: '#6b7280' }}>Total Transactions</Text>
          <Text as="h3" size="xl" weight="bold" style={{ marginTop: 8, color: '#18181b' }}>{stats.total}</Text>
        </Card>
        <Card style={{ border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px 0 #e5e7eb4d', backdropFilter: 'blur(2px)' }}>
          <Text size="sm" style={{ color: '#6b7280' }}>Completed</Text>
          <Text as="h3" size="xl" weight="bold" style={{ marginTop: 8, color: '#059669' }}>{stats.completed}</Text>
        </Card>
        <Card style={{ border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px 0 #e5e7eb4d', backdropFilter: 'blur(2px)' }}>
          <Text size="sm" style={{ color: '#6b7280' }}>Pending</Text>
          <Text as="h3" size="xl" weight="bold" style={{ marginTop: 8, color: '#d97706' }}>{stats.pending}</Text>
        </Card>
        <Card style={{ border: '1px solid #e5e7eb', background: '#fff', boxShadow: '0 2px 8px 0 #e5e7eb4d', backdropFilter: 'blur(2px)' }}>
          <Text size="sm" style={{ color: '#6b7280' }}>Total Paid</Text>
          <Text as="h3" size="xl" weight="bold" style={{ marginTop: 8, color: '#18181b' }}>{formatAmount(stats.totalAmount)}</Text>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card style={{ marginTop: 24 }}>
        <Text as="h2" size="lg" weight="bold" style={{ color: '#18181b', marginBottom: 16 }}>Filters & Sort</Text>
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
      </Card>

      {/* Transaction List */}
      <Card style={{ marginTop: 24 }}>
        <Text as="h2" size="lg" weight="bold" style={{ color: '#18181b', marginBottom: 16 }}>
            Transactions ({filteredTransactions().length} of {transactions.length})
        </Text>
        {filteredTransactions().length === 0 ? (
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
                {filteredTransactions().map((transaction) => (
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
      </Card>
    </div>
  );
}
