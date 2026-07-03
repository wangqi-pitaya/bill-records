import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (message, type = 'info', duration = 2500) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const newToast: ToastItem = { id, message, type, duration };
    set({ toasts: [...get().toasts, newToast] });

    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
