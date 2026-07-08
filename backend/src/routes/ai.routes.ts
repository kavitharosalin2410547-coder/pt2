import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const aiRouter = Router();

aiRouter.use(asyncHandler(requireAuth));
aiRouter.post('/chat', asyncHandler(aiController.chat));
aiRouter.post('/daily-plan', asyncHandler(aiController.dailyPlan));
aiRouter.post('/interview-questions', asyncHandler(aiController.generateInterviewQuestions));
aiRouter.post('/score-resume', asyncHandler(aiController.scoreResume));
aiRouter.post('/evaluate-answer', asyncHandler(aiController.evaluateMockAnswer));
aiRouter.post('/mock-question', asyncHandler(aiController.generateMockQuestion));
