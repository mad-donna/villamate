import { type HTMLAttributes } from 'react';

type BadgeVariant =
  | '완납'
  | '미납'
  | '납기임박'
  | '진행중'
  | '종료'
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
  완납: 'bg-green-100 text-green-700',
  미납: 'bg-red-100 text-red-700',
  납기임박: 'bg-orange-100 text-orange-700',
  진행중: 'bg-blue-100 text-blue-700',
  종료: 'bg-neutral-100 text-neutral-500',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  info: 'bg-blue-100 text-blue-700',
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
