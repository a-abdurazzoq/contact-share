import { z } from 'zod';

const phoneSchema = z.object({
    name: z.string().min(1, 'Phone name is required'),
    number: z.string().min(1, 'Phone number is required'),
});

const emailSchema = z.object({
    label: z.string().min(1, 'Email label is required'),
    email: z.string().email('Invalid email format'),
});

const socialSchema = z.object({
    name: z.string().min(1, 'Social name is required'),
    link: z.string().url('Invalid URL'),
});

export const createCardSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    position: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    birthday: z.string().optional(),
    phones: z.array(phoneSchema).default([]),
    emails: z.array(emailSchema).default([]),
    socials: z.array(socialSchema).default([]),
});

export const updateCardSchema = createCardSchema.partial();

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
