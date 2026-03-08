import { z } from 'zod';

export const importStatusParamsSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
});

export type ImportStatusParams = z.infer<typeof importStatusParamsSchema>;
