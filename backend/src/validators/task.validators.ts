import { TaskCategory, TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().datetime();

export const taskFiltersSchema = z.object({
  query: z.object({
    category: z.nativeEnum(TaskCategory).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    search: z.string().trim().max(120).optional(),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional().nullable(),
    category: z.nativeEnum(TaskCategory),
    dueDate: dateString,
    priority: z.nativeEnum(TaskPriority),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    category: z.nativeEnum(TaskCategory).optional(),
    dueDate: dateString.optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    completed: z.boolean().optional(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>['query'];
