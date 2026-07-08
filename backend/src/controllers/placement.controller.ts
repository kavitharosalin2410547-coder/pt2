import type { Request, Response } from 'express';
import { placementService } from '../services/placement.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type {
  CreatePlacementApplicationInput,
  PlacementFiltersInput,
  UpdatePlacementApplicationInput,
} from '../validators/placement.validators.js';

export const placementController = {
  async list(request: Request, response: Response) {
    const applications = await placementService.listApplications(
      getAuthenticatedUserId(request),
      request.query as PlacementFiltersInput,
    );
    response.json({ data: applications });
  },

  async create(request: Request, response: Response) {
    const application = await placementService.createApplication(
      getAuthenticatedUserId(request),
      request.body as CreatePlacementApplicationInput,
    );
    response.status(201).json({ data: application });
  },

  async update(request: Request, response: Response) {
    const application = await placementService.updateApplication(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdatePlacementApplicationInput,
    );
    response.json({ data: application });
  },

  async remove(request: Request, response: Response) {
    await placementService.deleteApplication(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async statistics(request: Request, response: Response) {
    const statistics = await placementService.getStatistics(getAuthenticatedUserId(request));
    response.json({ data: statistics });
  },
};
