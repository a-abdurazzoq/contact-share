import crypto from 'crypto';

/**
 * Generate a secure random token for share links
 * @returns URL-safe base64 encoded token
 */
export const generateSecureToken = (): string => {
    return crypto.randomBytes(32).toString('base64url');
};

/**
 * Hash a token using SHA-256 (for refresh token storage)
 * @param token - Token to hash
 * @returns Hex-encoded hash
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
