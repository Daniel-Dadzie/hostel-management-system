import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute.jsx';

// Layouts
import StudentLayout from './components/layouts/StudentLayout.jsx';
import AdminLayout from './components/layouts/AdminLayout.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import ApplyHostelPage from './pages/student/ApplyHostelPage.jsx';
import RoomPreferencesPage from './pages/student/RoomPreferencesPage.jsx';
import MyBookingPage from './pages/student/MyBookingPage.jsx';
import MyPaymentsPage from './pages/student/MyPaymentsPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageHostelsPage from './pages/admin/ManageHostelsPage.jsx';
import ManageRoomsPage from './pages/admin/ManageRoomsPage.jsx';
import ManageStudentsPage from './pages/admin/ManageStudentsPage.jsx';
import ManageBookingsPage from './pages/admin/ManageBookingsPage.jsx';
import ManagePaymentsPage from './pages/admin/ManagePaymentsPage.jsx';
import ViewReportsPage from './pages/admin/ViewReportsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="apply" element={<ApplyHostelPage />} />
          <Route path="preferences" element={<RoomPreferencesPage />} />
          <Route path="booking" element={<MyBookingPage />} />
          <Route path="payments" element={<MyPaymentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="hostels" element={<ManageHostelsPage />} />
          <Route path="rooms" element={<ManageRoomsPage />} />
          <Route path="students" element={<ManageStudentsPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="payments" element={<ManagePaymentsPage />} />
          <Route path="reports" element={<ViewReportsPage />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
