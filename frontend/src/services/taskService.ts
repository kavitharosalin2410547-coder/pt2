import { apiClient } from './apiClient';
import type { AnalyticsSummary, ApiSuccessResponse } from '../types/api';
import type { Task, TaskFilters, TaskFormInput } from '../types/task';

function toPayload(input: TaskFormInput) {
  return {
    ...input,
    dueDate: new Date(`${input.dueDate}T00:00:00.000Z`).toISOString(),
  };
}

export const taskService = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const response = await apiClient.get<ApiSuccessResponse<Task[]>>('/tasks', { params: filters });
    return response.data.data;
  },

  async create(input: TaskFormInput): Promise<Task> {
    const response = await apiClient.post<ApiSuccessResponse<Task>>('/tasks', toPayload(input));
    return response.data.data;
  },

  async update(id: string, input: TaskFormInput): Promise<Task> {
    const response = await apiClient.patch<ApiSuccessResponse<Task>>(`/tasks/${id}`, toPayload(input));
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async complete(id: string): Promise<Task> {
    const response = await apiClient.patch<ApiSuccessResponse<Task>>(`/tasks/${id}/complete`);
    return response.data.data;
  },

  async analytics(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<ApiSuccessResponse<AnalyticsSummary>>('/tasks/analytics');
    return response.data.data;
  },
};
