import type { ReactNode } from 'react';

type DashboardCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function DashboardCard({ title, children, className = '', action, icon }: DashboardCardProps) {
  return (
    <section className={`animate-soft-in rounded-2xl border border-slate-200/80 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ink-3 dark:bg-ink-2 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-ink-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-brand-500 dark:text-brand-400">{icon}</span>}
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
