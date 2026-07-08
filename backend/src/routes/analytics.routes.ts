import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const analyticsRouter = Router();

analyticsRouter.use(asyncHandler(requireAuth));
analyticsRouter.get('/', asyncHandler(analyticsController.learning));
