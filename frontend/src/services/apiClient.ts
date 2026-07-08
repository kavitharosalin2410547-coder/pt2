import axios, { type AxiosError } from 'axios';
import { env } from '../utils/env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAccessToken(token: string | null) {
  if (token) {
    window.localStorage.setItem('accessToken', token);
    return;
  }

  window.localStorage.removeItem('accessToken');
}

/** Extract a human-readable message from any thrown value */
export function getErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
  return (
    axiosErr?.response?.data?.error?.message ??
    (err instanceof Error ? err.message : String(err))
  );
}

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
