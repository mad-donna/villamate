export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-100 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}
