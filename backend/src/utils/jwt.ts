import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../types/auth.js';

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
