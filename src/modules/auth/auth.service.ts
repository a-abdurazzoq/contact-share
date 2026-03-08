import bcrypt from 'bcrypt';
import { prisma } from '../../prisma/client';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../../utils/jwt';
import { hashToken } from '../../utils/crypto';
import { RegisterInput, LoginInput } from './auth.schemas';

const BCRYPT_ROUNDS = 10;

export class AuthService {
    async register(input: RegisterInput) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                phoneNumber: input.phoneNumber,
                firstName: input.firstName,
                lastName: input.lastName,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
        });
        const refreshToken = generateRefreshToken({ userId: user.id });

        // Store refresh token hash
        await this.storeRefreshToken(user.id, refreshToken);

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    async login(input: LoginInput) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            input.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
        });
        const refreshToken = generateRefreshToken({ userId: user.id });

        // Store refresh token hash
        await this.storeRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshToken: string) {
        // Verify token
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // Check if token exists in database (not revoked)
        const tokenHash = hashToken(refreshToken);
        const storedToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
        });

        if (!storedToken) {
            throw new UnauthorizedError('Refresh token has been revoked');
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { tokenHash } });
            throw new UnauthorizedError('Refresh token has expired');
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
        });

        return { accessToken };
    }

    async logout(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await prisma.refreshToken.deleteMany({
            where: { tokenHash },
        });
    }

    private async storeRefreshToken(userId: string, token: string) {
        const tokenHash = hashToken(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId,
                expiresAt,
            },
        });
    }
}
