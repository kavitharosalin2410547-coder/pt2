import { Router } from 'express';
import { dsaController } from '../controllers/dsa.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createDsaProblemSchema,
  dsaFiltersSchema,
  learningItemIdSchema,
  updateDsaProblemSchema,
} from '../validators/learning.validators.js';

export const dsaRouter = Router();

dsaRouter.use(asyncHandler(requireAuth));
dsaRouter.get('/', validateRequest(dsaFiltersSchema), asyncHandler(dsaController.list));
dsaRouter.get('/summary', asyncHandler(dsaController.summary));
dsaRouter.post('/', validateRequest(createDsaProblemSchema), asyncHandler(dsaController.create));
dsaRouter.post('/import/leetcode-150', asyncHandler(dsaController.importNeetCode));
dsaRouter.patch('/:id', validateRequest(updateDsaProblemSchema), asyncHandler(dsaController.update));
dsaRouter.patch('/:id/solved', validateRequest(learningItemIdSchema), asyncHandler(dsaController.markSolved));
dsaRouter.patch(
  '/:id/revision-needed',
  validateRequest(learningItemIdSchema),
  asyncHandler(dsaController.markRevisionNeeded),
);
dsaRouter.delete('/:id', validateRequest(learningItemIdSchema), asyncHandler(dsaController.remove));
