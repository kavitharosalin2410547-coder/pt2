import { apiClient } from './apiClient';
import type { ApiSuccessResponse } from '../types/api';
import type { CreateOpportunityInput, Opportunity, OpportunityType } from '../types/opportunity';

export const opportunityService = {
  async list(type?: OpportunityType): Promise<Opportunity[]> {
    const params = type ? { type } : {};
    const response = await apiClient.get<ApiSuccessResponse<Opportunity[]>>('/opportunities', { params });
    return response.data.data;
  },

  async create(input: CreateOpportunityInput): Promise<Opportunity> {
    const response = await apiClient.post<ApiSuccessResponse<Opportunity>>('/opportunities', input);
    return response.data.data;
  },

  async update(id: string, input: Partial<CreateOpportunityInput & { isRegistered: boolean }>): Promise<Opportunity> {
    const response = await apiClient.patch<ApiSuccessResponse<Opportunity>>(`/opportunities/${id}`, input);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/opportunities/${id}`);
  },
};
