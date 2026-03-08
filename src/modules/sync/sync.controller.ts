import { Request, Response, NextFunction } from 'express';
import { SyncService } from './sync.service';
import { LinkedUpdatesQuery } from './sync.schemas';

const syncService = new SyncService();

export class SyncController {
    async getLinkedUpdates(
        req: Request<object, object, object, LinkedUpdatesQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const result = await syncService.getLinkedUpdates(userId, req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async syncContact(
        req: Request<{ contactId: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const result = await syncService.syncContact(req.params.contactId, userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
