import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createInterviewQuestionSchema,
  createMockInterviewSchema,
  interviewIdSchema,
  interviewQuestionFiltersSchema,
  updateInterviewQuestionSchema,
  updateMockInterviewSchema,
} from '../validators/interview.validators.js';

export const interviewRouter = Router();

interviewRouter.use(asyncHandler(requireAuth));
interviewRouter.get('/statistics', asyncHandler(interviewController.statistics));
interviewRouter.get('/questions', validateRequest(interviewQuestionFiltersSchema), asyncHandler(interviewController.listQuestions));
interviewRouter.post('/questions', validateRequest(createInterviewQuestionSchema), asyncHandler(interviewController.createQuestion));
interviewRouter.patch('/questions/:id', validateRequest(updateInterviewQuestionSchema), asyncHandler(interviewController.updateQuestion));
interviewRouter.delete('/questions/:id', validateRequest(interviewIdSchema), asyncHandler(interviewController.deleteQuestion));
interviewRouter.get('/mocks', asyncHandler(interviewController.listMocks));
interviewRouter.post('/mocks', validateRequest(createMockInterviewSchema), asyncHandler(interviewController.createMock));
interviewRouter.patch('/mocks/:id', validateRequest(updateMockInterviewSchema), asyncHandler(interviewController.updateMock));
interviewRouter.delete('/mocks/:id', validateRequest(interviewIdSchema), asyncHandler(interviewController.deleteMock));
