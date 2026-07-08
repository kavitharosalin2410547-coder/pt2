import { StudyMode } from '@prisma/client';
import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  body: z.object({
    studyMode: z.nativeEnum(StudyMode),
  }),
});

export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>['body'];
