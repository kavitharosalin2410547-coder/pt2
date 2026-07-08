type ProgressRingProps = {
  value: number;
  label?: string;
  size?: number;
};

export function ProgressRing({ value, label, size = 104 }: ProgressRingProps) {
  const normalized = Math.max(0, Math.min(value, 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" viewBox="0 0 100 100">
          <circle className="stroke-slate-200 dark:stroke-slate-800" cx="50" cy="50" r={radius} fill="none" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#progress-ring-gradient)"
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="progress-ring-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#4f46e5" />
              <stop offset="0.55" stopColor="#2563eb" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-slate-950 dark:text-white">
          {normalized}%
        </div>
      </div>
      {label ? <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span> : null}
    </div>
  );
}
