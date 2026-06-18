import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../context/AuthContext';

// Mock the Auth Context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the Image Uploader
vi.mock('../components/ImageUploadField', () => {
  return { default: () => <div data-testid="mock-image-upload" /> };
});

// Mock Layout
vi.mock('../components/layouts/PublicLayout', () => {
  return { default: ({ children }) => <div>{children}</div> };
});

describe('RegisterPage Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      register: mockRegister,
    });
    mockRegister.mockClear();
  });

  it('shows an error if passwords do not match', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Use exact strings to avoid the aria-label "Show password" conflict
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password456' } });
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@uni.edu' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register function when valid data is submitted', async () => {
    mockRegister.mockResolvedValue({});

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@uni.edu' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    
    // Use exact strings
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@uni.edu',
        phone: '1234567890',
        gender: 'MALE',
        profileImagePath: null,
        password: 'password123'
      });
    }, { timeout: 2500 });
  });
});