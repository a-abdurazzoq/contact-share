import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput, RefreshInput } from './auth.schemas';

const authService = new AuthService();

export class AuthController {
    async register(
        req: Request<object, object, RegisterInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(
        req: Request<object, object, LoginInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async refresh(
        req: Request<object, object, RefreshInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await authService.refresh(req.body.refreshToken);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async logout(
        req: Request<object, object, RefreshInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            await authService.logout(req.body.refreshToken);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
