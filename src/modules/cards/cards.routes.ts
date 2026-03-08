import { Router } from 'express';
import { CardsController } from './cards.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createCardSchema, updateCardSchema } from './cards.schemas';

const router = Router();
const cardsController = new CardsController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /v1/cards:
 *   get:
 *     tags: [Business Cards]
 *     summary: List user's business cards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards
 */
router.get('/', cardsController.listCards);

/**
 * @swagger
 * /v1/cards:
 *   post:
 *     tags: [Business Cards]
 *     summary: Create a new business card
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Card created
 */
router.post(
    '/',
    validateRequest({ body: createCardSchema }),
    cardsController.createCard
);

/**
 * @swagger
 * /v1/cards/{cardId}:
 *   get:
 *     tags: [Business Cards]
 *     summary: Get a business card
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
 *         description: Card details
 */
router.get('/:cardId', cardsController.getCard);

/**
 * @swagger
 * /v1/cards/{cardId}:
 *   patch:
 *     tags: [Business Cards]
 *     summary: Update a business card
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
 *         description: Card updated
 */
router.patch(
    '/:cardId',
    validateRequest({ body: updateCardSchema }),
    cardsController.updateCard
);

/**
 * @swagger
 * /v1/cards/{cardId}:
 *   delete:
 *     tags: [Business Cards]
 *     summary: Delete a business card
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Card deleted
 */
router.delete('/:cardId', cardsController.deleteCard);

export default router;
