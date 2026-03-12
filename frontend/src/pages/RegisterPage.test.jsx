import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage.jsx';

const registerMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    register: registerMock
  })
}));

vi.mock('../components/layouts/PublicLayout.jsx', () => ({
  default: ({ children }) => <>{children}</>
}));

vi.mock('../components/LoadingOverlay.jsx', () => ({
  default: () => null
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset();
    navigateMock.mockReset();
  });

  it('redirects to login after successful registration', async () => {
    registerMock.mockResolvedValueOnce({});
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/full name/i), 'Test Student');
    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/phone/i), '1234567890');
    await user.selectOptions(screen.getByLabelText(/gender/i), 'MALE');
    await user.type(screen.getByLabelText(/^password$/i), 'secret12');
    await user.type(screen.getByLabelText(/confirm password/i), 'secret12');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        fullName: 'Test Student',
        email: 'student@example.com',
        phone: '1234567890',
        gender: 'MALE',
        profileImageUrl: null,
        password: 'secret12'
      });
      expect(navigateMock).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { justRegistered: true }
      });
    });
  });
});
