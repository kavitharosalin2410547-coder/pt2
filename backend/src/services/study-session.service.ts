import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import { startOfDay } from '../utils/date.js';
import type {
  CreateStudySessionInput,
  UpdateStudySessionInput,
} from '../validators/learning.validators.js';

export const studySessionService = {
  async list(userId: string) {
    return prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  },

  async create(userId: string, input: CreateStudySessionInput) {
    return prisma.studySession.create({
      data: { ...input, notes: input.notes || null, date: new Date(input.date), userId },
    });
  },

  async update(userId: string, id: string, input: UpdateStudySessionInput) {
    await this.ensureOwnership(userId, id);
    return prisma.studySession.update({
      where: { id },
      data: {
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await prisma.studySession.delete({ where: { id } });
  },

  async summary(userId: string) {
    const sessions = await this.list(userId);
    const now = new Date();
    const weekStart = startOfDay(new Date(now));
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const weeklyMinutes = sessions
      .filter((session) => session.date >= weekStart)
      .reduce((sum, session) => sum + session.durationMinutes, 0);
    const monthlyMinutes = sessions
      .filter((session) => session.date >= monthStart)
      .reduce((sum, session) => sum + session.durationMinutes, 0);

    return {
      totalStudyHours: roundHours(totalMinutes),
      weeklyHours: roundHours(weeklyMinutes),
      monthlyHours: roundHours(monthlyMinutes),
      consistencyStreak: calculateSessionStreak(sessions.map((session) => session.date)),
    };
  },

  async ensureOwnership(userId: string, id: string) {
    const session = await prisma.studySession.findFirst({ where: { id, userId } });
    if (!session) {
      throw new AppError('Study session not found', 404, 'STUDY_SESSION_NOT_FOUND');
    }
    return session;
  },
};

function roundHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

function calculateSessionStreak(dates: Date[]) {
  const uniqueDays = new Set(dates.map((date) => startOfDay(date).toISOString()));
  let streak = 0;
  const cursor = startOfDay(new Date());

  while (uniqueDays.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
