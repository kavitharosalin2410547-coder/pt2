import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  GROQ_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  bcryptSaltRounds: parsedEnv.BCRYPT_SALT_ROUNDS,
  corsOrigin: parsedEnv.CORS_ORIGIN,
  groqApiKey: parsedEnv.GROQ_API_KEY ?? '',
} as const;
