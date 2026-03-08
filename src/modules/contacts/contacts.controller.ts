import { Request, Response, NextFunction } from 'express';
import { ContactsService } from './contacts.service';
import { assertTyped } from '../../utils/express';
import {
    CreateContactInput,
    UpdateContactInput,
    ListContactsQuery,
    CreateContactShareTokenInput,
    AcceptContactShareInput,
} from './contacts.schemas';

const contactsService = new ContactsService();

export class ContactsController {
    async listContacts(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<Record<string, string>, unknown, ListContactsQuery>(req)) return;

            const userId = req.user!.userId;
            const result = await contactsService.listContacts(userId, req.query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async createContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<Record<string, string>, CreateContactInput>(req)) return;

            const userId = req.user!.userId;
            const contact = await contactsService.createContact(userId, req.body);
            res.status(201).json({ id: contact.id });
        } catch (error) {
            next(error);
        }
    }

    async getContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }>(req)) return;

            const userId = req.user!.userId;
            const contact = await contactsService.getContact(
                req.params.contactId,
                userId
            );
            res.status(200).json(contact);
        } catch (error) {
            next(error);
        }
    }

    async updateContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }, UpdateContactInput>(req)) return;

            const userId = req.user!.userId;
            const contact = await contactsService.updateContact(
                req.params.contactId,
                userId,
                req.body
            );
            res.status(200).json(contact);
        } catch (error) {
            next(error);
        }
    }

    async deleteContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }>(req)) return;

            const userId = req.user!.userId;
            await contactsService.deleteContact(req.params.contactId, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async createContactShareToken(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }, CreateContactShareTokenInput>(req)) return;

            const userId = req.user!.userId;
            const result = await contactsService.createContactShareToken(
                req.params.contactId,
                userId,
                req.body
            );
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPublicContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ token: string }>(req)) return;

            const result = await contactsService.getPublicContact(req.params.token);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async acceptContactShare(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ token: string }, AcceptContactShareInput>(req)) return;

            const userId = req.user!.userId;
            const result = await contactsService.acceptContactShare(
                req.params.token,
                userId,
                req.body
            );
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async followContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }>(req)) return;

            const userId = req.user!.userId;
            const result = await contactsService.followContact(
                req.params.contactId,
                userId
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async unfollowContact(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!assertTyped<{ contactId: string }>(req)) return;

            const userId = req.user!.userId;
            const result = await contactsService.unfollowContact(
                req.params.contactId,
                userId
            );
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
