import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { categoryOptions, priorityOptions, statusOptions } from '../../utils/constants';
import { toDateInputValue } from '../../utils/date';
import type { Task, TaskFormInput } from '../../types/task';

type TaskFormProps = {
  task?: Task | null;
  isSubmitting: boolean;
  onSubmit: (input: TaskFormInput) => Promise<void>;
  onCancel?: () => void;
};

const defaultInput: TaskFormInput = {
  title: '',
  description: '',
  category: 'DSA',
  dueDate: toDateInputValue(new Date()),
  priority: 'MEDIUM',
  status: 'PENDING',
};

export function TaskForm({ task, isSubmitting, onSubmit, onCancel }: TaskFormProps) {
  const [input, setInput] = useState<TaskFormInput>(defaultInput);

  useEffect(() => {
    if (!task) {
      setInput(defaultInput);
      return;
    }

    setInput({
      title: task.title,
      description: task.description || '',
      category: task.category,
      dueDate: task.dueDate.slice(0, 10),
      priority: task.priority,
      status: task.status,
    });
  }, [task]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(input);

    if (!task) {
      setInput(defaultInput);
    }
  }

  return (
    <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Title"
          value={input.title}
          onChange={(event) => setInput((current) => ({ ...current, title: event.target.value }))}
          required
        />
        <Input
          label="Due date"
          type="date"
          value={input.dueDate}
          onChange={(event) => setInput((current) => ({ ...current, dueDate: event.target.value }))}
          required
        />
        <Select
          label="Category"
          options={categoryOptions}
          value={input.category}
          onChange={(event) =>
            setInput((current) => ({ ...current, category: event.target.value as TaskFormInput['category'] }))
          }
        />
        <Select
          label="Priority"
          options={priorityOptions}
          value={input.priority}
          onChange={(event) =>
            setInput((current) => ({ ...current, priority: event.target.value as TaskFormInput['priority'] }))
          }
        />
        <Select
          label="Status"
          options={statusOptions}
          value={input.status}
          onChange={(event) =>
            setInput((current) => ({ ...current, status: event.target.value as TaskFormInput['status'] }))
          }
        />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          value={input.description}
          onChange={(event) => setInput((current) => ({ ...current, description: event.target.value }))}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {task ? 'Update task' : 'Create task'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
