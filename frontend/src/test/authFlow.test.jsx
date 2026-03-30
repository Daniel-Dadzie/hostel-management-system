/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Mock services
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(() => Promise.resolve({ message: 'Success' })),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock('../services/profileService', () => ({
  getMyProfile: vi.fn(),
}));

// Test wrapper component
function TestWrapper({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Login Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display login form with email and password fields', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show error message for invalid credentials', async () => {
    const { loginUser } = await import('../services/authService');
    loginUser.mockRejectedValue(new Error('Invalid email or password'));

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should redirect to student dashboard on successful student login', async () => {
    const { loginUser } = await import('../services/authService');
    const { getMyProfile } = await import('../services/profileService');

    loginUser.mockResolvedValue({
      token: 'mock-student-token',
      role: 'STUDENT'
    });

    getMyProfile.mockResolvedValue({
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com'
    });

    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/hostels" element={<div data-testid="student-dashboard">Student Dashboard</div>} />
        </Routes>
      </TestWrapper>
    );

    // Navigate to login page
    window.history.pushState({}, 'Login', '/login');

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'student@example.com');
    await userEvent.type(passwordInput, 'correctpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should redirect to admin dashboard on successful admin login', async () => {
    const { loginUser } = await import('../services/authService');
    const { getMyProfile } = await import('../services/profileService');

    loginUser.mockResolvedValue({
      token: 'mock-admin-token',
      role: 'ADMIN'
    });

    getMyProfile.mockResolvedValue({
      id: 1,
      fullName: 'Admin User',
      email: 'admin@example.com'
    });

    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div data-testid="admin-dashboard">Admin Dashboard</div>} />
        </Routes>
      </TestWrapper>
    );

    window.history.pushState({}, 'Login', '/login');

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'adminpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should store token in localStorage on successful login', async () => {
    const { loginUser } = await import('../services/authService');
    const { getMyProfile } = await import('../services/profileService');

    loginUser.mockResolvedValue({
      token: 'test-token-123',
      role: 'STUDENT'
    });

    getMyProfile.mockResolvedValue({
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com'
    });

    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/hostels" element={<div>Hostels</div>} />
        </Routes>
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.token', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.role', 'STUDENT');
    });
  });
});

describe('Registration Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display registration form with all required fields', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  it('should show error for mismatched passwords', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    await userEvent.type(passwordInput, 'Password123');
    await userEvent.type(confirmPasswordInput, 'DifferentPassword123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});

describe('Auth Context Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide authentication state to child components', () => {
    function TestConsumer() {
      const { isAuthenticated, user, role } = useAuth();
      return (
        <div>
          <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
          <span data-testid="user-role">{role}</span>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  it('should update auth state after login', async () => {
    const { loginUser } = await import('../services/authService');
    const { getMyProfile } = await import('../services/profileService');

    loginUser.mockResolvedValue({
      token: 'test-token',
      role: 'STUDENT'
    });

    getMyProfile.mockResolvedValue({
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com'
    });

    function TestConsumer() {
      const { isAuthenticated, login } = useAuth();

      const handleLogin = async () => {
        await login('test@example.com', 'password');
      };

      return (
        <div>
          <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
          <button onClick={handleLogin} data-testid="login-btn">Login</button>
        </div>
      );
    }

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });
});