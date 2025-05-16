import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters long');

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// Registration form validation schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Feedback form validation schema
export const feedbackSchema = z.object({
  message: z
    .string()
    .min(1, 'Feedback message is required')
    .max(500, 'Feedback message must be less than 500 characters')
    .trim()
});

// Types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;