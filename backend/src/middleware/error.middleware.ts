import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  // Always log the full error so you can see it in the backend terminal
  console.error('[ERROR]', error);

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { message: error.message, code: error.code },
    });
    return;
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  response.status(500).json({
    error: { message, code: 'INTERNAL_SERVER_ERROR' },
  });
};
