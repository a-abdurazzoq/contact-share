import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from '../../src/utils/jwt';

describe('JWT Utilities', () => {
    const testPayload = {
        userId: 'user123',
        email: 'test@example.com',
    };

    describe('generateAccessToken', () => {
        it('should generate a valid access token', () => {
            const token = generateAccessToken(testPayload);
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // JWT has 3 parts
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify a valid access token', () => {
            const token = generateAccessToken(testPayload);
            const decoded = verifyAccessToken(token);
            expect(decoded.userId).toBe(testPayload.userId);
            expect(decoded.email).toBe(testPayload.email);
        });

        it('should throw on invalid token', () => {
            expect(() => verifyAccessToken('invalid-token')).toThrow();
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a valid refresh token', () => {
            const token = generateRefreshToken({ userId: testPayload.userId });
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify a valid refresh token', () => {
            const token = generateRefreshToken({ userId: testPayload.userId });
            const decoded = verifyRefreshToken(token);
            expect(decoded.userId).toBe(testPayload.userId);
        });

        it('should throw on invalid token', () => {
            expect(() => verifyRefreshToken('invalid-token')).toThrow();
        });
    });
});
