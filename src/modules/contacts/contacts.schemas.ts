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

export const createContactSchema = z.object({
    displayName: z.string().min(1, 'Display name is required'),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([]),
    phones: z.array(phoneSchema).default([]),
    emails: z.array(emailSchema).default([]),
    socials: z.array(socialSchema).default([]),
});

export const updateContactSchema = createContactSchema.partial();

export const listContactsQuerySchema = z.object({
    query: z.string().optional(),
    sort: z.enum(['name', 'date', 'updated']).default('updated'),
    tag: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().positive().max(100).default(20),
});

export const createContactShareTokenSchema = z.object({
    mode: z.enum(['PUBLIC', 'ONE_TIME']).default('PUBLIC'),
    expiresInSeconds: z.number().positive().optional(),
});

export const acceptContactShareSchema = z.object({
    tags: z.array(z.string()).default([]),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
export type CreateContactShareTokenInput = z.infer<
    typeof createContactShareTokenSchema
>;
export type AcceptContactShareInput = z.infer<typeof acceptContactShareSchema>;
