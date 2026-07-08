import { Router } from 'express';
import { examDateController } from '../controllers/exam-date.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const examDateRouter = Router();

examDateRouter.use(asyncHandler(requireAuth));
examDateRouter.get('/', asyncHandler(examDateController.list));
examDateRouter.post('/', asyncHandler(examDateController.create));
examDateRouter.patch('/:id', asyncHandler(examDateController.update));
examDateRouter.delete('/:id', asyncHandler(examDateController.remove));
