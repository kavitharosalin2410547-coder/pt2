import { Router } from 'express';
import { studySessionController } from '../controllers/study-session.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createStudySessionSchema,
  learningItemIdSchema,
  updateStudySessionSchema,
} from '../validators/learning.validators.js';

export const studySessionRouter = Router();

studySessionRouter.use(asyncHandler(requireAuth));
studySessionRouter.get('/', asyncHandler(studySessionController.list));
studySessionRouter.get('/summary', asyncHandler(studySessionController.summary));
studySessionRouter.post('/', validateRequest(createStudySessionSchema), asyncHandler(studySessionController.create));
studySessionRouter.patch('/:id', validateRequest(updateStudySessionSchema), asyncHandler(studySessionController.update));
studySessionRouter.delete('/:id', validateRequest(learningItemIdSchema), asyncHandler(studySessionController.remove));
