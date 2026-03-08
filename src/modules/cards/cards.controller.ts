import { Request, Response, NextFunction } from 'express';
import { CardsService } from './cards.service';
import { CreateCardInput, UpdateCardInput } from './cards.schemas';

const cardsService = new CardsService();

export class CardsController {
    async listCards(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const cards = await cardsService.listUserCards(userId);
            res.status(200).json(cards);
        } catch (error) {
            next(error);
        }
    }

    async createCard(
        req: Request<object, object, CreateCardInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const card = await cardsService.createCard(userId, req.body);
            res.status(201).json({ id: card.id });
        } catch (error) {
            next(error);
        }
    }

    async getCard(
        req: Request<{ cardId: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const card = await cardsService.getCard(req.params.cardId, userId);
            res.status(200).json(card);
        } catch (error) {
            next(error);
        }
    }

    async updateCard(
        req: Request<{ cardId: string }, object, UpdateCardInput>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            const card = await cardsService.updateCard(
                req.params.cardId,
                userId,
                req.body
            );
            res.status(200).json(card);
        } catch (error) {
            next(error);
        }
    }

    async deleteCard(
        req: Request<{ cardId: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user!.userId;
            await cardsService.deleteCard(req.params.cardId, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
