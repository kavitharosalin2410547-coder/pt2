import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, ExternalLink, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { Input } from '../components/common/Input';
import { LoadingState } from '../components/common/LoadingState';
import { Select } from '../components/common/Select';
import { StatCard } from '../components/common/StatCard';
import { useToast } from '../hooks/useToast';
import { placementService } from '../services/placementService';
import type {
  PlacementApplication,
  PlacementFilters,
  PlacementFormInput,
  PlacementRound,
  PlacementStatistics,
  PlacementStatus,
} from '../types/placement';
import { formatDate } from '../utils/date';

const statusOptions: Array<{ value: PlacementStatus; label: string }> = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'OA_SCHEDULED', label: 'OA Scheduled' },
  { value: 'OA_CLEARED', label: 'OA Cleared' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_CLEARED', label: 'Interview Cleared' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

const roundOptions: Array<{ value: PlacementRound; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'OA', label: 'OA' },
  { value: 'TECHNICAL_1', label: 'Technical 1' },
  { value: 'TECHNICAL_2', label: 'Technical 2' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'HR', label: 'HR' },
  { value: 'FINAL', label: 'Final' },
];

const boardColumns: Array<{ key: string; title: string; statuses: PlacementStatus[]; dropStatus: PlacementStatus; dropRound?: PlacementRound }> = [
  { key: 'wishlist', title: 'Wishlist', statuses: ['WISHLIST'], dropStatus: 'WISHLIST', dropRound: 'NONE' },
  { key: 'applied', title: 'Applied', statuses: ['APPLIED'], dropStatus: 'APPLIED', dropRound: 'NONE' },
  { key: 'oa', title: 'OA', statuses: ['OA_SCHEDULED', 'OA_CLEARED'], dropStatus: 'OA_SCHEDULED', dropRound: 'OA' },
  {
    key: 'interview',
    title: 'Interview',
    statuses: ['INTERVIEW_SCHEDULED', 'INTERVIEW_CLEARED'],
    dropStatus: 'INTERVIEW_SCHEDULED',
    dropRound: 'TECHNICAL_1',
  },
  { key: 'selected', title: 'Selected', statuses: ['SELECTED'], dropStatus: 'SELECTED', dropRound: 'FINAL' },
  { key: 'rejected', title: 'Rejected', statuses: ['REJECTED'], dropStatus: 'REJECTED' },
];

const emptyForm: PlacementFormInput = {
  companyName: '',
  role: '',
  packageLPA: 0,
  location: '',
  applicationDate: new Date().toISOString().slice(0, 10),
  deadlineDate: new Date().toISOString().slice(0, 10),
  jobLink: '',
  status: 'WISHLIST',
  round: 'NONE',
  notes: '',
};

export function PlacementTrackerPage() {
  const { notify } = useToast();
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [statistics, setStatistics] = useState<PlacementStatistics | null>(null);
  const [filters, setFilters] = useState<PlacementFilters>({});
  const [form, setForm] = useState<PlacementFormInput>(emptyForm);
  const [editingApplication, setEditingApplication] = useState<PlacementApplication | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadPlacementData = useCallback(() => {
    setIsLoading(true);
    Promise.all([placementService.list(filters), placementService.statistics()])
      .then(([applicationList, stats]) => {
        setApplications(applicationList);
        setStatistics(stats);
        setError('');
      })
      .catch(() => setError('Unable to load placement applications.'))
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    loadPlacementData();
  }, [loadPlacementData]);

  const visibleApplications = useMemo(() => applications, [applications]);

  function updateForm<K extends keyof PlacementFormInput>(key: K, value: PlacementFormInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(application: PlacementApplication) {
    setEditingApplication(application);
    setForm({
      companyName: application.companyName,
      role: application.role,
      packageLPA: application.packageLPA,
      location: application.location,
      applicationDate: application.applicationDate.slice(0, 10),
      deadlineDate: application.deadlineDate.slice(0, 10),
      jobLink: application.jobLink ?? '',
      status: application.status,
      round: application.round,
      notes: application.notes ?? '',
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.companyName.trim().length < 2 || form.role.trim().length < 2 || form.location.trim().length < 2) {
      notify('Company, role, and location are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingApplication) {
        await placementService.update(editingApplication.id, form);
        notify('Application updated.', 'success');
      } else {
        await placementService.create(form);
        notify('Application created.', 'success');
      }
      setForm(emptyForm);
      setEditingApplication(null);
      loadPlacementData();
    } catch {
      notify('Unable to save application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(applicationId: string) {
    try {
      await placementService.remove(applicationId);
      notify('Application deleted.', 'success');
      loadPlacementData();
    } catch {
      notify('Unable to delete application.', 'error');
    }
  }

  async function handleDrop(column: (typeof boardColumns)[number]) {
    if (!draggedId) {
      return;
    }

    try {
      await placementService.update(draggedId, {
        status: column.dropStatus,
        ...(column.dropRound ? { round: column.dropRound } : {}),
      });
      notify('Application moved.', 'success');
      loadPlacementData();
    } catch {
      notify('Unable to move application.', 'error');
    } finally {
      setDraggedId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Placement Tracker</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage applications, interviews, offers, and deadlines in one place.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Companies" value={statistics?.totalCompanies ?? 0} tone="indigo" />
        <StatCard title="Applied" value={statistics?.applied ?? 0} tone="blue" />
        <StatCard title="OA Cleared" value={statistics?.oaCleared ?? 0} tone="emerald" />
        <StatCard title="Interviews" value={statistics?.interviews ?? 0} tone="indigo" />
        <StatCard title="Selected" value={statistics?.selected ?? 0} tone="emerald" />
        <StatCard title="Rejected" value={statistics?.rejected ?? 0} tone="slate" />
      </section>

      <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">{editingApplication ? 'Edit Application' : 'Add Application'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track company status, round, package, location, and follow-up dates.</p>
          </div>
          {editingApplication ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingApplication(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Company Name" value={form.companyName} onChange={(event) => updateForm('companyName', event.target.value)} required />
          <Input label="Role" value={form.role} onChange={(event) => updateForm('role', event.target.value)} required />
          <Input
            label="Package (LPA)"
            type="number"
            min="0"
            step="0.1"
            value={form.packageLPA}
            onChange={(event) => updateForm('packageLPA', Number(event.target.value))}
            required
          />
          <Input label="Location" value={form.location} onChange={(event) => updateForm('location', event.target.value)} required />
          <Input
            label="Application Date"
            type="date"
            value={form.applicationDate}
            onChange={(event) => updateForm('applicationDate', event.target.value)}
            required
          />
          <Input
            label="Deadline Date"
            type="date"
            value={form.deadlineDate}
            onChange={(event) => updateForm('deadlineDate', event.target.value)}
            required
          />
          <Input label="Job Link" type="url" value={form.jobLink} onChange={(event) => updateForm('jobLink', event.target.value)} />
          <Select
            label="Status"
            value={form.status}
            options={statusOptions}
            onChange={(event) => updateForm('status', event.target.value as PlacementStatus)}
          />
          <Select
            label="Current Round"
            value={form.round}
            options={roundOptions}
            onChange={(event) => updateForm('round', event.target.value as PlacementRound)}
          />
          <label className="block md:col-span-2 xl:col-span-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={form.notes}
              onChange={(event) => updateForm('notes', event.target.value)}
            />
          </label>
        </div>
        <div className="mt-4">
          <Button type="submit" isLoading={isSubmitting}>
            {editingApplication ? 'Update Application' : 'Create Application'}
          </Button>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">Filters</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Select
            label="Status"
            value={filters.status ?? ''}
            options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as PlacementStatus || undefined }))}
          />
          <Input label="Company" value={filters.company ?? ''} onChange={(event) => setFilters((current) => ({ ...current, company: event.target.value || undefined }))} />
          <Input label="Role" value={filters.role ?? ''} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value || undefined }))} />
          <Input
            label="Package Min"
            type="number"
            min="0"
            value={filters.packageMin ?? ''}
            onChange={(event) => setFilters((current) => ({ ...current, packageMin: event.target.value ? Number(event.target.value) : undefined }))}
          />
          <Input
            label="Package Max"
            type="number"
            min="0"
            value={filters.packageMax ?? ''}
            onChange={(event) => setFilters((current) => ({ ...current, packageMax: event.target.value ? Number(event.target.value) : undefined }))}
          />
          <Input label="Location" value={filters.location ?? ''} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value || undefined }))} />
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading placement tracker" /> : null}

      {!isLoading ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Applications</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-3">Company</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Package</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Round</th>
                    <th className="px-3 py-3">Application Date</th>
                    <th className="px-3 py-3">Deadline</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleApplications.map((application) => (
                    <tr key={application.id} className="align-top">
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2"><CompanyLogo name={application.companyName} />{application.companyName}</div>
                        {application.jobLink ? (
                          <a className="mt-1 inline-flex items-center gap-1 text-xs text-brand-700 hover:underline dark:text-brand-300" href={application.jobLink} target="_blank" rel="noreferrer">
                            <ExternalLink size={12} /> Job link
                          </a>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{application.role}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{application.packageLPA} LPA</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{application.location}</td>
                      <td className="px-3 py-3"><StatusBadge status={application.status} /></td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{roundLabel(application.round)}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{formatDate(application.applicationDate)}</td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <span className="text-slate-700 dark:text-slate-300">{formatDate(application.deadlineDate)}</span>
                          <DeadlineBadge deadlineDate={application.deadlineDate} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button type="button" variant="secondary" className="h-8 px-3" onClick={() => startEdit(application)}>
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button type="button" variant="danger" className="h-8 px-3" onClick={() => handleDelete(application.id)}>
                            <Trash2 size={14} /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleApplications.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-500" colSpan={9}>
                        No placement applications found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Pipeline Board</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              {boardColumns.map((column) => (
                <div
                  key={column.key}
                  className="min-h-48 rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-200 dark:border-slate-800 dark:bg-slate-950"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(column)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{column.title}</h4>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {applications.filter((item) => column.statuses.includes(item.status)).length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {applications
                      .filter((item) => column.statuses.includes(item.status))
                      .map((application) => (
                        <div
                          key={application.id}
                          className="cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900"
                          draggable
                          onDragStart={() => setDraggedId(application.id)}
                          onDragEnd={() => setDraggedId(null)}
                        >
                          <div className="flex items-center gap-2">
                            <CompanyLogo name={application.companyName} />
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{application.companyName}</p>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{application.role}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{application.packageLPA} LPA</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"><MapPin size={11} />{application.location}</span>
                            <DeadlineBadge deadlineDate={application.deadlineDate} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Applications Submitted" value={statistics?.applicationsSubmitted ?? 0} tone="blue" />
            <StatCard title="Conversion Rate" value={`${statistics?.conversionRate ?? 0}%`} tone="indigo" />
            <StatCard title="OA Success Rate" value={`${statistics?.oaSuccessRate ?? 0}%`} tone="emerald" />
            <StatCard title="Interview Success Rate" value={`${statistics?.interviewSuccessRate ?? 0}%`} tone="emerald" />
            <StatCard title="Selection Rate" value={`${statistics?.selectionRate ?? 0}%`} tone="indigo" />
          </section>
        </>
      ) : null}
    </div>
  );
}

function statusLabel(status: PlacementStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function roundLabel(round: PlacementRound) {
  return roundOptions.find((option) => option.value === round)?.label ?? round;
}

function StatusBadge({ status }: { status: PlacementStatus }) {
  const classes =
    status === 'SELECTED'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : status === 'REJECTED'
        ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
        : status.includes('INTERVIEW')
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          : status.includes('OA')
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${classes}`}>{statusLabel(status)}</span>;
}

function CompanyLogo({ name }: { name: string }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-blue-600 text-xs font-semibold text-white shadow-sm">
      {name.trim().slice(0, 2).toUpperCase() || <Building2 size={14} />}
    </span>
  );
}

function DeadlineBadge({ deadlineDate }: { deadlineDate: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);

  if (daysRemaining < 0) {
    return <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Overdue</span>;
  }

  if (daysRemaining <= 7) {
    return <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Due soon</span>;
  }

  return null;
}
