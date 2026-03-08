import { Router } from 'express';
import { ShareController } from './share.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import {
    createShareTokenSchema,
    acceptShareSchema,
} from './share.schemas';

const router = Router();
const shareController = new ShareController();

/**
 * @swagger
 * /v1/cards/{cardId}/share-tokens:
 *   post:
 *     tags: [Share]
 *     summary: Create a share token for a business card
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Share token created
 */
router.post(
    '/cards/:cardId/share-tokens',
    authenticate,
    validateRequest({ body: createShareTokenSchema }),
    shareController.createCardShareToken
);

/**
 * @swagger
 * /v1/share/{token}:
 *   get:
 *     tags: [Share]
 *     summary: Get public business card by share token
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card details
 */
router.get('/share/:token', optionalAuthenticate, shareController.getPublicCard);

/**
 * @swagger
 * /v1/share/{token}/accept:
 *   post:
 *     tags: [Share]
 *     summary: Accept a card share and create contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Contact created
 */
router.post(
    '/share/:token/accept',
    authenticate,
    validateRequest({ body: acceptShareSchema }),
    shareController.acceptCardShare
);

/**
 * @swagger
 * /v1/cards/{cardId}/qr:
 *   get:
 *     tags: [Share]
 *     summary: Get QR code payload for a card
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR payload
 */
router.get('/cards/:cardId/qr', authenticate, shareController.getCardQR);

export default router;
