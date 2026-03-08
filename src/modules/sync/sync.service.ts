import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { LinkedUpdatesQuery } from './sync.schemas';

export class SyncService {
    async getLinkedUpdates(userId: string, query: LinkedUpdatesQuery) {
        const since = query.since ? new Date(query.since) : undefined;

        // Find contacts that are linked to cards and are being followed
        const contacts = await prisma.contact.findMany({
            where: {
                ownerUserId: userId,
                linkedCardId: { not: null },
                followStatus: 'FOLLOWING',
            },
            include: {
                linkedCard: true,
            },
        });

        // Filter by update time and build diff info
        const updates = contacts
            .filter((contact) => {
                if (!contact.linkedCard) return false;
                if (!since) return true;
                return contact.linkedCard.updatedAt > since;
            })
            .map((contact) => ({
                contactId: contact.id,
                linkedCardId: contact.linkedCardId!,
                cardUpdatedAt: contact.linkedCard!.updatedAt.toISOString(),
                diff: ['phones', 'emails', 'socials', 'company', 'position'], // Simplified diff
            }));

        return { items: updates };
    }

    async syncContact(contactId: string, userId: string) {
        // Get contact
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: {
                linkedCard: {
                    include: {
                        phones: true,
                        emails: true,
                        socials: true,
                    },
                },
            },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        if (!contact.linkedCardId || !contact.linkedCard) {
            throw new Error('Contact is not linked to a card');
        }

        const card = contact.linkedCard;

        // Update contact with card data in transaction
        await prisma.$transaction(async (tx) => {
            // Delete existing relations
            await tx.contactPhone.deleteMany({ where: { contactId } });
            await tx.contactEmail.deleteMany({ where: { contactId } });
            await tx.contactSocial.deleteMany({ where: { contactId } });

            // Update contact with fresh data
            await tx.contact.update({
                where: { id: contactId },
                data: {
                    displayName: `${card.firstName} ${card.lastName || ''}`.trim(),
                    lastSyncedAt: new Date(),
                    phones: {
                        create: card.phones.map((p) => ({
                            name: p.name,
                            number: p.number,
                        })),
                    },
                    emails: {
                        create: card.emails.map((e) => ({
                            label: e.label,
                            email: e.email,
                        })),
                    },
                    socials: {
                        create: card.socials.map((s) => ({
                            name: s.name,
                            link: s.link,
                        })),
                    },
                },
            });
        });

        return {
            contactId,
            syncedAt: new Date().toISOString(),
        };
    }
}
