import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type {
  CreateTaskInput,
  TaskFiltersInput,
  UpdateTaskInput,
} from '../validators/task.validators.js';

export const taskController = {
  async list(request: Request, response: Response) {
    const tasks = await taskService.listTasks(
      getAuthenticatedUserId(request),
      request.query as TaskFiltersInput,
    );
    response.json({ data: tasks });
  },

  async create(request: Request, response: Response) {
    const task = await taskService.createTask(
      getAuthenticatedUserId(request),
      request.body as CreateTaskInput,
    );
    response.status(201).json({ data: task });
  },

  async update(request: Request, response: Response) {
    const task = await taskService.updateTask(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateTaskInput,
    );
    response.json({ data: task });
  },

  async remove(request: Request, response: Response) {
    await taskService.deleteTask(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async complete(request: Request, response: Response) {
    const task = await taskService.completeTask(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
    );
    response.json({ data: task });
  },

  async analytics(request: Request, response: Response) {
    const analytics = await taskService.getAnalytics(getAuthenticatedUserId(request));
    response.json({ data: analytics });
  },
};
