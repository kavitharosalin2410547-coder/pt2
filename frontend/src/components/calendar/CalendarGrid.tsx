import { formatEnumLabel } from '../../utils/constants';
import { formatDate, getMonthDays, getWeekDays, isSameDay } from '../../utils/date';
import type { Task } from '../../types/task';
import type { ExamDate } from '../../types/examDate';

const EXAM_TYPE_DOT: Record<string, string> = {
  PLACEMENT: 'bg-green-500',
  EXAM: 'bg-red-500',
  INTERVIEW: 'bg-blue-500',
  CONTEST: 'bg-orange-500',
};

type CalendarGridProps = {
  view: 'week' | 'month';
  tasks: Task[];
  examDates?: ExamDate[];
};

export function CalendarGrid({ view, tasks, examDates = [] }: CalendarGridProps) {
  const days = view === 'week' ? getWeekDays() : getMonthDays();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {days.map((day) => {
        const dayTasks = tasks.filter((task) => isSameDay(new Date(task.dueDate), day));
        const dayExams = examDates.filter((ed) => isSameDay(new Date(ed.date), day));

        return (
          <section
            key={day.toISOString()}
            className={`min-h-32 rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900 ${
              dayExams.length > 0 ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{formatDate(day)}</p>

            {dayExams.map((ed) => (
              <div
                key={ed.id}
                className="mt-1.5 flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 dark:bg-red-900/20"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${EXAM_TYPE_DOT[ed.type] ?? 'bg-gray-400'}`} />
                <span className="truncate text-xs font-medium text-red-700 dark:text-red-400">
                  {ed.title}
                </span>
              </div>
            ))}

            <div className="mt-3 space-y-2">
              {dayTasks.length === 0 ? (
                <p className="text-xs text-slate-400">No scheduled tasks</p>
              ) : (
                dayTasks.map((task) => (
                  <div key={task.id} className="rounded-md bg-slate-50 p-2 dark:bg-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                    <p className="text-xs text-slate-500">{formatEnumLabel(task.category)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
