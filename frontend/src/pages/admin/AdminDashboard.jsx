import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    hostels: 0,
    rooms: 0,
    bookings: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const token = localStorage.getItem('hms.token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Load hostels
      const hostels = await apiRequest('/api/admin/hostels', { headers });
      
      // Load rooms
      const rooms = await apiRequest('/api/admin/rooms', { headers });
      
      // Load bookings
      const bookings = await apiRequest('/api/admin/bookings', { headers });

      setStats({
        hostels: hostels?.length || 0,
        rooms: rooms?.length || 0,
        bookings: bookings?.length || 0,
        pendingPayments: bookings?.filter(b => b.status === 'PENDING_PAYMENT')?.length || 0
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Hostels', value: stats.hostels, icon: '🏢', color: 'bg-blue-500', link: '/admin/hostels' },
    { label: 'Rooms', value: stats.rooms, icon: '🛏️', color: 'bg-green-500', link: '/admin/rooms' },
    { label: 'Bookings', value: stats.bookings, icon: '📋', color: 'bg-purple-500', link: '/admin/bookings' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: '⏳', color: 'bg-yellow-500', link: '/admin/bookings' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Manage hostels, rooms, and bookings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="card hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} text-white`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/hostels"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="text-xl">🏢</span>
            <span className="font-medium text-neutral-900 dark:text-white">Manage Hostels</span>
          </Link>
          <Link
            to="/admin/rooms"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="text-xl">🛏️</span>
            <span className="font-medium text-neutral-900 dark:text-white">Manage Rooms</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="text-xl">📋</span>
            <span className="font-medium text-neutral-900 dark:text-white">View Bookings</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="text-xl">✅</span>
            <span className="font-medium text-neutral-900 dark:text-white">Approve Bookings</span>
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-900/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Getting Started</h3>
            <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
              Start by creating hostels and rooms. Students will then be able to apply for accommodation.
              You can approve or reject bookings from the bookings page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
