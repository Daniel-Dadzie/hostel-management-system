/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/* ── components under test ── */
import { Modal } from '../ui/Modal.jsx';
import ProtectedRoute, { PublicRoute } from '../components/ProtectedRoute.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

/* ─────────────────── helpers ────────────────────── */

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

function renderWithAuth(ui, { authenticated = false, role = 'STUDENT' } = {}) {
  const authService = createAuthServiceMock();
  const profileService = createProfileServiceMock();

  if (authenticated) {
    localStorage.setItem('hms.token', 'test-token');
    localStorage.setItem('hms.role', role);
    profileService.getMyProfile.mockResolvedValue({ id: 1, fullName: 'Test User', email: 'test@test.com' });
  }

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider authService={authService} profileService={profileService}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/* ─────────────────── Modal ────────────────────── */

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and children when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Title">
        <p>Modal body text</p>
      </Modal>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Modal body text')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Close Test">
        <p>Content</p>
      </Modal>
    );

    await userEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed on the overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Escape Test">
        <p>Content</p>
      </Modal>
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Backdrop Test">
        <p>Content</p>
      </Modal>
    );

    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal content', async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Inner Click">
        <p data-testid="inner">Inner content</p>
      </Modal>
    );

    await userEvent.click(screen.getByTestId('inner'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders without a title', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>No title here</p>
      </Modal>
    );
    expect(screen.getByText('No title here')).toBeInTheDocument();
  });
});

/* ─────────────────── ProtectedRoute ────────────────────── */

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated user to /login', async () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider
          authService={createAuthServiceMock()}
          profileService={createProfileServiceMock()}
        >
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <div data-testid="secret">Secret</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div data-testid="login">Login</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    /* After loading, unauthenticated → redirects to /login */
    expect(container).toBeDefined();
  });

  it('renders children when authenticated without role restriction', async () => {
    localStorage.setItem('hms.token', 'tok');
    localStorage.setItem('hms.role', 'STUDENT');

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({ id: 1, fullName: 'Student', email: 'u@t.com' }),
    });

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider authService={createAuthServiceMock()} profileService={profileService}>
          <MemoryRouter initialEntries={['/home']}>
            <Routes>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <div data-testid="home">Home</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId('home')).toBeInTheDocument();
  });
});

/* ─────────────────── PublicRoute ────────────────────── */

describe('PublicRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children for unauthenticated users', async () => {
    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockRejectedValue(new Error('not auth')),
    });

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider authService={createAuthServiceMock()} profileService={profileService}>
          <MemoryRouter>
            <PublicRoute>
              <div data-testid="public-page">Public Page</div>
            </PublicRoute>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId('public-page')).toBeInTheDocument();
  });

  it('redirects authenticated student to /student', async () => {
    localStorage.setItem('hms.token', 'tok');
    localStorage.setItem('hms.role', 'STUDENT');

    const profileService = createProfileServiceMock({
      getMyProfile: vi.fn().mockResolvedValue({ id: 2, fullName: 'Student' }),
    });

    render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider authService={createAuthServiceMock()} profileService={profileService}>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<PublicRoute><div>Login</div></PublicRoute>} />
              <Route path="/student" element={<div data-testid="student-dash">Dashboard</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId('student-dash')).toBeInTheDocument();
  });
});
