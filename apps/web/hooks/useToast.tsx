'use client';

import { useState, useCallback } from 'react';
import { Toast } from '@/components/ui/Toast';

type ToastVariant = 'default' | 'error' | 'success';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>('default');

  const toast = useCallback((msg: string, v: ToastVariant = 'default') => {
    setMessage(msg);
    setVariant(v);
  }, []);

  const toastEl = (
    <Toast message={message} variant={variant} onClose={() => setMessage(null)} />
  );

  return { toast, toastEl };
}
