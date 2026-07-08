import { PlacementRound, PlacementStatus } from '@prisma/client';
import { z } from 'zod';

const dateString = z.string().datetime();

export const placementFiltersSchema = z.object({
  query: z.object({
    status: z.nativeEnum(PlacementStatus).optional(),
    company: z.string().trim().max(120).optional(),
    role: z.string().trim().max(120).optional(),
    location: z.string().trim().max(120).optional(),
    packageMin: z.coerce.number().min(0).optional(),
    packageMax: z.coerce.number().min(0).optional(),
  }),
});

export const createPlacementApplicationSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(2).max(120),
    role: z.string().trim().min(2).max(120),
    packageLPA: z.number().min(0),
    location: z.string().trim().min(2).max(120),
    applicationDate: dateString,
    deadlineDate: dateString,
    status: z.nativeEnum(PlacementStatus).default(PlacementStatus.WISHLIST),
    round: z.nativeEnum(PlacementRound).default(PlacementRound.NONE),
    notes: z.string().trim().max(2000).optional().nullable(),
    jobLink: z.string().trim().url().max(500).optional().nullable().or(z.literal('')),
  }),
});

export const updatePlacementApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: createPlacementApplicationSchema.shape.body.partial(),
});

export const placementApplicationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type PlacementFiltersInput = z.infer<typeof placementFiltersSchema>['query'];
export type CreatePlacementApplicationInput = z.infer<typeof createPlacementApplicationSchema>['body'];
export type UpdatePlacementApplicationInput = z.infer<typeof updatePlacementApplicationSchema>['body'];
