import { z } from 'zod';

const dateString = z.string().datetime();

const resumePayload = z.object({
  resumeName: z.string().trim().min(2).max(120),
  resumeVersion: z.string().trim().min(1).max(40),
  targetRole: z.string().trim().min(2).max(120),
  lastUpdatedDate: dateString,
  fileName: z.string().trim().max(255).optional().nullable(),
  fileMimeType: z.string().trim().max(120).optional().nullable(),
  fileData: z.string().max(8_000_000).optional().nullable(),
  checklistProjects: z.boolean().default(false),
  checklistSkills: z.boolean().default(false),
  checklistEducation: z.boolean().default(false),
  checklistExperience: z.boolean().default(false),
  checklistAchievements: z.boolean().default(false),
  checklistCertifications: z.boolean().default(false),
  atsContactInformation: z.boolean().default(false),
  atsSkillsSection: z.boolean().default(false),
  atsProjectsSection: z.boolean().default(false),
  atsKeywords: z.boolean().default(false),
  atsFormatting: z.boolean().default(false),
});

export const createResumeSchema = z.object({
  body: resumePayload,
});

export const updateResumeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: resumePayload.partial(),
});

export const resumeIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>['body'];
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>['body'];
