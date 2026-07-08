import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  show: (message: string, type?: ToastState['type']) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  type: 'success',
  show: (message, type = 'success') => {
    set({ message, visible: true, type });
    setTimeout(() => {
      set({ visible: false });
    }, 2000);
  },
  hide: () => set({ visible: false }),
}));
