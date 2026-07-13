import { View } from '@tarojs/components';
import { Icon } from './Icon';

interface FloatingButtonProps {
  onClick: () => void;
  color?: string;
  className?: string;
}

export function FloatingButton({ onClick, color, className = '' }: FloatingButtonProps) {
  return (
    <View
      className={`fixed right-6 bottom-[140rpx] z-40 w-[120rpx] h-[120rpx] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${className}`}
      style={{ backgroundColor: color || 'var(--primary-500)' }}
      onClick={onClick}
    >
      <Icon name="Plus" size={32} color="#fff" />
    </View>
  );
}
