import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColorMap = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-none flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/90 dark:bg-black/80 backdrop-blur-sm shadow-md animate-toast-in transition-all duration-300',
            )}
          >
            <Icon className={cn('shrink-0 w-4 h-4', iconColorMap[toast.type])} />
            <p className="flex-1 text-sm text-white truncate">
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
