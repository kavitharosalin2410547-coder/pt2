import { Router } from 'express';
import { coreCSController } from '../controllers/core-cs.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  learningItemIdSchema,
  updateCoreCSSchema,
  upsertCoreCSSchema,
} from '../validators/learning.validators.js';

export const coreCSRouter = Router();

coreCSRouter.use(asyncHandler(requireAuth));
coreCSRouter.get('/', asyncHandler(coreCSController.list));
coreCSRouter.get('/summary', asyncHandler(coreCSController.summary));
coreCSRouter.post('/initialize', asyncHandler(coreCSController.initializeDefaults));
coreCSRouter.post('/', validateRequest(upsertCoreCSSchema), asyncHandler(coreCSController.upsert));
coreCSRouter.patch('/:id', validateRequest(updateCoreCSSchema), asyncHandler(coreCSController.update));
coreCSRouter.delete('/:id', validateRequest(learningItemIdSchema), asyncHandler(coreCSController.remove));
