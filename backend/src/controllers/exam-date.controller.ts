import type { Request, Response } from 'express';
import { examDateService } from '../services/exam-date.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type { CreateExamDateInput, UpdateExamDateInput } from '../services/exam-date.service.js';

export const examDateController = {
  async list(request: Request, response: Response) {
    const examDates = await examDateService.list(getAuthenticatedUserId(request));
    response.json({ data: examDates });
  },

  async create(request: Request, response: Response) {
    const examDate = await examDateService.create(
      getAuthenticatedUserId(request),
      request.body as CreateExamDateInput,
    );
    response.status(201).json({ data: examDate });
  },

  async update(request: Request, response: Response) {
    const examDate = await examDateService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateExamDateInput,
    );
    response.json({ data: examDate });
  },

  async remove(request: Request, response: Response) {
    await examDateService.remove(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
    );
    response.status(204).send();
  },
};
