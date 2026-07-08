import type { User } from '@prisma/client';
import type { AuthenticatedUser } from '../types/auth.js';

export function toAuthUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
