import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    PORT: z.string().default('3000').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    APP_BASE_URL: z.string().url('APP_BASE_URL must be a valid URL'),
    CORS_ORIGINS: z.string().default('*'),
    TEST_DATABASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
    env = envSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Invalid environment variables:');
        error.errors.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}

export { env };
