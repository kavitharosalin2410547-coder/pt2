import { TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';

export interface CreateExamDateInput {
  title: string;
  date: string;
  type: 'PLACEMENT' | 'EXAM' | 'INTERVIEW' | 'CONTEST';
  notes?: string;
}

export interface UpdateExamDateInput {
  title?: string;
  date?: string;
  type?: 'PLACEMENT' | 'EXAM' | 'INTERVIEW' | 'CONTEST';
  notes?: string;
}

function assertTableExists(err: unknown, tableName: string): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('does not exist') || msg.includes('P2021') || msg.includes('undefined')) {
    throw new AppError(
      `Database table "${tableName}" not found. Run: cd backend && npx prisma migrate dev`,
      503,
      'DB_MIGRATION_NEEDED',
    );
  }
  throw err;
}

export const examDateService = {
  async list(userId: string) {
    try {
      return await (prisma as any).examDate.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      });
    } catch (err) {
      assertTableExists(err, 'exam_dates');
    }
  },

  async create(userId: string, input: CreateExamDateInput) {
    const examDate = await (prisma as any).examDate.create({
      data: {
        title: input.title,
        date: new Date(input.date),
        type: input.type,
        notes: input.notes ?? null,
        userId,
      },
    });

    await this.autoAdjustTasks(userId, new Date(input.date));

    return examDate;
  },

  async update(userId: string, id: string, input: UpdateExamDateInput) {
    await this.ensureOwnership(userId, id);

    return (prisma as any).examDate.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await (prisma as any).examDate.delete({ where: { id } });
  },

  async autoAdjustTasks(userId: string, examDate: Date) {
    const examDay = new Date(examDate);
    examDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(examDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const endOfExamDay = new Date(examDay);
    endOfExamDay.setHours(23, 59, 59, 999);

    // Mark all pending tasks on or after the exam date as HIGH priority
    await prisma.task.updateMany({
      where: {
        userId,
        status: TaskStatus.PENDING,
        dueDate: { gte: examDay },
      },
      data: { priority: TaskPriority.HIGH },
    });

    // Push tasks that fall exactly on the exam date to the next day
    await prisma.task.updateMany({
      where: {
        userId,
        status: TaskStatus.PENDING,
        dueDate: {
          gte: examDay,
          lte: endOfExamDay,
        },
      },
      data: { dueDate: nextDay },
    });
  },

  async ensureOwnership(userId: string, id: string) {
    const record = await (prisma as any).examDate.findFirst({ where: { id, userId } });
    if (!record) {
      throw new AppError('Exam date not found', 404, 'EXAM_DATE_NOT_FOUND');
    }
  },
};
