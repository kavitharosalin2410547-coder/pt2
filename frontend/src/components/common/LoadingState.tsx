type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-ink-3 dark:bg-ink-2">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}...</span>
    </div>
  );
}
