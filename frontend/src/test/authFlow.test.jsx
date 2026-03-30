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

// --------------------
// 🔹 Mocks
// --------------------
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

vi.mock('../services/profileService', () => ({
  getMyProfile: vi.fn(),
}));

import { loginUser, registerUser } from '../services/authService';
import { getMyProfile } from '../services/profileService';

// --------------------
// 🔹 Test Utils
// --------------------
function renderWithProviders(ui, { route = '/login' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  window.history.pushState({}, 'Test', route);

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// --------------------
// 🔹 Login Tests
// --------------------
describe('Auth - Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // mock localStorage properly
    vi.spyOn(Storage.prototype, 'setItem');
  });

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error on invalid login', async () => {
    loginUser.mockRejectedValue(new Error('Invalid email or password'));

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@mail.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('redirects student after login', async () => {
    loginUser.mockResolvedValue({ token: 'token', role: 'STUDENT' });
    getMyProfile.mockResolvedValue({ id: 1 });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/hostels" element={<div data-testid="student">Student</div>} />
      </Routes>,
      { route: '/login' }
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'student@mail.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('student')).toBeInTheDocument();
  });

  it('redirects admin after login', async () => {
    loginUser.mockResolvedValue({ token: 'token', role: 'ADMIN' });
    getMyProfile.mockResolvedValue({ id: 1 });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div data-testid="admin">Admin</div>} />
      </Routes>,
      { route: '/login' }
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@mail.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('admin')).toBeInTheDocument();
  });

  it('stores token in localStorage', async () => {
    loginUser.mockResolvedValue({ token: 'abc123', role: 'STUDENT' });
    getMyProfile.mockResolvedValue({ id: 1 });

    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@mail.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.token', 'abc123');
      expect(localStorage.setItem).toHaveBeenCalledWith('hms.role', 'STUDENT');
    });
  });
});

// --------------------
// 🔹 Register Tests
// --------------------
describe('Auth - Registration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  
  });

  it('validates password mismatch', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await userEvent.type(screen.getByLabelText(/^password/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Mismatch123');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits valid registration', async () => {
    registerUser.mockResolvedValue({ message: 'Success' });

    renderWithProviders(<RegisterPage />, { route: '/register' });

    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@mail.com');
    await userEvent.type(screen.getByLabelText(/phone/i), '123456789');
    await userEvent.type(screen.getByLabelText(/^password/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Password123');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    });
  });
});

// --------------------
// 🔹 Auth Context Tests
// --------------------
describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('default state is unauthenticated', () => {
    function TestComponent() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="status">{String(isAuthenticated)}</span>;
    }

    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('false');
  });

  it('updates after login', async () => {
    loginUser.mockResolvedValue({ token: 'token', role: 'STUDENT' });
    getMyProfile.mockResolvedValue({ id: 1 });

    function TestComponent() {
      const { isAuthenticated, login } = useAuth();

      return (
        <>
          <span data-testid="status">{String(isAuthenticated)}</span>
          <button onClick={() => login('a', 'b')}>Login</button>
        </>
      );
    }

    renderWithProviders(<TestComponent />);

    await userEvent.click(screen.getByText(/login/i));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('true');
    });
  });
});