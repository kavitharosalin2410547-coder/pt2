import { ProgressBar } from '../analytics/ProgressBar';

type ProgressSummaryProps = {
  label: string;
  value: number;
  caption?: string;
};

export function ProgressSummary({ label, value, caption }: ProgressSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-sm font-semibold text-slate-950">{value}%</p>
      </div>
      <div className="mt-3">
        <ProgressBar value={value} />
      </div>
      {caption ? <p className="mt-2 text-xs text-slate-500">{caption}</p> : null}
    </div>
  );
}
