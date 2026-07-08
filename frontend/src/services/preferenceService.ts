import { apiClient } from './apiClient';
import type { ApiSuccessResponse } from '../types/api';
import type { StudyMode, StudyPreference } from '../types/preference';

export const preferenceService = {
  async get(): Promise<StudyPreference> {
    const response = await apiClient.get<ApiSuccessResponse<StudyPreference>>('/preferences');
    return response.data.data;
  },

  async update(studyMode: StudyMode): Promise<StudyPreference> {
    const response = await apiClient.put<ApiSuccessResponse<StudyPreference>>('/preferences', {
      studyMode,
    });
    return response.data.data;
  },
};
