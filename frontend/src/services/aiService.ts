import { apiClient } from './apiClient';
import type { ApiSuccessResponse } from '../types/api';

export interface AIInterviewQuestion {
  question: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  notes: string;
}

export interface ATSResult {
  score: number;
  breakdown: { keywords: number; format: number; sections: number; impact: number; brevity: number };
  strengths: string[];
  improvements: string[];
}

export interface MockAnswerEval {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export const aiService = {
  async chat(message: string): Promise<string> {
    const response = await apiClient.post<ApiSuccessResponse<{ reply: string }>>('/ai/chat', { message });
    return response.data.data.reply;
  },

  async generateDailyPlan(): Promise<string> {
    const response = await apiClient.post<ApiSuccessResponse<{ plan: string }>>('/ai/daily-plan');
    return response.data.data.plan;
  },

  async generateInterviewQuestions(company: string, category: string): Promise<AIInterviewQuestion[]> {
    const response = await apiClient.post<ApiSuccessResponse<{ questions: AIInterviewQuestion[] }>>('/ai/interview-questions', { company, category });
    return response.data.data.questions;
  },

  async scoreResume(resumeText: string): Promise<ATSResult> {
    const response = await apiClient.post<ApiSuccessResponse<ATSResult>>('/ai/score-resume', { resumeText });
    return response.data.data;
  },

  async evaluateAnswer(question: string, answer: string, category: string): Promise<MockAnswerEval> {
    const response = await apiClient.post<ApiSuccessResponse<MockAnswerEval>>('/ai/evaluate-answer', { question, answer, category });
    return response.data.data;
  },

  async generateMockQuestion(company: string, category: string, questionNumber: number): Promise<string> {
    const response = await apiClient.post<ApiSuccessResponse<{ question: string }>>('/ai/mock-question', { company, category, questionNumber });
    return response.data.data.question;
  },
};
