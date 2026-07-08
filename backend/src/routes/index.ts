import type { Express } from 'express';
import { analyticsRouter } from './analytics.routes.js';
import { authRouter } from './auth.routes.js';
import { coreCSRouter } from './core-cs.routes.js';
import { dsaRouter } from './dsa.routes.js';
import { fullStackRouter } from './full-stack.routes.js';
import { healthRouter } from './health.routes.js';
import { interviewRouter } from './interview.routes.js';
import { placementRouter } from './placement.routes.js';
import { preferenceRouter } from './preference.routes.js';
import { resumeRouter } from './resume.routes.js';
import { studySessionRouter } from './study-session.routes.js';
import { taskRouter } from './task.routes.js';
// Stage 3
import { examDateRouter } from './exam-date.routes.js';
import { opportunityRouter } from './opportunity.routes.js';
import { aiRouter } from './ai.routes.js';

export function registerRoutes(app: Express) {
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/preferences', preferenceRouter);
  app.use('/api/dsa', dsaRouter);
  app.use('/api/core-cs', coreCSRouter);
  app.use('/api/full-stack', fullStackRouter);
  app.use('/api/study-sessions', studySessionRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/placement-applications', placementRouter);
  app.use('/api/interview-prep', interviewRouter);
  app.use('/api/resumes', resumeRouter);
  // Stage 3
  app.use('/api/exam-dates', examDateRouter);
  app.use('/api/opportunities', opportunityRouter);
  app.use('/api/ai', aiRouter);
}
