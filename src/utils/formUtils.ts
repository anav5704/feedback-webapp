import { ZodError, type ZodSchema } from 'zod';

// Type for form validation errors
export interface ValidationErrors {
  [key: string]: string;
}

// Validate form data using Zod schema
export const validateForm = <T>(schema: ZodSchema<T>, data: T): ValidationErrors => {
  try {
    schema.parse(data);
    return {}; // No errors
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return errors;
    }
    return { form: 'An unexpected error occurred' };
  }
};

// Sanitize form input
export const sanitizeInput = (input: string): string => {
  // Basic sanitization - remove HTML tags and trim
  return input
    .replace(/<[^>]*>/g, '')
    .trim();
};