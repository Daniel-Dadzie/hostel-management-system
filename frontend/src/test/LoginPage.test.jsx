import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

import LoginPage from '../pages/LoginPage';
import { useAuth } from '../context/AuthContext';

// Mock the Auth Context using Vitest (vi)
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the Layout
vi.mock('../components/layouts/PublicLayout', () => {
  return { default: ({ children }) => <div>{children}</div> };
});

describe('LoginPage Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      login: mockLogin,
    });
    mockLogin.mockClear();
  });

  it('renders the login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    // Use exact string matching here to avoid the aria-label conflict!
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows error if login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@uni.edu' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    }, { timeout: 2500 });
  });

  it('calls login function on successful form submit', async () => {
    mockLogin.mockResolvedValue({ role: 'STUDENT' });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@uni.edu' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@uni.edu', 'password123', false);
    }, { timeout: 2500 });
  });
});