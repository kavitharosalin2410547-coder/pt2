type StatCardProps = {
  title: string;
  value: string | number;
  caption?: string;
  tone?: 'blue' | 'indigo' | 'emerald' | 'violet' | 'slate';
  icon?: React.ReactNode;
};

import type React from 'react';

const toneConfig = {
  indigo: { bar: 'bg-brand-600', bg: 'bg-brand-50 dark:bg-brand-950/30', text: 'text-brand-600 dark:text-brand-400', border: 'border-brand-100 dark:border-brand-900/40' },
  blue:   { bar: 'bg-blue-600',  bg: 'bg-blue-50 dark:bg-blue-950/30',  text: 'text-blue-600 dark:text-blue-400',  border: 'border-blue-100 dark:border-blue-900/40' },
  emerald:{ bar: 'bg-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-950/30',text:'text-emerald-600 dark:text-emerald-400',border:'border-emerald-100 dark:border-emerald-900/40'},
  violet: { bar: 'bg-violet-600',bg: 'bg-violet-50 dark:bg-violet-950/30',text:'text-violet-600 dark:text-violet-400',border:'border-violet-100 dark:border-violet-900/40'},
  slate:  { bar: 'bg-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/40',  text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700/60' },
};

export function StatCard({ title, value, caption, tone = 'indigo', icon }: StatCardProps) {
  const cfg = toneConfig[tone];
  return (
    <section className={`animate-soft-in group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:bg-ink-2 ${cfg.border}`}>
      {/* Top accent bar */}
      <div className={`absolute left-0 right-0 top-0 h-0.5 ${cfg.bar}`} />

      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
        {icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.text}`}>
            {icon}
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      {caption && (
        <p className={`mt-1.5 text-xs font-medium ${cfg.text}`}>{caption}</p>
      )}
    </section>
  );
}
