import { Activity, BookOpen, Briefcase, CheckSquare, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { ProgressRing } from '../components/common/ProgressRing';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/analytics/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../services/aiService';
import { getErrorMessage } from '../services/apiClient';
import { interviewService } from '../services/interviewService';
import { learningAnalyticsService } from '../services/learningService';
import { placementService } from '../services/placementService';
import { resumeService } from '../services/resumeService';
import { taskService } from '../services/taskService';
import type { AnalyticsSummary } from '../types/api';
import type { InterviewStatistics } from '../types/interview';
import type { LearningAnalytics } from '../types/learning';
import type { PlacementApplication } from '../types/placement';
import type { PlacementStatistics } from '../types/placement';
import type { ResumeStatistics } from '../types/resume';
import type { Task } from '../types/task';
import { formatDate } from '../utils/date';
import { label } from '../utils/learning';

export function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null);
  const [placementStatistics, setPlacementStatistics] = useState<PlacementStatistics | null>(null);
  const [interviewStatistics, setInterviewStatistics] = useState<InterviewStatistics | null>(null);
  const [resumeStatistics, setResumeStatistics] = useState<ResumeStatistics | null>(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState<PlacementApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    Promise.all([
      taskService.list(),
      taskService.analytics(),
      learningAnalyticsService.get(),
      placementService.statistics(),
      interviewService.statistics(),
      resumeService.statistics(),
      placementService.list({ status: 'INTERVIEW_SCHEDULED' }),
    ])
      .then(([taskList, summary, learningSummary, placementSummary, interviewSummary, resumeSummary, interviews]) => {
        setTasks(taskList);
        setAnalytics(summary);
        setLearningAnalytics(learningSummary);
        setPlacementStatistics(placementSummary);
        setInterviewStatistics(interviewSummary);
        setResumeStatistics(resumeSummary);
        setUpcomingInterviews(interviews.slice(0, 3));
      })
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  const todayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((task) => new Date(task.dueDate).toDateString() === today && !task.completed);
  }, [tasks]);

  async function generateAiPlan() {
    setIsGeneratingPlan(true);
    try {
      const plan = await aiService.generateDailyPlan();
      setAiPlan(plan);
    } catch (err: unknown) {
      setAiPlan(`Error: ${getErrorMessage(err)}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => new Date(task.dueDate) > today && !task.completed).slice(0, 5);
  }, [tasks]);

  const weeklyCards = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const completed = tasks.filter(
        (task) => task.completedAt && new Date(task.completedAt).toDateString() === date.toDateString(),
      ).length;
      return { date, completed };
    });
  }, [tasks]);

  if (isLoading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error} />;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden rounded-3xl p-7 text-white"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #6366f1 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-32 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Command Center</p>
            <h2 className="mt-1.5 text-3xl font-black tracking-tight">
              Hey, {firstName} 👋
            </h2>
            <p className="mt-2 max-w-lg text-sm text-indigo-200/80">
              Your placement prep dashboard — track DSA, applications, interviews, and resume — all in one place.
            </p>

            {/* Quick stats row */}
            <div className="mt-5 flex flex-wrap gap-4">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-200">Today's tasks</p>
                <p className="mt-0.5 text-2xl font-black">{todayTasks.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-200">Applications</p>
                <p className="mt-0.5 text-2xl font-black">{placementStatistics?.totalCompanies ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-200">Study hrs / wk</p>
                <p className="mt-0.5 text-2xl font-black">{learningAnalytics?.study.weeklyHours ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <ProgressRing value={analytics?.completionPercentage ?? 0} size={80} label="Done" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Placement Apps"
          value={placementStatistics?.totalCompanies ?? 0}
          caption={`${placementStatistics?.interviews ?? 0} interviews scheduled`}
          tone="indigo"
          icon={<Briefcase size={15} />}
        />
        <StatCard
          title="Mock Interviews"
          value={interviewStatistics?.totalMockInterviews ?? 0}
          caption={`${interviewStatistics?.questionsMastered ?? 0} questions mastered`}
          tone="violet"
          icon={<Activity size={15} />}
        />
        <StatCard
          title="Resume ATS Score"
          value={`${resumeStatistics?.resumeScore ?? 0}%`}
          caption={`${resumeStatistics?.totalResumes ?? 0} version(s) uploaded`}
          tone="emerald"
          icon={<Target size={15} />}
        />
        <StatCard
          title="Task Completion"
          value={`${analytics?.completionPercentage ?? 0}%`}
          caption="overall completion rate"
          tone="blue"
          icon={<CheckSquare size={15} />}
        />
      </section>

      {/* ── Upcoming Interviews ── */}
      {upcomingInterviews.length > 0 && (
        <DashboardCard title="Upcoming Interviews">
          <div className="space-y-2">
            {upcomingInterviews.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 dark:bg-ink-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white shadow-glow">
                    {app.companyName.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{app.companyName}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  {app.role}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* ── Learning Progress ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="DSA Progress" icon={<TrendingUp size={14} />}>
          {learningAnalytics?.dsa ? (
            <>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{learningAnalytics.dsa.solved}</span>
                <span className="text-slate-400"> / {learningAnalytics.dsa.total} solved</span>
              </p>
              <ProgressBar value={learningAnalytics.dsa.solveRate} />
            </>
          ) : (
            <p className="text-sm text-slate-400">No DSA data yet.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Core CS Progress" icon={<BookOpen size={14} />}>
          {learningAnalytics?.coreCS && learningAnalytics.coreCS.length > 0 ? (
            <div className="space-y-3">
              {learningAnalytics.coreCS.slice(0, 3).map((cs) => (
                <div key={cs.subject}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{cs.subject}</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{cs.completedTopics}/{cs.totalTopics}</p>
                  </div>
                  <ProgressBar value={cs.completionPercentage} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No Core CS data yet.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Weekly Study">
          <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {learningAnalytics?.study.weeklyHours ?? 0}
            <span className="ml-1 text-base font-medium text-slate-400">hrs</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">this week</p>
        </DashboardCard>

        <DashboardCard title="Weak Areas">
          <AreaPreview items={learningAnalytics?.weakAreas ?? []} emptyText="No weak areas detected." color="text-red-500" />
        </DashboardCard>

        <DashboardCard title="Strong Areas">
          <AreaPreview items={learningAnalytics?.strongAreas ?? []} emptyText="No strong areas detected." color="text-emerald-500" />
        </DashboardCard>
      </section>

      {/* ── Tasks ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Today's Tasks">
          <TaskPreview tasks={todayTasks} emptyText="No pending tasks for today." />
        </DashboardCard>
        <DashboardCard title="Upcoming Tasks">
          <TaskPreview tasks={upcomingTasks} emptyText="No upcoming pending tasks." />
        </DashboardCard>
      </section>

      {/* ── AI Daily Planner ── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-brand-200/60 p-6 dark:border-brand-900/40"
        style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ede9fe 100%)' }}
      >
        <div className="dark:hidden" />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(135deg, #1e1b4b20 0%, #312e8118 50%, #4338ca15 100%)' }}
        />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Daily Planner</h3>
            </div>
            {aiPlan && (
              <button
                type="button"
                onClick={generateAiPlan}
                disabled={isGeneratingPlan}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
              >
                <RefreshCw size={12} className={isGeneratingPlan ? 'animate-spin' : ''} />
                Regenerate
              </button>
            )}
          </div>

          {!aiPlan ? (
            <div className="py-4 text-center">
              <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
                Let AI build a personalized study schedule from your weak topics, tasks, and upcoming deadlines.
              </p>
              <button
                type="button"
                onClick={generateAiPlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-glow hover:brightness-110 disabled:opacity-60 transition-all"
              >
                <Sparkles size={15} />
                {isGeneratingPlan ? 'Planning your day...' : "Generate Today's Plan"}
              </button>
            </div>
          ) : (
            <div
              className="whitespace-pre-wrap rounded-2xl border border-brand-100 bg-white/70 p-5 text-sm leading-relaxed text-slate-800 backdrop-blur dark:border-brand-900/30 dark:bg-white/5 dark:text-slate-200"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: aiPlan.replace(/\n/g, '<br />') }}
            />
          )}
        </div>
      </section>

      {/* ── Weekly Activity ── */}
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">7-Day Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyCards.map((card) => (
            <div
              key={card.date.toISOString()}
              className={`rounded-xl p-3 text-center transition-all ${
                card.completed > 0
                  ? 'bg-brand-gradient text-white shadow-glow'
                  : 'bg-white text-slate-400 shadow-card dark:bg-ink-2'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase opacity-70">
                {card.date.toLocaleDateString('en', { weekday: 'short' })}
              </p>
              <p className="mt-1 text-xl font-black">{card.completed}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AreaPreview({ items, emptyText, color }: { items: Array<{ name: string; score: number }>; emptyText: string; color?: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">{emptyText}</p>;
  return (
    <div className="space-y-2">
      {items.slice(0, 4).map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm dark:bg-ink-3">
          <span className="text-slate-700 dark:text-slate-300">{label(item.name)}</span>
          <span className={`font-bold ${color ?? 'text-brand-600'}`}>{item.score}</span>
        </div>
      ))}
    </div>
  );
}

function TaskPreview({ tasks, emptyText }: { tasks: Task[]; emptyText: string }) {
  if (tasks.length === 0) return <p className="text-sm text-slate-400">{emptyText}</p>;
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-3 rounded-xl bg-surface-2 p-3 dark:bg-ink-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
            <p className="text-xs text-slate-400">{formatDate(task.dueDate)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
