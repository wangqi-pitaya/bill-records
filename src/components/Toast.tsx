import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const textColorMap = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white dark:bg-gray-800 animate-toast-in transition-all duration-300',
              'border-l-4',
              toast.type === 'success' && 'border-l-green-500',
              toast.type === 'error' && 'border-l-red-500',
              toast.type === 'info' && 'border-l-blue-500',
              toast.type === 'warning' && 'border-l-yellow-500'
            )}
          >
            <div className={cn('shrink-0', textColorMap[toast.type])}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
