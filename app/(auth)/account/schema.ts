import { z } from 'zod';

export const accountFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(64, 'First name cannot exceed 64 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(s => s.trim())
    .nullable()
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(64, 'Last name cannot exceed 64 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(s => s.trim())
    .nullable()
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(64, 'Email cannot exceed 64 characters'),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
