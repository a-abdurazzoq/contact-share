import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);

        req.user = payload;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
};

export const optionalAuthenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = verifyAccessToken(token);
            req.user = payload;
        }

        next();
    } catch (error) {
        next();
    }
};
