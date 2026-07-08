import type { ApiSuccessResponse } from '../types/api';
import type {
  PlacementApplication,
  PlacementFilters,
  PlacementFormInput,
  PlacementStatistics,
} from '../types/placement';
import { apiClient } from './apiClient';

function toPayload(input: PlacementFormInput) {
  return {
    ...input,
    applicationDate: new Date(`${input.applicationDate}T00:00:00.000Z`).toISOString(),
    deadlineDate: new Date(`${input.deadlineDate}T00:00:00.000Z`).toISOString(),
    jobLink: input.jobLink.trim() || null,
    notes: input.notes.trim() || null,
  };
}

export const placementService = {
  async list(filters: PlacementFilters = {}): Promise<PlacementApplication[]> {
    const response = await apiClient.get<ApiSuccessResponse<PlacementApplication[]>>('/placement-applications', {
      params: filters,
    });
    return response.data.data;
  },

  async create(input: PlacementFormInput): Promise<PlacementApplication> {
    const response = await apiClient.post<ApiSuccessResponse<PlacementApplication>>(
      '/placement-applications',
      toPayload(input),
    );
    return response.data.data;
  },

  async update(id: string, input: Partial<PlacementFormInput>): Promise<PlacementApplication> {
    const payload = {
      ...input,
      ...(input.applicationDate ? { applicationDate: new Date(`${input.applicationDate}T00:00:00.000Z`).toISOString() } : {}),
      ...(input.deadlineDate ? { deadlineDate: new Date(`${input.deadlineDate}T00:00:00.000Z`).toISOString() } : {}),
    };
    const response = await apiClient.patch<ApiSuccessResponse<PlacementApplication>>(`/placement-applications/${id}`, payload);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/placement-applications/${id}`);
  },

  async statistics(): Promise<PlacementStatistics> {
    const response = await apiClient.get<ApiSuccessResponse<PlacementStatistics>>('/placement-applications/statistics');
    return response.data.data;
  },
};
