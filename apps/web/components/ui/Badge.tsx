import { type HTMLAttributes } from 'react';

type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-700 ring-1 ring-success-200',
  error: 'bg-error-100 text-error-700 ring-1 ring-error-200',
  warning: 'bg-warning-100 text-warning-700 ring-1 ring-warning-200',
  info: 'bg-primary-100 text-primary-700 ring-1 ring-primary-200',
  neutral: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200',
};

function Badge({ variant, children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
