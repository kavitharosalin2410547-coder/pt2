import type { Request, Response } from 'express';
import { preferenceService } from '../services/preference.service.js';
import { getAuthenticatedUserId } from '../utils/request.js';
import type { UpdatePreferenceInput } from '../validators/preference.validators.js';

export const preferenceController = {
  async get(request: Request, response: Response) {
    const preference = await preferenceService.getPreference(getAuthenticatedUserId(request));
    response.json({ data: preference });
  },

  async update(request: Request, response: Response) {
    const input = request.body as UpdatePreferenceInput;
    const preference = await preferenceService.updatePreference(
      getAuthenticatedUserId(request),
      input.studyMode,
    );
    response.json({ data: preference });
  },
};
