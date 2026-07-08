import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(160),
    password: z.string().min(1).max(128),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
