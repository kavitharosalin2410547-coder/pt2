import type { StudyMode } from '../types/preference';
import type { TaskCategory, TaskPriority, TaskStatus } from '../types/task';

export const categoryOptions: Array<{ value: TaskCategory; label: string }> = [
  { value: 'DSA', label: 'DSA' },
  { value: 'CORE_CS', label: 'Core CS' },
  { value: 'FULL_STACK', label: 'Full Stack' },
  { value: 'APTITUDE', label: 'Aptitude' },
];

export const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const studyModeOptions: Array<{ value: StudyMode; label: string }> = [
  { value: 'WEEKDAYS_ONLY', label: 'Weekdays Only' },
  { value: 'ALTERNATE_DAYS', label: 'Alternate Days' },
  { value: 'WEEKENDS_ONLY', label: 'Weekends Only' },
];

export function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
