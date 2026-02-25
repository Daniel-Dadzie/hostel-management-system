import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminBookings } from '../../services/bookingService.js';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    hostels: 0,
    rooms: 0,
    bookings: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomsData, setRoomsData] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const hostels = await listHostels();
      const rooms = await listRooms();
      const bookings = await listAdminBookings();

      setRoomsData(Array.isArray(rooms) ? rooms : []);
      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);

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
    { label: 'Hostels', value: stats.hostels, icon: '🏢', color: 'bg-primary-600', link: '/admin/hostels' },
    { label: 'Rooms', value: stats.rooms, icon: '🛏️', color: 'bg-green-500', link: '/admin/rooms' },
    { label: 'Bookings', value: stats.bookings, icon: '📋', color: 'bg-accent-600', link: '/admin/bookings' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: '⏳', color: 'bg-accent-500', link: '/admin/bookings' }
  ];

  const occupancyByHostel = roomsData.reduce((acc, room) => {
    const hostelName = room.hostelName || 'Unknown';
    if (!acc[hostelName]) {
      acc[hostelName] = { occupancy: 0, capacity: 0 };
    }
    acc[hostelName].occupancy += room.currentOccupancy || 0;
    acc[hostelName].capacity += room.capacity || 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Admin Dashboard</h1>
        <p className="section-subtitle">
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
                <p className="body-text text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="card-header text-neutral-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-header mb-4 text-neutral-900 dark:text-white">Quick Actions</h2>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="card-header mb-4 text-neutral-900 dark:text-white">Occupancy by Hostel</h2>
          <div className="space-y-3">
            {Object.entries(occupancyByHostel).map(([hostelName, value]) => {
              const rate = value.capacity === 0 ? 0 : Math.round((value.occupancy / value.capacity) * 100);
              return (
                <div key={hostelName}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-200">{hostelName}</span>
                    <span className="text-neutral-600 dark:text-neutral-300">{rate}%</span>
                  </div>
                  <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-800">
                    <div className="h-2 rounded bg-primary-600" style={{ width: `${rate}%` }}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(occupancyByHostel).length === 0 && (
              <p className="body-text text-neutral-500 dark:text-neutral-400">No occupancy data available.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-header mb-4 text-neutral-900 dark:text-white">Recent Bookings</h2>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="rounded border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-900 dark:text-white">{booking.studentName}</p>
                  <span className="body-text text-neutral-500 dark:text-neutral-400">#{booking.id}</span>
                </div>
                <p className="body-text mt-1 text-neutral-600 dark:text-neutral-300">
                  {booking.hostelName || '-'} / {booking.roomNumber || '-'}
                </p>
                <p className="body-text mt-1 text-neutral-500 dark:text-neutral-400">
                  Status: {booking.status?.replace('_', ' ')}
                </p>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p className="body-text text-neutral-500 dark:text-neutral-400">No recent bookings.</p>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-primary-50 p-6 dark:bg-primary-900/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-700 text-white">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="card-header text-primary-900 dark:text-primary-100">Getting Started</h3>
            <p className="body-text mt-1 text-primary-700 dark:text-primary-300">
              Start by creating hostels and rooms. Students will then be able to apply for accommodation.
              You can approve or reject bookings from the bookings page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
