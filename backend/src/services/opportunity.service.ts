import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';

type OpportunityType = 'HACKATHON' | 'INTERNSHIP' | 'CONTEST' | 'FELLOWSHIP';

function assertTableExists(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('does not exist') || msg.includes('P2021') || msg.includes('undefined')) {
    throw new AppError(
      'Database table "opportunities" not found. Run: cd backend && npx prisma migrate dev',
      503,
      'DB_MIGRATION_NEEDED',
    );
  }
  throw err;
}

export interface CreateOpportunityInput {
  title: string;
  organizer: string;
  type: OpportunityType;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  link: string;
  prizePool?: string;
  teamSize?: string;
  mode?: string;
}

export interface UpdateOpportunityInput {
  title?: string;
  organizer?: string;
  type?: OpportunityType;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  link?: string;
  prizePool?: string;
  teamSize?: string;
  mode?: string;
  isRegistered?: boolean;
}

export const opportunityService = {
  async list(userId: string, type?: OpportunityType) {
    try {
      return await (prisma as any).opportunity.findMany({
        where: { userId, ...(type ? { type } : {}) },
        orderBy: { registrationDeadline: 'asc' },
      });
    } catch (err) {
      assertTableExists(err);
    }
  },

  async create(userId: string, input: CreateOpportunityInput) {
    return (prisma as any).opportunity.create({
      data: {
        title: input.title,
        organizer: input.organizer,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        registrationDeadline: new Date(input.registrationDeadline),
        link: input.link,
        prizePool: input.prizePool ?? null,
        teamSize: input.teamSize ?? null,
        mode: input.mode ?? null,
        userId,
      },
    });
  },

  async update(userId: string, id: string, input: UpdateOpportunityInput) {
    await this.ensureOwnership(userId, id);

    return (prisma as any).opportunity.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.organizer !== undefined ? { organizer: input.organizer } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
        ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
        ...(input.registrationDeadline !== undefined
          ? { registrationDeadline: new Date(input.registrationDeadline) }
          : {}),
        ...(input.link !== undefined ? { link: input.link } : {}),
        ...(input.prizePool !== undefined ? { prizePool: input.prizePool ?? null } : {}),
        ...(input.teamSize !== undefined ? { teamSize: input.teamSize ?? null } : {}),
        ...(input.mode !== undefined ? { mode: input.mode ?? null } : {}),
        ...(input.isRegistered !== undefined ? { isRegistered: input.isRegistered } : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await (prisma as any).opportunity.delete({ where: { id } });
  },

  async ensureOwnership(userId: string, id: string) {
    const record = await (prisma as any).opportunity.findFirst({ where: { id, userId } });
    if (!record) {
      throw new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
    }
  },
};
