import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import { createResumeSchema, resumeIdSchema, updateResumeSchema } from '../validators/resume.validators.js';

export const resumeRouter = Router();

resumeRouter.use(asyncHandler(requireAuth));
resumeRouter.get('/', asyncHandler(resumeController.list));
resumeRouter.get('/statistics', asyncHandler(resumeController.statistics));
resumeRouter.post('/', validateRequest(createResumeSchema), asyncHandler(resumeController.create));
resumeRouter.patch('/:id', validateRequest(updateResumeSchema), asyncHandler(resumeController.update));
resumeRouter.delete('/:id', validateRequest(resumeIdSchema), asyncHandler(resumeController.remove));
