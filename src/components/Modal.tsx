import { View, Text } from '@tarojs/components';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  onConfirm?: () => void;
  themeColor?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showFooter = false,
  confirmText = '确定',
  cancelText = '取消',
  confirmDisabled = false,
  confirmVariant = 'primary',
  onConfirm,
  themeColor = '#10b981',
}: ModalProps) {
  if (!isOpen) return null;

  const confirmColors = {
    primary: themeColor,
    danger: '#ef4444',
    warning: '#f59e0b',
  };

  return (
    <View className="fixed inset-0 z-[70] flex items-center justify-center">
      <View className="absolute inset-0 bg-black/50" onClick={onClose} />
      <View className="relative bg-white dark:bg-gray-800 rounded-2xl w-[88%] max-w-[700rpx] overflow-hidden shadow-xl">
        <View className="px-6 pt-5 pb-3">
          <Text className="text-lg font-semibold text-center text-gray-800 dark:text-gray-100">{title}</Text>
        </View>
        <View className="px-6 py-2">{children}</View>
        {showFooter && (
          <View className="flex border-t border-gray-100 dark:border-gray-700 mt-2">
            <View
              className="flex-1 h-[96rpx] text-gray-600 dark:text-gray-300 text-base bg-transparent active:bg-gray-50 dark:active:bg-gray-700/50 flex items-center justify-center border-0 rounded-none"
              onClick={onClose}
              hoverClass=""
            >
              <Text>{cancelText}</Text>
            </View>
            <View
              className={`flex-1 h-[96rpx] text-white text-base border-0 rounded-none flex items-center justify-center ${confirmDisabled ? 'opacity-50' : ''}`}
              style={{ backgroundColor: confirmColors[confirmVariant] }}
              onClick={() => {
                if (!confirmDisabled) onConfirm?.();
              }}
              hoverClass=""
            >
              <Text className="text-white">{confirmText}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
