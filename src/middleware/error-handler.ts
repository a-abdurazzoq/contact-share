import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { createLogger } from '../config/logger';
import { env } from '../config/env';

const logger = createLogger('error-handler');

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // _next is unused but required by Express error handler signature
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        logger.warn(
            {
                statusCode: err.statusCode,
                code: err.code,
                message: err.message,
                path: req.path,
                method: req.method,
            },
            'Application error'
        );

        return res.status(err.statusCode).json(err.toJSON());
    }

    // Unexpected errors
    logger.error(
        {
            err,
            path: req.path,
            method: req.method,
            body: req.body,
        },
        'Unexpected error'
    );

    const isDevelopment = env.NODE_ENV === 'development';

    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            ...(isDevelopment && { stack: err.stack }),
        },
    });
};
