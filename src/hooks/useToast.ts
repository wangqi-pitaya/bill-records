import { useCallback } from 'react';
import { useToastStore } from '../store/useToastStore';

export function useToast() {
  const show = useToastStore((state) => state.show);

  const success = useCallback(
    (message: string) => show(message, 'success'),
    [show]
  );
  const error = useCallback(
    (message: string) => show(message, 'error'),
    [show]
  );
  const warning = useCallback(
    (message: string) => show(message, 'warning'),
    [show]
  );
  const info = useCallback(
    (message: string) => show(message, 'info'),
    [show]
  );

  return { success, error, warning, info };
}
