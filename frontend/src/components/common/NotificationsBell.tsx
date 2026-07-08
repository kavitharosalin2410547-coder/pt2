import { Bell, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const STORAGE_KEY = 'appNotifications';

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return (JSON.parse(raw) as AppNotification[]).map((n) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 10)));
}

export function addAppNotification(title: string, body: string) {
  const notifications = loadNotifications();
  const next: AppNotification = {
    id: crypto.randomUUID(),
    title,
    body,
    read: false,
    createdAt: new Date(),
  };
  const updated = [next, ...notifications].slice(0, 10);
  saveNotifications(updated);
  window.dispatchEvent(new Event('app-notification'));
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function refresh() {
      setNotifications(loadNotifications());
    }
    window.addEventListener('app-notification', refresh);
    return () => window.removeEventListener('app-notification', refresh);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function markAllRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }

  function dismiss(id: string) {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  }

  function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unread > 0) {
      // mark as read when opening
      setTimeout(markAllRead, 1000);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No notifications yet</div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
