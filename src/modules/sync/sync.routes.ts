import { Router } from 'express';
import { SyncController } from './sync.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { linkedUpdatesQuerySchema } from './sync.schemas';

const router = Router();
const syncController = new SyncController();

/**
 * @swagger
 * /v1/contacts/linked/updates:
 *   get:
 *     tags: [Sync]
 *     summary: Get updates for linked contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of updates
 */
router.get(
    '/contacts/linked/updates',
    authenticate,
    validateRequest({ query: linkedUpdatesQuerySchema }),
    syncController.getLinkedUpdates
);

/**
 * @swagger
 * /v1/contacts/{contactId}/sync:
 *   post:
 *     tags: [Sync]
 *     summary: Sync a contact with its linked card
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact synced
 */
router.post('/contacts/:contactId/sync', authenticate, syncController.syncContact);

export default router;
