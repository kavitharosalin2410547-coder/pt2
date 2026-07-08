import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate-request.middleware.js';
import {
  createTaskSchema,
  taskFiltersSchema,
  taskIdSchema,
  updateTaskSchema,
} from '../validators/task.validators.js';

export const taskRouter = Router();

taskRouter.use(asyncHandler(requireAuth));
taskRouter.get('/', validateRequest(taskFiltersSchema), asyncHandler(taskController.list));
taskRouter.get('/analytics', asyncHandler(taskController.analytics));
taskRouter.post('/', validateRequest(createTaskSchema), asyncHandler(taskController.create));
taskRouter.patch('/:id', validateRequest(updateTaskSchema), asyncHandler(taskController.update));
taskRouter.patch('/:id/complete', validateRequest(taskIdSchema), asyncHandler(taskController.complete));
taskRouter.delete('/:id', validateRequest(taskIdSchema), asyncHandler(taskController.remove));
