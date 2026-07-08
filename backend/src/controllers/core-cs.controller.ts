import type { Request, Response } from 'express';
import { coreCSService } from '../services/core-cs.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type { UpdateCoreCSInput, UpsertCoreCSInput } from '../validators/learning.validators.js';

export const coreCSController = {
  async list(request: Request, response: Response) {
    const items = await coreCSService.list(getAuthenticatedUserId(request));
    response.json({ data: items });
  },

  async initializeDefaults(request: Request, response: Response) {
    const items = await coreCSService.initializeDefaults(getAuthenticatedUserId(request));
    response.status(201).json({ data: items });
  },

  async upsert(request: Request, response: Response) {
    const item = await coreCSService.upsert(getAuthenticatedUserId(request), request.body as UpsertCoreCSInput);
    response.status(201).json({ data: item });
  },

  async update(request: Request, response: Response) {
    const item = await coreCSService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateCoreCSInput,
    );
    response.json({ data: item });
  },

  async remove(request: Request, response: Response) {
    await coreCSService.remove(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async summary(request: Request, response: Response) {
    const summary = await coreCSService.summary(getAuthenticatedUserId(request));
    response.json({ data: summary });
  },
};
