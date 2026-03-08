
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { generateSecureToken } from '../../utils/crypto';
import { env } from '../../config/env';
import {
    normalizePaginationParams,
    encodeCursor,
} from '../../utils/pagination';
import {
    CreateContactInput,
    UpdateContactInput,
    ListContactsQuery,
    CreateContactShareTokenInput,
    AcceptContactShareInput,
} from './contacts.schemas';

type ContactWhereClause = {
    ownerUserId: string;
    displayName?: { contains: string };
    tags?: { string_contains: string };
    id?: { lt: string };
};

type ContactOrderByClause =
    | { updatedAt: 'asc' | 'desc' }
    | { displayName: 'asc' | 'desc' }
    | { createdAt: 'asc' | 'desc' };

export class ContactsService {
    async listContacts(userId: string, query: ListContactsQuery) {
        const { limit, cursor } = normalizePaginationParams(
            query.limit,
            query.cursor
        );

        // Build where clause
        const whereClause: ContactWhereClause = {
            ownerUserId: userId,
            ...(query.query && {
                displayName: { contains: query.query },
            }),
            ...(query.tag && {
                tags: { string_contains: query.tag },
            }),
            ...(cursor && { id: { lt: cursor.id } }),
        };

        // Build order by
        let orderBy: ContactOrderByClause = { updatedAt: 'desc' };
        if (query.sort === 'name') {
            orderBy = { displayName: 'asc' };
        } else if (query.sort === 'date') {
            orderBy = { createdAt: 'desc' };
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            orderBy,
            take: limit + 1,
            select: {
                id: true,
                displayName: true,
                source: true,
                linkedCardId: true,
                tags: true,
                updatedAt: true,
                createdAt: true,
            },
        });

        const hasMore = contacts.length > limit;
        const items = hasMore ? contacts.slice(0, limit) : contacts;

        const nextCursor =
            hasMore && items.length > 0
                ? encodeCursor({ id: items[items.length - 1].id })
                : null;

        return { items, nextCursor };
    }

    async createContact(userId: string, input: CreateContactInput) {
        const contact = await prisma.contact.create({
            data: {
                ownerUserId: userId,
                displayName: input.displayName,
                notes: input.notes,
                tags: input.tags,
                source: 'MANUAL',
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

        return contact;
    }

    async getContact(contactId: string, userId: string) {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: {
                phones: true,
                emails: true,
                socials: true,
            },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        return contact;
    }

    async updateContact(
        contactId: string,
        userId: string,
        input: UpdateContactInput
    ) {
        // Verify ownership
        const existingContact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!existingContact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (existingContact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        // Update in transaction
        const contact = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Delete existing relations if provided in update
            if (input.phones !== undefined) {
                await tx.contactPhone.deleteMany({
                    where: { contactId },
                });
            }
            if (input.emails !== undefined) {
                await tx.contactEmail.deleteMany({
                    where: { contactId },
                });
            }
            if (input.socials !== undefined) {
                await tx.contactSocial.deleteMany({
                    where: { contactId },
                });
            }

            // Update contact
            return await tx.contact.update({
                where: { id: contactId },
                data: {
                    ...(input.displayName !== undefined && {
                        displayName: input.displayName,
                    }),
                    ...(input.notes !== undefined && { notes: input.notes }),
                    ...(input.tags !== undefined && { tags: input.tags }),
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

        return contact;
    }

    async deleteContact(contactId: string, userId: string) {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        await prisma.contact.delete({
            where: { id: contactId },
        });
    }

    async createContactShareToken(
        contactId: string,
        userId: string,
        input: CreateContactShareTokenInput
    ) {
        // Verify ownership
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
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
                type: 'CONTACT',
                mode: input.mode,
                targetContactId: contactId,
                createdByUserId: userId,
                expiresAt,
            },
        });

        const shareUrl = `${env.APP_BASE_URL}/cs/${token}`;

        return { token, shareUrl };
    }

    async getPublicContact(token: string) {
        const shareToken = await prisma.shareToken.findUnique({
            where: { token },
            include: {
                targetContact: {
                    include: {
                        phones: true,
                        emails: true,
                        socials: true,
                    },
                },
            },
        });

        if (!shareToken || !shareToken.targetContact) {
            throw new NotFoundError('Share token');
        }

        // Check expiry
        if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
            throw new NotFoundError('Share token has expired');
        }

        return { contact: shareToken.targetContact };
    }

    async acceptContactShare(
        token: string,
        recipientUserId: string,
        input: AcceptContactShareInput
    ) {
        const shareToken = await prisma.shareToken.findUnique({
            where: { token },
            include: {
                targetContact: {
                    include: {
                        phones: true,
                        emails: true,
                        socials: true,
                    },
                },
            },
        });

        if (!shareToken || !shareToken.targetContact) {
            throw new NotFoundError('Share token');
        }

        // Check expiry
        if (shareToken.expiresAt && shareToken.expiresAt < new Date()) {
            throw new NotFoundError('Share token has expired');
        }

        const sourceContact = shareToken.targetContact;

        // Create contact for recipient
        const contact = await prisma.contact.create({
            data: {
                ownerUserId: recipientUserId,
                displayName: sourceContact.displayName,
                notes: sourceContact.notes,
                tags: input.tags,
                source: 'LINK',
                phones: {
                    create: sourceContact.phones.map((p: { name: string; number: string }) => ({
                        name: p.name,
                        number: p.number,
                    })),
                },
                emails: {
                    create: sourceContact.emails.map((e: { label: string; email: string }) => ({
                        label: e.label,
                        email: e.email,
                    })),
                },
                socials: {
                    create: sourceContact.socials.map((s: { name: string; link: string }) => ({
                        name: s.name,
                        link: s.link,
                    })),
                },
            },
        });

        return { contactId: contact.id };
    }

    async followContact(contactId: string, userId: string) {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        // Update follow status
        await prisma.contact.update({
            where: { id: contactId },
            data: { followStatus: 'FOLLOWING' },
        });

        return { followStatus: 'FOLLOWING' };
    }

    async unfollowContact(contactId: string, userId: string) {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            throw new NotFoundError('Contact', contactId);
        }

        if (contact.ownerUserId !== userId) {
            throw new ForbiddenError('You do not have access to this contact');
        }

        // Update follow status
        await prisma.contact.update({
            where: { id: contactId },
            data: { followStatus: 'NONE' },
        });

        return { followStatus: 'NONE' };
    }
}
