import { View } from '@tarojs/components';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden ${className}`}>
      {children}
    </View>
  );
}
