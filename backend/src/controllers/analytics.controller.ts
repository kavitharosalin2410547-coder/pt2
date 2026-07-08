import type { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { getAuthenticatedUserId } from '../utils/request.js';

export const analyticsController = {
  async learning(request: Request, response: Response) {
    const analytics = await analyticsService.getLearningAnalytics(getAuthenticatedUserId(request));
    response.json({ data: analytics });
  },
};
