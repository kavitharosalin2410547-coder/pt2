export type ExamDateType = 'PLACEMENT' | 'EXAM' | 'INTERVIEW' | 'CONTEST';

export interface ExamDate {
  id: string;
  title: string;
  date: string;
  type: ExamDateType;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamDateInput {
  title: string;
  date: string;
  type: ExamDateType;
  notes?: string;
}
