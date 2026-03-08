import { Router } from 'express';
import { ScanController } from './scan.controller';
import { optionalAuthenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { scanEventSchema } from './scan.schemas';

const router = Router();
const scanController = new ScanController();

/**
 * @swagger
 * /v1/scan/events:
 *   post:
 *     tags: [Scan]
 *     summary: Record a scan event
 *     responses:
 *       202:
 *         description: Event recorded
 */
router.post(
    '/events',
    optionalAuthenticate,
    validateRequest({ body: scanEventSchema }),
    scanController.recordEvent
);

export default router;
