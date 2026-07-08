import { View, Text, ScrollView } from '@tarojs/components';
import { Category, BillType } from '../types';
import { Icon } from './Icon';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  type: BillType;
}

export function CategoryGrid({ categories, selectedCategory, onSelect, type }: CategoryGridProps) {
  return (
    <ScrollView scrollY className="h-full">
      <View className="grid grid-cols-5 gap-3 p-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;
          return (
            <View
              key={cat.id}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-[16rpx] aspect-square transition-all active:scale-95 ${
                isSelected
                  ? type === 'income'
                    ? 'bg-income-500 text-white'
                    : 'bg-expense-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => onSelect(cat)}
            >
              <Icon name={cat.icon} size={24} color={isSelected ? '#fff' : 'currentColor'} />
              <Text className="text-xs font-medium truncate w-full text-center">{cat.name}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
