import { CoreCSSubject, LearningStatus } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateCoreCSInput, UpsertCoreCSInput } from '../validators/learning.validators.js';

const defaultTopics: Record<CoreCSSubject, string[]> = {
  OS: ['Processes and Threads', 'CPU Scheduling', 'Memory Management', 'Deadlocks', 'File Systems'],
  DBMS: ['ER Model', 'SQL', 'Normalization', 'Transactions', 'Indexing'],
  CN: ['OSI Model', 'TCP/IP', 'Routing', 'HTTP and DNS', 'Network Security'],
  OOP: ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Design Principles'],
};

export const coreCSService = {
  async list(userId: string) {
    return prisma.coreCSProgress.findMany({
      where: { userId },
      orderBy: [{ subject: 'asc' }, { topic: 'asc' }],
    });
  },

  async initializeDefaults(userId: string) {
    const data = Object.entries(defaultTopics).flatMap(([subject, topics]) =>
      topics.map((topic) => ({
        userId,
        subject: subject as CoreCSSubject,
        topic,
        status: LearningStatus.NOT_STARTED,
      })),
    );

    await prisma.coreCSProgress.createMany({ data, skipDuplicates: true });
    return this.list(userId);
  },

  async upsert(userId: string, input: UpsertCoreCSInput) {
    return prisma.coreCSProgress.upsert({
      where: { userId_subject_topic: { userId, subject: input.subject, topic: input.topic } },
      create: { ...input, notes: input.notes || null, userId },
      update: { status: input.status, notes: input.notes || null },
    });
  },

  async update(userId: string, id: string, input: UpdateCoreCSInput) {
    await this.ensureOwnership(userId, id);
    return prisma.coreCSProgress.update({
      where: { id },
      data: {
        ...(input.topic !== undefined ? { topic: input.topic } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await prisma.coreCSProgress.delete({ where: { id } });
  },

  async summary(userId: string) {
    const items = await this.list(userId);
    return Object.values(CoreCSSubject).map((subject) => {
      const subjectItems = items.filter((item) => item.subject === subject);
      const completed = subjectItems.filter((item) => item.status === LearningStatus.COMPLETED).length;
      const revisionNeeded = subjectItems.filter((item) => item.status === LearningStatus.REVISION_NEEDED).length;
      return {
        subject,
        totalTopics: subjectItems.length,
        completedTopics: completed,
        revisionNeeded,
        completionPercentage: subjectItems.length === 0 ? 0 : Math.round((completed / subjectItems.length) * 100),
      };
    });
  },

  async ensureOwnership(userId: string, id: string) {
    const item = await prisma.coreCSProgress.findFirst({ where: { id, userId } });
    if (!item) {
      throw new AppError('Core CS topic not found', 404, 'CORE_CS_TOPIC_NOT_FOUND');
    }
    return item;
  },
};
