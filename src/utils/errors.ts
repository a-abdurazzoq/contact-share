export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        const result: { error: { code: string; message: string; details?: unknown } } = {
            error: {
                code: this.code,
                message: this.message,
            },
        };
        if (this.details) {
            result.error.details = this.details;
        }
        return result;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(403, 'FORBIDDEN', message);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id ${id} not found`
            : `${resource} not found`;
        super(404, 'NOT_FOUND', message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, 'CONFLICT', message);
    }
}
