'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center px-4',
        'bg-black/40 transition-opacity',
      ].join(' ')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900">{title}</h2>
          {description && (
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-semibold hover:bg-neutral-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'flex-1 h-11 rounded-xl text-sm font-semibold transition-colors',
              variant === 'destructive'
                ? 'bg-error-500 text-white hover:bg-error-600'
                : 'bg-primary-600 text-white hover:bg-primary-700',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
