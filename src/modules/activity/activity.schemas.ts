import { z } from 'zod';

export const activitySummaryQuerySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
});

export const activityEventsQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().positive().max(100).default(20),
});

export type ActivitySummaryQuery = z.infer<typeof activitySummaryQuerySchema>;
export type ActivityEventsQuery = z.infer<typeof activityEventsQuerySchema>;
