import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { toAuthUser } from '../utils/user.js';

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
      return;
    }

    const token = header.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      next(new AppError('User no longer exists', 401, 'AUTH_INVALID'));
      return;
    }

    request.user = toAuthUser(user);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'AUTH_INVALID'));
  }
}
