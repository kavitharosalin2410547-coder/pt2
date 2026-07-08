export type ApiSuccessResponse<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  error: {
    message: string;
    code: string;
  };
};

export type AnalyticsSummary = {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  currentStreak: number;
};
