export type PlacementStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'OA_SCHEDULED'
  | 'OA_CLEARED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_CLEARED'
  | 'SELECTED'
  | 'REJECTED';

export type PlacementRound = 'NONE' | 'OA' | 'TECHNICAL_1' | 'TECHNICAL_2' | 'MANAGERIAL' | 'HR' | 'FINAL';

export type PlacementApplication = {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  packageLPA: number;
  location: string;
  applicationDate: string;
  deadlineDate: string;
  status: PlacementStatus;
  round: PlacementRound;
  notes: string | null;
  jobLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlacementFormInput = {
  companyName: string;
  role: string;
  packageLPA: number;
  location: string;
  applicationDate: string;
  deadlineDate: string;
  jobLink: string;
  status: PlacementStatus;
  round: PlacementRound;
  notes: string;
};

export type PlacementFilters = {
  status?: PlacementStatus;
  company?: string;
  role?: string;
  packageMin?: number;
  packageMax?: number;
  location?: string;
};

export type PlacementStatistics = {
  totalCompanies: number;
  applied: number;
  oaCleared: number;
  interviews: number;
  selected: number;
  rejected: number;
  applicationsSubmitted: number;
  conversionRate: number;
  oaSuccessRate: number;
  interviewSuccessRate: number;
  selectionRate: number;
};
