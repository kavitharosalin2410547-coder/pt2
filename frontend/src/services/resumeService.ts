import type { ApiSuccessResponse } from '../types/api';
import type { ResumeInput, ResumeStatistics, ResumeVersion } from '../types/resume';
import { apiClient } from './apiClient';

function toPayload(input: ResumeInput) {
  return {
    ...input,
    lastUpdatedDate: new Date(`${input.lastUpdatedDate}T00:00:00.000Z`).toISOString(),
    fileName: input.fileName || null,
    fileMimeType: input.fileMimeType || null,
    fileData: input.fileData || null,
  };
}

export const resumeService = {
  async list(): Promise<ResumeVersion[]> {
    const response = await apiClient.get<ApiSuccessResponse<ResumeVersion[]>>('/resumes');
    return response.data.data;
  },

  async create(input: ResumeInput): Promise<ResumeVersion> {
    const response = await apiClient.post<ApiSuccessResponse<ResumeVersion>>('/resumes', toPayload(input));
    return response.data.data;
  },

  async update(id: string, input: Partial<ResumeInput>): Promise<ResumeVersion> {
    const payload = {
      ...input,
      ...(input.lastUpdatedDate ? { lastUpdatedDate: new Date(`${input.lastUpdatedDate}T00:00:00.000Z`).toISOString() } : {}),
    };
    const response = await apiClient.patch<ApiSuccessResponse<ResumeVersion>>(`/resumes/${id}`, payload);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },

  async statistics(): Promise<ResumeStatistics> {
    const response = await apiClient.get<ApiSuccessResponse<ResumeStatistics>>('/resumes/statistics');
    return response.data.data;
  },
};
