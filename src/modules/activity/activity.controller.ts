import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service';
import { assertTyped } from '../../utils/express';
import { ActivitySummaryQuery, ActivityEventsQuery } from './activity.schemas';

const activityService = new ActivityService();

export class ActivityController {
    async getSummary(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ cardId: string }, unknown, ActivitySummaryQuery>(req)) return;

            const userId = req.user!.userId;
            const result = await activityService.getCardActivitySummary(
                req.params.cardId,
                userId,
                req.query
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getEvents(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ cardId: string }, unknown, ActivityEventsQuery>(req)) return;

            const userId = req.user!.userId;
            const result = await activityService.getCardActivityEvents(
                req.params.cardId,
                userId,
                req.query
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
