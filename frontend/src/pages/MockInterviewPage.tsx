import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, CheckCircle2, ChevronRight, Clock, Mic, RotateCcw, Sparkles, User, X } from 'lucide-react';
import { Button } from '../components/common/Button';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { aiService } from '../services/aiService';
import type { MockAnswerEval } from '../services/aiService';
import { getErrorMessage } from '../services/apiClient';

type Category = 'HR_INTERVIEW' | 'BEHAVIORAL' | 'DSA_INTERVIEW' | 'CORE_CS_INTERVIEW' | 'SYSTEM_DESIGN' | 'FULL_STACK_INTERVIEW';

const CATEGORY_LABELS: Record<Category, string> = {
  HR_INTERVIEW: 'HR Interview',
  BEHAVIORAL: 'Behavioral',
  DSA_INTERVIEW: 'DSA Interview',
  CORE_CS_INTERVIEW: 'Core CS Interview',
  SYSTEM_DESIGN: 'System Design',
  FULL_STACK_INTERVIEW: 'Full Stack Interview',
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  HR_INTERVIEW: 'Salary, expectations, background, motivation',
  BEHAVIORAL: 'Situational & behavioral (STAR method)',
  DSA_INTERVIEW: 'Data structures, algorithms, problem solving',
  CORE_CS_INTERVIEW: 'OS, DBMS, Networks, OOP concepts',
  SYSTEM_DESIGN: 'Architecture, scalability, design patterns',
  FULL_STACK_INTERVIEW: 'Frontend, backend, databases, deployment',
};

const TIME_LIMIT = 120; // seconds per question

type InterviewState = 'setup' | 'in-progress' | 'evaluating' | 'result' | 'finished';

interface QnA {
  question: string;
  answer: string;
  eval: MockAnswerEval | null;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function MockInterviewPage() {
  const [state, setState] = useState<InterviewState>('setup');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<Category>('HR_INTERVIEW');
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [currentQ, setCurrentQ] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [history, setHistory] = useState<QnA[]>([]);
  const [isLoadingQ, setIsLoadingQ] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer countdown
  useEffect(() => {
    if (state !== 'in-progress') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitAnswer(true); // auto-submit on timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentQ]);

  async function startInterview() {
    if (!company.trim()) { setError('Enter a company name'); return; }
    setError('');
    setHistory([]);
    setCurrentQ(0);
    setState('in-progress');
    setTimeLeft(TIME_LIMIT);
    setAnswer('');
    await loadQuestion(1);
  }

  async function loadQuestion(qNum: number) {
    setIsLoadingQ(true);
    setError('');
    try {
      const q = await aiService.generateMockQuestion(company, category, qNum);
      setQuestion(q);
      setTimeLeft(TIME_LIMIT);
      textareaRef.current?.focus();
    } catch (err) {
      setError(getErrorMessage(err));
      setState('setup');
    } finally {
      setIsLoadingQ(false);
    }
  }

  async function handleSubmitAnswer(timedOut = false) {
    clearInterval(timerRef.current!);
    const userAnswer = timedOut && !answer.trim() ? '(No answer — time ran out)' : answer.trim() || '(No answer provided)';

    setState('evaluating');
    try {
      const evaluation = await aiService.evaluateAnswer(question, userAnswer, category);
      const entry: QnA = { question, answer: userAnswer, eval: evaluation };
      const newHistory = [...history, entry];
      setHistory(newHistory);
      setState('result');
    } catch (err) {
      setError(getErrorMessage(err));
      setState('in-progress');
    }
  }

  async function nextQuestion() {
    const nextNum = currentQ + 2;
    if (currentQ + 1 >= totalQuestions) {
      setState('finished');
      return;
    }
    setCurrentQ((c) => c + 1);
    setAnswer('');
    setState('in-progress');
    await loadQuestion(nextNum);
  }

  function resetInterview() {
    setState('setup');
    setHistory([]);
    setCurrentQ(0);
    setAnswer('');
    setQuestion('');
    setError('');
  }

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.eval?.score ?? 0), 0) / history.length * 10)
    : 0;

  const timerUrgent = timeLeft <= 30;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Mock Interview</h2>
        <p className="mt-1 text-sm text-slate-500">AI-powered timed interview with per-answer evaluation and final score.</p>
      </div>

      {error && <ErrorState message={error} />}

      {/* ── Setup ── */}
      {state === 'setup' && (
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-card dark:border-ink-3 dark:bg-ink-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure Interview</h3>
                <p className="text-xs text-slate-500">Set up your mock interview session</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Target Company</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                  placeholder="e.g. Google, Amazon, Infosys, TCS..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Interview Type</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        category === cat
                          ? 'border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/30'
                          : 'border-slate-200 bg-surface-2 hover:border-brand-300 dark:border-ink-3 dark:bg-ink-3'
                      }`}
                    >
                      <p className={`text-xs font-bold ${category === cat ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{CATEGORY_DESCRIPTIONS[cat]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Number of Questions: <span className="text-brand-600 dark:text-brand-400">{totalQuestions}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>3 (quick)</span>
                  <span>10 (thorough)</span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">2 minutes per question</p>
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Answer will auto-submit when time runs out. Total: ~{totalQuestions * 2} minutes
                </p>
              </div>

              <Button className="w-full" onClick={startInterview}>
                <Sparkles size={15} />
                Start Mock Interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── In Progress ── */}
      {(state === 'in-progress' || state === 'evaluating') && (
        <div className="space-y-4">
          {/* Progress + Timer header */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-card dark:border-ink-3 dark:bg-ink-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-xs font-black text-white shadow-glow">
                {currentQ + 1}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Question {currentQ + 1} of {totalQuestions}</p>
                <p className="text-xs text-slate-500">{company} · {CATEGORY_LABELS[category]}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-black ${timerUrgent ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-surface-2 text-slate-700 dark:bg-ink-3 dark:text-slate-200'}`}>
              <Clock size={14} className={timerUrgent ? 'animate-pulse' : ''} />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)' }}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">Interview Question</p>
                <p className="text-base font-semibold leading-relaxed">
                  {isLoadingQ ? (
                    <span className="flex items-center gap-2 text-indigo-300">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating question...
                    </span>
                  ) : question}
                </p>
              </div>
            </div>
          </div>

          {/* Answer */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-ink-3 dark:bg-ink-2">
            <div className="mb-3 flex items-center gap-2">
              <User size={14} className="text-brand-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Answer</p>
            </div>
            <textarea
              ref={textareaRef}
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-200 bg-surface-2 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
              placeholder="Type your answer here... Structure it clearly. Use examples and specific details."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={state === 'evaluating'}
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-400">{answer.length} characters</p>
              <Button onClick={() => handleSubmitAnswer(false)} isLoading={state === 'evaluating'} disabled={isLoadingQ}>
                Submit Answer
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Per-question Result ── */}
      {state === 'result' && history.length > 0 && (
        <div className="space-y-4">
          {(() => {
            const last = history[history.length - 1];
            const e = last.eval!;
            const scoreColor = e.score >= 8 ? 'text-emerald-500' : e.score >= 6 ? 'text-amber-500' : 'text-red-500';
            const scoreBg = e.score >= 8 ? 'bg-emerald-500' : e.score >= 6 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-ink-3 dark:bg-ink-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">AI Evaluation</h3>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${scoreBg} text-xl font-black text-white`}>
                        {e.score}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${scoreColor}`}>out of 10</p>
                        <p className="text-[10px] text-slate-400">Question {currentQ + 1}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl bg-surface-2 p-3 dark:bg-ink-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Question</p>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{last.question}</p>
                  </div>

                  <div className="mb-4 rounded-xl bg-surface-2 p-3 dark:bg-ink-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Answer</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{last.answer}</p>
                  </div>

                  <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-3 dark:border-brand-900/30 dark:bg-brand-950/20">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Feedback</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{e.feedback}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
                      <div className="mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Strengths</p>
                      </div>
                      <ul className="space-y-1">
                        {e.strengths.map((s, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">• {s}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
                      <div className="mb-2 flex items-center gap-1.5">
                        <AlertCircle size={13} className="text-amber-600 dark:text-amber-400" />
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Improvements</p>
                      </div>
                      <ul className="space-y-1">
                        {e.improvements.map((imp, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">• {imp}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={resetInterview}>
                    <X size={14} /> End Interview
                  </Button>
                  <Button onClick={nextQuestion}>
                    {currentQ + 1 >= totalQuestions ? 'See Final Results' : 'Next Question'}
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── Finished — Full summary ── */}
      {state === 'finished' && (
        <div className="space-y-5">
          {/* Hero score */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)' }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Mock Interview Complete</p>
              <p className="mt-2 text-7xl font-black">{avgScore}</p>
              <p className="text-xl text-indigo-200">/ 100</p>
              <p className="mt-2 text-sm text-indigo-200">
                {company} · {CATEGORY_LABELS[category]}
              </p>
              <p className="mt-3 text-sm font-semibold">
                {avgScore >= 80 ? '🚀 Outstanding performance!'
                : avgScore >= 65 ? '✅ Good — keep practicing!'
                : avgScore >= 50 ? '📈 Room to improve — review weak areas'
                : '💪 Keep practicing — you\'ll get there!'}
              </p>
              <div className="mx-auto mt-5 h-2 max-w-xs overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${avgScore}%` }} />
              </div>
            </div>
          </div>

          {/* Per-question summary */}
          <DashboardCard title={`Question Breakdown (${history.length} Questions)`}>
            <div className="space-y-3">
              {history.map((h, i) => {
                const score = h.eval?.score ?? 0;
                const sc = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={i} className="rounded-xl border border-slate-100 bg-surface-2 p-3 dark:border-ink-3 dark:bg-ink-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sc} text-xs font-black text-white`}>
                        {score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{h.question}</p>
                        {h.eval?.feedback && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{h.eval.feedback}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <div className="flex justify-center gap-3">
            <Button onClick={resetInterview}>
              <RotateCcw size={14} /> Take Another Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
