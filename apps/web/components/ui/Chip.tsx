interface ChipProps {
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

function Chip({ label, selected, onRemove, onClick }: ChipProps) {
  return (
    <span
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium cursor-pointer select-none transition-colors',
        selected
          ? 'bg-primary-100 text-primary-700 border border-primary-300'
          : 'bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200',
      ].join(' ')}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 -mr-1 w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-600 leading-none"
          aria-label={`${label} 제거`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export { Chip };
export type { ChipProps };
