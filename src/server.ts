import { createApp } from './app';
import { logger } from './config/logger';
import { env } from './config/env';
import { prisma } from './prisma/client';

const app = createApp();

const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT}`);
    logger.info(`📚 API Documentation: ${env.APP_BASE_URL}/docs`);
    logger.info(`🏥 Health check: ${env.APP_BASE_URL}/health`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown...`);

    server.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forceful shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled rejection');
    process.exit(1);
});
