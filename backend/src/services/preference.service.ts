import type { StudyMode } from '@prisma/client';
import { prisma } from '../prisma/client.js';

export const preferenceService = {
  async getPreference(userId: string) {
    return prisma.studyPreference.upsert({
      where: { userId },
      create: {
        userId,
        studyMode: 'WEEKDAYS_ONLY',
      },
      update: {},
    });
  },

  async updatePreference(userId: string, studyMode: StudyMode) {
    return prisma.studyPreference.upsert({
      where: { userId },
      create: {
        userId,
        studyMode,
      },
      update: {
        studyMode,
      },
    });
  },
};
