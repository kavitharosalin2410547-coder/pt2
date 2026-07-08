import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type { CreateResumeInput, UpdateResumeInput } from '../validators/resume.validators.js';

const checklistKeys = [
  'checklistProjects',
  'checklistSkills',
  'checklistEducation',
  'checklistExperience',
  'checklistAchievements',
  'checklistCertifications',
] as const;

const atsKeys = [
  'atsContactInformation',
  'atsSkillsSection',
  'atsProjectsSection',
  'atsKeywords',
  'atsFormatting',
] as const;

export const resumeService = {
  async listResumes(userId: string) {
    return prisma.resumeVersion.findMany({
      where: { userId },
      orderBy: [{ lastUpdatedDate: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async createResume(userId: string, input: CreateResumeInput) {
    return prisma.resumeVersion.create({
      data: {
        ...input,
        fileName: input.fileName || null,
        fileMimeType: input.fileMimeType || null,
        fileData: input.fileData || null,
        lastUpdatedDate: new Date(input.lastUpdatedDate),
        userId,
      },
    });
  },

  async updateResume(userId: string, resumeId: string, input: UpdateResumeInput) {
    await this.ensureResumeOwnership(userId, resumeId);
    return prisma.resumeVersion.update({
      where: { id: resumeId },
      data: {
        ...(input.resumeName !== undefined ? { resumeName: input.resumeName } : {}),
        ...(input.resumeVersion !== undefined ? { resumeVersion: input.resumeVersion } : {}),
        ...(input.targetRole !== undefined ? { targetRole: input.targetRole } : {}),
        ...(input.lastUpdatedDate !== undefined ? { lastUpdatedDate: new Date(input.lastUpdatedDate) } : {}),
        ...(input.fileName !== undefined ? { fileName: input.fileName || null } : {}),
        ...(input.fileMimeType !== undefined ? { fileMimeType: input.fileMimeType || null } : {}),
        ...(input.fileData !== undefined ? { fileData: input.fileData || null } : {}),
        ...(input.checklistProjects !== undefined ? { checklistProjects: input.checklistProjects } : {}),
        ...(input.checklistSkills !== undefined ? { checklistSkills: input.checklistSkills } : {}),
        ...(input.checklistEducation !== undefined ? { checklistEducation: input.checklistEducation } : {}),
        ...(input.checklistExperience !== undefined ? { checklistExperience: input.checklistExperience } : {}),
        ...(input.checklistAchievements !== undefined ? { checklistAchievements: input.checklistAchievements } : {}),
        ...(input.checklistCertifications !== undefined ? { checklistCertifications: input.checklistCertifications } : {}),
        ...(input.atsContactInformation !== undefined ? { atsContactInformation: input.atsContactInformation } : {}),
        ...(input.atsSkillsSection !== undefined ? { atsSkillsSection: input.atsSkillsSection } : {}),
        ...(input.atsProjectsSection !== undefined ? { atsProjectsSection: input.atsProjectsSection } : {}),
        ...(input.atsKeywords !== undefined ? { atsKeywords: input.atsKeywords } : {}),
        ...(input.atsFormatting !== undefined ? { atsFormatting: input.atsFormatting } : {}),
      },
    });
  },

  async deleteResume(userId: string, resumeId: string) {
    await this.ensureResumeOwnership(userId, resumeId);
    await prisma.resumeVersion.delete({ where: { id: resumeId } });
  },

  async getStatistics(userId: string) {
    const resumes = await prisma.resumeVersion.findMany({ where: { userId } });
    const latest = resumes.sort((a, b) => b.lastUpdatedDate.getTime() - a.lastUpdatedDate.getTime())[0];
    const resumeScore = latest ? completion(latest, checklistKeys) : 0;
    const atsScore = latest ? completion(latest, atsKeys) : 0;

    return {
      totalResumes: resumes.length,
      resumeScore,
      atsScore,
      latestResumeName: latest?.resumeName ?? null,
      charts: {
        resumeReadiness: [
          { name: 'Resume', value: resumeScore },
          { name: 'ATS', value: atsScore },
        ],
      },
    };
  },

  async ensureResumeOwnership(userId: string, resumeId: string) {
    const resume = await prisma.resumeVersion.findFirst({ where: { id: resumeId, userId } });
    if (!resume) {
      throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
    }
  },
};

function completion(item: Record<string, unknown>, keys: readonly string[]) {
  return Math.round((keys.filter((key) => item[key] === true).length / keys.length) * 100);
}
