import { apiClient } from './apiClient';
import type { ApiSuccessResponse } from '../types/api';
import type { CreateExamDateInput, ExamDate } from '../types/examDate';

export const examDateService = {
  async list(): Promise<ExamDate[]> {
    const response = await apiClient.get<ApiSuccessResponse<ExamDate[]>>('/exam-dates');
    return response.data.data;
  },

  async create(input: CreateExamDateInput): Promise<ExamDate> {
    const response = await apiClient.post<ApiSuccessResponse<ExamDate>>('/exam-dates', input);
    return response.data.data;
  },

  async update(id: string, input: Partial<CreateExamDateInput>): Promise<ExamDate> {
    const response = await apiClient.patch<ApiSuccessResponse<ExamDate>>(`/exam-dates/${id}`, input);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/exam-dates/${id}`);
  },
};
