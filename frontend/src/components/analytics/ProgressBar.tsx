type ProgressBarProps = {
  value: number;
  tone?: 'brand' | 'emerald' | 'blue';
};

export function ProgressBar({ value, tone = 'brand' }: ProgressBarProps) {
  const gradient = {
    brand: 'from-brand-600 to-brand-400',
    emerald: 'from-emerald-600 to-teal-400',
    blue: 'from-blue-600 to-sky-400',
  }[tone];
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-ink-3">
      <div
        className={"h-full rounded-full bg-gradient-to-r transition-all duration-700 " + gradient}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
