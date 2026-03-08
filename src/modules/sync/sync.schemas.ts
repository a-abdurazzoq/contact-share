import { z } from 'zod';

export const linkedUpdatesQuerySchema = z.object({
    since: z.string().optional(),
});

export type LinkedUpdatesQuery = z.infer<typeof linkedUpdatesQuerySchema>;
