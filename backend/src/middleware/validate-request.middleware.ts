import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { AppError } from '../utils/AppError.js';

export function validateRequest(schema: AnyZodObject) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(new AppError('Invalid request payload', 400, 'VALIDATION_ERROR'));
      return;
    }

    next();
  };
}
