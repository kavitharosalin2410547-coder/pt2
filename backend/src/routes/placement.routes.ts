import { Router } from 'express';
import { placementController } from '../controllers/placement.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createPlacementApplicationSchema,
  placementApplicationIdSchema,
  placementFiltersSchema,
  updatePlacementApplicationSchema,
} from '../validators/placement.validators.js';

export const placementRouter = Router();

placementRouter.use(asyncHandler(requireAuth));
placementRouter.get('/', validateRequest(placementFiltersSchema), asyncHandler(placementController.list));
placementRouter.get('/statistics', asyncHandler(placementController.statistics));
placementRouter.post('/', validateRequest(createPlacementApplicationSchema), asyncHandler(placementController.create));
placementRouter.patch('/:id', validateRequest(updatePlacementApplicationSchema), asyncHandler(placementController.update));
placementRouter.delete('/:id', validateRequest(placementApplicationIdSchema), asyncHandler(placementController.remove));
