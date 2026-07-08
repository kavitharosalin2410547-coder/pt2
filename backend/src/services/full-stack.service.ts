import { FullStackTechnology, LearningStatus } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateFullStackInput, UpsertFullStackInput } from '../validators/learning.validators.js';

export const fullStackService = {
  async list(userId: string) {
    return prisma.fullStackProgress.findMany({ where: { userId }, orderBy: { technology: 'asc' } });
  },

  async initializeDefaults(userId: string) {
    await prisma.fullStackProgress.createMany({
      data: Object.values(FullStackTechnology).map((technology) => ({
        technology,
        userId,
        status: LearningStatus.NOT_STARTED,
      })),
      skipDuplicates: true,
    });
    return this.list(userId);
  },

  async upsert(userId: string, input: UpsertFullStackInput) {
    return prisma.fullStackProgress.upsert({
      where: { userId_technology: { userId, technology: input.technology } },
      create: { ...input, notes: input.notes || null, userId },
      update: { status: input.status, notes: input.notes || null },
    });
  },

  async update(userId: string, id: string, input: UpdateFullStackInput) {
    await this.ensureOwnership(userId, id);
    return prisma.fullStackProgress.update({
      where: { id },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      },
    });
  },

  async summary(userId: string) {
    const items = await this.list(userId);
    const completed = items.filter((item) => item.status === LearningStatus.COMPLETED).length;
    const revisionNeeded = items.filter((item) => item.status === LearningStatus.REVISION_NEEDED).length;
    return {
      totalTechnologies: items.length,
      completedTechnologies: completed,
      revisionNeeded,
      completionPercentage: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    };
  },

  async ensureOwnership(userId: string, id: string) {
    const item = await prisma.fullStackProgress.findFirst({ where: { id, userId } });
    if (!item) {
      throw new AppError('Full Stack progress item not found', 404, 'FULL_STACK_ITEM_NOT_FOUND');
    }
    return item;
  },
};
