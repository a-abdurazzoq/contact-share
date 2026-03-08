import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { CreateCardInput, UpdateCardInput } from './cards.schemas';

export class CardsService {
    async listUserCards(userId: string) {
        const cards = await prisma.businessCard.findMany({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                company: true,
                position: true,
                isActive: true,
                updatedAt: true,
                createdAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        return { items: cards };
    }

    async createCard(userId: string, input: CreateCardInput) {
        const card = await prisma.businessCard.create({
            data: {
                userId,
                firstName: input.firstName,
                lastName: input.lastName,
                position: input.position,
                company: input.company,
                bio: input.bio,
                website: input.website || null,
                birthday: input.birthday,
                phones: {
                    create: input.phones,
                },
                emails: {
                    create: input.emails,
                },
                socials: {
                    create: input.socials,
                },
            },
            include: {
                phones: true,
                emails: true,
                socials: true,
            },
        });

        return card;
    }

    async getCard(cardId: string, userId: string) {
        const card = await prisma.businessCard.findUnique({
            where: { id: cardId },
            include: {
                phones: true,
                emails: true,
                socials: true,
            },
        });

        if (!card) {
            throw new NotFoundError('Business card', cardId);
        }

        if (card.userId !== userId) {
            throw new ForbiddenError('You do not have access to this card');
        }

        return card;
    }

    async updateCard(cardId: string, userId: string, input: UpdateCardInput) {
        // Verify ownership
        const existingCard = await prisma.businessCard.findUnique({
            where: { id: cardId },
        });

        if (!existingCard) {
            throw new NotFoundError('Business card', cardId);
        }

        if (existingCard.userId !== userId) {
            throw new ForbiddenError('You do not have access to this card');
        }

        // Update in transaction
        const card = await prisma.$transaction(async (tx) => {
            // Delete existing relations if provided in update
            if (input.phones !== undefined) {
                await tx.businessCardPhone.deleteMany({
                    where: { cardId },
                });
            }
            if (input.emails !== undefined) {
                await tx.businessCardEmail.deleteMany({
                    where: { cardId },
                });
            }
            if (input.socials !== undefined) {
                await tx.businessCardSocial.deleteMany({
                    where: { cardId },
                });
            }

            // Update card
            return await tx.businessCard.update({
                where: { id: cardId },
                data: {
                    ...(input.firstName !== undefined && { firstName: input.firstName }),
                    ...(input.lastName !== undefined && { lastName: input.lastName }),
                    ...(input.position !== undefined && { position: input.position }),
                    ...(input.company !== undefined && { company: input.company }),
                    ...(input.bio !== undefined && { bio: input.bio }),
                    ...(input.website !== undefined && {
                        website: input.website || null,
                    }),
                    ...(input.birthday !== undefined && { birthday: input.birthday }),
                    ...(input.phones !== undefined && {
                        phones: { create: input.phones },
                    }),
                    ...(input.emails !== undefined && {
                        emails: { create: input.emails },
                    }),
                    ...(input.socials !== undefined && {
                        socials: { create: input.socials },
                    }),
                },
                include: {
                    phones: true,
                    emails: true,
                    socials: true,
                },
            });
        });

        return card;
    }

    async deleteCard(cardId: string, userId: string) {
        const card = await prisma.businessCard.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundError('Business card', cardId);
        }

        if (card.userId !== userId) {
            throw new ForbiddenError('You do not have access to this card');
        }

        await prisma.businessCard.delete({
            where: { id: cardId },
        });
    }
}
