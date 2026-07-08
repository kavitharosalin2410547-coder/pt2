type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = 'Something went wrong', message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200/60 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
      <p className="text-sm font-bold text-red-700 dark:text-red-400">{title}</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>
    </div>
  );
}
