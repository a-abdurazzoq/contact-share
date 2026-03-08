import { Request, Response, NextFunction } from 'express';
import { ImportService } from './import.service';

const importService = new ImportService();

export class ImportController {
    async importContacts(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const file = req.file;

            if (!file) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'No file uploaded',
                    },
                });
                return;
            }

            const result = await importService.createImport(userId, file);
            res.status(202).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getImportStatus(
        req: Request<{ importId: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const result = await importService.getImportStatus(
                req.params.importId,
                userId
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
