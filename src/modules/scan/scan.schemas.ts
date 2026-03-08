import { z } from 'zod';

export const scanEventSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    source: z.enum(['QR', 'LINK']),
    deviceId: z.string().optional(),
});

export type ScanEventInput = z.infer<typeof scanEventSchema>;
