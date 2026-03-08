import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import {
    normalizePaginationParams,
    encodeCursor,
} from '../../utils/pagination';
import {
    ActivitySummaryQuery,
    ActivityEventsQuery,
} from './activity.schemas';

export class ActivityService {
    async getCardActivitySummary(
        cardId: string,
        userId: string,
        query: ActivitySummaryQuery
    ) {
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

        // Parse dates
        const from = query.from ? new Date(query.from) : undefined;
        const to = query.to ? new Date(query.to) : undefined;

        const whereClause = {
            targetCardId: cardId,
            ...(from || to
                ? {
                    createdAt: {
                        ...(from && { gte: from }),
                        ...(to && { lte: to }),
                    },
                }
                : {}),
        };

        // Count events
        const [sharedCount, receivedCount, scannedCount] = await Promise.all([
            prisma.activityEvent.count({
                where: {
                    ...whereClause,
                    type: { in: ['CARD_SHARED', 'LINK_OPENED'] },
                },
            }),
            prisma.activityEvent.count({
                where: {
                    ...whereClause,
                    type: 'CONTACT_RECEIVED',
                },
            }),
            prisma.activityEvent.count({
                where: {
                    ...whereClause,
                    type: 'QR_SCANNED',
                },
            }),
        ]);

        return {
            cardId,
            range: {
                from: from?.toISOString() || null,
                to: to?.toISOString() || null,
            },
            metrics: {
                sharedContacts: sharedCount,
                receivedContacts: receivedCount,
                scanned: scannedCount,
            },
        };
    }

    async getCardActivityEvents(
        cardId: string,
        userId: string,
        query: ActivityEventsQuery
    ) {
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

        const { limit, cursor } = normalizePaginationParams(
            query.limit,
            query.cursor
        );

        // Build query
        const events = await prisma.activityEvent.findMany({
            where: {
                targetCardId: cardId,
                ...(cursor && { id: { lt: cursor.id } }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1, // Fetch one extra to determine if there's a next page
        });

        const hasMore = events.length > limit;
        const items = hasMore ? events.slice(0, limit) : events;

        const nextCursor =
            hasMore && items.length > 0
                ? encodeCursor({ id: items[items.length - 1].id })
                : null;

        return {
            items: items.map((event) => ({
                id: event.id,
                type: event.type,
                actorUserId: event.actorUserId,
                meta: event.meta,
                createdAt: event.createdAt.toISOString(),
            })),
            nextCursor,
        };
    }
}
