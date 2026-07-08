import type { ChartPoint } from './learning';

export type InterviewCategory =
  | 'HR_INTERVIEW'
  | 'BEHAVIORAL'
  | 'DSA_INTERVIEW'
  | 'CORE_CS_INTERVIEW'
  | 'SYSTEM_DESIGN'
  | 'FULL_STACK_INTERVIEW';

export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type InterviewQuestionStatus = 'NOT_STARTED' | 'PRACTICED' | 'MASTERED';
export type MockInterviewType = InterviewCategory;

export type InterviewQuestion = {
  id: string;
  question: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  answerNotes: string | null;
  userNotes: string | null;
  status: InterviewQuestionStatus;
  createdAt: string;
  updatedAt: string;
};

export type InterviewQuestionInput = {
  question: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  answerNotes: string;
  userNotes: string;
  status: InterviewQuestionStatus;
};

export type InterviewQuestionFilters = {
  category?: InterviewCategory;
  difficulty?: InterviewDifficulty;
  status?: InterviewQuestionStatus;
  search?: string;
};

export type MockInterview = {
  id: string;
  company: string;
  interviewType: MockInterviewType;
  date: string;
  rating: number;
  feedback: string | null;
  strengths: string | null;
  weaknesses: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MockInterviewInput = {
  company: string;
  interviewType: MockInterviewType;
  date: string;
  rating: number;
  feedback: string;
  strengths: string;
  weaknesses: string;
};

export type InterviewStatistics = {
  totalQuestions: number;
  questionsPracticed: number;
  questionsMastered: number;
  practiceCompletionPercentage: number;
  totalMockInterviews: number;
  averageRating: number;
  improvementTrend: number;
  charts: {
    practiceProgress: ChartPoint[];
    mockRatings: ChartPoint[];
  };
};
