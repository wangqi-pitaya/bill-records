import { View, Text, Button } from '@tarojs/components';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showFooter?: boolean;
  confirmText?: string;
  confirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  onConfirm?: () => void;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showFooter = false,
  confirmText = '确定',
  confirmDisabled = false,
  confirmVariant = 'primary',
  onConfirm,
}: ModalProps) {
  if (!isOpen) return null;

  const confirmColors = {
    primary: 'bg-blue-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  return (
    <View className="fixed inset-0 z-[70] flex items-center justify-center">
      <View className="absolute inset-0 bg-black/50" onClick={onClose} />
      <View className="relative bg-white dark:bg-gray-800 rounded-2xl w-[80%] max-w-[600rpx] overflow-hidden shadow-xl">
        <View className="px-6 pt-5 pb-3">
          <Text className="text-lg font-semibold text-center text-gray-800 dark:text-gray-100">{title}</Text>
        </View>
        <View className="px-6 py-2">{children}</View>
        {showFooter && (
          <View className="flex border-t border-gray-100 dark:border-gray-700 mt-2">
            <Button
              className="flex-1 h-[96rpx] text-gray-600 dark:text-gray-300 text-base bg-transparent border-0 rounded-none after:border-0 flex items-center justify-center"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              className={`flex-1 h-[96rpx] text-white text-base border-0 rounded-none after:border-0 flex items-center justify-center ${confirmColors[confirmVariant]} ${confirmDisabled ? 'opacity-50' : ''}`}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
