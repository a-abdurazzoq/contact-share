import { Request, Response, NextFunction } from 'express';
import { ScanService } from './scan.service';
import { ScanEventInput } from './scan.schemas';

const scanService = new ScanService();

export class ScanController {
    async recordEvent(
        req: Request<object, object, ScanEventInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const actorUserId = req.user?.userId;
            const result = await scanService.recordScanEvent(req.body, actorUserId);
            res.status(202).json(result);
        } catch (error) {
            next(error);
        }
    }
}
