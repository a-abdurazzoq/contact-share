import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import {
    updateProfileSchema,
    changePasswordSchema,
    supportContactSchema,
} from './profile.schemas';

const router = Router();
const profileController = new ProfileController();

/**
 * @swagger
 * /v1/me:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authenticate, profileController.getMe);

/**
 * @swagger
 * /v1/me:
 *   patch:
 *     tags: [Profile]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.patch(
    '/me',
    authenticate,
    validateRequest({ body: updateProfileSchema }),
    profileController.updateMe
);

/**
 * @swagger
 * /v1/me/password/change:
 *   post:
 *     tags: [Profile]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Password changed
 */
router.post(
    '/me/password/change',
    authenticate,
    validateRequest({ body: changePasswordSchema }),
    profileController.changePassword
);

/**
 * @swagger
 * /v1/support/contact:
 *   post:
 *     tags: [Support]
 *     summary: Contact support
 *     responses:
 *       202:
 *         description: Message received
 */
router.post(
    '/support/contact',
    optionalAuthenticate,
    validateRequest({ body: supportContactSchema }),
    profileController.contactSupport
);

/**
 * @swagger
 * /v1/pages/about:
 *   get:
 *     tags: [Pages]
 *     summary: Get about page
 *     responses:
 *       200:
 *         description: About page content
 */
router.get('/pages/about', profileController.getAbout);

export default router;
