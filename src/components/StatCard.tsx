import { View, Text } from '@tarojs/components';
import { formatMoney } from '../lib/utils';

interface StatCardProps {
  income: number;
  expense: number;
  balance: number;
  color?: string;
}

export function StatCard({ income, expense, balance, color = '#3b82f6' }: StatCardProps) {
  const positive = balance >= 0;
  return (
    <View
      className="rounded-card shadow-card p-4 flex items-center justify-between"
      style={{ backgroundColor: color }}
    >
      <View className="flex flex-col">
        <Text className="text-xs text-white/80">收入</Text>
        <Text className="text-lg font-bold text-white mt-0.5">+{formatMoney(income)}</Text>
      </View>
      <View className="flex flex-col items-center">
        <Text className="text-xs text-white/80">结余</Text>
        <Text className="text-xl font-bold text-white mt-0.5">
          {positive ? '+' : ''}{formatMoney(balance)}
        </Text>
      </View>
      <View className="flex flex-col items-end">
        <Text className="text-xs text-white/80">支出</Text>
        <Text className="text-lg font-bold text-white mt-0.5">-{formatMoney(expense)}</Text>
      </View>
    </View>
  );
}
