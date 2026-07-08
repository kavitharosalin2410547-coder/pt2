import type { Request, Response } from 'express';
import { fullStackService } from '../services/full-stack.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type { UpdateFullStackInput, UpsertFullStackInput } from '../validators/learning.validators.js';

export const fullStackController = {
  async list(request: Request, response: Response) {
    const items = await fullStackService.list(getAuthenticatedUserId(request));
    response.json({ data: items });
  },

  async initializeDefaults(request: Request, response: Response) {
    const items = await fullStackService.initializeDefaults(getAuthenticatedUserId(request));
    response.status(201).json({ data: items });
  },

  async upsert(request: Request, response: Response) {
    const item = await fullStackService.upsert(getAuthenticatedUserId(request), request.body as UpsertFullStackInput);
    response.status(201).json({ data: item });
  },

  async update(request: Request, response: Response) {
    const item = await fullStackService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateFullStackInput,
    );
    response.json({ data: item });
  },

  async summary(request: Request, response: Response) {
    const summary = await fullStackService.summary(getAuthenticatedUserId(request));
    response.json({ data: summary });
  },
};
