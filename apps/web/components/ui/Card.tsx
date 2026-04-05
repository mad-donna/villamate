import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface WidgetCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentColor?: string;
}

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={['bg-white rounded-2xl shadow-sm p-6', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

function WidgetCard({ children, accentColor, className = '', ...props }: WidgetCardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-sm p-4 overflow-hidden relative',
        className,
      ].join(' ')}
      {...props}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
      )}
      <div className={accentColor ? 'pl-3' : ''}>{children}</div>
    </div>
  );
}

export { Card, WidgetCard };
export type { CardProps, WidgetCardProps };
