import { z } from 'zod';

// Student registration validation schema
export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must be less than 120 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(30, 'Phone number must be less than 30 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Room application validation schema
export const applySchema = z.object({
  hostelId: z.number({ required_error: 'Hostel is required' }),
  floorNumber: z.number({ required_error: 'Floor number is required' }),
  roomId: z.number({ required_error: 'Room is required' }),
  hasAc: z.boolean(),
  hasWifi: z.boolean(),
  mattressType: z.enum(['NORMAL', 'ORTHOPEDIC'], {
    errorMap: () => ({ message: 'Please select a mattress type' }),
  }),
  specialRequests: z.string().max(500).optional(),
});

// Payment/receipt submission validation schema
export const receiptSchema = z.object({
  transactionReference: z
    .string()
    .min(4, 'Transaction reference must be at least 4 characters')
    .max(120, 'Transaction reference must be less than 120 characters'),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must be less than 120 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(30, 'Phone number must be less than 30 characters'),
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Password reset validation schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Forgot password schema (email only)
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
});
