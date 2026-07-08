import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, PlayCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../hooks/useToast';
import { dsaService } from '../services/learningService';
import type { DSAFilters, DSAProblem, DsaDifficulty, DsaProblemStatus } from '../types/learning';
import {
  difficulties,
  dsaStatuses,
  dsaTopics,
  label,
  neetCode150TopicTargets,
  neetCode150Total,
} from '../utils/learning';

type RoadmapCoverage = {
  topic: (typeof dsaTopics)[number];
  imported: number;
  solved: number;
  target: number;
  percent: number;
};

const catalogFilter = { catalog: 'neetcode150' as const };

const statusClasses: Record<DsaProblemStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SOLVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  REVISION_NEEDED: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};

const difficultyClasses: Record<DsaDifficulty, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  HARD: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

function externalButtonClass(variant: 'primary' | 'secondary') {
  const base = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition hover:-translate-y-0.5';
  if (variant === 'primary') return `${base} bg-brand-600 text-white hover:bg-brand-700`;
  return `${base} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`;
}

export function DSATrackerPage() {
  const { notify } = useToast();
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [allProblems, setAllProblems] = useState<DSAProblem[]>([]);
  const [summary, setSummary] = useState({ total: 0, solved: 0, pending: 0, revisionNeeded: 0, solveRate: 0 });
  const [filters, setFilters] = useState<DSAFilters>({ ...catalogFilter, sortBy: 'date', sortOrder: 'desc' });
  const [isCatalogReady, setIsCatalogReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!isCatalogReady) return;

    setIsLoading(true);
    setError('');
    Promise.all([
      dsaService.list({ ...filters, ...catalogFilter }),
      dsaService.list({ ...catalogFilter, sortBy: 'date', sortOrder: 'desc' }),
      dsaService.summary(),
    ])
      .then(([problemList, fullProblemList, problemSummary]) => {
        setProblems(problemList);
        setAllProblems(fullProblemList);
        setSummary(problemSummary);
      })
      .catch(() => setError('Unable to load NeetCode 150 tracker.'))
      .finally(() => setIsLoading(false));
  }, [filters, isCatalogReady]);

  useEffect(() => {
    let isActive = true;

    async function syncCatalog() {
      setIsLoading(true);
      setError('');
      try {
        await dsaService.importNeetCode();
        if (isActive) setIsCatalogReady(true);
      } catch {
        if (isActive) {
          setError('Unable to sync the NeetCode 150 catalog.');
          setIsLoading(false);
        }
      }
    }

    syncCatalog();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roadmapCoverage: RoadmapCoverage[] = useMemo(() => {
    return dsaTopics.map((topic) => {
      const topicProblems = allProblems.filter((problem) => problem.topic === topic);
      const solved = topicProblems.filter((problem) => problem.status === 'SOLVED').length;
      const target = neetCode150TopicTargets[topic];
      return {
        topic,
        imported: Math.min(topicProblems.length, target),
        solved: Math.min(solved, target),
        target,
        percent: target === 0 ? 0 : Math.round((Math.min(solved, target) / target) * 100),
      };
    });
  }, [allProblems]);

  const topicCoverage = useMemo(() => {
    return roadmapCoverage.map((item) => ({
      topic: item.topic,
      count: allProblems.filter((problem) => problem.topic === item.topic).length,
      solved: item.solved,
      target: item.target,
    }));
  }, [allProblems, roadmapCoverage]);

  const neetCodeImported = roadmapCoverage.reduce((total, item) => total + item.imported, 0);
  const neetCodeSolved = roadmapCoverage.reduce((total, item) => total + item.solved, 0);
  const neetCodeRevisionNeeded = allProblems.filter((problem) => problem.status === 'REVISION_NEEDED').length;
  const neetCodeNotStarted = allProblems.filter((problem) => problem.status === 'PENDING').length;
  const neetCodeCompletionRate = neetCode150Total === 0 ? 0 : Math.round((neetCodeSolved / neetCode150Total) * 100);

  async function refreshCatalog() {
    setIsRefreshing(true);
    try {
      const result = await dsaService.importNeetCode();
      notify(`NeetCode 150 catalog refreshed. ${result.imported} added, ${result.updated} updated.`, 'success');
      load();
    } catch {
      notify('Unable to refresh NeetCode 150 catalog.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function updateStatus(actionType: 'solved' | 'revision', id: string) {
    try {
      if (actionType === 'solved') await dsaService.markSolved(id);
      if (actionType === 'revision') await dsaService.markRevisionNeeded(id);
      notify('Progress updated.', 'success');
      load();
    } catch {
      notify('Unable to update progress.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">NeetCode 150 Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Official roadmap progress, problem links, solution videos, and revision state.</p>
        </div>
        <Button variant="secondary" isLoading={isRefreshing} onClick={refreshCatalog}><RefreshCw size={16} />Refresh Catalog</Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="NeetCode Solved" value={`${neetCodeSolved}/${neetCode150Total}`} tone="emerald" />
        <StatCard title="Completion Rate" value={`${neetCodeCompletionRate}%`} tone="indigo" />
        <StatCard title="Revision Needed" value={neetCodeRevisionNeeded} tone="blue" />
        <StatCard title="Not Started" value={neetCodeNotStarted} tone="slate" />
        <StatCard title="Catalog Items" value={`${neetCodeImported}/${neetCode150Total}`} tone="blue" />
        <StatCard title="All Solved" value={summary.solved} tone="emerald" />
        <StatCard title="All Problems" value={summary.total} tone="slate" />
        <StatCard title="Overall Solve Rate" value={`${summary.solveRate}%`} tone="indigo" />
      </section>

      <DashboardCard title="Roadmap Progress">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roadmapCoverage.map((item) => (
            <div key={item.topic} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{item.topic}</span>
                <span className="text-slate-600 dark:text-slate-400">{item.solved}/{item.target}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500" style={{ width: `${item.percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.imported}/{item.target} catalog items ready</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Practice Queue">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input label="Search" value={filters.search ?? ''} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          <Select label="Category" value={filters.topic ?? ''} onChange={(event) => setFilters({ ...filters, topic: event.target.value })} options={[{ value: '', label: 'All Categories' }, ...dsaTopics.map((topic) => ({ value: topic, label: topic }))]} />
          <Select label="Difficulty" value={filters.difficulty ?? ''} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value as DSAFilters['difficulty'] })} options={[{ value: '', label: 'All Difficulties' }, ...difficulties.map((item) => ({ value: item, label: label(item) }))]} />
          <Select label="Status" value={filters.status ?? ''} onChange={(event) => setFilters({ ...filters, status: event.target.value as DSAFilters['status'] })} options={[{ value: '', label: 'All Statuses' }, ...dsaStatuses.map((item) => ({ value: item, label: label(item) }))]} />
          <Select label="Sort" value={filters.sortBy ?? 'date'} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value as DSAFilters['sortBy'] })} options={[{ value: 'date', label: 'Recently Updated' }, { value: 'difficulty', label: 'Difficulty' }]} />
        </div>
      </DashboardCard>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading NeetCode 150 tracker" /> : (
        <DashboardCard title="NeetCode Problems">
          <div className="grid gap-3 lg:grid-cols-2">
            {problems.map((problem) => (
              <article
                key={problem.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-white">{problem.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{problem.topic}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${difficultyClasses[problem.difficulty]}`}>
                      {label(problem.difficulty)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[problem.status]}`}>
                      {label(problem.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {problem.leetcodeLink ? (
                    <a className={externalButtonClass('primary')} href={problem.leetcodeLink} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} /> Solve
                    </a>
                  ) : null}
                  {problem.youtubeLink ? (
                    <a className={externalButtonClass('secondary')} href={problem.youtubeLink} target="_blank" rel="noreferrer">
                      <PlayCircle size={14} /> Watch Solution
                    </a>
                  ) : null}
                  <Button className="h-8 px-2 text-xs" variant="secondary" disabled={problem.status === 'SOLVED'} onClick={() => updateStatus('solved', problem.id)}>
                    <CheckCircle2 size={14} /> Mark Solved
                  </Button>
                  <Button className="h-8 px-2 text-xs" variant="secondary" disabled={problem.status === 'REVISION_NEEDED'} onClick={() => updateStatus('revision', problem.id)}>
                    <RotateCcw size={14} /> Revision
                  </Button>
                </div>
              </article>
            ))}
            {problems.length === 0 ? <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 lg:col-span-2">No NeetCode problems match these filters.</p> : null}
          </div>
        </DashboardCard>
      )}

      <DashboardCard title="Topic Coverage">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topicCoverage.map((item) => (
            <div key={item.topic} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>{item.topic}</span>
                <span className="font-semibold text-slate-900">{item.count}/{item.target}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.solved} solved</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
