import { InterviewQuestionStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateInterviewQuestionInput,
  CreateMockInterviewInput,
  InterviewQuestionFiltersInput,
  UpdateInterviewQuestionInput,
  UpdateMockInterviewInput,
} from '../validators/interview.validators.js';

export const interviewService = {
  async listQuestions(userId: string, filters: InterviewQuestionFiltersInput) {
    const where: Prisma.InterviewQuestionWhereInput = {
      userId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { question: { contains: filters.search, mode: 'insensitive' } },
              { answerNotes: { contains: filters.search, mode: 'insensitive' } },
              { userNotes: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.interviewQuestion.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async createQuestion(userId: string, input: CreateInterviewQuestionInput) {
    return prisma.interviewQuestion.create({
      data: {
        question: input.question,
        category: input.category,
        difficulty: input.difficulty,
        answerNotes: input.answerNotes || null,
        userNotes: input.userNotes || null,
        status: input.status,
        userId,
      },
    });
  },

  async updateQuestion(userId: string, questionId: string, input: UpdateInterviewQuestionInput) {
    await this.ensureQuestionOwnership(userId, questionId);
    return prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        ...(input.question !== undefined ? { question: input.question } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
        ...(input.answerNotes !== undefined ? { answerNotes: input.answerNotes || null } : {}),
        ...(input.userNotes !== undefined ? { userNotes: input.userNotes || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  },

  async deleteQuestion(userId: string, questionId: string) {
    await this.ensureQuestionOwnership(userId, questionId);
    await prisma.interviewQuestion.delete({ where: { id: questionId } });
  },

  async listMockInterviews(userId: string) {
    return prisma.mockInterview.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async createMockInterview(userId: string, input: CreateMockInterviewInput) {
    return prisma.mockInterview.create({
      data: {
        company: input.company,
        interviewType: input.interviewType,
        date: new Date(input.date),
        rating: input.rating,
        feedback: input.feedback || null,
        strengths: input.strengths || null,
        weaknesses: input.weaknesses || null,
        userId,
      },
    });
  },

  async updateMockInterview(userId: string, mockInterviewId: string, input: UpdateMockInterviewInput) {
    await this.ensureMockInterviewOwnership(userId, mockInterviewId);
    return prisma.mockInterview.update({
      where: { id: mockInterviewId },
      data: {
        ...(input.company !== undefined ? { company: input.company } : {}),
        ...(input.interviewType !== undefined ? { interviewType: input.interviewType } : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.feedback !== undefined ? { feedback: input.feedback || null } : {}),
        ...(input.strengths !== undefined ? { strengths: input.strengths || null } : {}),
        ...(input.weaknesses !== undefined ? { weaknesses: input.weaknesses || null } : {}),
      },
    });
  },

  async deleteMockInterview(userId: string, mockInterviewId: string) {
    await this.ensureMockInterviewOwnership(userId, mockInterviewId);
    await prisma.mockInterview.delete({ where: { id: mockInterviewId } });
  },

  async getStatistics(userId: string) {
    const [questions, mocks] = await Promise.all([
      prisma.interviewQuestion.findMany({ where: { userId } }),
      prisma.mockInterview.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    ]);

    const practiced = questions.filter((question) => question.status !== InterviewQuestionStatus.NOT_STARTED).length;
    const mastered = questions.filter((question) => question.status === InterviewQuestionStatus.MASTERED).length;
    const totalRating = mocks.reduce((sum, mock) => sum + mock.rating, 0);
    const averageRating = mocks.length === 0 ? 0 : Math.round((totalRating / mocks.length) * 10) / 10;
    const firstHalf = mocks.slice(0, Math.ceil(mocks.length / 2));
    const secondHalf = mocks.slice(Math.ceil(mocks.length / 2));

    return {
      totalQuestions: questions.length,
      questionsPracticed: practiced,
      questionsMastered: mastered,
      practiceCompletionPercentage: rate(practiced, questions.length),
      totalMockInterviews: mocks.length,
      averageRating,
      improvementTrend: average(secondHalf) - average(firstHalf),
      charts: {
        practiceProgress: [
          { name: 'Not Started', value: questions.length - practiced },
          { name: 'Practiced', value: questions.filter((question) => question.status === InterviewQuestionStatus.PRACTICED).length },
          { name: 'Mastered', value: mastered },
        ],
        mockRatings: mocks.map((mock) => ({
          name: mock.date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          value: mock.rating,
        })),
      },
    };
  },

  async ensureQuestionOwnership(userId: string, questionId: string) {
    const question = await prisma.interviewQuestion.findFirst({ where: { id: questionId, userId } });
    if (!question) {
      throw new AppError('Interview question not found', 404, 'INTERVIEW_QUESTION_NOT_FOUND');
    }
  },

  async ensureMockInterviewOwnership(userId: string, mockInterviewId: string) {
    const mockInterview = await prisma.mockInterview.findFirst({ where: { id: mockInterviewId, userId } });
    if (!mockInterview) {
      throw new AppError('Mock interview not found', 404, 'MOCK_INTERVIEW_NOT_FOUND');
    }
  },
};

function rate(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(items: Array<{ rating: number }>) {
  if (items.length === 0) {
    return 0;
  }

  return Math.round((items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10) / 10;
}
