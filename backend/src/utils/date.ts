import type { StudyMode } from '@prisma/client';

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(first: Date, second: Date): boolean {
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

export function isValidStudyDay(date: Date, studyMode: StudyMode): boolean {
  const day = date.getDay();

  if (studyMode === 'WEEKDAYS_ONLY') {
    return day >= 1 && day <= 5;
  }

  if (studyMode === 'WEEKENDS_ONLY') {
    return day === 0 || day === 6;
  }

  const epoch = startOfDay(new Date('2024-01-01T00:00:00.000Z')).getTime();
  const diffDays = Math.floor((startOfDay(date).getTime() - epoch) / 86_400_000);
  return diffDays % 2 === 0;
}

export function getNextValidStudyDay(fromDate: Date, studyMode: StudyMode): Date {
  const candidate = startOfDay(fromDate);

  for (let index = 0; index < 14; index += 1) {
    if (isValidStudyDay(candidate, studyMode)) {
      return candidate;
    }

    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
}
