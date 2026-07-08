import type { Request, Response } from 'express';
import { interviewService } from '../services/interview.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type {
  CreateInterviewQuestionInput,
  CreateMockInterviewInput,
  InterviewQuestionFiltersInput,
  UpdateInterviewQuestionInput,
  UpdateMockInterviewInput,
} from '../validators/interview.validators.js';

export const interviewController = {
  async listQuestions(request: Request, response: Response) {
    const questions = await interviewService.listQuestions(
      getAuthenticatedUserId(request),
      request.query as InterviewQuestionFiltersInput,
    );
    response.json({ data: questions });
  },

  async createQuestion(request: Request, response: Response) {
    const question = await interviewService.createQuestion(
      getAuthenticatedUserId(request),
      request.body as CreateInterviewQuestionInput,
    );
    response.status(201).json({ data: question });
  },

  async updateQuestion(request: Request, response: Response) {
    const question = await interviewService.updateQuestion(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateInterviewQuestionInput,
    );
    response.json({ data: question });
  },

  async deleteQuestion(request: Request, response: Response) {
    await interviewService.deleteQuestion(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async listMocks(request: Request, response: Response) {
    const mocks = await interviewService.listMockInterviews(getAuthenticatedUserId(request));
    response.json({ data: mocks });
  },

  async createMock(request: Request, response: Response) {
    const mock = await interviewService.createMockInterview(
      getAuthenticatedUserId(request),
      request.body as CreateMockInterviewInput,
    );
    response.status(201).json({ data: mock });
  },

  async updateMock(request: Request, response: Response) {
    const mock = await interviewService.updateMockInterview(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateMockInterviewInput,
    );
    response.json({ data: mock });
  },

  async deleteMock(request: Request, response: Response) {
    await interviewService.deleteMockInterview(getAuthenticatedUserId(request), getRequiredParam(request, 'id'));
    response.status(204).send();
  },

  async statistics(request: Request, response: Response) {
    const statistics = await interviewService.getStatistics(getAuthenticatedUserId(request));
    response.json({ data: statistics });
  },
};
