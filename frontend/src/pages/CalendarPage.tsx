import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { examDateService } from '../services/examDateService';
import { taskService } from '../services/taskService';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../services/apiClient';
import type { ExamDate, CreateExamDateInput, ExamDateType } from '../types/examDate';
import type { Task } from '../types/task';

const EXAM_TYPE_OPTIONS: { value: ExamDateType; label: string }[] = [
  { value: 'PLACEMENT', label: 'Placement Drive' },
  { value: 'EXAM', label: 'Exam' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'CONTEST', label: 'Contest' },
];

const TYPE_COLOR: Record<ExamDateType, string> = {
  PLACEMENT: 'bg-green-100 text-green-700 border-green-200',
  EXAM: 'bg-red-100 text-red-700 border-red-200',
  INTERVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  CONTEST: 'bg-orange-100 text-orange-700 border-orange-200',
};

const EMPTY_FORM: CreateExamDateInput = {
  title: '',
  date: '',
  type: 'EXAM',
  notes: '',
};

export function CalendarPage() {
  const { notify } = useToast();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateExamDateInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([taskService.list(), examDateService.list()])
      .then(([t, e]) => {
        setTasks(t);
        setExamDates(e);
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    if (!form.title.trim() || !form.date) {
      notify('Please fill in title and date.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const created = await examDateService.create(form);
      setExamDates((prev) => [...prev, created]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      notify('Exam date saved. Tasks near this date have been auto-adjusted.', 'success');
    } catch {
      notify('Failed to save exam date.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await examDateService.remove(id);
      setExamDates((prev) => prev.filter((e) => e.id !== id));
      notify('Exam date removed.', 'success');
    } catch {
      notify('Failed to remove exam date.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Calendar</h2>
          <p className="text-sm text-slate-500">Weekly and monthly task scheduling views.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Exam Date
          </Button>
          <div className="flex rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <Button variant={view === 'week' ? 'primary' : 'ghost'} onClick={() => setView('week')}>
              Week
            </Button>
            <Button variant={view === 'month' ? 'primary' : 'ghost'} onClick={() => setView('month')}>
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Exam date chips */}
      {examDates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {examDates.map((ed) => (
            <span
              key={ed.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${TYPE_COLOR[ed.type]}`}
            >
              {ed.title} — {new Date(ed.date).toLocaleDateString()}
              <button
                type="button"
                onClick={() => handleDelete(ed.id)}
                className="ml-1 opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? (
        <LoadingState label="Loading calendar" />
      ) : (
        <CalendarGrid view={view} tasks={tasks} examDates={examDates} />
      )}

      {/* Add Exam Date Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Add Exam / Placement Date
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title
                </label>
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. TCS NQT, GATE 2025"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as ExamDateType }))
                  }
                >
                  {EXAM_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={2}
                  placeholder="Any additional notes"
                  value={form.notes ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
