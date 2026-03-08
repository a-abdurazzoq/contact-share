import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface TypedRequest<
    P extends ParamsDictionary = ParamsDictionary,
    B = unknown,
    Q = ParsedQs
> extends Omit<Request, 'params' | 'body' | 'query'> {
    params: P;
    body: B;
    query: Q;
    user?: {
        userId: string;
        email: string;
    };
}

export function assertTyped<
    P extends ParamsDictionary = ParamsDictionary,
    B = unknown,
    Q = ParsedQs
>(
    _req: unknown
): _req is TypedRequest<P, B, Q> {
    return true;
}
