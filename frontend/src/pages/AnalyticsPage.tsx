import { useEffect, useState } from 'react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { StatCard } from '../components/common/StatCard';
import { LearningChart } from '../components/learning/LearningChart';
import { learningAnalyticsService } from '../services/learningService';
import type { LearningAnalytics } from '../types/learning';
import { label } from '../utils/learning';

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learningAnalyticsService
      .get()
      .then(setAnalytics)
      .catch(() => setError('Unable to load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingState label="Loading analytics" />;
  }

  if (error || !analytics) {
    return <ErrorState message={error || 'Analytics unavailable.'} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Study hours, topic progress, weak areas, and strengths.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="DSA Solve Rate" value={`${analytics.dsa.solveRate}%`} tone="emerald" />
        <StatCard title="Total Study Hours" value={analytics.study.totalStudyHours} tone="indigo" />
        <StatCard title="Weekly Hours" value={analytics.study.weeklyHours} tone="blue" />
        <StatCard title="Study Streak" value={analytics.study.consistencyStreak} caption="days" tone="emerald" />
      </section>
      <DashboardCard title="Insights">
        <div className="grid gap-3 md:grid-cols-3">
          <Insight label="Momentum" value={`${analytics.study.weeklyHours}h this week`} />
          <Insight label="Focus Area" value={analytics.weakAreas[0] ? label(analytics.weakAreas[0].name) : 'No weak areas'} />
          <Insight label="Strongest Area" value={analytics.strongAreas[0] ? label(analytics.strongAreas[0].name) : 'Build more history'} />
        </div>
      </DashboardCard>
      <section className="grid gap-4 xl:grid-cols-2">
        <LearningChart title="Study Hours Chart" data={analytics.charts.studyHours} type="line" />
        <LearningChart title="Category Distribution Chart" data={analytics.charts.categoryDistribution} type="pie" />
        <LearningChart title="DSA Progress Chart" data={analytics.charts.dsaProgress} />
        <LearningChart title="Subject Completion Chart" data={analytics.charts.subjectCompletion.map((point) => ({ ...point, name: label(point.name) }))} />
        <LearningChart title="Weekly Productivity Chart" data={analytics.charts.weeklyProductivity} type="line" />
        <DashboardCard title="Weak Areas">
          <AreaList items={analytics.weakAreas} emptyText="No weak areas detected yet." />
        </DashboardCard>
        <DashboardCard title="Top Strengths">
          <AreaList items={analytics.strongAreas} emptyText="No strengths detected yet." />
        </DashboardCard>
      </section>
    </div>
  );
}

function AreaList({ items, emptyText }: { items: Array<{ name: string; score: number }>; emptyText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950">
          <span className="text-slate-700 dark:text-slate-300">{label(item.name)}</span>
          <span className="font-semibold text-slate-900 dark:text-white">{item.score}</span>
        </div>
      ))}
    </div>
  );
}

function Insight({ label: insightLabel, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{insightLabel}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
