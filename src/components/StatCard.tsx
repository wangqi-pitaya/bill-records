import { View, Text } from '@tarojs/components';
import { formatMoney } from '../lib/utils';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
  showHeader?: boolean;
}

export function StatCard({ income, expense, balance, color = '#3b82f6', showHeader = true }: StatCardProps) {
  const positive = balance >= 0;
  return (
    <View
      className="rounded-card shadow-card p-5"
      style={{ backgroundColor: color }}
    >
      {showHeader && (
        <View className="flex items-center justify-between mb-4">
          <Text className="text-xs text-white/80">结余</Text>
          <Text className="text-2xl font-bold text-white">
            {positive ? '+' : ''}{formatMoney(balance)}
          </Text>
        </View>
      )}
      <View className="flex">
        <View className="flex-1 flex flex-col">
          <Text className="text-xs text-white/80">收入</Text>
          <Text className="text-lg font-bold text-white mt-0.5">+{formatMoney(income)}</Text>
        </View>
        <View className="flex-1 flex flex-col">
          <Text className="text-xs text-white/80">支出</Text>
          <Text className="text-lg font-bold text-white mt-0.5">-{formatMoney(expense)}</Text>
        </View>
      </View>
    </View>
  );
}
