import { useEffect, useMemo, useState } from 'react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { ProgressSummary } from '../components/learning/ProgressSummary';
import { useToast } from '../hooks/useToast';
import { fullStackService } from '../services/learningService';
import type { FullStackInput, FullStackProgress } from '../types/learning';
import { fullStackTechnologies, label, learningStatuses } from '../utils/learning';

export function FullStackPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<FullStackProgress[]>([]);
  const [form, setForm] = useState<FullStackInput>({ technology: 'REACT', status: 'NOT_STARTED', notes: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    fullStackService
      .list()
      .then(setItems)
      .catch(() => setError('Unable to load Full Stack tracker.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  const completed = items.filter((item) => item.status === 'COMPLETED').length;
  const revisionNeeded = items.filter((item) => item.status === 'REVISION_NEEDED').length;
  const progress = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);
  const technologyMap = useMemo(() => new Map(items.map((item) => [item.technology, item])), [items]);

  async function initialize() {
    try {
      setItems(await fullStackService.initialize());
      notify('Default Full Stack technologies added.', 'success');
    } catch {
      notify('Unable to initialize technologies.', 'error');
    }
  }

  async function save() {
    try {
      await fullStackService.upsert(form);
      notify('Technology progress saved.', 'success');
      load();
    } catch {
      notify('Unable to save technology progress.', 'error');
    }
  }

  async function update(item: FullStackProgress, input: Partial<FullStackInput>) {
    try {
      await fullStackService.update(item.id, input);
      load();
    } catch {
      notify('Unable to update technology progress.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Full Stack</h2>
          <p className="text-sm text-slate-500">Track React, Angular, Spring Boot, and .NET learning progress.</p>
        </div>
        <Button variant="secondary" onClick={initialize}>Add Default Technologies</Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <ProgressSummary label="Overall Progress" value={progress} caption={`${completed}/${items.length} completed`} />
        <DashboardCard title="Revision Needed">
          <p className="text-3xl font-semibold text-slate-950">{revisionNeeded}</p>
          <p className="mt-1 text-sm text-slate-500">technologies</p>
        </DashboardCard>
        <DashboardCard title="Active Stack Areas">
          <p className="text-3xl font-semibold text-slate-950">{items.length}</p>
          <p className="mt-1 text-sm text-slate-500">tracked technologies</p>
        </DashboardCard>
      </section>

      <DashboardCard title="Update Technology">
        <div className="grid gap-3 md:grid-cols-3">
          <Select label="Technology" value={form.technology} onChange={(event) => setForm({ ...form, technology: event.target.value as FullStackInput['technology'] })} options={fullStackTechnologies.map((technology) => ({ value: technology, label: label(technology) }))} />
          <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as FullStackInput['status'] })} options={learningStatuses.map((status) => ({ value: status, label: label(status) }))} />
          <Input label="Notes" value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button onClick={save}>Save Progress</Button>
        </div>
      </DashboardCard>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading Full Stack" /> : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {fullStackTechnologies.map((technology) => {
            const item = technologyMap.get(technology);
            return (
              <DashboardCard key={technology} title={label(technology)}>
                {item ? (
                  <div className="space-y-3">
                    <Select label="Status" value={item.status} onChange={(event) => update(item, { status: event.target.value as FullStackProgress['status'] })} options={learningStatuses.map((status) => ({ value: status, label: label(status) }))} />
                    <Input label="Notes" value={item.notes ?? ''} onChange={(event) => update(item, { notes: event.target.value })} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not tracked yet.</p>
                )}
              </DashboardCard>
            );
          })}
        </section>
      )}
    </div>
  );
}
