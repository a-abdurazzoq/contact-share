import { Router } from 'express';
import multer from 'multer';
import { ImportController } from './import.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const importController = new ImportController();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'text/csv',
            'text/vcard',
            'text/x-vcard',
            'application/vnd.ms-excel',
        ];
        const allowedExtensions = ['.csv', '.vcf', '.vcard'];

        const hasValidType = allowedTypes.includes(file.mimetype);
        const hasValidExt = allowedExtensions.some((ext) =>
            file.originalname.toLowerCase().endsWith(ext)
        );

        if (hasValidType || hasValidExt) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and vCard files are allowed.'));
        }
    },
});

/**
 * @swagger
 * /v1/contacts/import:
 *   post:
 *     tags: [Import]
 *     summary: Import contacts from file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: Import started
 */
router.post(
    '/contacts/import',
    authenticate,
    upload.single('file'),
    importController.importContacts
);

/**
 * @swagger
 * /v1/contacts/import/{importId}:
 *   get:
 *     tags: [Import]
 *     summary: Get import status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: importId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Import status
 */
router.get(
    '/contacts/import/:importId',
    authenticate,
    importController.getImportStatus
);

export default router;
