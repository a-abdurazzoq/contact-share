import { Router } from 'express';
import { ContactsController } from './contacts.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import {
    createContactSchema,
    updateContactSchema,
    listContactsQuerySchema,
    createContactShareTokenSchema,
    acceptContactShareSchema,
} from './contacts.schemas';

const router = Router();
const contactsController = new ContactsController();

/**
 * @swagger
 * /v1/contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: List user's contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contacts
 */
router.get(
    '/',
    authenticate,
    validateRequest({ query: listContactsQuerySchema }),
    contactsController.listContacts
);

/**
 * @swagger
 * /v1/contacts:
 *   post:
 *     tags: [Contacts]
 *     summary: Create a new contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Contact created
 */
router.post(
    '/',
    authenticate,
    validateRequest({ body: createContactSchema }),
    contactsController.createContact
);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   get:
 *     tags: [Contacts]
 *     summary: Get a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact details
 */
router.get('/:contactId', authenticate, contactsController.getContact);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   patch:
 *     tags: [Contacts]
 *     summary: Update a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact updated
 */
router.patch(
    '/:contactId',
    authenticate,
    validateRequest({ body: updateContactSchema }),
    contactsController.updateContact
);

/**
 * @swagger
 * /v1/contacts/{contactId}:
 *   delete:
 *     tags: [Contacts]
 *     summary: Delete a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Contact deleted
 */
router.delete('/:contactId', authenticate, contactsController.deleteContact);

/**
 * @swagger
 * /v1/contacts/{contactId}/share-tokens:
 *   post:
 *     tags: [Contacts]
 *     summary: Create a share token for a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Share token created
 */
router.post(
    '/:contactId/share-tokens',
    authenticate,
    validateRequest({ body: createContactShareTokenSchema }),
    contactsController.createContactShareToken
);

/**
 * @swagger
 * /v1/contacts/contact-share/{token}:
 *   get:
 *     tags: [Contacts]
 *     summary: Get public contact by share token
 *     responses:
 *       200:
 *         description: Contact details
 */
router.get('/contact-share/:token', contactsController.getPublicContact);

/**
 * @swagger
 * /v1/contacts/contact-share/{token}/accept:
 *   post:
 *     tags: [Contacts]
 *     summary: Accept a contact share
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Contact created
 */
router.post(
    '/contact-share/:token/accept',
    authenticate,
    validateRequest({ body: acceptContactShareSchema }),
    contactsController.acceptContactShare
);

/**
 * @swagger
 * /v1/contacts/{contactId}/follow:
 *   post:
 *     tags: [Contacts]
 *     summary: Follow a contact for auto-sync
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Follow status updated
 */
router.post('/:contactId/follow', authenticate, contactsController.followContact);

/**
 * @swagger
 * /v1/contacts/{contactId}/follow:
 *   delete:
 *     tags: [Contacts]
 *     summary: Unfollow a contact
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Follow status updated
 */
router.delete(
    '/:contactId/follow',
    authenticate,
    contactsController.unfollowContact
);

export default router;
