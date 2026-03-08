import { Request, Response, NextFunction } from 'express';
import { ShareService } from './share.service';
import {
    CreateShareTokenInput,
    AcceptShareInput,
} from './share.schemas';

const shareService = new ShareService();

export class ShareController {
    async createCardShareToken(
        req: Request<{ cardId: string }, object, CreateShareTokenInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const result = await shareService.createCardShareToken(
                req.params.cardId,
                userId,
                req.body
            );
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPublicCard(
        req: Request<{ token: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const actorUserId = req.user?.userId;
            const result = await shareService.getPublicCard(
                req.params.token,
                actorUserId
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async acceptCardShare(
        req: Request<{ token: string }, object, AcceptShareInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const recipientUserId = req.user?.userId;
            const result = await shareService.acceptCardShare(
                req.params.token,
                recipientUserId,
                req.body
            );
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCardQR(
        req: Request<{ cardId: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const result = await shareService.getCardQR(req.params.cardId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
