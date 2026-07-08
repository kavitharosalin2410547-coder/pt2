import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'relative bg-brand-gradient text-white font-semibold shadow-glow hover:brightness-110 hover:shadow-[0_4px_20px_-4px_rgb(99_102_241_/_0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  secondary:
    'border border-slate-200 bg-white text-slate-800 shadow-soft hover:border-brand-300 hover:bg-surface-2 hover:text-brand-700 disabled:opacity-50 dark:border-ink-3 dark:bg-ink-2 dark:text-slate-100 dark:hover:border-brand-600 dark:hover:bg-ink-3',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:opacity-50',
  ghost:
    'text-slate-600 hover:bg-surface-3 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-ink-3 dark:hover:text-white',
};

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-95 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Working...
        </span>
      ) : children}
    </button>
  );
}
