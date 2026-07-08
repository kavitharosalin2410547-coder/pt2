import type { Request, Response } from 'express';
import { opportunityService } from '../services/opportunity.service.js';
import { getAuthenticatedUserId, getRequiredParam } from '../utils/request.js';
import type { CreateOpportunityInput, UpdateOpportunityInput } from '../services/opportunity.service.js';

// Curated live hackathon / contest data
const LIVE_HACKATHONS = [
  { id: 'sih-2025', title: 'Smart India Hackathon 2025', organizer: 'AICTE / Govt of India', type: 'HACKATHON', mode: 'Offline', prizePool: '₹1,00,000+', teamSize: '2–6', link: 'https://www.sih.gov.in', registrationDeadline: '2025-09-15', startDate: '2025-10-01', endDate: '2025-10-02', tags: ['AI', 'Social Impact', 'Government'], eligibility: 'All engineering students' },
  { id: 'hackwithinfy-2025', title: 'HackWithInfy 2025', organizer: 'Infosys', type: 'HACKATHON', mode: 'Online', prizePool: '₹5,00,000', teamSize: '1–3', link: 'https://www.infosys.com/hackwithinfy.html', registrationDeadline: '2025-08-30', startDate: '2025-09-10', endDate: '2025-09-12', tags: ['Full Stack', 'AI', 'Corporate'], eligibility: '2025–2026 batch engineering students' },
  { id: 'tcs-codevita-2025', title: 'TCS CodeVita 2025', organizer: 'Tata Consultancy Services', type: 'CONTEST', mode: 'Online', prizePool: 'PPO + ₹2,00,000', teamSize: '1', link: 'https://www.tcscodevita.com', registrationDeadline: '2025-08-20', startDate: '2025-09-01', endDate: '2025-09-30', tags: ['Competitive Programming', 'Pre-placement'], eligibility: 'Final / pre-final year students' },
  { id: 'techgig-2025', title: 'TechGig Code Gladiators 2025', organizer: 'TechGig / Times Internet', type: 'CONTEST', mode: 'Online', prizePool: '₹5,00,000', teamSize: '1', link: 'https://www.techgig.com/codegladiators', registrationDeadline: '2025-09-10', startDate: '2025-09-15', endDate: '2025-11-30', tags: ['Algorithms', 'DSA'], eligibility: 'All IT professionals and students' },
  { id: 'flipkart-grid-6', title: 'Flipkart Grid 6.0', organizer: 'Flipkart', type: 'HACKATHON', mode: 'Online + Offline Finals', prizePool: '₹7,50,000 + PPO', teamSize: '1–3', link: 'https://unstop.com/hackathons/flipkart-grid-60', registrationDeadline: '2025-08-10', startDate: '2025-08-15', endDate: '2025-10-15', tags: ['E-commerce', 'AI/ML'], eligibility: 'Pre-final and final year students' },
  { id: 'amazon-hackon-2025', title: 'Amazon HackOn 2025', organizer: 'Amazon India', type: 'HACKATHON', mode: 'Online', prizePool: 'PPO + ₹3,00,000', teamSize: '2–4', link: 'https://amazon.in/hackon', registrationDeadline: '2025-09-30', startDate: '2025-10-10', endDate: '2025-11-30', tags: ['AWS', 'Cloud', 'AI'], eligibility: 'All UG/PG engineering students' },
  { id: 'microsoft-imagine-2025', title: 'Microsoft Imagine Cup 2025', organizer: 'Microsoft', type: 'HACKATHON', mode: 'Online + Global Finals', prizePool: '$100,000 USD', teamSize: '1–4', link: 'https://imaginecup.microsoft.com', registrationDeadline: '2025-11-30', startDate: '2025-12-01', endDate: '2026-03-31', tags: ['Azure', 'AI', 'Global', 'Social Impact'], eligibility: 'Students aged 16+ in any program' },
  { id: 'google-hashcode-2026', title: 'Google Hash Code 2026', organizer: 'Google', type: 'CONTEST', mode: 'Online', prizePool: 'Trip to Google HQ', teamSize: '2–4', link: 'https://codingcompetitions.withgoogle.com/hashcode', registrationDeadline: '2026-01-15', startDate: '2026-02-01', endDate: '2026-02-28', tags: ['Optimization', 'Algorithms', 'Google'], eligibility: 'Students and professionals worldwide' },
  { id: 'acm-icpc-india-2025', title: 'ACM ICPC India 2025', organizer: 'ACM / ICPC Foundation', type: 'CONTEST', mode: 'Offline (Regional)', prizePool: 'World Finals berth', teamSize: '3', link: 'https://icpc.global', registrationDeadline: '2025-09-01', startDate: '2025-10-15', endDate: '2025-11-30', tags: ['Competitive Programming', 'Prestigious'], eligibility: 'Undergraduate students only' },
  { id: 'hackerearth-monthly', title: 'HackerEarth Monthly Challenge', organizer: 'HackerEarth', type: 'CONTEST', mode: 'Online', prizePool: '$500', teamSize: '1', link: 'https://www.hackerearth.com/challenges/', registrationDeadline: '2025-09-28', startDate: '2025-09-28', endDate: '2025-09-30', tags: ['Competitive Programming'], eligibility: 'Open to all' },
];

export const opportunityController = {
  async list(request: Request, response: Response) {
    const type = request.query.type as string | undefined;
    const opportunities = await opportunityService.list(getAuthenticatedUserId(request), type as any);
    response.json({ data: opportunities });
  },

  async liveFeed(_request: Request, response: Response) {
    const now = new Date();
    const feed = LIVE_HACKATHONS
      .map((h) => {
        const deadline = new Date(h.registrationDeadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...h, daysLeft, isExpired: daysLeft < 0 };
      })
      .sort((a, b) => {
        if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
        return a.daysLeft - b.daysLeft;
      });
    response.json({ data: feed });
  },

  async create(request: Request, response: Response) {
    const opportunity = await opportunityService.create(
      getAuthenticatedUserId(request),
      request.body as CreateOpportunityInput,
    );
    response.status(201).json({ data: opportunity });
  },

  async update(request: Request, response: Response) {
    const opportunity = await opportunityService.update(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
      request.body as UpdateOpportunityInput,
    );
    response.json({ data: opportunity });
  },

  async remove(request: Request, response: Response) {
    await opportunityService.remove(
      getAuthenticatedUserId(request),
      getRequiredParam(request, 'id'),
    );
    response.status(204).send();
  },
};
