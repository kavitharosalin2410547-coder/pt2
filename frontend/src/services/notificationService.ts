import { scheduleNotification } from '../hooks/useNotifications';
import type { Task } from '../types/task';

export interface NotificationSettings {
  dailyReminder: boolean;
  deadlineAlerts: boolean;
  streakAlert: boolean;
  reminderTime: string; // "HH:MM"
}

const STORAGE_KEY = 'notificationSettings';

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NotificationSettings;
  } catch {
    // ignore
  }
  return { dailyReminder: true, deadlineAlerts: true, streakAlert: true, reminderTime: '09:00' };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const notificationService = {
  scheduleDailyReminder(preferredTime: string) {
    const [hours, minutes] = preferredTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delayMs = target.getTime() - now.getTime();
    scheduleNotification(
      'Time to study! 📚',
      'Open your plan for today and keep your streak alive.',
      delayMs,
    );
  },

  scheduleDeadlineAlerts(tasks: Task[]) {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const task of tasks) {
      if (task.completed) continue;
      const due = new Date(task.dueDate);
      if (due > now && due <= in24h) {
        const notifyAt = new Date(due.getTime() - 60 * 60 * 1000); // 1h before
        const delayMs = notifyAt.getTime() - now.getTime();
        if (delayMs > 0) {
          scheduleNotification('Task due soon ⏰', `"${task.title}" is due in about an hour.`, delayMs);
        }
      }
    }
  },

  scheduleStreakAlert() {
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    const today = new Date().toDateString();
    if (lastStudyDate === today) return; // already studied today

    const now = new Date();
    const ninepm = new Date();
    ninepm.setHours(21, 0, 0, 0);
    if (ninepm <= now) return;

    const delayMs = ninepm.getTime() - now.getTime();
    scheduleNotification(
      "Don't break your streak! 🔥",
      'Log a study session today to keep your streak alive.',
      delayMs,
    );
  },
};
