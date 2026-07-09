import { View, Text } from '@tarojs/components';
import { useToastStore } from '../store/useToastStore';

const typeStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
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
        <View className={`px-5 py-2.5 rounded-lg ${typeStyles[type]} shadow-lg max-w-[80%]`}>
          <Text className="text-white text-sm font-medium text-center block">{message}</Text>
        </View>
      </View>
    </View>
  );
}
