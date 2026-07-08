import { DsaProblemStatus, LearningStatus } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { startOfDay } from '../utils/date.js';
import { coreCSService } from './core-cs.service.js';
import { dsaService } from './dsa.service.js';
import { fullStackService } from './full-stack.service.js';
import { studySessionService } from './study-session.service.js';

export const analyticsService = {
  async getLearningAnalytics(userId: string) {
    const [dsaSummary, coreSummary, fullStackSummary, studySummary, dsaProblems, coreItems, fullStackItems, sessions] =
      await Promise.all([
        dsaService.summary(userId),
        coreCSService.summary(userId),
        fullStackService.summary(userId),
        studySessionService.summary(userId),
        prisma.dSAProblem.findMany({ where: { userId } }),
        prisma.coreCSProgress.findMany({ where: { userId } }),
        prisma.fullStackProgress.findMany({ where: { userId } }),
        prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
      ]);

    return {
      dsa: dsaSummary,
      coreCS: coreSummary,
      fullStack: fullStackSummary,
      study: studySummary,
      charts: {
        studyHours: lastNDaysStudyHours(sessions, 14),
        categoryDistribution: categoryDistribution(sessions),
        dsaProgress: [
          { name: 'Solved', value: dsaSummary.solved },
          { name: 'Pending', value: dsaSummary.pending },
          { name: 'Revision Needed', value: dsaSummary.revisionNeeded },
        ],
        subjectCompletion: coreSummary.map((item) => ({
          name: item.subject,
          value: item.completionPercentage,
        })),
        weeklyProductivity: lastNDaysStudyHours(sessions, 7),
      },
      weakAreas: detectWeakAreas(dsaProblems, coreItems, fullStackItems),
      strongAreas: detectStrongAreas(dsaProblems, coreItems, fullStackItems),
    };
  },
};

function lastNDaysStudyHours(sessions: Array<{ date: Date; durationMinutes: number }>, days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - (days - index - 1));
    const minutes = sessions
      .filter((session) => startOfDay(session.date).toISOString() === date.toISOString())
      .reduce((sum, session) => sum + session.durationMinutes, 0);

    return {
      name: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: Math.round((minutes / 60) * 10) / 10,
    };
  });
}

function categoryDistribution(sessions: Array<{ category: string; durationMinutes: number }>) {
  const totals = new Map<string, number>();
  sessions.forEach((session) => totals.set(session.category, (totals.get(session.category) ?? 0) + session.durationMinutes));
  return Array.from(totals.entries()).map(([name, minutes]) => ({ name, value: Math.round((minutes / 60) * 10) / 10 }));
}

function detectWeakAreas(
  dsaProblems: Array<{ topic: string; status: DsaProblemStatus; revisionCount: number }>,
  coreItems: Array<{ subject: string; status: LearningStatus }>,
  fullStackItems: Array<{ technology: string; status: LearningStatus }>,
) {
  const dsaByTopic = groupBy(dsaProblems, (item) => item.topic);
  const dsaWeak = Array.from(dsaByTopic.entries())
    .map(([name, items]) => ({
      name,
      score:
        items.filter((item) => item.status !== DsaProblemStatus.SOLVED).length +
        items.filter((item) => item.status === DsaProblemStatus.REVISION_NEEDED).length +
        items.reduce((sum, item) => sum + item.revisionCount, 0),
    }))
    .filter((item) => item.score > 0);

  const coreWeak = Object.entries(groupProgress(coreItems, 'subject'))
    .map(([name, stats]) => ({ name, score: stats.total - stats.completed + stats.revisionNeeded }))
    .filter((item) => item.score > 0);

  const fullStackWeak = fullStackItems
    .filter((item) => item.status !== LearningStatus.COMPLETED)
    .map((item) => ({ name: item.technology, score: item.status === LearningStatus.REVISION_NEEDED ? 2 : 1 }));

  return [...dsaWeak, ...coreWeak, ...fullStackWeak].sort((a, b) => b.score - a.score).slice(0, 5);
}

function detectStrongAreas(
  dsaProblems: Array<{ topic: string; status: DsaProblemStatus }>,
  coreItems: Array<{ subject: string; status: LearningStatus }>,
  fullStackItems: Array<{ technology: string; status: LearningStatus }>,
) {
  const dsaStrong = Array.from(groupBy(dsaProblems, (item) => item.topic).entries())
    .map(([name, items]) => ({ name, score: items.filter((item) => item.status === DsaProblemStatus.SOLVED).length }))
    .filter((item) => item.score > 0);

  const coreStrong = Object.entries(groupProgress(coreItems, 'subject'))
    .map(([name, stats]) => ({ name, score: stats.completed }))
    .filter((item) => item.score > 0);

  const fullStackStrong = fullStackItems
    .filter((item) => item.status === LearningStatus.COMPLETED)
    .map((item) => ({ name: item.technology, score: 1 }));

  return [...dsaStrong, ...coreStrong, ...fullStackStrong].sort((a, b) => b.score - a.score).slice(0, 5);
}

function groupBy<T>(items: T[], keyFactory: (item: T) => string) {
  return items.reduce((map, item) => {
    const key = keyFactory(item);
    map.set(key, [...(map.get(key) ?? []), item]);
    return map;
  }, new Map<string, T[]>());
}

function groupProgress<T extends Record<string, string | LearningStatus>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, { total: number; completed: number; revisionNeeded: number }>>((acc, item) => {
    const name = String(item[key]);
    acc[name] ??= { total: 0, completed: 0, revisionNeeded: 0 };
    acc[name].total += 1;
    acc[name].completed += item.status === LearningStatus.COMPLETED ? 1 : 0;
    acc[name].revisionNeeded += item.status === LearningStatus.REVISION_NEEDED ? 1 : 0;
    return acc;
  }, {});
}
