import {
  CoreCSSubject,
  DsaDifficulty,
  DsaProblemStatus,
  FullStackTechnology,
  LearningStatus,
  StudySessionCategory,
} from '@prisma/client';
import { z } from 'zod';

const optionalUrl = z.string().trim().url().max(500).optional().nullable().or(z.literal(''));
const optionalNotes = z.string().trim().max(2000).optional().nullable();

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
  'Arrays',
  'Strings',
  'Hashing',
  'Queue',
  'BST',
  'Heap',
  'DP',
] as const;

export const dsaFiltersSchema = z.object({
  query: z.object({
    search: z.string().trim().max(120).optional(),
    topic: z.string().trim().max(80).optional(),
    difficulty: z.nativeEnum(DsaDifficulty).optional(),
    status: z.nativeEnum(DsaProblemStatus).optional(),
    sortBy: z.enum(['date', 'difficulty']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    catalog: z.enum(['neetcode150']).optional(),
  }),
});

export const createDsaProblemSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(160),
    topic: z.string().trim().min(2).max(80),
    difficulty: z.nativeEnum(DsaDifficulty),
    status: z.nativeEnum(DsaProblemStatus).default(DsaProblemStatus.PENDING),
    leetcodeLink: optionalUrl,
    youtubeLink: optionalUrl,
    notes: optionalNotes,
  }),
});

export const updateDsaProblemSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createDsaProblemSchema.shape.body.partial(),
});

export const learningItemIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const upsertCoreCSSchema = z.object({
  body: z.object({
    subject: z.nativeEnum(CoreCSSubject),
    topic: z.string().trim().min(2).max(120),
    status: z.nativeEnum(LearningStatus),
    notes: optionalNotes,
  }),
});

export const updateCoreCSSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    topic: z.string().trim().min(2).max(120).optional(),
    status: z.nativeEnum(LearningStatus).optional(),
    notes: optionalNotes,
  }),
});

export const upsertFullStackSchema = z.object({
  body: z.object({
    technology: z.nativeEnum(FullStackTechnology),
    status: z.nativeEnum(LearningStatus),
    notes: optionalNotes,
  }),
});

export const updateFullStackSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.nativeEnum(LearningStatus).optional(),
    notes: optionalNotes,
  }),
});

export const createStudySessionSchema = z.object({
  body: z.object({
    date: z.string().datetime(),
    durationMinutes: z.number().int().min(1).max(1440),
    category: z.nativeEnum(StudySessionCategory),
    notes: optionalNotes,
  }),
});

export const updateStudySessionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createStudySessionSchema.shape.body.partial(),
});

export type DsaFiltersInput = z.infer<typeof dsaFiltersSchema>['query'];
export type CreateDsaProblemInput = z.infer<typeof createDsaProblemSchema>['body'];
export type UpdateDsaProblemInput = z.infer<typeof updateDsaProblemSchema>['body'];
export type UpsertCoreCSInput = z.infer<typeof upsertCoreCSSchema>['body'];
export type UpdateCoreCSInput = z.infer<typeof updateCoreCSSchema>['body'];
export type UpsertFullStackInput = z.infer<typeof upsertFullStackSchema>['body'];
export type UpdateFullStackInput = z.infer<typeof updateFullStackSchema>['body'];
export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>['body'];
export type UpdateStudySessionInput = z.infer<typeof updateStudySessionSchema>['body'];
