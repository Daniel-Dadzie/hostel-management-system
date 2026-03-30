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

/* ---------------- helpers ---------------- */

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

/* ---------------- Login Flow ---------------- */

describe('Login Flow Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
  });

  it('renders login form', () => {
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

  it('shows error for invalid credentials', async () => {
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

  it('redirects student after login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'student-token',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'Student',
        email: 'student@example.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student/hostels"
          element={<div data-testid="student-dashboard" />}
        />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'student@test.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'password'
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('student-dashboard')).toBeInTheDocument();
  });

  it('redirects admin after login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'admin-token',
        role: 'ADMIN',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'Admin',
        email: 'admin@example.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div data-testid="admin-dashboard" />} />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'password'
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument();
  });

  it('stores token in localStorage', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'stored-token',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'User',
        email: 'user@test.com',
      }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/hostels" element={<div />} />
      </Routes>,
      { route: '/login', authService, profileService }
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'user@test.com');
    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'password'
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.token', 'stored-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.role', 'STUDENT');
    });
  });
});

/* ---------------- Register Flow ---------------- */

describe('Registration Flow Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders registration form', () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: '/register' }
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: '/register' }
    );

    const user = userEvent.setup();

    /* required fields must be filled or form won't submit */
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0240000000');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE');

    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'Password123'
    );

    await user.type(
      screen.getByLabelText(/confirm password/i),
      'WrongPassword'
    );

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits registration successfully', async () => {
    const authService = createAuthServiceMock({
      registerUser: vi.fn().mockResolvedValue({ message: 'Success' }),
    });

    renderWithProviders(
  <Routes>
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
  </Routes>,
  { route: '/register', authService }
);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0240000000');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE');

    await user.type(
      screen.getByLabelText(/^password$/i, { selector: 'input' }),
      'Password123'
    );

    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Password123'
    );

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalled();
    });
  });
});

/* ---------------- Auth Context ---------------- */

describe('Auth Context Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
  });

  it('default state is unauthenticated', () => {
    function Consumer() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="status">{String(isAuthenticated)}</span>;
    }

    renderWithProviders(<Consumer />);

    expect(screen.getByTestId('status')).toHaveTextContent('false');
  });

  it('updates state after login', async () => {
    const authService = createAuthServiceMock({
      loginUser: vi.fn().mockResolvedValue({
        token: 'abc123',
        role: 'STUDENT',
      }),
    });

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({
        id: 1,
        fullName: 'User',
      }),
    });

    function Consumer() {
      const { login, isAuthenticated } = useAuth();

      return (
        <>
          <span data-testid="status">
            {isAuthenticated ? 'yes' : 'no'}
          </span>

          <button
            data-testid="login-btn"
            onClick={() => login('test@test.com', 'pass')}
          >
            login
          </button>
        </>
      );
    }

    renderWithProviders(<Consumer />, { authService, profileService });

    expect(screen.getByTestId('status')).toHaveTextContent('no');

    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('yes');
    });
  });
});