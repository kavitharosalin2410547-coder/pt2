import { useEffect, useMemo, useState } from 'react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ProgressSummary } from '../components/learning/ProgressSummary';
import { useToast } from '../hooks/useToast';
import { coreCSService } from '../services/learningService';
import type { CoreCSInput, CoreCSProgress } from '../types/learning';
import { coreSubjects, label, learningStatuses } from '../utils/learning';

const emptyForm: CoreCSInput = { subject: 'OS', topic: '', status: 'NOT_STARTED', notes: '' };

export function CoreCSPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<CoreCSProgress[]>([]);
  const [form, setForm] = useState<CoreCSInput>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    coreCSService
      .list()
      .then(setItems)
      .catch(() => setError('Unable to load Core CS tracker.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  const summaries = useMemo(() => {
    return coreSubjects.map((subject) => {
      const subjectItems = items.filter((item) => item.subject === subject);
      const completed = subjectItems.filter((item) => item.status === 'COMPLETED').length;
      const revisionNeeded = subjectItems.filter((item) => item.status === 'REVISION_NEEDED').length;
      return {
        subject,
        total: subjectItems.length,
        completed,
        revisionNeeded,
        percentage: subjectItems.length === 0 ? 0 : Math.round((completed / subjectItems.length) * 100),
      };
    });
  }, [items]);

  async function initialize() {
    try {
      const result = await coreCSService.initialize();
      setItems(result);
      notify('Default Core CS topics added.', 'success');
    } catch {
      notify('Unable to initialize Core CS topics.', 'error');
    }
  }

  async function save() {
    if (form.topic.trim().length < 2) {
      notify('Topic must be at least 2 characters.', 'error');
      return;
    }
    try {
      await coreCSService.upsert(form);
      setForm(emptyForm);
      notify('Core CS topic saved.', 'success');
      load();
    } catch {
      notify('Unable to save topic.', 'error');
    }
  }

  async function update(item: CoreCSProgress, status: CoreCSProgress['status']) {
    try {
      await coreCSService.update(item.id, { status });
      load();
    } catch {
      notify('Unable to update topic.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Core CS</h2>
          <p className="text-sm text-slate-500">Track OS, DBMS, Computer Networks, and OOP preparation.</p>
        </div>
        <Button variant="secondary" onClick={initialize}>Add Default Topics</Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaries.map((summary) => (
          <ProgressSummary
            key={summary.subject}
            label={label(summary.subject)}
            value={summary.percentage}
            caption={`${summary.completed}/${summary.total} completed, ${summary.revisionNeeded} revision`}
          />
        ))}
      </section>

      <DashboardCard title="Add Topic">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select label="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value as CoreCSInput['subject'] })} options={coreSubjects.map((subject) => ({ value: subject, label: label(subject) }))} />
          <Input label="Topic" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} />
          <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CoreCSInput['status'] })} options={learningStatuses.map((status) => ({ value: status, label: label(status) }))} />
          <Input label="Notes" value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button onClick={save}>Save Topic</Button>
        </div>
      </DashboardCard>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading Core CS" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {coreSubjects.map((subject) => (
            <DashboardCard key={subject} title={label(subject)}>
              <div className="space-y-3">
                {items.filter((item) => item.subject === subject).map((item) => (
                  <div key={item.id} className="rounded-md bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{item.topic}</p>
                        <p className="text-xs text-slate-500">{label(item.status)}{item.notes ? ` - ${item.notes}` : ''}</p>
                      </div>
                      <Select
                        className="sm:w-44"
                        label="Status"
                        value={item.status}
                        onChange={(event) => update(item, event.target.value as CoreCSProgress['status'])}
                        options={learningStatuses.map((status) => ({ value: status, label: label(status) }))}
                      />
                    </div>
                  </div>
                ))}
                {items.filter((item) => item.subject === subject).length === 0 ? <p className="text-sm text-slate-500">No topics yet.</p> : null}
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
}
