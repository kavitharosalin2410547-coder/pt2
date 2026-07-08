import type { CoreCSSubject, DsaDifficulty, DsaProblemStatus, FullStackTechnology, LearningStatus } from '../types/learning';

export const dsaTopics = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
] as const;

export const legacyDsaTopics = [
  'Arrays',
  'Strings',
  'Hashing',
  'Queue',
  'BST',
  'Heap',
  'DP',
];

export const allDsaTopics = [...dsaTopics, ...legacyDsaTopics];

export const neetCode150TopicTargets: Record<(typeof dsaTopics)[number], number> = {
  'Arrays & Hashing': 9,
  'Two Pointers': 5,
  'Sliding Window': 6,
  Stack: 6,
  'Binary Search': 7,
  'Linked List': 11,
  Trees: 15,
  Tries: 3,
  'Heap / Priority Queue': 7,
  Backtracking: 10,
  Graphs: 13,
  'Advanced Graphs': 6,
  '1-D Dynamic Programming': 12,
  '2-D Dynamic Programming': 11,
  Greedy: 8,
  Intervals: 6,
  'Math & Geometry': 8,
  'Bit Manipulation': 7,
};

export const neetCode150Total = Object.values(neetCode150TopicTargets).reduce((total, count) => total + count, 0);

export const difficulties: DsaDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
export const dsaStatuses: DsaProblemStatus[] = ['PENDING', 'SOLVED', 'REVISION_NEEDED'];
export const learningStatuses: LearningStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVISION_NEEDED'];
export const coreSubjects: CoreCSSubject[] = ['OS', 'DBMS', 'CN', 'OOP'];
export const fullStackTechnologies: FullStackTechnology[] = ['REACT', 'ANGULAR', 'SPRING_BOOT', 'DOTNET'];

export const labels: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  SOLVED: 'Solved',
  PENDING: 'Not Started',
  REVISION_NEEDED: 'Revision Needed',
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CORE_CS: 'Core CS',
  FULL_STACK: 'Full Stack',
  SPRING_BOOT: 'Spring Boot',
  DOTNET: '.NET',
  REACT: 'React',
  ANGULAR: 'Angular',
  OS: 'Operating Systems',
  DBMS: 'DBMS',
  CN: 'Computer Networks',
  OOP: 'OOP',
  DSA: 'DSA',
  APTITUDE: 'Aptitude',
};

export function label(value: string) {
  return labels[value] ?? value;
}

export function toDateInput(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}
