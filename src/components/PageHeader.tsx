import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Icon } from './Icon';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  rightIcon?: string;
  onRightClick?: () => void;
  background?: string;
}

export function PageHeader({
  title,
  onBack,
  showBack = true,
  right,
  rightIcon,
  onRightClick,
  background = 'bg-white dark:bg-gray-800',
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack({ fail: () => Taro.switchTab({ url: '/pages/index/index' }) });
    }
  };

  return (
    <View className={`${background} px-4 h-12 flex items-center shrink-0`} style={{ paddingTop: 0 }}>
      <View className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg">
        {showBack && (
          <View
            className="w-8 h-8 flex items-center justify-center"
            onClick={handleBack}
          >
            <Icon name="ArrowLeft" size={20} />
          </View>
        )}
      </View>
      <View className="flex-1 flex items-center justify-center">
        <Text className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</Text>
      </View>
      <View className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300">
        {right || (rightIcon ? (
          <View className="w-8 h-8 flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 rounded-lg" onClick={onRightClick}>
            <Icon name={rightIcon} size={20} />
          </View>
        ) : <View />)}
      </View>
    </View>
  );
}
