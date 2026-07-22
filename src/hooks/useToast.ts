import { useCallback } from 'react';
import { useToastStore } from '../store/useToastStore';

export function useToast() {
  const show = useToastStore((state) => state.show);

  return {
    success: useCallback((message: string) => show(message, 'success'), [show]),
    error: useCallback((message: string) => show(message, 'error'), [show]),
    warning: useCallback((message: string) => show(message, 'warning'), [show]),
    info: useCallback((message: string) => show(message, 'info'), [show]),
  };
}
