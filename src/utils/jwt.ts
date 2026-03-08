import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessTokenPayload {
    userId: string;
    email: string;
}

export interface RefreshTokenPayload {
    userId: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
    const options: jwt.SignOptions = {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    // Add jwtid (jti) to ensure uniqueness even if generated in the same second
    const options: jwt.SignOptions = {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        jwtid: crypto.randomUUID(),
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
