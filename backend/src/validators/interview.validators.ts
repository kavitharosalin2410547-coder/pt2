import { InterviewCategory, InterviewDifficulty, InterviewQuestionStatus, MockInterviewType } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().datetime();

export const interviewQuestionFiltersSchema = z.object({
  query: z.object({
    category: z.nativeEnum(InterviewCategory).optional(),
    difficulty: z.nativeEnum(InterviewDifficulty).optional(),
    status: z.nativeEnum(InterviewQuestionStatus).optional(),
    search: z.string().trim().max(160).optional(),
  }),
});

export const createInterviewQuestionSchema = z.object({
  body: z.object({
    question: z.string().trim().min(5).max(1000),
    category: z.nativeEnum(InterviewCategory),
    difficulty: z.nativeEnum(InterviewDifficulty),
    answerNotes: z.string().trim().max(3000).optional().nullable(),
    userNotes: z.string().trim().max(3000).optional().nullable(),
    status: z.nativeEnum(InterviewQuestionStatus).default(InterviewQuestionStatus.NOT_STARTED),
  }),
});

export const updateInterviewQuestionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createInterviewQuestionSchema.shape.body.partial(),
});

export const createMockInterviewSchema = z.object({
  body: z.object({
    company: z.string().trim().min(2).max(120),
    interviewType: z.nativeEnum(MockInterviewType),
    date: dateString,
    rating: z.number().int().min(1).max(10),
    feedback: z.string().trim().max(3000).optional().nullable(),
    strengths: z.string().trim().max(2000).optional().nullable(),
    weaknesses: z.string().trim().max(2000).optional().nullable(),
  }),
});

export const updateMockInterviewSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createMockInterviewSchema.shape.body.partial(),
});

export const interviewIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type InterviewQuestionFiltersInput = z.infer<typeof interviewQuestionFiltersSchema>['query'];
export type CreateInterviewQuestionInput = z.infer<typeof createInterviewQuestionSchema>['body'];
export type UpdateInterviewQuestionInput = z.infer<typeof updateInterviewQuestionSchema>['body'];
export type CreateMockInterviewInput = z.infer<typeof createMockInterviewSchema>['body'];
export type UpdateMockInterviewInput = z.infer<typeof updateMockInterviewSchema>['body'];
