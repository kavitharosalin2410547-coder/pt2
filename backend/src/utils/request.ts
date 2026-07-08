import type { Request } from 'express';
import { AppError } from './AppError.js';

export function getAuthenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  return request.user.id;
}

export function getRequiredParam(request: Request, key: string): string {
  const value = request.params[key];

  if (!value) {
    throw new AppError(`Missing required route parameter: ${key}`, 400, 'MISSING_ROUTE_PARAM');
  }

  return value;
}
