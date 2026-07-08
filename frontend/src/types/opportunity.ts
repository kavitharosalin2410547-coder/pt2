export type OpportunityType = 'HACKATHON' | 'INTERNSHIP' | 'CONTEST' | 'FELLOWSHIP';

export interface Opportunity {
  id: string;
  title: string;
  organizer: string;
  type: OpportunityType;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  link: string;
  prizePool?: string | null;
  teamSize?: string | null;
  mode?: string | null;
  isRegistered: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
