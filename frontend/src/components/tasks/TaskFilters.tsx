import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { categoryOptions, statusOptions } from '../../utils/constants';
import type { TaskFilters as TaskFiltersType } from '../../types/task';

type TaskFiltersProps = {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
};

const allCategories = [{ value: '', label: 'All Categories' }, ...categoryOptions];
const allStatuses = [{ value: '', label: 'All Statuses' }, ...statusOptions];

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
      <Input
        label="Search"
        value={filters.search || ''}
        onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
        placeholder="Search tasks"
      />
      <Select
        label="Category"
        options={allCategories}
        value={filters.category || ''}
        onChange={(event) =>
          onChange({ ...filters, category: event.target.value ? (event.target.value as TaskFiltersType['category']) : undefined })
        }
      />
      <Select
        label="Status"
        options={allStatuses}
        value={filters.status || ''}
        onChange={(event) =>
          onChange({ ...filters, status: event.target.value ? (event.target.value as TaskFiltersType['status']) : undefined })
        }
      />
    </div>
  );
}
