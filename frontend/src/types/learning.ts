export type DsaDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type DsaProblemStatus = 'SOLVED' | 'PENDING' | 'REVISION_NEEDED';
export type CoreCSSubject = 'OS' | 'DBMS' | 'CN' | 'OOP';
export type LearningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVISION_NEEDED';
export type FullStackTechnology = 'REACT' | 'ANGULAR' | 'SPRING_BOOT' | 'DOTNET';
export type StudySessionCategory = 'DSA' | 'CORE_CS' | 'FULL_STACK' | 'APTITUDE';

export type DSAProblem = {
  id: string;
  title: string;
  topic: string;
  difficulty: DsaDifficulty;
  status: DsaProblemStatus;
  leetcodeLink?: string | null;
  youtubeLink?: string | null;
  notes?: string | null;
  revisionCount: number;
  lastSolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DSAProblemInput = Omit<
  DSAProblem,
  'id' | 'revisionCount' | 'lastSolvedAt' | 'createdAt' | 'updatedAt'
>;

export type DSAFilters = {
  search?: string;
  topic?: string;
  difficulty?: DsaDifficulty | '';
  status?: DsaProblemStatus | '';
  sortBy?: 'date' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
  catalog?: 'neetcode150';
};

export type DSASummary = {
  total: number;
  solved: number;
  pending: number;
  revisionNeeded: number;
  solveRate: number;
};

export type CoreCSProgress = {
  id: string;
  subject: CoreCSSubject;
  topic: string;
  status: LearningStatus;
  notes?: string | null;
  updatedAt: string;
};

export type CoreCSInput = Pick<CoreCSProgress, 'subject' | 'topic' | 'status' | 'notes'>;

export type CoreCSSummary = {
  subject: CoreCSSubject;
  totalTopics: number;
  completedTopics: number;
  revisionNeeded: number;
  completionPercentage: number;
};

export type FullStackProgress = {
  id: string;
  technology: FullStackTechnology;
  status: LearningStatus;
  notes?: string | null;
  updatedAt: string;
};

export type FullStackInput = Pick<FullStackProgress, 'technology' | 'status' | 'notes'>;

export type FullStackSummary = {
  totalTechnologies: number;
  completedTechnologies: number;
  revisionNeeded: number;
  completionPercentage: number;
};

export type StudySession = {
  id: string;
  date: string;
  durationMinutes: number;
  category: StudySessionCategory;
  notes?: string | null;
  createdAt: string;
};

export type StudySessionInput = Pick<StudySession, 'date' | 'durationMinutes' | 'category' | 'notes'>;

export type StudySummary = {
  totalStudyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  consistencyStreak: number;
};

export type ChartPoint = { name: string; value: number };
export type AreaScore = { name: string; score: number };

export type LearningAnalytics = {
  dsa: DSASummary;
  coreCS: CoreCSSummary[];
  fullStack: FullStackSummary;
  study: StudySummary;
  charts: {
    studyHours: ChartPoint[];
    categoryDistribution: ChartPoint[];
    dsaProgress: ChartPoint[];
    subjectCompletion: ChartPoint[];
    weeklyProductivity: ChartPoint[];
  };
  weakAreas: AreaScore[];
  strongAreas: AreaScore[];
};
