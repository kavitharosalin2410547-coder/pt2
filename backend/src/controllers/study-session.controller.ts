import type { Request, Response } from 'express';
import { studySessionService } from '../services/study-session.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type {
  CreateStudySessionInput,
  UpdateStudySessionInput,
} from '../validators/learning.validators.js';

export const studySessionController = {
  async list(request: Request, response: Response) {
    const sessions = await studySessionService.list(getAuthenticatedUserId(request));
    response.json({ data: sessions });
  },

  async create(request: Request, response: Response) {
    const session = await studySessionService.create(
      getAuthenticatedUserId(request),
      request.body as CreateStudySessionInput,
    );
    response.status(201).json({ data: session });
  },

  async update(request: Request, response: Response) {
    const session = await studySessionService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateStudySessionInput,
    );
    response.json({ data: session });
  },

  async remove(request: Request, response: Response) {
    await studySessionService.remove(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async summary(request: Request, response: Response) {
    const summary = await studySessionService.summary(getAuthenticatedUserId(request));
    response.json({ data: summary });
  },
};
