import { View, Text } from '@tarojs/components';
import { useToastStore } from '../store/useToastStore';

const typeColors = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export function ToastContainer() {
  const { message, visible, type } = useToastStore();

  if (!visible) return null;

  return (
    <View
      className="fixed left-0 right-0 z-[200] pointer-events-none"
      style={{ top: '120rpx' }}
    >
      <View className="flex items-center justify-center">
        <View className="px-5 py-2.5 rounded-lg shadow-lg max-w-[80%]" style={{ backgroundColor: typeColors[type] }}>
          <Text className="text-white text-sm font-medium text-center block">{message}</Text>
        </View>
      </View>
    </View>
  );
}
