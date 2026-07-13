import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  show: (message: string, type?: ToastState['type']) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  type: 'success',
  show: (message, type = 'success') => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    set({ message, visible: true, type });
    timer = setTimeout(() => {
      set({ visible: false });
      timer = null;
    }, 2000);
  },
  hide: () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    set({ visible: false });
  },
}));
