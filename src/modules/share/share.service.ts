import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { generateSecureToken } from '../../utils/crypto';
import { env } from '../../config/env';
import {
    CreateShareTokenInput,
    AcceptShareInput,
} from './share.schemas';

export class ShareService {
    async createCardShareToken(
        cardId: string,
        userId: string,
        input: CreateShareTokenInput
    ) {
        // Verify card ownership
        const card = await prisma.businessCard.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundError('Business card', cardId);
        }

        if (card.userId !== userId) {
            throw new ForbiddenError('You do not have access to this card');
        }

        // Generate token
        const token = generateSecureToken();

        // Calculate expiry
        let expiresAt: Date | null = null;
        if (input.expiresInSeconds) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + input.expiresInSeconds);
        }

        // Create share token
        await prisma.shareToken.create({
            data: {
                token,
                type: 'CARD',
                mode: input.mode,
                targetCardId: cardId,
                createdByUserId: userId,
                expiresAt,
            },
        });

        const shareUrl = `${env.APP_BASE_URL}/s/${token}`;

        // Log activity
        await prisma.activityEvent.create({
            data: {
                type: 'CARD_SHARED',
                actorUserId: userId,
                targetCardId: cardId,
                meta: { shareUrl },
            },
        });

        return { token, shareUrl };
    }

    async getPublicCard(token: string, actorUserId?: string) {
        const shareToken = await prisma.shareToken.findUnique({
            where: { token },
            include: {
                targetCard: {
                    include: {
                        phones: true,
                        emails: true,
                        socials: true,
                    },
                },
            },
        });

        if (!shareToken || !shareToken.targetCard) {
            throw new NotFoundError('Share token');
        }

        // Check expiry
        if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
            throw new NotFoundError('Share token has expired');
        }

        // Log activity
        await prisma.activityEvent.create({
            data: {
                type: 'LINK_OPENED',
                actorUserId,
                targetCardId: shareToken.targetCardId,
                meta: { token },
            },
        });

        return { card: shareToken.targetCard };
    }

    async acceptCardShare(
        token: string,
        recipientUserId: string | undefined,
        input: AcceptShareInput
    ) {
        const shareToken = await prisma.shareToken.findUnique({
            where: { token },
            include: {
                targetCard: {
                    include: {
                        phones: true,
                        emails: true,
                        socials: true,
                    },
                },
            },
        });

        if (!shareToken || !shareToken.targetCard) {
            throw new NotFoundError('Share token');
        }

        // Check expiry
        if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
            throw new NotFoundError('Share token has expired');
        }

        const card = shareToken.targetCard;

        // If not authenticated, can't create contact (for MVP, we require auth)
        if (!recipientUserId) {
            throw new ForbiddenError('Authentication required to save contact');
        }

        // Create contact
        const contact = await prisma.contact.create({
            data: {
                ownerUserId: recipientUserId,
                displayName: `${card.firstName} ${card.lastName || ''}`.trim(),
                source: 'LINK',
                linkedCardId: card.id,
                followStatus: 'FOLLOWING',
                tags: input.tags,
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

        // Log activity
        await prisma.activityEvent.create({
            data: {
                type: 'CONTACT_RECEIVED',
                actorUserId: recipientUserId,
                targetCardId: card.id,
                targetContactId: contact.id,
                meta: { token },
            },
        });

        return {
            contactId: contact.id,
            linkedCardId: card.id,
        };
    }

    async getCardQR(cardId: string, userId: string) {
        // Verify ownership
        const card = await prisma.businessCard.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new NotFoundError('Business card', cardId);
        }

        if (card.userId !== userId) {
            throw new ForbiddenError('You do not have access to this card');
        }

        // Find an existing public token or create one
        let shareToken = await prisma.shareToken.findFirst({
            where: {
                targetCardId: cardId,
                type: 'CARD',
                mode: 'PUBLIC',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });

        if (!shareToken) {
            // Create a long-lived token for QR
            const token = generateSecureToken();
            shareToken = await prisma.shareToken.create({
                data: {
                    token,
                    type: 'CARD',
                    mode: 'PUBLIC',
                    targetCardId: cardId,
                    createdByUserId: userId,
                    expiresAt: null, // No expiry for QR tokens
                },
            });
        }

        const payload = `${env.APP_BASE_URL}/s/${shareToken.token}`;
        return { payload };
    }
}
