import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import {
    UpdateProfileInput,
    ChangePasswordInput,
    SupportContactInput,
} from './profile.schemas';

const profileService = new ProfileService();

export class ProfileController {
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const profile = await profileService.getProfile(userId);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    async updateMe(
        req: Request<object, object, UpdateProfileInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const profile = await profileService.updateProfile(userId, req.body);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(
        req: Request<object, object, ChangePasswordInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            await profileService.changePassword(userId, req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async contactSupport(
        req: Request<object, object, SupportContactInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user?.userId;
            const result = await profileService.contactSupport(req.body, userId);
            res.status(202).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAbout(_req: Request, res: Response, next: NextFunction) {
        try {
            const content = await profileService.getAboutPage();
            res.status(200).json(content);
        } catch (error) {
            next(error);
        }
    }
}
