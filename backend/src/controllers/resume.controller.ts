import type { Request, Response } from 'express';
import { resumeService } from '../services/resume.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type { CreateResumeInput, UpdateResumeInput } from '../validators/resume.validators.js';

export const resumeController = {
  async list(request: Request, response: Response) {
    const resumes = await resumeService.listResumes(getAuthenticatedUserId(request));
    response.json({ data: resumes });
  },

  async create(request: Request, response: Response) {
    const resume = await resumeService.createResume(getAuthenticatedUserId(request), request.body as CreateResumeInput);
    response.status(201).json({ data: resume });
  },

  async update(request: Request, response: Response) {
    const resume = await resumeService.updateResume(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateResumeInput,
    );
    response.json({ data: resume });
  },

  async remove(request: Request, response: Response) {
    await resumeService.deleteResume(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async statistics(request: Request, response: Response) {
    const statistics = await resumeService.getStatistics(getAuthenticatedUserId(request));
    response.json({ data: statistics });
  },
};
