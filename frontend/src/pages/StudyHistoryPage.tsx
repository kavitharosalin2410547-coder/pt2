import { useEffect, useState } from 'react';
import { DashboardCard } from '../components/common/DashboardCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useToast } from '../hooks/useToast';
import { studySessionService } from '../services/learningService';
import type { StudySession, StudySessionInput } from '../types/learning';
import { label, toDateInput } from '../utils/learning';

const categories = ['DSA', 'CORE_CS', 'FULL_STACK', 'APTITUDE'] as const;
const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  date: `${today}T00:00:00.000Z`,
  durationMinutes: 60,
  category: 'DSA',
  notes: '',
} satisfies StudySessionInput;

export function StudyHistoryPage() {
  const { notify } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [summary, setSummary] = useState({ totalStudyHours: 0, weeklyHours: 0, monthlyHours: 0, consistencyStreak: 0 });
  const [form, setForm] = useState<StudySessionInput>(emptyForm);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setIsLoading(true);
    Promise.all([studySessionService.list(), studySessionService.summary()])
      .then(([sessionList, sessionSummary]) => {
        setSessions(sessionList);
        setSummary(sessionSummary);
      })
      .catch(() => setError('Unable to load study history.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  function startEdit(session: StudySession) {
    setEditing(session);
    setForm({
      date: new Date(session.date).toISOString(),
      durationMinutes: session.durationMinutes,
      category: session.category,
      notes: session.notes ?? '',
    });
  }

  async function save() {
    try {
      const payload = { ...form, date: new Date(form.date).toISOString() };
      if (editing) {
        await studySessionService.update(editing.id, payload);
        notify('Study session updated.', 'success');
      } else {
        await studySessionService.create(payload);
        notify('Study session added.', 'success');
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch {
      notify('Unable to save study session.', 'error');
    }
  }

  async function remove(id: string) {
    try {
      await studySessionService.remove(id);
      notify('Study session deleted.', 'success');
      load();
    } catch {
      notify('Unable to delete study session.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Study History</h2>
        <p className="text-sm text-slate-500">Log study sessions and track time consistency.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Study Hours" value={summary.totalStudyHours} />
        <StatCard title="Weekly Hours" value={summary.weeklyHours} />
        <StatCard title="Monthly Hours" value={summary.monthlyHours} />
        <StatCard title="Consistency Streak" value={summary.consistencyStreak} caption="days" />
      </section>

      <DashboardCard title={editing ? 'Edit Study Session' : 'Add Study Session'}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Date" type="date" value={toDateInput(form.date)} onChange={(event) => setForm({ ...form, date: `${event.target.value}T00:00:00.000Z` })} />
          <Input label="Duration Minutes" type="number" min={1} value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} />
          <Select label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as StudySessionInput['category'] })} options={categories.map((category) => ({ value: category, label: label(category) }))} />
          <Input label="Notes" value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={save}>{editing ? 'Update Session' : 'Add Session'}</Button>
          {editing ? <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</Button> : null}
        </div>
      </DashboardCard>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading study history" /> : (
        <DashboardCard title="Sessions">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-col gap-3 rounded-md bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{label(session.category)} - {session.durationMinutes} min</p>
                  <p className="text-xs text-slate-500">{toDateInput(session.date)}{session.notes ? ` - ${session.notes}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="h-8 px-3" variant="secondary" onClick={() => startEdit(session)}>Edit</Button>
                  <Button className="h-8 px-3" variant="danger" onClick={() => remove(session.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {sessions.length === 0 ? <p className="text-sm text-slate-500">No study sessions logged yet.</p> : null}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
