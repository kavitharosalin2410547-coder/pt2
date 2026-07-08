import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/AppError.js';

// Models in preference order — all free on Groq
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // best quality, free tier
  'llama-3.1-8b-instant',      // faster, lower latency
  'llama3-70b-8192',           // fallback
  'llama3-8b-8192',            // lightest fallback
  'mixtral-8x7b-32768',        // wide context fallback
];

const SYSTEM_PROMPT = `You are an expert placement preparation assistant for engineering students preparing for campus placements in India. You help with:
- Data Structures & Algorithms (DSA) doubts
- Core CS subjects: OS, DBMS, Computer Networks, OOP
- HR interview questions and behavioral answers
- System Design basics
- Project explanations and resume tips
- Study roadmap and preparation strategy

Keep answers concise, practical, and student-friendly. Use examples. When explaining DSA, include time/space complexity.`;

function getGroqClient(): Groq {
  if (!env.groqApiKey) {
    throw new AppError(
      'GROQ_API_KEY is not set. Add it to backend/.env and restart the server.',
      500,
      'GROQ_KEY_MISSING',
    );
  }
  return new Groq({ apiKey: env.groqApiKey });
}

async function callGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const groq = getGroqClient();

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  let lastError = 'Unknown error';

  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Skip to next model on model-not-found or quota=0 errors
      const isModelUnavailable =
        msg.includes('404') ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('decommissioned') ||
        (msg.includes('429') && msg.includes('limit: 0'));
      if (isModelUnavailable) {
        lastError = `${model}: ${msg}`;
        continue;
      }
      throw new AppError(`Groq API error: ${msg}`, 502, 'GROQ_API_ERROR');
    }
  }

  throw new AppError(
    `No working Groq model found. Last error: ${lastError}`,
    502,
    'GROQ_MODEL_UNAVAILABLE',
  );
}

function parseJson<T>(raw: string, pattern: RegExp): T {
  const match = raw.match(pattern);
  if (!match) throw new AppError('AI returned unexpected format', 502, 'AI_PARSE_ERROR');
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    throw new AppError('AI returned malformed JSON', 502, 'AI_PARSE_ERROR');
  }
}

export const aiService = {
  async chat(userMessage: string): Promise<string> {
    return callGroq(userMessage, SYSTEM_PROMPT);
  },

  async generateDailyPlan(userId: string): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const [weakDsa, pendingCoreCS, todayTasks, upcomingTasks] = await Promise.all([
      prisma.dSAProblem.findMany({
        where: { userId, status: 'REVISION_NEEDED' },
        select: { topic: true },
      }),
      prisma.coreCSProgress.findMany({
        where: { userId, status: 'NOT_STARTED' },
        select: { subject: true, topic: true },
        take: 5,
      }),
      prisma.task.findMany({
        where: { userId, completed: false, dueDate: { gte: today, lte: todayEnd } },
        select: { title: true, category: true },
      }),
      prisma.task.findMany({
        where: { userId, completed: false, dueDate: { gt: todayEnd, lte: threeDaysLater } },
        select: { title: true, dueDate: true },
      }),
    ]);

    const weakDsaTopics = [...new Set(weakDsa.map((p) => p.topic))];
    const pendingCoreCSTitles = pendingCoreCS.map((p) => `${p.subject} - ${p.topic}`);
    const todayTaskTitles = todayTasks.map((t) => `[${t.category}] ${t.title}`);
    const upcomingDeadlines = upcomingTasks.map(
      (t) => `${t.title} (due ${t.dueDate.toLocaleDateString()})`,
    );

    const prompt = `Generate a structured study plan for today based on this student's data:
- Weak DSA topics needing revision: ${weakDsaTopics.join(', ') || 'none'}
- Pending Core CS topics: ${pendingCoreCSTitles.join(', ') || 'none'}
- Today's scheduled tasks: ${todayTaskTitles.join(', ') || 'none'}
- Upcoming deadlines (within 3 days): ${upcomingDeadlines.join(', ') || 'none'}
- Daily study hours goal: 4 hours

Output a prioritized schedule broken into time blocks. Be specific. Format as a clean numbered list with time estimates.`;

    return callGroq(prompt, SYSTEM_PROMPT);
  },

  async generateInterviewQuestions(company: string, category: string): Promise<Array<{
    question: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    notes: string;
  }>> {
    const prompt = `Generate 8 real, specific interview questions commonly asked by ${company} for ${category.replace(/_/g, ' ')} interviews.

The questions should reflect ${company}'s actual interview culture and difficulty level.

Respond ONLY with a JSON array, no markdown, no extra text:
[
  {
    "question": "The exact interview question",
    "difficulty": "EASY",
    "notes": "Key points to cover in the answer"
  }
]

difficulty must be "EASY", "MEDIUM", or "HARD". Generate a mix.`;

    const raw = await callGroq(prompt);
    return parseJson<Array<{ question: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD'; notes: string }>>(raw, /\[[\s\S]*\]/);
  },

  async scoreResume(resumeText: string): Promise<{
    score: number;
    breakdown: { keywords: number; format: number; sections: number; impact: number; brevity: number };
    strengths: string[];
    improvements: string[];
  }> {
    const prompt = `You are an ATS (Applicant Tracking System) evaluator used by top tech companies.

Analyze this resume and give a detailed ATS compatibility score:

---
${resumeText.slice(0, 6000)}
---

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "score": <overall score 0-100>,
  "breakdown": {
    "keywords": <score 0-100>,
    "format": <score 0-100>,
    "sections": <score 0-100>,
    "impact": <score 0-100>,
    "brevity": <score 0-100>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const raw = await callGroq(prompt);
    return parseJson<{
      score: number;
      breakdown: { keywords: number; format: number; sections: number; impact: number; brevity: number };
      strengths: string[];
      improvements: string[];
    }>(raw, /\{[\s\S]*\}/);
  },

  async evaluateMockAnswer(question: string, answer: string, category: string): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    const prompt = `You are an expert interview panel evaluator for ${category.replace(/_/g, ' ')} interviews.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

Evaluate strictly and fairly. Respond ONLY with JSON (no markdown):
{
  "score": <score 1-10>,
  "feedback": "<2-3 sentences of concise overall feedback>",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"]
}`;

    const raw = await callGroq(prompt);
    return parseJson<{
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    }>(raw, /\{[\s\S]*\}/);
  },

  async generateMockQuestion(company: string, category: string, questionNumber: number): Promise<string> {
    const prompt = `Generate exactly 1 interview question that ${company} might ask in a ${category.replace(/_/g, ' ')} interview. This is question number ${questionNumber} in a series. Return ONLY the question text, nothing else.`;
    return (await callGroq(prompt)).trim();
  },
};
