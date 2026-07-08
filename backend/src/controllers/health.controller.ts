import type { Request, Response } from 'express';
import { healthService } from '../services/health.service.js';

export function getHealth(_request: Request, response: Response) {
  response.json({
    data: healthService.getStatus(),
  });
}
