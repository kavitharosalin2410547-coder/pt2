import { Button } from '../common/Button';
import { formatEnumLabel } from '../../utils/constants';
import { formatDate } from '../../utils/date';
import type { Task } from '../../types/task';

type TaskListProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
};

const priorityClasses: Record<Task['priority'], string> = {
  HIGH: 'bg-red-50 text-red-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  LOW: 'bg-emerald-50 text-emerald-700',
};

export function TaskList({ tasks, onEdit, onDelete, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No tasks match the current view.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-950">{task.title}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityClasses[task.priority]}`}>
                  {formatEnumLabel(task.priority)}
                </span>
              </div>
              {task.description ? <p className="mt-2 text-sm text-slate-600">{task.description}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{formatEnumLabel(task.category)}</span>
                <span>{formatEnumLabel(task.status)}</span>
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!task.completed ? (
                <Button variant="secondary" onClick={() => onComplete(task.id)}>
                  Complete
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => onEdit(task)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(task.id)}>
                Delete
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
