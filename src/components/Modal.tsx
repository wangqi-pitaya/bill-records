import React from 'react';
import { View, Text } from '@tarojs/components';
import { Button } from './Button';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  variant?: 'default' | 'danger';
  className?: string;
}

function getConfirmClasses(variant: 'default' | 'danger', isDark: boolean): string {
  if (variant === 'danger') {
    return isDark
      ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
      : 'bg-red-50 text-red-600 hover:bg-red-100';
  }
  return isDark
    ? 'bg-primary/20 text-primary-light hover:bg-primary/30'
    : 'bg-primary/10 text-primary hover:bg-primary/20';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  showCancel = true,
  variant = 'default',
  className = '',
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const confirmClasses = getConfirmClasses(variant, isDark);

  return (
    <View
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center px-6',
        isDark ? 'bg-black/60' : 'bg-black/40'
      )}
      onClick={onClose}
    >
      <View
        className={cn(
          'w-full max-w-sm rounded-card p-6 shadow-2xl border',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200/50',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <Text
            className={cn(
              'text-lg font-semibold text-center block mb-4',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {title}
          </Text>
        )}

        {children && <View className="mb-5">{children}</View>}

        <View className="flex gap-3">
          {showCancel && (
            <Button variant="secondary" fullWidth onClick={onClose}>
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              variant="custom"
              className={confirmClasses}
              fullWidth
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

export default Modal;
