import pino from 'pino';
import { env } from './env';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
        env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            }
            : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

export const createLogger = (context: string) => {
    return logger.child({ context });
};
