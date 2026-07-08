import type { ChartPoint } from './learning';

export type ResumeVersion = {
  id: string;
  resumeName: string;
  resumeVersion: string;
  targetRole: string;
  lastUpdatedDate: string;
  fileName: string | null;
  fileMimeType: string | null;
  fileData: string | null;
  checklistProjects: boolean;
  checklistSkills: boolean;
  checklistEducation: boolean;
  checklistExperience: boolean;
  checklistAchievements: boolean;
  checklistCertifications: boolean;
  atsContactInformation: boolean;
  atsSkillsSection: boolean;
  atsProjectsSection: boolean;
  atsKeywords: boolean;
  atsFormatting: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ResumeInput = Omit<ResumeVersion, 'id' | 'createdAt' | 'updatedAt'>;

export type ResumeStatistics = {
  totalResumes: number;
  resumeScore: number;
  atsScore: number;
  latestResumeName: string | null;
  charts: {
    resumeReadiness: ChartPoint[];
  };
};
