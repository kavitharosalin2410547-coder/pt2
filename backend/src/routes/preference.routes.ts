import { Router } from 'express';
import { preferenceController } from '../controllers/preference.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import { updatePreferenceSchema } from '../validators/preference.validators.js';

export const preferenceRouter = Router();

preferenceRouter.use(asyncHandler(requireAuth));
preferenceRouter.get('/', asyncHandler(preferenceController.get));
preferenceRouter.put('/', validateRequest(updatePreferenceSchema), asyncHandler(preferenceController.update));
