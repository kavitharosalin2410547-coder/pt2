import { useEffect } from 'react';

export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: icon ?? '/favicon.ico',
  });
}

export function scheduleNotification(title: string, body: string, delayMs: number): () => void {
  const id = setTimeout(() => sendNotification(title, body), delayMs);
  return () => clearTimeout(id);
}

export function useNotifications() {
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}
