/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createAuthServiceMock(overrides = {}) {
  return {
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    ...overrides,
  };
}

function createProfileServiceMock(overrides = {}) {
  return {
    getMyProfile: vi.fn(),
    ...overrides,
  };
}

function renderWithProviders(
  ui,
  {
    route = '/',
    authService = createAuthServiceMock(),
    profileService = createProfileServiceMock(),
  } = {}
) {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider authService={authService} profileService={profileService}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Login Flow Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
  });

  it('should display login form with email and password fields', () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: '/login' }
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show error message for invalid credentials', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockRejectedValue(new Error('Invalid email or password')),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: '/login', authService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'wrongpassword'
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('should redirect to student dashboard on successful student login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'mock-student-token',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student/hostels"
          element={<div data-testid="student-dashboard">Student Dashboard</div>}
        />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'student@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'correctpassword'
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('student-dashboard')).toBeInTheDocument();
  });

  it('should redirect to admin dashboard on successful admin login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'mock-admin-token',
        role: 'ADMIN',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'Admin User',
        email: 'admin@example.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div data-testid="admin-dashboard">Admin Dashboard</div>} />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'adminpassword'
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('should store token in localStorage on successful login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'test-token-123',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/hostels" element={<div>Hostels</div>} />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'password123'
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.token', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.role', 'STUDENT');
    });
  });
});

describe('Registration Flow Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should display registration form with all required fields', () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: '/register' }
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  it('should show error for mismatched passwords', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: '/register' }
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/^password/i, { selector: 'input' }),
      'Password123'
    );
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('should submit registration successfully', async () => {
    const authService = createAuthServiceMock({
      registerUser: vi.fn().mockResolvedValue({ message: 'Success' }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: '/register', authService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0240000000');
    await user.type(
      screen.getByLabelText(/^password/i, { selector: 'input' }),
      'Password123'
    );
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalled();
    });
  });
});

describe('Auth Context Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
  });

  it('should provide authentication state to child components', () => {
    function TestConsumer() {
      const { isAuthenticated, role } = useAuth();

      return (
        <div>
          <span data-testid="auth-status">
            {isAuthenticated ? 'authenticated' : 'not-authenticated'}
          </span>
          <span data-testid="user-role">{role ?? ''}</span>
        </div>
      );
    }

    renderWithProviders(<TestConsumer />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  it('should update auth state after login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'test-token',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
      }),
    });

    function TestConsumer() {
      const { isAuthenticated, login } = useAuth();

      const handleLogin = async () => {
        await login('test@example.com', 'password');
      };

      return (
        <div>
          <span data-testid="auth-status">
            {isAuthenticated ? 'authenticated' : 'not-authenticated'}
          </span>
          <button onClick={handleLogin} data-testid="login-btn">
            Login
          </button>
        </div>
      );
    }

    renderWithProviders(<TestConsumer />, { authService, profileService });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    const user = userEvent.setup();
    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
  });
});