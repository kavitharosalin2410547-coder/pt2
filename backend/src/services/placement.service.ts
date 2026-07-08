import { PlacementStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreatePlacementApplicationInput,
  PlacementFiltersInput,
  UpdatePlacementApplicationInput,
} from '../validators/placement.validators.js';

const interviewStatuses: PlacementStatus[] = [PlacementStatus.INTERVIEW_SCHEDULED, PlacementStatus.INTERVIEW_CLEARED];
const oaSuccessStatuses: PlacementStatus[] = [
  PlacementStatus.OA_CLEARED,
  PlacementStatus.INTERVIEW_SCHEDULED,
  PlacementStatus.INTERVIEW_CLEARED,
  PlacementStatus.SELECTED,
];
const interviewSuccessStatuses: PlacementStatus[] = [PlacementStatus.INTERVIEW_CLEARED, PlacementStatus.SELECTED];

export const placementService = {
  async listApplications(userId: string, filters: PlacementFiltersInput) {
    const packageMin = filters.packageMin === undefined ? undefined : Number(filters.packageMin);
    const packageMax = filters.packageMax === undefined ? undefined : Number(filters.packageMax);
    const where: Prisma.PlacementApplicationWhereInput = {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.company ? { companyName: { contains: filters.company, mode: 'insensitive' } } : {}),
      ...(filters.role ? { role: { contains: filters.role, mode: 'insensitive' } } : {}),
      ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
      ...(packageMin !== undefined || packageMax !== undefined
        ? {
            packageLPA: {
              ...(packageMin !== undefined ? { gte: packageMin } : {}),
              ...(packageMax !== undefined ? { lte: packageMax } : {}),
            },
          }
        : {}),
    };

    return prisma.placementApplication.findMany({
      where,
      orderBy: [{ applicationDate: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async createApplication(userId: string, input: CreatePlacementApplicationInput) {
    return prisma.placementApplication.create({
      data: {
        companyName: input.companyName,
        role: input.role,
        packageLPA: input.packageLPA,
        location: input.location,
        applicationDate: new Date(input.applicationDate),
        deadlineDate: new Date(input.deadlineDate),
        status: input.status,
        round: input.round,
        notes: input.notes || null,
        jobLink: input.jobLink || null,
        userId,
      },
    });
  },

  async updateApplication(userId: string, applicationId: string, input: UpdatePlacementApplicationInput) {
    await this.ensureApplicationOwnership(userId, applicationId);

    return prisma.placementApplication.update({
      where: { id: applicationId },
      data: {
        ...(input.companyName !== undefined ? { companyName: input.companyName } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.packageLPA !== undefined ? { packageLPA: input.packageLPA } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.applicationDate !== undefined ? { applicationDate: new Date(input.applicationDate) } : {}),
        ...(input.deadlineDate !== undefined ? { deadlineDate: new Date(input.deadlineDate) } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.round !== undefined ? { round: input.round } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
        ...(input.jobLink !== undefined ? { jobLink: input.jobLink || null } : {}),
      },
    });
  },

  async deleteApplication(userId: string, applicationId: string) {
    await this.ensureApplicationOwnership(userId, applicationId);
    await prisma.placementApplication.delete({ where: { id: applicationId } });
  },

  async getStatistics(userId: string) {
    const applications = await prisma.placementApplication.findMany({ where: { userId } });
    const totalCompanies = applications.length;
    const applied = applications.filter((item) => item.status !== PlacementStatus.WISHLIST).length;
    const oaCleared = applications.filter((item) => oaSuccessStatuses.includes(item.status)).length;
    const interviews = applications.filter((item) => interviewStatuses.includes(item.status) || item.status === PlacementStatus.SELECTED).length;
    const selected = applications.filter((item) => item.status === PlacementStatus.SELECTED).length;
    const rejected = applications.filter((item) => item.status === PlacementStatus.REJECTED).length;
    const oaAttempts = applications.filter((item) => item.status !== PlacementStatus.WISHLIST && item.status !== PlacementStatus.APPLIED).length;
    const interviewAttempts = applications.filter((item) => interviewStatuses.includes(item.status) || item.status === PlacementStatus.SELECTED).length;

    return {
      totalCompanies,
      applied,
      oaCleared,
      interviews,
      selected,
      rejected,
      applicationsSubmitted: applied,
      conversionRate: rate(selected, applied),
      oaSuccessRate: rate(oaCleared, oaAttempts),
      interviewSuccessRate: rate(applications.filter((item) => interviewSuccessStatuses.includes(item.status)).length, interviewAttempts),
      selectionRate: rate(selected, totalCompanies),
    };
  },

  async ensureApplicationOwnership(userId: string, applicationId: string) {
    const application = await prisma.placementApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      throw new AppError('Placement application not found', 404, 'PLACEMENT_APPLICATION_NOT_FOUND');
    }
  },
};

function rate(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}
