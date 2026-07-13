import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';

type Direction = 'top' | 'bottom' | 'left' | 'right';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: Direction;
  title?: string;
  showClose?: boolean;
  showFooter?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  onConfirm?: () => void;
  onCancel?: () => void;
  closeOnMaskClick?: boolean;
  width?: string;
  height?: string;
  children?: React.ReactNode;
  themeColor?: string;
}

const positionClasses: Record<Direction, string> = {
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0',
  left: 'left-0 top-0 bottom-0',
  right: 'right-0 top-0 bottom-0',
};

const enterTransform: Record<Direction, string> = {
  top: '-translate-y-full',
  bottom: 'translate-y-full',
  left: '-translate-x-full',
  right: 'translate-x-full',
};

const enterTransformActive: Record<Direction, string> = {
  top: 'translate-y-0',
  bottom: 'translate-y-0',
  left: 'translate-x-0',
  right: 'translate-x-0',
};

const sizeClasses: Record<Direction, { dim: string; size: string }> = {
  top: { dim: 'w-full', size: 'h-auto max-h-[85vh]' },
  bottom: { dim: 'w-full', size: 'h-auto max-h-[85vh]' },
  left: { dim: 'h-full', size: 'w-[85%] max-w-[700rpx]' },
  right: { dim: 'h-full', size: 'w-[92%] max-w-[840rpx]' },
};

export function Drawer({
  isOpen,
  onClose,
  direction = 'bottom',
  title,
  showClose = true,
  showFooter = false,
  cancelText = '取消',
  confirmText = '确定',
  confirmDisabled = false,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  closeOnMaskClick = true,
  width,
  height,
  children,
  themeColor = '#10b981',
}: DrawerProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setEntered(true), 20);
      return () => clearTimeout(t);
    } else if (mounted) {
      setEntered(false);
      const t = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const confirmColors = {
    primary: themeColor,
    danger: '#ef4444',
    warning: '#f59e0b',
  };

  const isHorizontal = direction === 'left' || direction === 'right';
  const dim = sizeClasses[direction].dim;
  const size = sizeClasses[direction].size;
  const transform = entered ? enterTransformActive[direction] : enterTransform[direction];

  return (
    <View className="fixed inset-0 z-[1000]">
      <View
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeOnMaskClick ? onClose : undefined}
      />
      <View
        className={`absolute bg-white dark:bg-gray-800 shadow-xl flex flex-col ${positionClasses[direction]} ${dim} ${size} ${transform} transition-transform duration-200`}
        style={{
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
          paddingBottom: '80px',
        }}
      >
        {title !== undefined && (
          <View className="flex items-center justify-between px-4 h-12 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <View
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
              onClick={onClose}
            >
              {showClose ? <Icon name="X" size={20} /> : <View />}
            </View>
            <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</Text>
            <View className="w-8 h-8" />
          </View>
        )}

        <View className="flex-1 overflow-hidden">
          <View className="h-full overflow-auto">
            {children}
          </View>
        </View>

        {showFooter && (
          <View className="flex border-t border-gray-100 dark:border-gray-700 shrink-0">
            <View
              className="flex-1 h-12 text-gray-600 dark:text-gray-300 text-base bg-transparent active:bg-gray-50 dark:active:bg-gray-700/50 flex items-center justify-center"
              onClick={() => onCancel?.()}
            >
              <Text>{cancelText}</Text>
            </View>
            <View
              className={`flex-1 h-12 text-white text-base flex items-center justify-center ${confirmDisabled ? 'opacity-50' : ''}`}
              style={{ backgroundColor: confirmColors[confirmVariant] }}
              onClick={() => {
                if (!confirmDisabled) onConfirm?.();
              }}
            >
              <Text className="text-white">{confirmText}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
