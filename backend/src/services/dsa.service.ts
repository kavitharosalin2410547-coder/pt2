import { DsaDifficulty, DsaProblemStatus, Prisma } from '@prisma/client';
import { neetCode150Problems } from '../data/neetcode150.js';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateDsaProblemInput,
  DsaFiltersInput,
  UpdateDsaProblemInput,
} from '../validators/learning.validators.js';

const difficultyRank: Record<DsaDifficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export const dsaService = {
  async list(userId: string, filters: DsaFiltersInput) {
    const where: Prisma.DSAProblemWhereInput = {
      userId,
      ...(filters.catalog === 'neetcode150' ? { title: { in: neetCode150Problems.map((problem) => problem.title) } } : {}),
      ...(filters.topic ? { topic: filters.topic } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: 'insensitive' } }, { notes: { contains: filters.search, mode: 'insensitive' } }] }
        : {}),
    };

    const problems = await prisma.dSAProblem.findMany({
      where,
      orderBy: filters.sortBy === 'date' ? { updatedAt: filters.sortOrder ?? 'desc' } : { createdAt: 'desc' },
    });

    if (filters.sortBy === 'difficulty') {
      return problems.sort((a, b) => {
        const direction = filters.sortOrder === 'desc' ? -1 : 1;
        return (difficultyRank[a.difficulty] - difficultyRank[b.difficulty]) * direction;
      });
    }

    return problems;
  },

  async create(userId: string, input: CreateDsaProblemInput) {
    return prisma.dSAProblem.create({
      data: {
        title: input.title,
        topic: input.topic,
        difficulty: input.difficulty,
        status: input.status,
        leetcodeLink: input.leetcodeLink || null,
        youtubeLink: input.youtubeLink || null,
        notes: input.notes || null,
        lastSolvedAt: input.status === DsaProblemStatus.SOLVED ? new Date() : null,
        revisionCount: input.status === DsaProblemStatus.REVISION_NEEDED ? 1 : 0,
        userId,
      },
    });
  },

  async update(userId: string, id: string, input: UpdateDsaProblemInput) {
    const existing = await this.ensureOwnership(userId, id);
    const statusChanged = input.status && input.status !== existing.status;

    return prisma.dSAProblem.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.topic !== undefined ? { topic: input.topic } : {}),
        ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.leetcodeLink !== undefined ? { leetcodeLink: input.leetcodeLink || null } : {}),
        ...(input.youtubeLink !== undefined ? { youtubeLink: input.youtubeLink || null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
        ...(input.status === DsaProblemStatus.SOLVED ? { lastSolvedAt: new Date() } : {}),
        ...(statusChanged && input.status === DsaProblemStatus.REVISION_NEEDED
          ? { revisionCount: { increment: 1 } }
          : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await prisma.dSAProblem.delete({ where: { id } });
  },

  async markSolved(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    return prisma.dSAProblem.update({
      where: { id },
      data: { status: DsaProblemStatus.SOLVED, lastSolvedAt: new Date() },
    });
  },

  async markRevisionNeeded(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    return prisma.dSAProblem.update({
      where: { id },
      data: { status: DsaProblemStatus.REVISION_NEEDED, revisionCount: { increment: 1 } },
    });
  },

  async importNeetCode150(userId: string) {
    const existingProblems = await prisma.dSAProblem.findMany({
      where: { userId, title: { in: neetCode150Problems.map((problem) => problem.title) } },
      select: { id: true, title: true },
    });
    const existingByTitle = new Map(existingProblems.map((problem) => [problem.title, problem.id]));

    const updates = neetCode150Problems.flatMap((problem) => {
      const id = existingByTitle.get(problem.title);
      return id
        ? [
          prisma.dSAProblem.update({
            where: { id },
            data: {
              topic: problem.topic,
              difficulty: problem.difficulty,
              leetcodeLink: problem.leetcodeLink || null,
              youtubeLink: problem.youtubeLink || null,
            },
          }),
        ]
        : [];
    });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    const toCreate = neetCode150Problems.filter((problem) => !existingByTitle.has(problem.title));
    if (toCreate.length > 0) {
      await prisma.dSAProblem.createMany({
        data: toCreate.map((problem) => ({
          title: problem.title,
          topic: problem.topic,
          difficulty: problem.difficulty,
          status: problem.status,
          leetcodeLink: problem.leetcodeLink || null,
          youtubeLink: problem.youtubeLink || null,
          notes: problem.notes || null,
          userId,
        })),
      });
    }

    return { imported: toCreate.length, skipped: existingByTitle.size, updated: existingByTitle.size };
  },

  async summary(userId: string) {
    const [total, solved, pending, revisionNeeded] = await Promise.all([
      prisma.dSAProblem.count({ where: { userId } }),
      prisma.dSAProblem.count({ where: { userId, status: DsaProblemStatus.SOLVED } }),
      prisma.dSAProblem.count({ where: { userId, status: DsaProblemStatus.PENDING } }),
      prisma.dSAProblem.count({ where: { userId, status: DsaProblemStatus.REVISION_NEEDED } }),
    ]);

    return {
      total,
      solved,
      pending,
      revisionNeeded,
      solveRate: total === 0 ? 0 : Math.round((solved / total) * 100),
    };
  },

  async ensureOwnership(userId: string, id: string) {
    const problem = await prisma.dSAProblem.findFirst({ where: { id, userId } });
    if (!problem) {
      throw new AppError('DSA problem not found', 404, 'DSA_PROBLEM_NOT_FOUND');
    }
    return problem;
  },
};
