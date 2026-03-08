import bcrypt from 'bcrypt';
import { prisma } from '../../prisma/client';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';
import {
    UpdateProfileInput,
    ChangePasswordInput,
    SupportContactInput,
} from './profile.schemas';

const BCRYPT_ROUNDS = 10;

export class ProfileService {
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User', userId);
        }

        return user;
    }

    async updateProfile(userId: string, input: UpdateProfileInput) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(input.firstName !== undefined && { firstName: input.firstName }),
                ...(input.lastName !== undefined && { lastName: input.lastName }),
                ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
            },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        return user;
    }

    async changePassword(userId: string, input: ChangePasswordInput) {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User', userId);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            input.currentPassword,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }

    async contactSupport(input: SupportContactInput, userId?: string) {
        await prisma.supportMessage.create({
            data: {
                subject: input.subject,
                message: input.message,
                userId,
            },
        });

        return { ticketId: `t_${Date.now()}` };
    }

    async getAboutPage() {
        return {
            title: 'About Contact Share',
            content:
                'Contact Share is a modern digital business card and contact management platform. Share your professional information instantly via QR codes or links, and keep your contacts synced automatically.',
        };
    }
}
