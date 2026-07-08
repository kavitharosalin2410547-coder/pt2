import { apiClient } from './apiClient';
import type { ApiSuccessResponse } from '../types/api';
import type { AuthUser, LoginRequest, LoginResponse, SignupRequest } from '../types/auth';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async signup(payload: SignupRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/signup', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiSuccessResponse<AuthUser>>('/auth/me');
    return response.data.data;
  },
};
