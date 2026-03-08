import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './config/logger';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import cardsRoutes from './modules/cards/cards.routes';
import shareRoutes from './modules/share/share.routes';
import scanRoutes from './modules/scan/scan.routes';
import activityRoutes from './modules/activity/activity.routes';
import contactsRoutes from './modules/contacts/contacts.routes';
import syncRoutes from './modules/sync/sync.routes';
import importRoutes from './modules/import/import.routes';

export const createApp = () => {
    const app = express();

    // Middleware
    app.use(cors({
        origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(','),
        credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use(
        pinoHttp({
            logger,
            autoLogging: env.NODE_ENV !== 'test',
        })
    );

    // Health check
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    //  API routes
    app.use('/v1/auth', authRoutes);
    app.use('/v1', profileRoutes);
    app.use('/v1/cards', cardsRoutes);
    app.use('/v1', shareRoutes);
    app.use('/v1/scan', scanRoutes);
    app.use('/v1', activityRoutes);
    app.use('/v1/contacts', contactsRoutes);
    app.use('/v1', syncRoutes);
    app.use('/v1', importRoutes);

    // Swagger documentation
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Contact Share & Sync API',
                version: '1.0.0',
                description:
                    'Production-ready backend for digital business cards and contact management',
            },
            servers: [
                {
                    url: env.APP_BASE_URL,
                    description: 'API server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
        apis: ['./src/modules/**/*.routes.ts'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: `Route ${req.method} ${req.path} not found`,
            },
        });
    });

    // Error handler (must be last)
    app.use(errorHandler);

    return app;
};
