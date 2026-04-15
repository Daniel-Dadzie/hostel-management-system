import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute.jsx';

// Layouts
import StudentLayout from './components/layouts/StudentLayout.jsx';
import AdminLayout from './components/layouts/AdminLayout.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import AboutUsPage from './pages/public/AboutUsPage.jsx';
import ContactUsPage from './pages/public/ContactUsPage.jsx';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage.jsx';
import TermsAndConditionsPage from './pages/public/TermsAndConditionsPage.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import HostelListPage from './pages/student/HostelListPage.jsx';
import HostelFloorsPage from './pages/student/HostelFloorsPage.jsx';
import HostelRoomsPage from './pages/student/HostelRoomsPage.jsx';
import RoomDetailPage from './pages/student/RoomDetailPage.jsx';
import ConfirmBookingPage from './pages/student/ConfirmBookingPage.jsx';
import ApplyHostelPage from './pages/student/ApplyHostelPage.jsx';
import RoomPreferencesPage from './pages/student/RoomPreferencesPage.jsx';
import MyBookingPage from './pages/student/MyBookingPage.jsx';
import MyPaymentsPage from './pages/student/MyPaymentsPage.jsx';
import PaymentTransactionHistoryPage from './pages/student/PaymentTransactionHistoryPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';
import ComplaintsPage from './pages/student/ComplaintsPage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageHostelsPage from './pages/admin/ManageHostelsPage.jsx';
import ManageRoomsPage from './pages/admin/ManageRoomsPage.jsx';
import ManageFloorsPage from './pages/admin/ManageFloorsPage.jsx';
import ManageStudentsPage from './pages/admin/ManageStudentsPage.jsx';
import ManageBookingsPage from './pages/admin/ManageBookingsPage.jsx';
import ManageAcademicTermsPage from './pages/admin/ManageAcademicTermsPage.jsx';
import ManagePaymentsPage from './pages/admin/ManagePaymentsPage.jsx';
import ViewReportsPage from './pages/admin/ViewReportsPage.jsx';

export default function App() {
  return (
    <NotificationProvider>
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="hostels" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="hostels" element={<HostelListPage />} />
          <Route path="hostels/:hostelId/floors" element={<HostelFloorsPage />} />
          <Route path="hostels/:hostelId/floors/:floorNumber/rooms" element={<HostelRoomsPage />} />
          <Route path="hostels/:hostelId/floors/:floorNumber/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="confirm" element={<ConfirmBookingPage />} />
          <Route path="apply" element={<ApplyHostelPage />} />
          <Route path="preferences" element={<RoomPreferencesPage />} />
          <Route path="booking" element={<MyBookingPage />} />
          <Route path="payments" element={<MyPaymentsPage />} />
          <Route path="payment-history" element={<PaymentTransactionHistoryPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
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
          <Route path="floors" element={<ManageFloorsPage />} />
          <Route path="students" element={<ManageStudentsPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="terms" element={<ManageAcademicTermsPage />} />
          <Route path="payments" element={<ManagePaymentsPage />} />
          <Route path="reports" element={<ViewReportsPage />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </NotificationProvider>
  );
}
