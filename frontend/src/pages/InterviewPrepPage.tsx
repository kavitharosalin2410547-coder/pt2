import { useCallback, useEffect, useState } from 'react';
import { Bot, MessageSquareText, Pencil, RotateCcw, Sparkles, Star, Trash2, X } from 'lucide-react';
import { LearningChart } from '../components/learning/LearningChart';
import { Button } from '../components/common/Button';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { Input } from '../components/common/Input';
import { LoadingState } from '../components/common/LoadingState';
import { Select } from '../components/common/Select';
import { StatCard } from '../components/common/StatCard';
import { useToast } from '../hooks/useToast';
import { aiService } from '../services/aiService';
import type { AIInterviewQuestion } from '../services/aiService';
import { interviewService } from '../services/interviewService';
import { resumeService } from '../services/resumeService';
import { getErrorMessage } from '../services/apiClient';
import type {
  InterviewCategory,
  InterviewDifficulty,
  InterviewQuestion,
  InterviewQuestionFilters,
  InterviewQuestionInput,
  InterviewQuestionStatus,
  InterviewStatistics,
  MockInterview,
  MockInterviewInput,
} from '../types/interview';
import type { ResumeStatistics } from '../types/resume';
import { formatDate } from '../utils/date';

const categoryOptions: Array<{ value: InterviewCategory; label: string }> = [
  { value: 'HR_INTERVIEW', label: 'HR Interview' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
  { value: 'DSA_INTERVIEW', label: 'DSA Interview' },
  { value: 'CORE_CS_INTERVIEW', label: 'Core CS Interview' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'FULL_STACK_INTERVIEW', label: 'Full Stack Interview' },
];

const difficultyOptions: Array<{ value: InterviewDifficulty; label: string }> = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const statusOptions: Array<{ value: InterviewQuestionStatus; label: string }> = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'PRACTICED', label: 'Practiced' },
  { value: 'MASTERED', label: 'Mastered' },
];

const emptyQuestion: InterviewQuestionInput = {
  question: '',
  category: 'HR_INTERVIEW',
  difficulty: 'MEDIUM',
  answerNotes: '',
  userNotes: '',
  status: 'NOT_STARTED',
};

const emptyMock: MockInterviewInput = {
  company: '',
  interviewType: 'HR_INTERVIEW',
  date: new Date().toISOString().slice(0, 10),
  rating: 7,
  feedback: '',
  strengths: '',
  weaknesses: '',
};

const DIFF_COLOR: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function InterviewPrepPage() {
  const { notify } = useToast();
  const [tab, setTab] = useState<'questions' | 'mocks' | 'ai-generator'>('ai-generator');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [mocks, setMocks] = useState<MockInterview[]>([]);
  const [statistics, setStatistics] = useState<InterviewStatistics | null>(null);
  const [resumeStatistics, setResumeStatistics] = useState<ResumeStatistics | null>(null);
  const [filters, setFilters] = useState<InterviewQuestionFilters>({});
  const [questionForm, setQuestionForm] = useState<InterviewQuestionInput>(emptyQuestion);
  const [mockForm, setMockForm] = useState<MockInterviewInput>(emptyMock);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [editingMock, setEditingMock] = useState<MockInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Generator state
  const [aiCompany, setAiCompany] = useState('');
  const [aiCategory, setAiCategory] = useState<InterviewCategory>('HR_INTERVIEW');
  const [aiQuestions, setAiQuestions] = useState<AIInterviewQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [addingIdx, setAddingIdx] = useState<number | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      interviewService.questions(filters),
      interviewService.mocks(),
      interviewService.statistics(),
      resumeService.statistics(),
    ])
      .then(([questionList, mockList, stats, resumeStats]) => {
        setQuestions(questionList);
        setMocks(mockList);
        setStatistics(stats);
        setResumeStatistics(resumeStats);
        setError('');
      })
      .catch(() => setError('Unable to load interview preparation data.'))
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  async function generateAIQuestions() {
    if (!aiCompany.trim()) { notify('Enter a company name', 'error'); return; }
    setIsGenerating(true);
    setAiError('');
    setAiQuestions([]);
    try {
      const qs = await aiService.generateInterviewQuestions(aiCompany.trim(), aiCategory);
      setAiQuestions(qs);
    } catch (err) {
      setAiError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }

  async function addAIQuestionToBank(q: AIInterviewQuestion, idx: number) {
    setAddingIdx(idx);
    try {
      await interviewService.createQuestion({
        question: q.question,
        category: aiCategory,
        difficulty: q.difficulty,
        answerNotes: q.notes,
        userNotes: '',
        status: 'NOT_STARTED',
      });
      notify('Question added to your bank!', 'success');
      loadData();
    } catch {
      notify('Failed to add question', 'error');
    } finally {
      setAddingIdx(null);
    }
  }

  async function addAllAIQuestions() {
    setIsSubmitting(true);
    try {
      for (const q of aiQuestions) {
        await interviewService.createQuestion({
          question: q.question,
          category: aiCategory,
          difficulty: q.difficulty,
          answerNotes: q.notes,
          userNotes: '',
          status: 'NOT_STARTED',
        });
      }
      notify(`Added ${aiQuestions.length} questions to your bank!`, 'success');
      loadData();
    } catch {
      notify('Some questions failed to add', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateQuestion<K extends keyof InterviewQuestionInput>(key: K, value: InterviewQuestionInput[K]) {
    setQuestionForm((current) => ({ ...current, [key]: value }));
  }

  function updateMock<K extends keyof MockInterviewInput>(key: K, value: MockInterviewInput[K]) {
    setMockForm((current) => ({ ...current, [key]: value }));
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (questionForm.question.trim().length < 5) { notify('Question must be at least 5 characters.', 'error'); return; }
    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        await interviewService.updateQuestion(editingQuestion.id, questionForm);
        notify('Question updated.', 'success');
      } else {
        await interviewService.createQuestion(questionForm);
        notify('Question added.', 'success');
      }
      setQuestionForm(emptyQuestion);
      setEditingQuestion(null);
      loadData();
    } catch { notify('Unable to save question.', 'error'); }
    finally { setIsSubmitting(false); }
  }

  async function saveMock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mockForm.company.trim().length < 2) { notify('Company is required.', 'error'); return; }
    setIsSubmitting(true);
    try {
      if (editingMock) {
        await interviewService.updateMock(editingMock.id, mockForm);
        notify('Mock interview updated.', 'success');
      } else {
        await interviewService.createMock(mockForm);
        notify('Mock interview logged.', 'success');
      }
      setMockForm(emptyMock);
      setEditingMock(null);
      loadData();
    } catch { notify('Unable to save mock interview.', 'error'); }
    finally { setIsSubmitting(false); }
  }

  async function deleteQuestion(id: string) {
    try { await interviewService.deleteQuestion(id); notify('Deleted.', 'success'); loadData(); }
    catch { notify('Unable to delete.', 'error'); }
  }

  async function deleteMock(id: string) {
    try { await interviewService.deleteMock(id); notify('Deleted.', 'success'); loadData(); }
    catch { notify('Unable to delete.', 'error'); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Interview Prep</h2>
        <p className="mt-1 text-sm text-slate-500">AI-powered question bank, mock interview tracker, and performance analytics.</p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Questions Practiced" value={statistics?.questionsPracticed ?? 0} tone="emerald" />
        <StatCard title="Questions Mastered" value={statistics?.questionsMastered ?? 0} tone="indigo" />
        <StatCard title="Mock Interviews" value={statistics?.totalMockInterviews ?? 0} tone="blue" />
        <StatCard title="Avg Rating" value={`${statistics?.averageRating ?? 0}/10`} tone="violet" />
      </section>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-card dark:border-ink-3 dark:bg-ink-2">
        {([
          { key: 'ai-generator', label: '✨ AI Questions' },
          { key: 'questions', label: 'Question Bank' },
          { key: 'mocks', label: 'Mock Interviews' },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              tab === t.key
                ? 'bg-brand-gradient text-white shadow-glow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} />}

      {/* ── AI Generator Tab ── */}
      {tab === 'ai-generator' && (
        <div className="space-y-5">
          <DashboardCard title="AI Interview Question Generator" icon={<Sparkles size={14} />}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter a company name and interview type — Gemini will generate real questions that company asks.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Company Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                    placeholder="e.g. Google, Infosys, TCS, Amazon..."
                    value={aiCompany}
                    onChange={(e) => setAiCompany(e.target.value)}
                  />
                </div>
                <div className="min-w-[200px]">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Interview Type</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as InterviewCategory)}
                  >
                    {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <Button onClick={generateAIQuestions} isLoading={isGenerating} className="shrink-0">
                  <Sparkles size={15} />
                  Generate
                </Button>
              </div>

              {aiError && <ErrorState message={aiError} />}

              {aiQuestions.length > 0 && (
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {aiQuestions.length} questions generated for <span className="text-brand-600 dark:text-brand-400">{aiCompany}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={generateAIQuestions} isLoading={isGenerating}>
                        <RotateCcw size={13} /> Regenerate
                      </Button>
                      <Button variant="secondary" onClick={addAllAIQuestions} isLoading={isSubmitting}>
                        Add All to Bank
                      </Button>
                    </div>
                  </div>
                  {aiQuestions.map((q, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200/80 bg-surface-2 p-4 dark:border-ink-3 dark:bg-ink-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFF_COLOR[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.question}</p>
                          {q.notes && (
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              💡 {q.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          className="h-8 shrink-0 px-3 text-xs"
                          onClick={() => addAIQuestionToBank(q, idx)}
                          isLoading={addingIdx === idx}
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isGenerating && aiQuestions.length === 0 && !aiError && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-ink-3">
                  <Bot className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Enter a company name and click Generate</p>
                  <p className="mt-1 text-xs text-slate-400">AI will fetch real questions from that company's interviews</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* ── Question Bank Tab ── */}
      {tab === 'questions' && (
        <div className="space-y-5">
          <form
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-ink-3 dark:bg-ink-2"
            onSubmit={saveQuestion}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              {editingQuestion && (
                <button type="button" onClick={() => { setEditingQuestion(null); setQuestionForm(emptyQuestion); }} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Question *</span>
                <textarea
                  className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                  value={questionForm.question}
                  onChange={(e) => updateQuestion('question', e.target.value)}
                  required
                />
              </label>
              <Select label="Category" value={questionForm.category} options={categoryOptions} onChange={(e) => updateQuestion('category', e.target.value as InterviewCategory)} />
              <Select label="Difficulty" value={questionForm.difficulty} options={difficultyOptions} onChange={(e) => updateQuestion('difficulty', e.target.value as InterviewDifficulty)} />
              <Select label="Status" value={questionForm.status} options={statusOptions} onChange={(e) => updateQuestion('status', e.target.value as InterviewQuestionStatus)} />
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Answer Notes</span>
                <textarea
                  className="min-h-16 w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white"
                  value={questionForm.answerNotes}
                  onChange={(e) => updateQuestion('answerNotes', e.target.value)}
                />
              </label>
            </div>
            <Button className="mt-4" type="submit" isLoading={isSubmitting}>
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </form>

          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Category" value={filters.category ?? ''} options={[{ value: '', label: 'All Categories' }, ...categoryOptions]} onChange={(e) => setFilters((f) => ({ ...f, category: (e.target.value as InterviewCategory) || undefined }))} />
            <Select label="Difficulty" value={filters.difficulty ?? ''} options={[{ value: '', label: 'All Difficulties' }, ...difficultyOptions]} onChange={(e) => setFilters((f) => ({ ...f, difficulty: (e.target.value as InterviewDifficulty) || undefined }))} />
            <Select label="Status" value={filters.status ?? ''} options={[{ value: '', label: 'All Statuses' }, ...statusOptions]} onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as InterviewQuestionStatus) || undefined }))} />
            <Input label="Search" value={filters.search ?? ''} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))} />
          </div>

          {isLoading ? <LoadingState label="Loading questions" /> : (
            <div className="grid gap-3 lg:grid-cols-2">
              {questions.map((q) => (
                <div key={q.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ink-3 dark:bg-ink-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFF_COLOR[q.difficulty]}`}>{q.difficulty}</span>
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/30 dark:text-brand-300">{labelify(q.category)}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-ink-3 dark:text-slate-400">{labelify(q.status)}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.question}</p>
                      {q.userNotes && <p className="mt-2 text-xs text-slate-500">{q.userNotes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-surface-2 hover:text-brand-600 dark:hover:bg-ink-3" onClick={() => { setEditingQuestion(q); setQuestionForm({ question: q.question, category: q.category, difficulty: q.difficulty, answerNotes: q.answerNotes ?? '', userNotes: q.userNotes ?? '', status: q.status }); setTab('questions'); }}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-ink-3">
                  <MessageSquareText className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400">No questions yet. Use the AI Generator tab to add questions!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Mock Interviews Tab ── */}
      {tab === 'mocks' && (
        <div className="space-y-5">
          <form
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-ink-3 dark:bg-ink-2"
            onSubmit={saveMock}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                {editingMock ? 'Edit Mock Interview' : 'Log Mock Interview'}
              </h3>
              {editingMock && (
                <button type="button" onClick={() => { setEditingMock(null); setMockForm(emptyMock); }} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Company" value={mockForm.company} onChange={(e) => updateMock('company', e.target.value)} required />
              <Select label="Interview Type" value={mockForm.interviewType} options={categoryOptions} onChange={(e) => updateMock('interviewType', e.target.value as InterviewCategory)} />
              <Input label="Date" type="date" value={mockForm.date} onChange={(e) => updateMock('date', e.target.value)} required />
              <Input label="Rating (1-10)" type="number" min="1" max="10" value={mockForm.rating} onChange={(e) => updateMock('rating', Number(e.target.value))} required />
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Feedback</span>
                <textarea className="min-h-16 w-full rounded-xl border border-slate-200 bg-surface-2 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 dark:border-ink-3 dark:bg-ink-3 dark:text-white" value={mockForm.feedback} onChange={(e) => updateMock('feedback', e.target.value)} />
              </label>
              <Input label="Strengths" value={mockForm.strengths} onChange={(e) => updateMock('strengths', e.target.value)} />
              <Input label="Weaknesses" value={mockForm.weaknesses} onChange={(e) => updateMock('weaknesses', e.target.value)} />
            </div>
            <Button className="mt-4" type="submit" isLoading={isSubmitting}>
              {editingMock ? 'Update' : 'Log Mock Interview'}
            </Button>
          </form>

          {isLoading ? <LoadingState label="Loading mocks" /> : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mocks.map((mock) => (
                  <div key={mock.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card dark:border-ink-3 dark:bg-ink-2">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-black text-white shadow-glow">
                        {mock.company.charAt(0)}
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-surface-2 hover:text-brand-600 dark:hover:bg-ink-3" onClick={() => { setEditingMock(mock); setMockForm({ company: mock.company, interviewType: mock.interviewType, date: mock.date.slice(0, 10), rating: mock.rating, feedback: mock.feedback ?? '', strengths: mock.strengths ?? '', weaknesses: mock.weaknesses ?? '' }); }}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" onClick={() => deleteMock(mock.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{mock.company}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{labelify(mock.interviewType)} · {formatDate(mock.date)}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{mock.rating}/10</span>
                    </div>
                    {mock.feedback && <p className="mt-2 text-xs text-slate-500 line-clamp-2">{mock.feedback}</p>}
                  </div>
                ))}
                {mocks.length === 0 && (
                  <div className="col-span-3 rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-ink-3">
                    <p className="text-sm text-slate-400">No mock interviews logged yet.</p>
                  </div>
                )}
              </div>

              <section className="grid gap-4 xl:grid-cols-2">
                <LearningChart title="Practice Progress" data={statistics?.charts.practiceProgress ?? []} type="pie" />
                <LearningChart title="Mock Interview Ratings" data={statistics?.charts.mockRatings ?? []} type="line" />
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function labelify(value: string) {
  return value.toLowerCase().split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
