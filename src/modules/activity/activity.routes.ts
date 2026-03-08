import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import {
    activitySummaryQuerySchema,
    activityEventsQuerySchema,
} from './activity.schemas';

const router = Router();
const activityController = new ActivityController();

/**
 * @swagger
 * /v1/cards/{cardId}/activity/summary:
 *   get:
 *     tags: [Activity]
 *     summary: Get activity summary for a card
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activity summary
 */
router.get(
    '/cards/:cardId/activity/summary',
    authenticate,
    validateRequest({ query: activitySummaryQuerySchema }),
    activityController.getSummary
);

/**
 * @swagger
 * /v1/cards/{cardId}/activity/events:
 *   get:
 *     tags: [Activity]
 *     summary: Get activity events for a card
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: cursor
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Activity events
 */
router.get(
    '/cards/:cardId/activity/events',
    authenticate,
    validateRequest({ query: activityEventsQuerySchema }),
    activityController.getEvents
);

export default router;
