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
    <View className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <View className={`px-6 py-3 rounded-full ${typeStyles[type]} shadow-lg`}>
        <Text className="text-white text-sm font-medium">{message}</Text>
      </View>
    </View>
  );
}
