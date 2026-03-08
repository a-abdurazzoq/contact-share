import { z } from 'zod';

export const updateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().url('Invalid URL').optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const supportContactSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SupportContactInput = z.infer<typeof supportContactSchema>;
