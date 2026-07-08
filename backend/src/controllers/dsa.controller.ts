import type { Request, Response } from 'express';
import { dsaService } from '../services/dsa.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type {
  CreateDsaProblemInput,
  DsaFiltersInput,
  UpdateDsaProblemInput,
} from '../validators/learning.validators.js';

export const dsaController = {
  async list(request: Request, response: Response) {
    const problems = await dsaService.list(getAuthenticatedUserId(request), request.query as DsaFiltersInput);
    response.json({ data: problems });
  },

  async create(request: Request, response: Response) {
    const problem = await dsaService.create(getAuthenticatedUserId(request), request.body as CreateDsaProblemInput);
    response.status(201).json({ data: problem });
  },

  async update(request: Request, response: Response) {
    const problem = await dsaService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateDsaProblemInput,
    );
    response.json({ data: problem });
  },

  async remove(request: Request, response: Response) {
    await dsaService.remove(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async markSolved(request: Request, response: Response) {
    const problem = await dsaService.markSolved(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.json({ data: problem });
  },

  async markRevisionNeeded(request: Request, response: Response) {
    const problem = await dsaService.markRevisionNeeded(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
    );
    response.json({ data: problem });
  },

  async importNeetCode(request: Request, response: Response) {
    const result = await dsaService.importNeetCode150(getAuthenticatedUserId(request));
    response.status(201).json({ data: result });
  },

  async summary(request: Request, response: Response) {
    const summary = await dsaService.summary(getAuthenticatedUserId(request));
    response.json({ data: summary });
  },
};
