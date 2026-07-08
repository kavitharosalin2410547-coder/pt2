import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginInput, SignupInput } from '../validators/auth.validators.js';

export const authController = {
  async signup(request: Request, response: Response) {
    const result = await authService.signup(request.body as SignupInput);
    response.status(201).json({ data: result });
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body as LoginInput);
    response.json({ data: result });
  },

  getProfile(request: Request, response: Response) {
    response.json({ data: request.user });
  },
};
