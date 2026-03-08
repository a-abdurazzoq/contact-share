import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validateRequest =
    (schema: {
        body?: z.ZodSchema;
        params?: z.ZodSchema;
        query?: z.ZodSchema;
    }) =>
        (req: Request, _res: Response, next: NextFunction) => {
            try {
                if (schema.body) {
                    req.body = schema.body.parse(req.body);
                }
                if (schema.params) {
                    req.params = schema.params.parse(req.params);
                }
                if (schema.query) {
                    req.query = schema.query.parse(req.query);
                }
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const details = error.errors.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));
                    next(new ValidationError('Validation failed', details));
                } else {
                    next(error);
                }
            }
        };
