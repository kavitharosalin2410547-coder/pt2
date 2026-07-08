import { Router } from 'express';
import { fullStackController } from '../controllers/full-stack.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  updateFullStackSchema,
  upsertFullStackSchema,
} from '../validators/learning.validators.js';

export const fullStackRouter = Router();

fullStackRouter.use(asyncHandler(requireAuth));
fullStackRouter.get('/', asyncHandler(fullStackController.list));
fullStackRouter.get('/summary', asyncHandler(fullStackController.summary));
fullStackRouter.post('/initialize', asyncHandler(fullStackController.initializeDefaults));
fullStackRouter.post('/', validateRequest(upsertFullStackSchema), asyncHandler(fullStackController.upsert));
fullStackRouter.patch('/:id', validateRequest(updateFullStackSchema), asyncHandler(fullStackController.update));
