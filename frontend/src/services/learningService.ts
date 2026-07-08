import type { ApiSuccessResponse } from '../types/api';
import type {
  CoreCSInput,
  CoreCSProgress,
  CoreCSSummary,
  DSAFilters,
  DSAProblem,
  DSAProblemInput,
  DSASummary,
  FullStackInput,
  FullStackProgress,
  FullStackSummary,
  LearningAnalytics,
  StudySession,
  StudySessionInput,
  StudySummary,
} from '../types/learning';
import { apiClient } from './apiClient';

function cleanFilters(filters: DSAFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined));
}

export const dsaService = {
  async list(filters: DSAFilters = {}) {
    const response = await apiClient.get<ApiSuccessResponse<DSAProblem[]>>('/dsa', { params: cleanFilters(filters) });
    return response.data.data;
  },
  async summary() {
    const response = await apiClient.get<ApiSuccessResponse<DSASummary>>('/dsa/summary');
    return response.data.data;
  },
  async create(input: DSAProblemInput) {
    const response = await apiClient.post<ApiSuccessResponse<DSAProblem>>('/dsa', input);
    return response.data.data;
  },
  async update(id: string, input: Partial<DSAProblemInput>) {
    const response = await apiClient.patch<ApiSuccessResponse<DSAProblem>>(`/dsa/${id}`, input);
    return response.data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/dsa/${id}`);
  },
  async markSolved(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<DSAProblem>>(`/dsa/${id}/solved`);
    return response.data.data;
  },
  async markRevisionNeeded(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<DSAProblem>>(`/dsa/${id}/revision-needed`);
    return response.data.data;
  },
  async importNeetCode() {
    const response = await apiClient.post<ApiSuccessResponse<{ imported: number; skipped: number; updated: number }>>('/dsa/import/leetcode-150');
    return response.data.data;
  },
};

export const coreCSService = {
  async list() {
    const response = await apiClient.get<ApiSuccessResponse<CoreCSProgress[]>>('/core-cs');
    return response.data.data;
  },
  async summary() {
    const response = await apiClient.get<ApiSuccessResponse<CoreCSSummary[]>>('/core-cs/summary');
    return response.data.data;
  },
  async initialize() {
    const response = await apiClient.post<ApiSuccessResponse<CoreCSProgress[]>>('/core-cs/initialize');
    return response.data.data;
  },
  async upsert(input: CoreCSInput) {
    const response = await apiClient.post<ApiSuccessResponse<CoreCSProgress>>('/core-cs', input);
    return response.data.data;
  },
  async update(id: string, input: Partial<CoreCSInput>) {
    const response = await apiClient.patch<ApiSuccessResponse<CoreCSProgress>>(`/core-cs/${id}`, input);
    return response.data.data;
  },
};

export const fullStackService = {
  async list() {
    const response = await apiClient.get<ApiSuccessResponse<FullStackProgress[]>>('/full-stack');
    return response.data.data;
  },
  async summary() {
    const response = await apiClient.get<ApiSuccessResponse<FullStackSummary>>('/full-stack/summary');
    return response.data.data;
  },
  async initialize() {
    const response = await apiClient.post<ApiSuccessResponse<FullStackProgress[]>>('/full-stack/initialize');
    return response.data.data;
  },
  async upsert(input: FullStackInput) {
    const response = await apiClient.post<ApiSuccessResponse<FullStackProgress>>('/full-stack', input);
    return response.data.data;
  },
  async update(id: string, input: Partial<FullStackInput>) {
    const response = await apiClient.patch<ApiSuccessResponse<FullStackProgress>>(`/full-stack/${id}`, input);
    return response.data.data;
  },
};

export const studySessionService = {
  async list() {
    const response = await apiClient.get<ApiSuccessResponse<StudySession[]>>('/study-sessions');
    return response.data.data;
  },
  async summary() {
    const response = await apiClient.get<ApiSuccessResponse<StudySummary>>('/study-sessions/summary');
    return response.data.data;
  },
  async create(input: StudySessionInput) {
    const response = await apiClient.post<ApiSuccessResponse<StudySession>>('/study-sessions', input);
    return response.data.data;
  },
  async update(id: string, input: StudySessionInput) {
    const response = await apiClient.patch<ApiSuccessResponse<StudySession>>(`/study-sessions/${id}`, input);
    return response.data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/study-sessions/${id}`);
  },
};

export const learningAnalyticsService = {
  async get() {
    const response = await apiClient.get<ApiSuccessResponse<LearningAnalytics>>('/analytics');
    return response.data.data;
  },
};
