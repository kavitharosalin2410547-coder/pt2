export type StudyMode = 'WEEKDAYS_ONLY' | 'ALTERNATE_DAYS' | 'WEEKENDS_ONLY';

export type StudyPreference = {
  id: string;
  studyMode: StudyMode;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
