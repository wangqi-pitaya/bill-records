import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary-500 dark:text-primary-400', sizeClasses[size], className)}
    />
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = '加载中...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-3 px-6 py-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
}
