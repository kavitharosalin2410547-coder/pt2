import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import type {
  CreateTaskInput,
  TaskFiltersInput,
  UpdateTaskInput,
} from '../validators/task.validators.js';
import { AppError } from '../utils/AppError.js';
import { getNextValidStudyDay, startOfDay } from '../utils/date.js';

export const taskService = {
  async listTasks(userId: string, filters: TaskFiltersInput) {
    await this.rescheduleMissedTasks(userId);

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async createTask(userId: string, input: CreateTaskInput) {
    const completed = input.status === TaskStatus.COMPLETED;

    return prisma.task.create({
      data: {
        title: input.title,
        description: input.description || null,
        category: input.category,
        dueDate: new Date(input.dueDate),
        priority: input.priority,
        status: input.status,
        completed,
        completedAt: completed ? new Date() : null,
        userId,
      },
    });
  },

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    await this.ensureTaskOwnership(userId, taskId);

    const completed =
      input.completed ?? (input.status ? input.status === TaskStatus.COMPLETED : undefined);

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description || null } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(completed !== undefined
          ? {
              completed,
              status: completed ? TaskStatus.COMPLETED : input.status ?? TaskStatus.PENDING,
              completedAt: completed ? new Date() : null,
            }
          : {}),
      },
    });
  },

  async deleteTask(userId: string, taskId: string) {
    await this.ensureTaskOwnership(userId, taskId);
    await prisma.task.delete({ where: { id: taskId } });
  },

  async completeTask(userId: string, taskId: string) {
    await this.ensureTaskOwnership(userId, taskId);

    return prisma.task.update({
      where: { id: taskId },
      data: {
        completed: true,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  },

  async getAnalytics(userId: string) {
    await this.rescheduleMissedTasks(userId);

    const [totalTasks, completedTasks, completedTaskDates] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.findMany({
        where: { userId, completed: true, completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalTasks,
      completedTasks,
      completionPercentage,
      currentStreak: calculateCurrentStreak(completedTaskDates.map((task) => task.completedAt)),
    };
  },

  async rescheduleMissedTasks(userId: string) {
    const preference = await prisma.studyPreference.upsert({
      where: { userId },
      create: { userId, studyMode: 'WEEKDAYS_ONLY' },
      update: {},
    });

    const today = startOfDay(new Date());
    const missedTasks = await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: { lt: today },
      },
    });

    await Promise.all(
      missedTasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            dueDate: getNextValidStudyDay(today, preference.studyMode),
          },
        }),
      ),
    );
  },

  async ensureTaskOwnership(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }
  },
};

function calculateCurrentStreak(completedDates: Array<Date | null>): number {
  const uniqueDays = new Set(
    completedDates
      .filter((date): date is Date => Boolean(date))
      .map((date) => startOfDay(date).toISOString()),
  );

  let streak = 0;
  const cursor = startOfDay(new Date());

  while (uniqueDays.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
