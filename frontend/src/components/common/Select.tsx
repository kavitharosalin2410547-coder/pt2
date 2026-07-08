import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ value: string; label: string }>;
};

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <select
        className={`mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-brand-900/60 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
