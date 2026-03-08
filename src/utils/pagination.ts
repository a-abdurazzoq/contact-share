interface CursorData {
    id: string;
    [key: string]: unknown;
}

/**
 * Encode cursor data to base64
 */
export const encodeCursor = (data: CursorData): string => {
    return Buffer.from(JSON.stringify(data)).toString('base64url');
};

/**
 * Decode cursor from base64
 */
export const decodeCursor = (cursor: string): CursorData => {
    try {
        const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
        return JSON.parse(decoded);
    } catch (error) {
        throw new Error('Invalid cursor format');
    }
};

/**
 * Validate and normalize pagination parameters
 */
export const normalizePaginationParams = (
    limit?: number,
    cursor?: string
): {
    limit: number;
    cursor: CursorData | null;
} => {
    const normalizedLimit = Math.min(limit || 20, 100);
    const normalizedCursor = cursor ? decodeCursor(cursor) : null;

    return {
        limit: normalizedLimit,
        cursor: normalizedCursor,
    };
};
