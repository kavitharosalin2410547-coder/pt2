export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function isSameDay(first: Date, second: Date): boolean {
  return first.toDateString() === second.toDateString();
}

export function getWeekDays(referenceDate = new Date()): Date[] {
  const start = new Date(referenceDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function getMonthDays(referenceDate = new Date()): Date[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const count = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: count }, (_, index) => new Date(year, month, index + 1));
}
