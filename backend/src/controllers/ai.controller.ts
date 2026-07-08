import type { Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';
import { getAuthenticatedUserId } from '../utils/request.js';
import { AppError } from '../utils/AppError.js';

export const aiController = {
  async chat(request: Request, response: Response) {
    const { message } = request.body as { message: string };
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message is required', 400, 'MISSING_MESSAGE');
    }
    const reply = await aiService.chat(message.trim());
    response.json({ data: { reply } });
  },

  async dailyPlan(request: Request, response: Response) {
    const userId = getAuthenticatedUserId(request);
    const plan = await aiService.generateDailyPlan(userId);
    response.json({ data: { plan } });
  },

  async generateInterviewQuestions(request: Request, response: Response) {
    const { company, category } = request.body as { company?: string; category?: string };
    if (!company || !category) {
      throw new AppError('company and category are required', 400, 'MISSING_FIELDS');
    }
    const questions = await aiService.generateInterviewQuestions(company.trim(), category.trim());
    response.json({ data: { questions } });
  },

  async scoreResume(request: Request, response: Response) {
    const { resumeText } = request.body as { resumeText?: string };
    if (!resumeText || resumeText.trim().length < 50) {
      throw new AppError('Resume text is required (min 50 chars)', 400, 'MISSING_RESUME');
    }
    const result = await aiService.scoreResume(resumeText.trim());
    response.json({ data: result });
  },

  async evaluateMockAnswer(request: Request, response: Response) {
    const { question, answer, category } = request.body as { question?: string; answer?: string; category?: string };
    if (!question || !answer || !category) {
      throw new AppError('question, answer, and category are required', 400, 'MISSING_FIELDS');
    }
    const result = await aiService.evaluateMockAnswer(question, answer, category);
    response.json({ data: result });
  },

  async generateMockQuestion(request: Request, response: Response) {
    const { company, category, questionNumber } = request.body as { company?: string; category?: string; questionNumber?: number };
    if (!company || !category) {
      throw new AppError('company and category are required', 400, 'MISSING_FIELDS');
    }
    const question = await aiService.generateMockQuestion(company, category, questionNumber ?? 1);
    response.json({ data: { question } });
  },
};
