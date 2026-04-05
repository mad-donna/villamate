'use client';

import { ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: 'primary' | 'error' | 'warning' | 'success';
  onClick?: () => void;
  children?: ReactNode;
}

const borderColorMap: Record<string, string> = {
  primary: 'border-l-blue-600',
  error: 'border-l-red-500',
  warning: 'border-l-orange-500',
  success: 'border-l-green-500',
};

export function WidgetCard({
  title,
  value,
  subtitle,
  accentColor = 'primary',
  onClick,
  children,
}: WidgetCardProps) {
  const borderColor = borderColorMap[accentColor];

  const inner = (
    <div className="text-left">
      <p className="text-xs text-neutral-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
      {children}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${borderColor} text-left w-full min-h-[44px] active:scale-95 transition-transform`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${borderColor}`}
    >
      {inner}
    </div>
  );
}
