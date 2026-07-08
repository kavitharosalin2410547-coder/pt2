import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskList } from '../components/tasks/TaskList';
import { useToast } from '../hooks/useToast';
import { taskService } from '../services/taskService';
import type { Task, TaskFilters as TaskFiltersType, TaskFormInput } from '../types/task';

export function TasksPage() {
  const { notify } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = useCallback(() => {
    setIsLoading(true);
    taskService
      .list(filters)
      .then(setTasks)
      .catch(() => setError('Unable to load tasks.'))
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleSubmit(input: TaskFormInput) {
    if (input.title.trim().length < 2) {
      notify('Task title must be at least 2 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, input);
        notify('Task updated.', 'success');
      } else {
        await taskService.create(input);
        notify('Task created.', 'success');
      }
      setEditingTask(null);
      loadTasks();
    } catch {
      notify('Unable to save task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(taskId: string) {
    try {
      await taskService.remove(taskId);
      notify('Task deleted.', 'success');
      loadTasks();
    } catch {
      notify('Unable to delete task.', 'error');
    }
  }

  async function handleComplete(taskId: string) {
    try {
      await taskService.complete(taskId);
      notify('Task completed.', 'success');
      loadTasks();
    } catch {
      notify('Unable to complete task.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Tasks</h2>
        <p className="text-sm text-slate-500">Create, schedule, filter, and complete preparation tasks.</p>
      </div>
      <TaskForm
        task={editingTask}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={editingTask ? () => setEditingTask(null) : undefined}
      />
      <TaskFilters filters={filters} onChange={setFilters} />
      {error ? <ErrorState message={error} /> : null}
      {isLoading ? (
        <LoadingState label="Loading tasks" />
      ) : (
        <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={handleDelete} onComplete={handleComplete} />
      )}
    </div>
  );
}
