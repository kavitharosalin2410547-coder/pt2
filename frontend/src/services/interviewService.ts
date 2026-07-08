import type { ApiSuccessResponse } from '../types/api';
import type {
  InterviewQuestion,
  InterviewQuestionFilters,
  InterviewQuestionInput,
  InterviewStatistics,
  MockInterview,
  MockInterviewInput,
} from '../types/interview';
import { apiClient } from './apiClient';

function mockPayload(input: MockInterviewInput) {
  return {
    ...input,
    date: new Date(`${input.date}T00:00:00.000Z`).toISOString(),
    feedback: input.feedback.trim() || null,
    strengths: input.strengths.trim() || null,
    weaknesses: input.weaknesses.trim() || null,
  };
}

function questionPayload(input: InterviewQuestionInput) {
  return {
    ...input,
    answerNotes: input.answerNotes.trim() || null,
    userNotes: input.userNotes.trim() || null,
  };
}

export const interviewService = {
  async questions(filters: InterviewQuestionFilters = {}): Promise<InterviewQuestion[]> {
    const response = await apiClient.get<ApiSuccessResponse<InterviewQuestion[]>>('/interview-prep/questions', {
      params: filters,
    });
    return response.data.data;
  },

  async createQuestion(input: InterviewQuestionInput): Promise<InterviewQuestion> {
    const response = await apiClient.post<ApiSuccessResponse<InterviewQuestion>>(
      '/interview-prep/questions',
      questionPayload(input),
    );
    return response.data.data;
  },

  async updateQuestion(id: string, input: Partial<InterviewQuestionInput>): Promise<InterviewQuestion> {
    const response = await apiClient.patch<ApiSuccessResponse<InterviewQuestion>>(`/interview-prep/questions/${id}`, input);
    return response.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/interview-prep/questions/${id}`);
  },

  async mocks(): Promise<MockInterview[]> {
    const response = await apiClient.get<ApiSuccessResponse<MockInterview[]>>('/interview-prep/mocks');
    return response.data.data;
  },

  async createMock(input: MockInterviewInput): Promise<MockInterview> {
    const response = await apiClient.post<ApiSuccessResponse<MockInterview>>('/interview-prep/mocks', mockPayload(input));
    return response.data.data;
  },

  async updateMock(id: string, input: Partial<MockInterviewInput>): Promise<MockInterview> {
    const payload = {
      ...input,
      ...(input.date ? { date: new Date(`${input.date}T00:00:00.000Z`).toISOString() } : {}),
    };
    const response = await apiClient.patch<ApiSuccessResponse<MockInterview>>(`/interview-prep/mocks/${id}`, payload);
    return response.data.data;
  },

  async deleteMock(id: string): Promise<void> {
    await apiClient.delete(`/interview-prep/mocks/${id}`);
  },

  async statistics(): Promise<InterviewStatistics> {
    const response = await apiClient.get<ApiSuccessResponse<InterviewStatistics>>('/interview-prep/statistics');
    return response.data.data;
  },
};
