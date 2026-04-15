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
  success: 'bg-success-100 text-success-700',
  error: 'bg-error-100 text-error-700',
  warning: 'bg-warning-100 text-warning-700',
  info: 'bg-primary-100 text-primary-700',
  neutral: 'bg-neutral-100 text-neutral-500',
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
