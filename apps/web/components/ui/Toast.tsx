'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  variant?: 'default' | 'error' | 'success';
  onClose: () => void;
}

export function Toast({ message, variant = 'default', onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={[
        'fixed bottom-20 left-4 right-4 z-[100] text-sm rounded-2xl px-4 py-3 shadow-lg text-white',
        variant === 'error' ? 'bg-error-600'
          : variant === 'success' ? 'bg-success-600'
          : 'bg-neutral-900',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
