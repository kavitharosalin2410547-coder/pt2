import { Router } from 'express';
import { opportunityController } from '../controllers/opportunity.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const opportunityRouter = Router();

opportunityRouter.use(asyncHandler(requireAuth));
opportunityRouter.get('/', asyncHandler(opportunityController.list));
opportunityRouter.get('/live-feed', asyncHandler(opportunityController.liveFeed));
opportunityRouter.post('/', asyncHandler(opportunityController.create));
opportunityRouter.patch('/:id', asyncHandler(opportunityController.update));
opportunityRouter.delete('/:id', asyncHandler(opportunityController.remove));
