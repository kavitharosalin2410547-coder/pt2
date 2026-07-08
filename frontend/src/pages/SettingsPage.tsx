import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Select } from '../components/common/Select';
import { useToast } from '../hooks/useToast';
import { preferenceService } from '../services/preferenceService';
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '../services/notificationService';
import type { StudyMode } from '../types/preference';
import { studyModeOptions } from '../utils/constants';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

export function SettingsPage() {
  const { notify } = useToast();
  const [studyMode, setStudyMode] = useState<StudyMode>('WEEKDAYS_ONLY');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(
    getNotificationSettings,
  );

  useEffect(() => {
    preferenceService
      .get()
      .then((preference) => setStudyMode(preference.studyMode))
      .catch(() => setError('Unable to load settings.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      await preferenceService.update(studyMode);
      saveNotificationSettings(notifSettings);
      notify('Settings saved.', 'success');
    } catch {
      notify('Unable to update preference.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading settings" />;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500">Configure study preferences and notification settings.</p>
      </div>
      {error ? <ErrorState message={error} /> : null}

      {/* Study preference */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Study Schedule</h3>
        <Select
          label="Study preference"
          options={studyModeOptions}
          value={studyMode}
          onChange={(event) => setStudyMode(event.target.value as StudyMode)}
        />
      </section>

      {/* Notifications */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
        <p className="mb-3 text-xs text-slate-500">
          Browser notifications will only fire if you&apos;ve granted permission.
        </p>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle
            label="Daily Study Reminder"
            checked={notifSettings.dailyReminder}
            onChange={(v) => setNotifSettings((s) => ({ ...s, dailyReminder: v }))}
          />
          <Toggle
            label="Deadline Alerts (1h before due task)"
            checked={notifSettings.deadlineAlerts}
            onChange={(v) => setNotifSettings((s) => ({ ...s, deadlineAlerts: v }))}
          />
          <Toggle
            label="Streak Alert (9 PM if no session logged)"
            checked={notifSettings.streakAlert}
            onChange={(v) => setNotifSettings((s) => ({ ...s, streakAlert: v }))}
          />
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Preferred reminder time
          </label>
          <input
            type="time"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={notifSettings.reminderTime}
            onChange={(e) => setNotifSettings((s) => ({ ...s, reminderTime: e.target.value }))}
          />
        </div>
      </section>

      <Button onClick={handleSave} isLoading={isSaving}>
        Save settings
      </Button>
    </div>
  );
}
