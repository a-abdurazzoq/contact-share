import { z } from 'zod';

export const createShareTokenSchema = z.object({
    mode: z.enum(['PUBLIC', 'ONE_TIME']).default('PUBLIC'),
    expiresInSeconds: z.number().positive().optional(),
});

export const acceptShareSchema = z.object({
    saveAs: z.enum(['CONTACT']).default('CONTACT'),
    tags: z.array(z.string()).default([]),
});

export type CreateShareTokenInput = z.infer<typeof createShareTokenSchema>;
export type AcceptShareInput = z.infer<typeof acceptShareSchema>;
