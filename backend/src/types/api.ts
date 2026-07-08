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
