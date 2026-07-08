import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import { loginSchema, signupSchema } from '../validators/auth.validators.js';

export const authRouter = Router();

authRouter.post('/signup', validateRequest(signupSchema), asyncHandler(authController.signup));
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(authController.login));
authRouter.get('/me', asyncHandler(requireAuth), authController.getProfile);
