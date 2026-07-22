import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  themeColor?: string;
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

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  themeColor = '#10b981',
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const confirmClasses = getConfirmClasses(variant, isDark);

  return (
    <View
      className={cn(
        'fixed inset-0 z-[9999] transition-opacity duration-300',
        isDark ? 'bg-black/60' : 'bg-black/40'
      )}
      onClick={onClose}
    >
      <View
        className={cn(
          'absolute bottom-0 left-0 right-0 rounded-t-2xl border-t',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200/50'
        )}
        style={{ maxHeight: '70vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <View className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <Text
            className={cn(
              'text-lg font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {title}
          </Text>
          <View
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            )}
            onClick={onClose}
          >
            <Text
              className={cn(
                'text-xl font-light',
                isDark ? 'text-gray-400' : 'text-gray-500'
              )}
            >
              ×
            </Text>
          </View>
        </View>

        <ScrollView
          scrollY
          style={{ maxHeight: '50vh' }}
          className="p-4"
        >
          {children}
        </ScrollView>

        {(onConfirm || onCancel) && (
          <View
            className={cn(
              'flex gap-3 p-4 border-t',
              isDark ? 'border-gray-700' : 'border-gray-200/50'
            )}
          >
            {onCancel && (
              <View
                className={cn(
                  'flex-1 py-3 rounded-xl text-center text-sm font-medium border transition-colors',
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
                onClick={onCancel}
              >
                <Text>{cancelText}</Text>
              </View>
            )}
            {onConfirm && (
              <View
                className={cn(
                  'flex-1 py-3 rounded-xl text-center text-sm font-medium transition-colors',
                  confirmClasses
                )}
                onClick={onConfirm}
              >
                <Text style={{ color: themeColor }}>{confirmText}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Drawer;
